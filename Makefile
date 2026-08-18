# corpora-ui — task runner for the react/ library and the release pipeline.
# Usage: make <target>   (run from the repo root)
#
# CI calls these targets directly; every workflow step is a one-line `make`.

REACT_DIR := react
BUN := bun

# `--frozen-lockfile` in CI, a plain install locally.
INSTALL_FLAGS ?=

# Bump used when opening the next release branch.
BUMP ?= minor

# Commit range for `release-notes`.
RANGE ?= origin/main..HEAD

# owner/name. The workflows set this from ${{ github.repository }}; otherwise it
# is derived from the origin remote. `gh` reads this variable natively too.
# (sed uses `,` as its delimiter: a `#` would open a comment, even inside $(shell).)
GH_REPO ?= $(shell git config --get remote.origin.url 2>/dev/null | sed -E 's,.*github\.com[:/],,; s,\.git$$,,')

# Branch and commit-title types accepted by `pr-guard`.
TYPES := feat|fix|chore|docs|ci|refactor|test|perf|build|style|revert

pkg_version = $(shell node -p "require('./$(REACT_DIR)/package.json').version")
pkg_name = $(shell node -p "require('./$(REACT_DIR)/package.json').name")

.DEFAULT_GOAL := help

.PHONY: help install serve build preview test typecheck lint format check ci pack \
        clean distclean pkg-version next-version version-set release-notes \
        pr-guard pr-types-sync release-pr release-branch delete-branch publish publish-github \
        tag-release rulesets-apply rulesets-diff

help: ## List available targets
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-16s\033[0m %s\n", $$1, $$2}'

# --- development ------------------------------------------------------------

install: ## Install dependencies
	cd $(REACT_DIR) && $(BUN) install $(INSTALL_FLAGS)

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

check: typecheck lint ## Typecheck + lint

ci: install check test build ## Everything CI runs on a pull request

clean: ## Remove build output and caches
	rm -rf $(REACT_DIR)/dist $(REACT_DIR)/dist-lib $(REACT_DIR)/node_modules/.vite dist-pack

distclean: clean ## Also remove node_modules
	rm -rf $(REACT_DIR)/node_modules

# --- versions ---------------------------------------------------------------

pkg-version: ## Print the version in react/package.json
	@$(pkg_version)

next-version: ## Print the version after the newest vX.Y.Z tag (BUMP=major|minor|patch)
	@git tag -l 'v[0-9]*.[0-9]*.[0-9]*' | sed 's/^v//' \
	  | sort -t. -k1,1n -k2,2n -k3,3n | tail -1 \
	  | awk -F. -v b='$(BUMP)' \
	      'BEGIN { maj = 0; min = 0; pat = 0 } { maj = $$1; min = $$2; pat = $$3 } \
	       END { if (b == "major") printf "%d.0.0\n", maj + 1; \
	             else if (b == "patch") printf "%d.%d.%d\n", maj, min, pat + 1; \
	             else printf "%d.%d.0\n", maj, min + 1 }'

version-set: ## Write VERSION into react/package.json (env: VERSION)
	@set -eu; : "$${VERSION:?VERSION is required}"; \
	(cd $(REACT_DIR) && npm pkg set version="$$VERSION"); \
	echo "react/package.json is now $$VERSION"

release-notes: ## Print a markdown changelog for RANGE (default origin/main..HEAD)
	@git log --no-merges --reverse --pretty='- %s' $(RANGE) | grep . \
	  || echo '- _Nothing merged yet._'

# --- pull requests ----------------------------------------------------------

# BASE_PR / BASE_PR_STATE describe the PR whose head is BASE — number and
# OPEN|MERGED|CLOSED, or empty when the branch has never had one. They are only
# consulted for a <type>/<slug> base, which is a link in a stack exactly when it
# carries a PR of its own; that is what separates a real stack parent from a
# stale or unrelated branch that merely happens to be named correctly.
#
# MERGED counts as valid. `gh stack merge` is atomic, so a healthy stack never
# sits half-merged, but a partial merge leaves the PRs above it pointing at a
# branch whose PR has landed until `gh stack sync` retargets them. That window
# is a legitimate state to be in, not a misconfigured base, so it warns instead
# of failing. CLOSED does fail: an abandoned branch is not a stack parent.
#
# Resolving this needs an API call, so the caller passes it in and this target
# stays hermetic — leave BASE_PR unset to skip the check locally.
pr-guard: ## Validate a PR's base, branch name and title (env: BASE, HEAD, TITLE, BASE_PR, BASE_PR_STATE)
	@set -eu; \
	: "$${BASE:?BASE is required}" "$${HEAD:?HEAD is required}"; \
	case "$$BASE" in \
	main) \
	  echo "$$HEAD" | grep -Eq '^release/v[0-9]+\.[0-9]+\.[0-9]+$$' \
	    || { echo "::error::main only accepts PRs from release/vX.Y.Z (got '$$HEAD')"; exit 1; }; \
	  want="release/v$$($(pkg_version))"; \
	  [ "$$want" = "$$HEAD" ] \
	    || { echo "::error::react/package.json declares $$want but the branch is $$HEAD"; exit 1; }; \
	  ;; \
	release/v*) \
	  echo "$$HEAD" | grep -Eq '^($(TYPES))/[a-z0-9][a-z0-9._-]*$$' \
	    || { echo "::error::branch must be <type>/<slug> — one of $(TYPES) (got '$$HEAD')"; exit 1; }; \
	  printf '%s' "$${TITLE-}" | grep -Eq '^($(TYPES))(\([a-z0-9._/-]+\))?!?: .+' \
	    || { echo "::error::PR title must read '<type>: summary' (got '$${TITLE-}')"; exit 1; }; \
	  ;; \
	*) \
	  echo "$$BASE" | grep -Eq '^($(TYPES))/[a-z0-9][a-z0-9._-]*$$' \
	    || { echo "::error::$$BASE is not a valid base — target main, release/vX.Y.Z, or another <type>/<slug> branch when stacking"; exit 1; }; \
	  if [ "$${BASE_PR+set}" = set ]; then \
	    [ -n "$$BASE_PR" ] \
	      || { echo "::error::$$BASE has never had a PR, so it is not a link in a stack — retarget onto release/vX.Y.Z"; exit 1; }; \
	    case "$${BASE_PR_STATE-}" in \
	    OPEN) \
	      echo "stacked on $$BASE (PR #$$BASE_PR)";; \
	    MERGED) \
	      echo "::warning::$$BASE has landed (PR #$$BASE_PR) — run 'gh stack sync' to retarget this PR onto the trunk";; \
	    *) \
	      echo "::error::$$BASE's PR #$$BASE_PR is $${BASE_PR_STATE:-in an unknown state}, not open or merged — retarget onto release/vX.Y.Z"; exit 1;; \
	    esac; \
	  else \
	    echo "note: BASE_PR unset — skipping the stack-membership check"; \
	  fi; \
	  echo "$$HEAD" | grep -Eq '^($(TYPES))/[a-z0-9][a-z0-9._-]*$$' \
	    || { echo "::error::branch must be <type>/<slug> — one of $(TYPES) (got '$$HEAD')"; exit 1; }; \
	  printf '%s' "$${TITLE-}" | grep -Eq '^($(TYPES))(\([a-z0-9._/-]+\))?!?: .+' \
	    || { echo "::error::PR title must read '<type>: summary' (got '$${TITLE-}')"; exit 1; }; \
	  ;; \
	esac; \
	echo "guard passed: $$HEAD -> $$BASE"

# A base missing from pr.yml's filter does not fail — it runs no workflow at
# all, so the PR reports no checks and can be merged with the guard never
# having run. That is silent, so the two lists are compared here instead of
# being left to whoever edits TYPES next.
pr-types-sync: ## Verify pr.yml's base filter lists every TYPES prefix
	@set -eu; \
	wf=.github/workflows/pr.yml; \
	rc=0; \
	for t in $$(printf '%s' '$(TYPES)' | tr '|' ' '); do \
	  grep -q "^ *- \"$$t/\*\"" "$$wf" \
	    || { echo "::error::$$wf does not accept \"$$t/*\" as a base, so stacked PRs from $$t/ branches would run no checks at all"; rc=1; }; \
	done; \
	for p in $$(sed -n 's/^ *- "\([a-z]*\)\/\*"$$/\1/p' "$$wf" | sort -u); do \
	  printf '%s' '$(TYPES)' | tr '|' '\n' | grep -qx "$$p" \
	    || { echo "::error::$$wf accepts \"$$p/*\" as a base but TYPES does not list $$p — the guard would reject what CI let through"; rc=1; }; \
	done; \
	[ "$$rc" = 0 ] || exit 1; \
	echo "pr.yml base filter matches TYPES"

release-pr: ## Open or refresh the draft release PR into main (env: BRANCH)
	@set -eu; \
	branch="$${BRANCH:-$$(git rev-parse --abbrev-ref HEAD)}"; \
	version="$${branch#release/v}"; \
	git fetch --quiet origin \
	  "main:refs/remotes/origin/main" "$$branch:refs/remotes/origin/$$branch"; \
	body="$$(mktemp)"; \
	{ printf 'Release **v%s**.\n\n## Changes\n\n' "$$version"; \
	  $(MAKE) -s --no-print-directory release-notes RANGE="origin/main..origin/$$branch"; \
	  printf '\n---\nRefreshed automatically whenever a PR lands on `%s`.\n' "$$branch"; \
	} > "$$body"; \
	num="$$(gh pr list --base main --head "$$branch" --state open --json number --jq '.[0].number // empty')"; \
	if [ -n "$$num" ]; then \
	  gh pr edit "$$num" --body-file "$$body"; \
	  echo "refreshed release PR #$$num"; \
	else \
	  gh pr create --draft --base main --head "$$branch" \
	    --title "release: v$$version" --body-file "$$body"; \
	fi; \
	rm -f "$$body"

delete-branch: ## Delete a remote branch, tolerating one already gone (env: BRANCH)
	@set -eu; : "$${BRANCH:?BRANCH is required}"; \
	if gh api -X DELETE "repos/$(GH_REPO)/git/refs/heads/$$BRANCH" >/dev/null 2>&1; then \
	  echo "deleted $$BRANCH"; \
	else \
	  echo "$$BRANCH was already gone"; \
	fi

# --- releases ---------------------------------------------------------------

pack: install build ## Write the publishable tarball to dist-pack/
	mkdir -p dist-pack
	cd $(REACT_DIR) && npm pack --pack-destination ../dist-pack

publish: ## Publish react/ to npm, skipping a version that is already public
	@set -eu; \
	name="$$($(pkg_name))"; version="$$($(pkg_version))"; \
	if npm view "$$name@$$version" version >/dev/null 2>&1; then \
	  echo "$$name@$$version is already on npm — skipping"; exit 0; \
	fi; \
	cd $(REACT_DIR) && npm publish --provenance --access public

# GitHub Packages requires auth even for reads, so the skip-check relies on the
# same .npmrc token `npm publish` does. No --provenance: npmjs-only feature.
publish-github: ## Publish react/ to GitHub Packages, skipping a version already there
	@set -eu; \
	name="$$($(pkg_name))"; version="$$($(pkg_version))"; \
	registry=https://npm.pkg.github.com; \
	if npm view "$$name@$$version" version --registry "$$registry" >/dev/null 2>&1; then \
	  echo "$$name@$$version is already on GitHub Packages — skipping"; exit 0; \
	fi; \
	cd $(REACT_DIR) && npm publish --registry "$$registry"

tag-release: ## Tag HEAD as v<package version> and publish the GitHub Release
	@set -eu; \
	tag="v$$($(pkg_version))"; \
	if gh api "repos/$(GH_REPO)/git/ref/tags/$$tag" >/dev/null 2>&1; then \
	  echo "$$tag already exists — skipping"; exit 0; \
	fi; \
	gh release create "$$tag" --target "$$(git rev-parse HEAD)" \
	  --title "$$tag" --generate-notes; \
	echo "released $$tag"

release-branch: ## Cut release/v<next> from main with the version bumped (env: VERSION, BUMP)
	@set -eu; \
	git fetch --quiet --force --tags origin "main:refs/remotes/origin/main"; \
	version="$${VERSION:-$$($(MAKE) -s --no-print-directory next-version)}"; \
	branch="release/v$$version"; \
	if git ls-remote --exit-code --heads origin "$$branch" >/dev/null 2>&1; then \
	  echo "$$branch already exists — nothing to do"; exit 0; \
	fi; \
	git checkout --quiet -B "$$branch" origin/main; \
	$(MAKE) -s --no-print-directory version-set VERSION="$$version"; \
	git add $(REACT_DIR)/package.json; \
	git commit --quiet -m "chore(release): open v$$version"; \
	git push --quiet -u origin "$$branch"; \
	echo "opened $$branch"

# --- repository settings ----------------------------------------------------

rulesets-diff: ## List the rulesets GitHub currently has, by id and name
	@gh api "repos/$(GH_REPO)/rulesets" --jq '.[] | "\(.id)\t\(.name)"'

rulesets-apply: ## Push .github/rulesets/*.json to GitHub (matched by name)
	@set -eu; \
	for f in .github/rulesets/*.json; do \
	  name="$$(node -p "require('./$$f').name")"; \
	  id="$$(gh api "repos/$(GH_REPO)/rulesets" --jq ".[] | select(.name==\"$$name\") | .id")"; \
	  if [ -n "$$id" ]; then \
	    gh api -X PUT "repos/$(GH_REPO)/rulesets/$$id" --input "$$f" >/dev/null; \
	    echo "updated $$name"; \
	  else \
	    gh api -X POST "repos/$(GH_REPO)/rulesets" --input "$$f" >/dev/null; \
	    echo "created $$name"; \
	  fi; \
	done
