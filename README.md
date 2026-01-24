# Newsgist

A news aggregation and summarization pipeline that fetches articles from Canadian news sources, clusters related stories, and generates AI-powered summaries.

## Overview

Newsgist uses a data pipeline orchestrated by Prefect to:

1. Fetch headlines from GDELT (news data provider)
2. Deduplicate articles by URL and title
3. Extract full article content
4. Generate embeddings using SentenceTransformers
5. Cluster similar articles using HDBSCAN
6. Summarize clusters using Google Gemini AI

## Tech Stack

- **Python 3.13** with Prefect for orchestration
- **PostgreSQL** for data persistence
- **Docker** for containerization
- **sentence-transformers** for embeddings
- **Google Gemini** for summarization
- **Nextjs** frontend

### Running Locally

```bash
# Start the database
docker compose up -d

# Navigate to the data pipeline
cd data

# Build and start Prefect infrastructure
make build
make start

# Deploy the flow
make deploy-local

# Navigate to /frontend
npm run dev
```
