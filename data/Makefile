COMPOSE=docker compose
PREFECT_SERVER=http://localhost:4200/api
POOL_NAME=local-docker-pool

.PHONY: build start stop logs reset deploy

build:
	$(COMPOSE) up -d db server
	@echo "Waiting for Prefect API..."
	@until curl -sf $(PREFECT_SERVER)/health > /dev/null; do sleep 2; done
	@echo "Prefect API is up"
	@$(COMPOSE) exec server prefect work-pool create $(POOL_NAME) --type docker || true
	@echo "Work pool ensured: $(POOL_NAME)"

deploy:
	@echo "Deploying to environment: $(ENV)"
	@echo "Prefect server should be running first..."
	uv run python -u -m deploy $(ENV)

start:
	$(COMPOSE) up -d

stop:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs -f

reset:
	$(COMPOSE) down -v
