#!/usr/bin/env bash
# Shared release-version helpers for the `next → main` lifecycle.
#
# One release tag is open at a time. It is created on `next` when no open tag exists, then
# force-moved forward on every subsequent merge into `next`, and finally moved onto `main`
# and frozen when the promotion PR lands.
#
# Source this file from a workflow step:
#   . .github/scripts/release-version.sh
#
# Requires: a full-depth checkout with tags (actions/checkout with fetch-depth: 0).

set -euo pipefail

# ---------------------------------------------------------------------------
# Tunables — semver bump is driven by lines changed (see BRANCH-AND-RELEASE-POLICY.md).
#
# total changed lines (insertions + deletions) since the last released tag:
#   < PATCH_MAX            → patch
#   < MINOR_MAX            → minor
#   >= MINOR_MAX           → major
# ---------------------------------------------------------------------------
: "${PATCH_MAX:=100}"
: "${MINOR_MAX:=1000}"

# Paths excluded from the line count. Generated and vendored files would otherwise
# dominate the bump — a lockfile refresh alone can read as a major release.
EXCLUDE_PATHS=(
  ':(exclude)**/*.lock'
  ':(exclude)bun.lock'
  ':(exclude)bun.lockb'
  ':(exclude)package-lock.json'
  ':(exclude)pnpm-lock.yaml'
  ':(exclude)yarn.lock'
  ':(exclude)dist/**'
  ':(exclude)build/**'
  ':(exclude)**/__snapshots__/**'
  ':(exclude)**/*.snap'
  ':(exclude)**/*.lock.yml'
  ':(exclude)CHANGELOG.md'
)

# latest_released_tag — highest v*.*.* tag that is already an ancestor of main.
# This is the version production currently serves. Prints v0.0.0 when there is none.
latest_released_tag() {
  local t latest=""
  for t in $(git tag --list 'v[0-9]*.[0-9]*.[0-9]*' | sort -V); do
    if git merge-base --is-ancestor "$t" origin/main 2>/dev/null; then
      latest="$t"
    fi
  done
  printf '%s\n' "${latest:-v0.0.0}"
}

# open_release_tag — highest v*.*.* tag that is reachable from next but NOT yet an ancestor
# of main; that is, a release that has been cut on staging and not yet promoted. Prints an
# empty string when no release is open.
#
# Note the deliberate avoidance of `git describe --abbrev=0`: it returns the *nearest*
# reachable tag, which is not necessarily the highest one.
open_release_tag() {
  local t open=""
  for t in $(git tag --merged origin/next --list 'v[0-9]*.[0-9]*.[0-9]*' | sort -V); do
    if ! git merge-base --is-ancestor "$t" origin/main 2>/dev/null; then
      open="$t"
    fi
  done
  printf '%s\n' "$open"
}

# changed_lines <from_ref> <to_ref> — insertions + deletions between two refs, excluding
# the generated paths above.
changed_lines() {
  local from="$1" to="$2" range
  if git rev-parse -q --verify "${from}^{commit}" >/dev/null 2>&1; then
    range="${from}..${to}"
  else
    range="$to"   # no prior tag: count the whole history reachable from <to>
  fi
  git diff --numstat "$range" -- "${EXCLUDE_PATHS[@]}" 2>/dev/null |
    awk '{ a = ($1 == "-" ? 0 : $1); d = ($2 == "-" ? 0 : $2); total += a + d } END { print total + 0 }'
}

# bump_for_lines <count> — maps a line count onto a semver bump level.
bump_for_lines() {
  local n="$1"
  if   [ "$n" -lt "$PATCH_MAX" ]; then printf 'patch\n'
  elif [ "$n" -lt "$MINOR_MAX" ]; then printf 'minor\n'
  else                                 printf 'major\n'
  fi
}

# next_version <base_tag> <bump> — applies a bump level to vX.Y.Z.
next_version() {
  local base="${1#v}" bump="$2" major minor patch
  IFS=. read -r major minor patch <<< "$base"
  major=${major:-0}; minor=${minor:-0}; patch=${patch:-0}
  case "$bump" in
    major) major=$((major + 1)); minor=0; patch=0 ;;
    minor) minor=$((minor + 1)); patch=0 ;;
    patch) patch=$((patch + 1)) ;;
    *) echo "unknown bump level: $bump" >&2; return 1 ;;
  esac
  printf 'v%s.%s.%s\n' "$major" "$minor" "$patch"
}

# configure_git_bot — commit identity for automated commits and tags.
configure_git_bot() {
  git config user.name "github-actions[bot]"
  git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
}
