COMPOSE=docker compose
PREFECT_SERVER=http://localhost:4200/api
POOL_NAME=local-docker-pool

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
