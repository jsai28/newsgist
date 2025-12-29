FROM python:3.13-slim

ARG FLOW_NAME

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

COPY pyproject.toml uv.lock ./
COPY common/pyproject.toml ./common/
COPY flows/${FLOW_NAME}/pyproject.toml ./flows/${FLOW_NAME}/
COPY deploy/pyproject.toml ./deploy/

RUN uv sync --frozen --no-dev --package ${FLOW_NAME} --no-install-project

COPY . .

RUN uv sync --frozen --no-dev --package ${FLOW_NAME}
