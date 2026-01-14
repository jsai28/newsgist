from prefect import flow, task, get_run_logger
from datetime import timedelta
import requests
import os

from common.utils import announce_news

@task
def format_headlines(headlines):
    message = f"Found {len(headlines)} new stories!"
    print(announce_news(message))

@task(retries=3, log_prints=True)
def fetch_top_news():
    api_key = os.getenv("NEWS_API_KEY")
    url = f"https://gnews.io/api/v4/top-headlines?category=general&apikey={api_key}"
    return requests.get(url).json()

@flow(name="news_etl", log_prints=True)
def news_etl():
    logger = get_run_logger()
    data = fetch_top_news()
    format_headlines(["headline1", "hadlines2"])
    logger.info(f"Retrieved data: {data}")

if __name__ == "__main__":
    news_etl()
