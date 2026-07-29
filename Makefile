# corpora-ui — task runner for the react/ library
# Usage: make <target>   (run from the repo root)

REACT_DIR := react
BUN := bun

.DEFAULT_GOAL := help

.PHONY: help install serve build preview test typecheck lint format check clean distclean

help: ## List available targets
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

install: ## Install dependencies
	cd $(REACT_DIR) && $(BUN) install

serve: ## Start the Vite dev server
	cd $(REACT_DIR) && $(BUN) run dev

build: ## Type-check and build for production
	cd $(REACT_DIR) && $(BUN) run build

preview: ## Serve the production build locally
	cd $(REACT_DIR) && $(BUN) run preview

test: ## Run the bun test runner
	cd $(REACT_DIR) && $(BUN) test

typecheck: ## Type-check without emitting
	cd $(REACT_DIR) && $(BUN) run typecheck

lint: ## Run eslint
	cd $(REACT_DIR) && $(BUN) run lint

format: ## Format sources with prettier
	cd $(REACT_DIR) && $(BUN) run format

check: typecheck lint ## Typecheck + lint (CI quality gate)

clean: ## Remove build output and caches
	rm -rf $(REACT_DIR)/dist $(REACT_DIR)/node_modules/.vite

distclean: clean ## Also remove node_modules
	rm -rf $(REACT_DIR)/node_modules
