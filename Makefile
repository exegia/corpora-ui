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

# Line-count thresholds for promote: insertions+deletions of next...dev.
# < CHURN_MINOR → patch (0.0.+1); < CHURN_MAJOR → minor (0.+1.0); else major.
CHURN_MINOR ?= 100
CHURN_MAJOR ?= 1000

# Commit range for `release-notes`.
RANGE ?= origin/main..HEAD

# owner/name. The workflows set this from ${{ github.repository }}; otherwise it
# is derived from the origin remote. `gh` reads this variable natively too.
# (sed uses `,` as its delimiter: a `#` would open a comment, even inside $(shell).)
GH_REPO ?= $(shell git config --get remote.origin.url 2>/dev/null | sed -E 's,.*github\.com[:/],,; s,\.git$$,,')

# Branch and commit-title types accepted by `pr-guard`.
TYPES := feat|fix|chore|docs|ci|refactor|test|perf|build|style|revert

# Command strings, NOT $(shell …) values: every consumer runs them inside a
# recipe as `$$($(pkg_version))`. Turning them into make-time expansions makes
# that `$(0.21.0)` in sh — "0.21.0: not found" — and breaks pr-guard, publish
# and tag-release. (Regressed once per release so far; keep them as commands.)
pkg_version = node -p "require('./$(REACT_DIR)/package.json').version"
pkg_name = node -p "require('./$(REACT_DIR)/package.json').name"

.DEFAULT_GOAL := help

.PHONY: help install serve build preview test typecheck lint format check ci pack \
        clean distclean pkg-version next-version version-set release-notes \
        pr-guard pr-types-sync release-pr release-branch delete-branch publish publish-github \
        tag-release rulesets-apply rulesets-diff \
        churn-info churn-bump bootstrap-lanes promote-pr cut-release \
        sync-lanes cleanup-cycle cleanup-local

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

pr-guard: ## Validate a PR's base, branch name and title (env: BASE, HEAD, TITLE)
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
	dev|release/v*) \
	  echo "$$HEAD" | grep -Eq '^($(TYPES))/[a-z0-9][a-z0-9._-]*$$' \
	    || { echo "::error::branch must be <type>/<slug> — one of $(TYPES) (got '$$HEAD')"; exit 1; }; \
	  printf '%s' "$${TITLE-}" | grep -Eq '^($(TYPES))(\([a-z0-9._/-]+\))?!?: .+' \
	    || { echo "::error::PR title must read '<type>: summary' (got '$${TITLE-}')"; exit 1; }; \
	  ;; \
	next) \
	  [ "$$HEAD" = "dev" ] || echo "$$HEAD" | grep -Eq '^chore/sync-main-into-next$$' \
	    || { echo "::error::next only accepts PRs from dev (got '$$HEAD')"; exit 1; }; \
	  ;; \
	*) \
	  echo "::error::$$BASE is not a valid base — target dev, next, main, or release/vX.Y.Z"; exit 1;; \
	esac; \
	echo "guard passed: $$HEAD -> $$BASE"

# A base missing from pr.yml's filter does not fail — it runs no workflow at
# all, so the PR reports no checks and can be merged with the guard never
# having run. That is silent, so the long-lived bases are compared here.
pr-types-sync: ## Verify pr.yml lists main, next, dev, and release/v* as bases
	@set -eu; \
	wf=.github/workflows/pr.yml; \
	rc=0; \
	for b in main next dev; do \
	  grep -qE "^ +- $$b$$" "$$wf" \
	    || { echo "::error::$$wf does not list $$b as a PR base"; rc=1; }; \
	done; \
	grep -q 'release/v\*' "$$wf" \
	  || { echo "::error::$$wf does not list release/v* as a PR base, so in-flight release PRs would run no checks"; rc=1; }; \
	[ "$$rc" = 0 ] || exit 1; \
	echo "pr.yml lists main, next, dev, and release/v*"

release-pr: ## Open or refresh the draft release PR into main (env: BRANCH)
	@set -eu; \
	branch="$${BRANCH:-$$(git rev-parse --abbrev-ref HEAD)}"; \
	version="$${branch#release/v}"; \
	git fetch --quiet origin \
	  "main:refs/remotes/origin/main" "$$branch:refs/remotes/origin/$$branch"; \
	body="$$(mktemp)"; \
	{ printf 'Release **v%s**.\n\n## Changes\n\n' "$$version"; \
	  $(MAKE) -s --no-print-directory release-notes RANGE="origin/main..origin/$$branch"; \
	  printf '\n---\nRefreshed automatically whenever `%s` is updated from `next`.\n' "$$branch"; \
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

# --- promotion (dev → next → release/v*) ------------------------------------

# Prints: bump insertions deletions total
# bump is major|minor|patch from CHURN_* thresholds.
churn-info: ## Print bump and line counts for FROM...TO (env: FROM, TO)
	@set -eu; \
	: "$${FROM:?FROM is required}" "$${TO:?TO is required}"; \
	stat="$$(git diff --shortstat "$$FROM...$$TO" 2>/dev/null || true)"; \
	ins="$$(printf '%s' "$$stat" | sed -n 's/.* \([0-9][0-9]*\) insertion.*/\1/p')"; \
	del="$$(printf '%s' "$$stat" | sed -n 's/.* \([0-9][0-9]*\) deletion.*/\1/p')"; \
	ins="$${ins:-0}"; del="$${del:-0}"; \
	total=$$((ins + del)); \
	if [ "$$total" -ge $(CHURN_MAJOR) ]; then bump=major; \
	elif [ "$$total" -ge $(CHURN_MINOR) ]; then bump=minor; \
	else bump=patch; \
	fi; \
	printf '%s %s %s %s\n' "$$bump" "$$ins" "$$del" "$$total"

churn-bump: ## Classify a bump from git diff --shortstat (env: FROM, TO)
	@$(MAKE) -s --no-print-directory churn-info FROM="$(FROM)" TO="$(TO)" | awk '{print $$1}'

bootstrap-lanes: ## Create origin/dev and origin/next if they do not exist
	@set -eu; \
	git fetch --quiet --force --tags origin \
	  "+refs/heads/main:refs/remotes/origin/main"; \
	if git ls-remote --exit-code --heads origin next >/dev/null 2>&1; then \
	  echo "origin/next already exists"; \
	else \
	  git push origin refs/remotes/origin/main:refs/heads/next; \
	  echo "created origin/next from main"; \
	fi; \
	if git ls-remote --exit-code --heads origin dev >/dev/null 2>&1; then \
	  echo "origin/dev already exists"; \
	else \
	  ver="$$(git ls-remote --heads origin 'release/v*' \
	    | awk '{print $$2}' \
	    | sed 's|refs/heads/release/v||' \
	    | grep -E '^[0-9]+\.[0-9]+\.[0-9]+$$' \
	    | sort -t. -k1,1n -k2,2n -k3,3n \
	    | tail -1 || true)"; \
	  if [ -n "$$ver" ]; then src="release/v$$ver"; \
	  else src=main; \
	  fi; \
	  git fetch --quiet origin "+refs/heads/$$src:refs/remotes/origin/$$src"; \
	  git push origin "refs/remotes/origin/$$src:refs/heads/dev"; \
	  echo "created origin/dev from $$src"; \
	fi

promote-pr: ## Open or refresh the PR from dev into next (env: VERSION, BUMP, CHURN)
	@set -eu; \
	git fetch --quiet --force origin \
	  "+refs/heads/dev:refs/remotes/origin/dev" \
	  "+refs/heads/next:refs/remotes/origin/next"; \
	ahead="$$(git rev-list --count origin/next..origin/dev)"; \
	if [ "$$ahead" -eq 0 ]; then \
	  echo "dev is not ahead of next — nothing to promote"; \
	  exit 0; \
	fi; \
	: "$${VERSION:?VERSION is required}"; \
	stat="$$(git diff --shortstat origin/next...origin/dev || true)"; \
	body="$$(mktemp)"; \
	{ printf 'Promote **v%s** (`%s`%s).\n\n' "$$VERSION" "$${BUMP:-patch}" \
	    "$${CHURN:+, $$CHURN lines of churn}"; \
	  printf '<!-- corpora-release: v%s -->\n\n' "$$VERSION"; \
	  printf '%s\n\n' "$${stat:-0 files changed}"; \
	  printf -- '- bump: %s\n' "$${BUMP:-patch}"; \
	} > "$$body"; \
	num="$$(gh pr list --base next --head dev --state open --json number --jq '.[0].number // empty')"; \
	if [ -n "$$num" ]; then \
	  gh pr edit "$$num" --title "chore: promote v$$VERSION to next" --body-file "$$body"; \
	  echo "refreshed promote PR #$$num"; \
	else \
	  gh pr create --base next --head dev \
	    --title "chore: promote v$$VERSION to next" --body-file "$$body"; \
	  num="$$(gh pr list --base next --head dev --state open --json number --jq '.[0].number // empty')"; \
	  echo "opened promote PR #$$num"; \
	fi; \
	rm -f "$$body"; \
	gh pr merge "$$num" --auto --merge

cut-release: ## Cut or refresh release/v<VERSION> from origin/next (env: VERSION)
	@set -eu; \
	git fetch --quiet --force origin \
	  "+refs/heads/next:refs/remotes/origin/next" \
	  "+refs/heads/main:refs/remotes/origin/main"; \
	if git diff --quiet origin/main origin/next; then \
	  echo "next and main have the same tree — nothing to cut"; \
	  exit 0; \
	fi; \
	existing="$$(gh pr list --base main --state open --json headRefName \
	  --jq '[.[] | select(.headRefName | test("^release/v[0-9]"))] | .[0].headRefName // empty')"; \
	if [ -n "$$existing" ]; then \
	  version="$${existing#release/v}"; \
	  echo "in-flight $$existing — refreshing at v$$version"; \
	else \
	  if [ -z "$${VERSION-}" ]; then \
	    body="$$(gh pr list --base next --head dev --state merged --limit 1 \
	      --json body --jq '.[0].body // empty')"; \
	    VERSION="$$(printf '%s' "$$body" | sed -n 's/.*<!-- corpora-release: v\([0-9][0-9.]*\) -->.*/\1/p')"; \
	  fi; \
	  if [ -z "$${VERSION-}" ]; then \
	    b="$$($(MAKE) -s --no-print-directory churn-bump FROM=origin/main TO=origin/next)"; \
	    VERSION="$$($(MAKE) -s --no-print-directory next-version BUMP="$$b")"; \
	  fi; \
	  version="$$VERSION"; \
	fi; \
	: "$${version:?could not determine VERSION to cut}"; \
	branch="release/v$$version"; \
	if git fetch --quiet origin "+refs/heads/$$branch:refs/remotes/origin/$$branch" 2>/dev/null; then \
	  git checkout --quiet -B "$$branch" "origin/$$branch"; \
	  git merge --quiet --no-edit -X theirs origin/next; \
	else \
	  git checkout --quiet -B "$$branch" origin/next; \
	fi; \
	$(MAKE) -s --no-print-directory version-set VERSION="$$version"; \
	git add $(REACT_DIR)/package.json; \
	if git diff --cached --quiet; then \
	  echo "react/package.json already $$version"; \
	else \
	  git commit --quiet -m "chore(release): open v$$version"; \
	fi; \
	git push --quiet -u origin "$$branch"; \
	echo "updated $$branch"

release-branch: ## Cut release/v<next> from origin/next (env: VERSION, BUMP)
	@$(MAKE) --no-print-directory cut-release \
	  VERSION="$${VERSION:-$$($(MAKE) -s --no-print-directory next-version)}"

sync-lanes: ## Merge origin/main into next and dev via PRs
	@set -eu; \
	$(MAKE) --no-print-directory bootstrap-lanes; \
	git fetch --quiet --force origin \
	  "+refs/heads/main:refs/remotes/origin/main" \
	  "+refs/heads/next:refs/remotes/origin/next" \
	  "+refs/heads/dev:refs/remotes/origin/dev"; \
	for lane in next dev; do \
	  head="chore/sync-main-into-$$lane"; \
	  git checkout --quiet -B "$$head" "origin/$$lane"; \
	  if git merge-base --is-ancestor origin/main HEAD; then \
	    echo "$$lane already contains main"; \
	    continue; \
	  fi; \
	  git merge --quiet --no-edit origin/main; \
	  git push --force-with-lease --quiet -u origin "$$head"; \
	  body="$$(mktemp)"; \
	  printf 'Sync **main** into `%s` after the production release.\n' "$$lane" > "$$body"; \
	  num="$$(gh pr list --base "$$lane" --head "$$head" --state open --json number --jq '.[0].number // empty')"; \
	  if [ -n "$$num" ]; then \
	    gh pr edit "$$num" --title "chore: sync main into $$lane" --body-file "$$body"; \
	    echo "refreshed sync PR #$$num into $$lane"; \
	  else \
	    gh pr create --base "$$lane" --head "$$head" \
	      --title "chore: sync main into $$lane" --body-file "$$body"; \
	    num="$$(gh pr list --base "$$lane" --head "$$head" --state open --json number --jq '.[0].number // empty')"; \
	    echo "opened sync PR #$$num into $$lane"; \
	  fi; \
	  rm -f "$$body"; \
	  gh pr merge "$$num" --auto --merge; \
	done

cleanup-cycle: ## Delete remote feature branches merged into dev, leftover release/v*
	@set -eu; \
	git fetch --quiet --prune origin; \
	git fetch --quiet --force origin "+refs/heads/dev:refs/remotes/origin/dev"; \
	for ref in $$(git branch -r --merged origin/dev \
	    | sed 's/^[[:space:]]*origin\///' \
	    | grep -E '^($(TYPES))/' || true); do \
	  $(MAKE) -s --no-print-directory delete-branch BRANCH="$$ref"; \
	done; \
	open="$$(gh pr list --base main --state open --json headRefName \
	  --jq '[.[].headRefName | select(startswith("release/v"))] | join(" ")')"; \
	for ref in $$(git ls-remote --heads origin 'release/v*' \
	    | awk '{print $$2}' | sed 's|refs/heads/||'); do \
	  case " $$open " in *" $$ref "*) continue ;; esac; \
	  $(MAKE) -s --no-print-directory delete-branch BRANCH="$$ref"; \
	done

cleanup-local: ## Delete local feature/release branches whose remotes are gone
	@set -eu; \
	git fetch --prune --quiet origin; \
	current="$$(git rev-parse --abbrev-ref HEAD)"; \
	for b in $$(git branch --format='%(refname:short)' \
	    | grep -E '^($(TYPES))/|^release/v' || true); do \
	  [ "$$b" = "$$current" ] && continue; \
	  if git ls-remote --exit-code --heads origin "$$b" >/dev/null 2>&1; then \
	    continue; \
	  fi; \
	  git branch -D "$$b"; \
	done

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
