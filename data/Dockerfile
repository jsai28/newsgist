FROM python:3.13-slim

# Build argument for which flow to build
ARG FLOW_NAME

# Install uv for fast dependency management
COPY --from=ghcr.io/astral-sh/uv:0.5.28 /uv /uvx /bin/

WORKDIR /app

# Copy dependency files first for better caching
COPY pyproject.toml uv.lock ./
COPY common/pyproject.toml common/pyproject.toml
COPY flows/${FLOW_NAME}/pyproject.toml flows/${FLOW_NAME}/pyproject.toml

# Install dependencies to system Python
# Export all packages (including workspace members) and install with --system
ENV UV_COMPILE_BYTECODE=1
RUN uv export --frozen --no-dev --all-packages > requirements.txt && \
    uv pip install --system --no-cache -r requirements.txt

# Copy only the specific flow's source code
COPY common/ common/
COPY flows/${FLOW_NAME}/ flows/${FLOW_NAME}/

# Set Python path for imports
ENV PYTHONPATH=/app
