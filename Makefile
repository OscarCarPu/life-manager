.PHONY: up build clean logs down reset-dev up-logs

up:
	@echo "Starting local development environment (with Supabase)..."
	cd supabase
	npx supabase start
	docker compose -f docker-compose-dev.yaml up -d --wait
	@echo "Local development environment is up"

up-logs:
	@echo "Starting local development environment with logs (with Supabase)..."
	cd supabase
	npx supabase start
	docker compose -f docker-compose-dev.yaml up --wait -d
	@echo "Local development environment is up"
	docker compose -f docker-compose-dev.yaml logs -f

clean:
	@echo "Cleaning services"
	docker compose -f docker-compose-dev.yaml down -v
	cd supabase
	npx supabase stop
	@echo "Volumes cleaned"

build:
	@echo "Building images.."
	docker compose -f docker-compose-dev.yaml build
	@echo "All images built, resetting Supabase"
	cd supabase
	npx supabase start
	npx supabase db reset
	npx supabase stop
	@echo "Supabase reset complete"

logs:
	@echo "Showing logs for all services"
	docker compose -f docker-compose-dev.yaml logs -f

down:
	@echo "Stopping all services"
	docker compose -f docker-compose-dev.yaml down
	cd supabase
	npx supabase stop
	@echo "All services stopped"

reset-dev:
	@echo "Resetting development environment"
	docker compose -f docker-compose-dev.yaml down -v
	docker compose -f docker-compose-dev.yaml up -d --build --wait
	cd supabase
	npx supabase start
	npx supabase db reset
	@echo "Development environment reset complete"
	docker compose -f docker-compose-dev.yaml logs -f
