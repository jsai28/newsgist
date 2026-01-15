FROM python:3.13-slim

# Install uv for fast dependency management
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Copy dependency files first for better caching
COPY pyproject.toml uv.lock ./
COPY common/pyproject.toml common/pyproject.toml
COPY flows/news_etl/pyproject.toml flows/news_etl/pyproject.toml

# Install dependencies to system Python
# Export all packages (including workspace members) and install with --system
ENV UV_COMPILE_BYTECODE=1
RUN uv export --frozen --no-dev --all-packages > requirements.txt && \
    uv pip install --system --no-cache -r requirements.txt

# Copy source code
COPY common/ common/
COPY flows/ flows/

# Set Python path for imports
ENV PYTHONPATH=/app

# Default command (can be overridden by Prefect)
CMD ["python", "-m", "flows.news_etl.news_etl"]
