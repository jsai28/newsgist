COMPOSE=docker compose
PREFECT_SERVER=http://localhost:4200/api
PREFECT_SERVER_DOCKER=http://host.docker.internal:4200/api
POOL_NAME=local-docker-pool

# Prod configuration (override these or set as env vars)
PROD_POOL_NAME ?= prod-docker-pool
PROD_API_URL ?= https://api.prefect.cloud/api/accounts/YOUR_ACCOUNT/workspaces/YOUR_WORKSPACE

build:
	$(COMPOSE) up -d db server
	@echo "Waiting for Prefect API..."
	@until curl -sf $(PREFECT_SERVER)/health > /dev/null; do sleep 2; done
	@echo "Prefect API is up"
	@$(COMPOSE) exec server prefect work-pool create $(POOL_NAME) --type docker || true
	@echo "Work pool ensured: $(POOL_NAME)"

start:
	$(COMPOSE) up -d

stop:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

reset:
	$(COMPOSE) down -v

deploy-local:
	PREFECT_API_URL=$(PREFECT_SERVER) uv run prefect deploy --all \
		--pool $(POOL_NAME) \
		--job-variable 'image={{ build-image.image }}' \
		--job-variable image_pull_policy=Never \
		--job-variable env.PREFECT_API_URL=$(PREFECT_SERVER_DOCKER)

deploy-prod:
	uv run prefect deploy --all \
		--pool $(PROD_POOL_NAME) \
		--job-variable image_pull_policy=Always \
		--job-variable env.PREFECT_API_URL=$(PROD_API_URL)
