from prefect import flow, task, get_run_logger
from datetime import datetime, timedelta
import requests
from newspaper import Article
from sentence_transformers import SentenceTransformer

SOURCES = [
    'cbc.ca',
    'ctvnews.ca',
    'globalnews.ca',
    'theglobeandmail.com',
    'nationalpost.com',
    'thestar.com'
]

GDELT_BASE_URL = "https://api.gdeltproject.org/api/v2/doc/doc"


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

    texts = [f"{a['title']} {a['text']}" for a in articles]

    logger.info(f"Encoding {len(texts)} articles...")
    embeddings = model.encode(texts, show_progress_bar=True)

    for i, article in enumerate(articles):
        article["embedding"] = embeddings[i].tolist()

    logger.info(f"Vectorized {len(articles)} articles with {len(embeddings[0])}-dim embeddings")
    return articles


@flow(name="news_etl", log_prints=True)
def news_etl():
    logger = get_run_logger()

    articles = fetch_gdelt_articles()
    logger.info(f"Retrieved {len(articles)} articles")

    extracted = extract_text(articles)
    vectorized = vectorize_articles(extracted)

    return vectorized


if __name__ == "__main__":
    news_etl()
