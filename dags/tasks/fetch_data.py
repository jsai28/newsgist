from prefect import task
import requests
import os

@task(retries=3, log_prints=True)
def fetch_top_news():
    api_key = os.getenv("NEWS_API_KEY")
    url = f"https://newsapi.org/v2/top-headlines?country=us&apiKey={api_key}"
    return requests.get(url).json()
