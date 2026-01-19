from prefect import flow, task, get_run_logger
from datetime import datetime, timedelta
import re
import requests
from newspaper import Article
from sentence_transformers import SentenceTransformer
import numpy as np
from sklearn.cluster import HDBSCAN
import random
from collections import defaultdict
from google import genai
from prefect.blocks.system import Secret

SOURCES = [
    'cbc.ca',
    'ctvnews.ca',
    'globalnews.ca',
    'theglobeandmail.com',
    'thestar.com'
]

GDELT_BASE_URL = "https://api.gdeltproject.org/api/v2/doc/doc"

CHUNK_SIZE = 250
CHUNK_OVERLAP = 2 # 2 sentence overlap

MIN_CLUSTER_SIZE = 3


def split_sentences(text: str) -> list[str]:
    """LLM Generated function for splitting sentences."""
    pattern = r'(?<=[.!?])\s+'
    sentences = re.split(pattern, text)
    return [s.strip() for s in sentences if s.strip()]


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> list[str]:
    if len(text) <= chunk_size:
        return [text]

    sentences = split_sentences(text)

    chunks = []
    cur_chunk = []
    cur_word_count = 0
    for s in sentences:
        words = s.split()
        if cur_word_count + len(words) > chunk_size and cur_chunk:
            chunks.append(" ".join(cur_chunk))
            cur_chunk = cur_chunk[-overlap:]
            cur_word_count = sum(len(sent.split()) for sent in cur_chunk)
        cur_chunk.append(s)
        cur_word_count += len(words)

    if cur_chunk:
        chunks.append(" ".join(cur_chunk))
    return chunks


@task(retries=2, log_prints=True)
def fetch_gdelt_articles(max_records: int = 250) -> dict:
    logger = get_run_logger()

    yesterday = datetime.now() - timedelta(days=1)
    start_datetime = yesterday.strftime("%Y%m%d") + "000000"
    end_datetime = yesterday.strftime("%Y%m%d") + "235959"

    domain_query = " OR ".join([f"domain:{source}" for source in SOURCES])
    query = f"({domain_query})"

    params = {
        "query": query,
        "mode": "artlist",
        "format": "json",
        "startdatetime": start_datetime,
        "enddatetime": end_datetime,
        "maxrecords": max_records
    }

    logger.info(f"Fetching articles from {yesterday.strftime('%Y-%m-%d')}")
    logger.info(f"Sources: {SOURCES}")

    response = requests.get(GDELT_BASE_URL, params=params)
    response.raise_for_status()
    data = response.json()
    articles = data.get("articles", [])
    return articles


@task(retries=2, log_prints=True)
def extract_text(articles: list) -> list[dict]:
    logger = get_run_logger()
    results = []

    for article_meta in articles:
        url = article_meta.get("url")
        if not url:
            continue

        try:
            article = Article(url)
            article.download()
            article.parse()

            results.append({
                "url": url,
                "title": article.title,
                "text": article.text,
                "authors": article.authors,
                "publish_date": article.publish_date,
                "source_domain": article_meta.get("domain"),
                "gdelt_title": article_meta.get("title"),
            })

        except Exception as e:
            logger.warning(f"Failed to extract {url}: {e}")
            continue

    logger.info(f"Successfully extracted {len(results)}/{len(articles)} articles")
    return results


@task(retries=2, log_prints=True)
def vectorize_articles(articles: list[dict], model_name: str = "all-MiniLM-L6-v2") -> list[dict]:
    logger = get_run_logger()

    if not articles:
        return articles

    logger.info(f"Loading model: {model_name}")
    model = SentenceTransformer(model_name)

    total_chunks = 0
    for article in articles:
        text = f"{article['title']} {article['text']}"
        chunks = chunk_text(text)
        total_chunks += len(chunks)

        chunk_embeddings = model.encode(chunks, normalize_embeddings=True)

        if len(chunks) == 1:
            article["embedding"] = chunk_embeddings[0].tolist()
        else:
            avg_embedding = chunk_embeddings.mean(axis=0)
            article["embedding"] = avg_embedding.tolist()

        article["chunk_count"] = len(chunks)

    logger.info(f"Vectorized {len(articles)} articles ({total_chunks} total chunks)")
    return articles


@task(retries=2, log_prints=True)
def cluster_articles(articles: list[dict]) -> dict[str, dict]:
    embeddings = np.array([article["embedding"] for article in articles])
    cluster_algo = HDBSCAN(min_cluster_size=MIN_CLUSTER_SIZE, metric='cosine')
    labels = cluster_algo.fit_predict(embeddings)
    
    clusters = defaultdict(list)
    for article,label in zip(articles,labels):
        clusters[label].append(article)
    
    return clusters


@task(retries=2, log_prints=True)
def summarize_clusters(clusters: dict[str, dict], max_clusters: int = 10) -> list:
    logger = get_run_logger()

    valid_clusters = [(label, articles) for label, articles in clusters.items() if label != -1]
    sorted_clusters = sorted(valid_clusters, key=lambda x: len(x[1]), reverse=True)
    top_clusters = sorted_clusters[:max_clusters]

    logger.info(f"Summarizing top {len(top_clusters)} clusters out of {len(valid_clusters)} total")

    api_key = Secret.load("gemini-api-key").get()
    client = genai.Client(api_key=api_key)

    summaries = []
    for label, articles in top_clusters:
        sample_size = min(len(articles), MIN_CLUSTER_SIZE)
        articles_sample = random.sample(articles, sample_size)

        articles_text = "\n\n".join([
            f"Title: {a['title']}\nText: {a['text']}..."
            for a in articles_sample
        ])

        prompt = f"""Summarize these news articles into a single cohesive paragraph.
                    Keep it to 2-4 sentences.
                    {articles_text}
                    """

        response = client.models.generate_content(
            model="gemini-2.5-flash-lite",
            contents=prompt
        )

        logger.info(f"Summary: {response.text}\n")
        summaries.append({
            "cluster_id": int(label),
            "article_count": len(articles),
            "summary": response.text,
            "sampled_articles": articles_sample
        })

    return summaries


@flow(name="news_etl", log_prints=True)
def news_etl():
    logger = get_run_logger()

    articles = fetch_gdelt_articles()
    logger.info(f"Retrieved {len(articles)} articles")

    extracted = extract_text(articles)
    vectorized = vectorize_articles(extracted)
    clusters = cluster_articles(vectorized)
    summarized = summarize_clusters(clusters)

    return summarized


if __name__ == "__main__":
    news_etl()
