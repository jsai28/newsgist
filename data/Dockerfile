FROM python:3.13-slim

# Build argument for which flow to build
ARG FLOW_NAME

COPY --from=ghcr.io/astral-sh/uv:0.5.28 /uv /uvx /bin/

WORKDIR /app

COPY pyproject.toml uv.lock ./
COPY common/pyproject.toml common/pyproject.toml
COPY flows/${FLOW_NAME}/pyproject.toml flows/${FLOW_NAME}/pyproject.toml

# Need to install packages to system otherwise when 
# prefect triggers the container it will fail
ENV UV_COMPILE_BYTECODE=1
RUN uv export --frozen --no-dev --all-packages > requirements.txt && \
    uv pip install --system --no-cache -r requirements.txt

COPY common/ common/
COPY flows/${FLOW_NAME}/ flows/${FLOW_NAME}/

# Set Python path for imports
ENV PYTHONPATH=/app
