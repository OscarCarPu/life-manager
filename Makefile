.PHONY: up build clean logs down reset-dev

up:
	@echo "Starting local development environment (with Supabase)..."
	cd supabase
	npx supabase start
	docker compose --profile dev up -d
	@echo "Local development environment is up"

clean:
	@echo "Cleaning services"
	docker compose down -v
	cd supabase
	npx supabase stop
	@echo "Volumes cleaned"

build:
	@echo "Building images.."
	docker compose --profile dev build
	@echo "All images built, resetting Supabase"
	cd supabase
	npx supabase start
	npx supabase db reset
	npx supabase stop
	@echo "Supabase reset complete"

logs:
	@echo "Showing logs for all services"
	docker compose logs -f

down:
	@echo "Stopping all services"
	docker compose down
	cd supabase
	npx supabase stop
	@echo "All services stopped"

reset-dev:
	@echo "Resetting development environment"
	docker compose down -v
	docker compose up -d --build
	cd supabase
	npx supabase start
	npx supabase db reset
	@echo "Development environment reset complete"
	docker compose logs -f
