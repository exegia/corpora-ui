# Branch & Release Policy

Source of truth for `corpora-ui`'s branch model, PR targeting rules, protection expectations, and
release promotion flow. Read [`LIFECYCLE.md`](./LIFECYCLE.md) alongside it.

This repo diverges from the shared `repo-template` in three ways, all in the release flow:

1. **`main` is an alias for the latest published version.** It runs no tests and no e2e — those
   already ran on `next`, and re-running them on the same source only adds a second chance to
   fail. `main` builds and publishes, nothing else.
2. **Versions are cut on `next`, not on `main`,** and the bump is derived from **lines changed**
   rather than conventional-commit prefixes.
3. **Promotion is by cherry-pick,** not by merging `next` into `main`.

## Branch model

| Branch / prefix | Purpose | Created by | Lifecycle? |
|---|---|---|---|
| `feature/<n>-<slug>` | New capability or enhancement | `issue-start-branch.yml` | yes |
| `bug/<n>-<slug>` | Defect fix | `issue-start-branch.yml` | yes |
| `doc/<n>-<slug>` | Documentation-only change | `issue-start-branch.yml` | yes |
| `chore/<n>-<slug>` | CI, build, refactor, tooling | `issue-start-branch.yml` | yes |
| `dev` | Integration branch | protected long-lived branch | yes |
| `next` | Staging / pre-release branch | protected long-lived branch | yes |
| `main` | Production branch — latest published tag | protected long-lived branch | yes |
| `release/vX.Y.Z` | Cherry-picked promotion branch | `promote-to-main.yml` | yes |
| `hotfix/*`, `dependabot/*`, `copilot/*`, `claude/*` | Bot and exception flows | respective bots / maintainers | exempt from branch-tag enforcement |

## PR targeting rules (enforced by `pr-base-policy.yml`)

1. **Lifecycle work targets `dev`.** PRs opened against unsupported base branches are reassigned
   to `dev`.
2. **Only `dev` promotes into `next`.** Any other head branch targeting `next` is redirected back
   to `dev`.
3. **Only `release/vX.Y.Z` releases into `main`.** PRs into `main` from any other head are closed —
   *including `next` itself*, since releases are cherry-picked rather than merged from staging.

## Where CI runs

| Branch | Lint / typecheck / unit | e2e | Build | Publish |
|---|---|---|---|---|
| PR → `dev` | ✅ | — | verification only | — |
| push `dev` | ✅ | — | verification only | — |
| PR → `next` | ✅ | — | verification only | — |
| push `next` | ✅ | ✅ | verification only | — |
| PR → `main` | — | — | — | — |
| release published | — | — | ✅ | ✅ |

Nothing on `next` builds an artifact for distribution. A build there exists only to prove the
package compiles before it is tagged.

## Release flow

### 1. Cutting the version on `next`

Every merge into `next` runs `next-staging.yml`. After the test job passes, the tag job does one
of two things:

- **No release is open** — no `v*.*.*` tag exists that is reachable from `next` but not yet an
  ancestor of `main`. The workflow counts the lines changed since the last released tag, maps that
  onto a bump, and creates the new tag.
- **A release is already open** — that tag is **force-moved** onto the new merge commit, so the
  changes from the PR that just merged ship under the version already cut. No new version is
  created.

Exactly one release tag is open at a time. The tag is provisional while it lives on `next`.

**Exception — promotion in flight.** If a `release/vX.Y.Z → main` PR is already open, the tag is
*not* advanced. That PR carries a fixed set of cherry-picks; moving the tag past it would make the
tag claim commits the PR does not contain, and `release-tag.yml` would then re-anchor that tag on
`main` — publishing a version that silently dropped work. The merge stays on `next` untagged and is
picked up by the next version instead. The job succeeds with a warning annotation.

### 2. Line-based semantic versioning

Insertions + deletions since the last released tag, measured with `git diff --numstat`:

| Changed lines | Bump |
|---|---|
| `< PATCH_MAX` (default 100) | **patch** |
| `< MINOR_MAX` (default 1000) | **minor** |
| `>= MINOR_MAX` | **major** |

Both thresholds are constants at the top of `.github/scripts/release-version.sh`, alongside an
`EXCLUDE_PATHS` list that keeps lockfiles, `dist/`, snapshots, and compiled `*.lock.yml` out of the
count — without it a routine lockfile refresh reads as a major release.

> [!NOTE]
> This is a deliberate departure from the org default. Lines changed is a proxy for blast radius,
> not for compatibility: a one-line signature change is breaking, and a 2,000-line docs sweep is
> not. If a release is mis-sized, delete the open tag on `next` before promoting and re-run
> **Next Staging** with `workflow_dispatch`, or promote with an explicit `tag` input.

### 3. Promotion

Run the **Promote to Main** workflow (`promote-to-main.yml`) when staging is ready. It:

1. resolves the open release tag on `next`
2. cuts `release/vX.Y.Z` from `main`
3. cherry-picks (`-x`) every non-merge commit in `main..vX.Y.Z`, in order
4. stamps `## [Unreleased]` → `## [vX.Y.Z] - YYYY-MM-DD` in `CHANGELOG.md` on that branch
5. opens the `release/vX.Y.Z → main` PR

A cherry-pick conflict aborts the run and asks for manual resolution rather than pushing a
half-applied release.

> [!IMPORTANT]
> Step 3 uses `--no-merges`, which assumes `dev → next` PRs are **squash-merged** — one commit per
> PR, as `dev-to-next.md` instructs. Switching that repo to merge commits would make promotion
> cherry-pick the individual feature commits instead, changing what lands and in what order.

### 4. Publishing

When the promotion PR merges, `release-tag.yml`:

1. **moves the tag onto the `main` commit** — the cherry-picks have different SHAs than their
   `next` originals, so the tag must be re-anchored for `main` to be the released code
2. publishes the GitHub Release

Nothing is pushed to `main` outside the PR merge itself: the changelog was stamped on the promotion
branch precisely so a review-gated `main` never has to accept a direct bot push.

That release triggers `publish.yml`, which builds and publishes to npm with provenance. The cycle
then ends: the tag is frozen, and the next merge into `next` cuts a new version.

### Force-moved tags

The release tag is force-moved twice — forward along `next` on each merge, and once onto `main` at
promotion. Two consequences worth knowing:

- Anyone who fetched the tag while it was open gets a divergent ref and needs `git fetch --tags --force`.
- **Tag protection rules will block this.** Do not protect `v*` tags in this repo, or the staging
  tag job will fail.

Only the final position, on `main`, is permanent.

## Branch protection and ruleset expectations

`main`, `dev`, and `next` should all be:

1. non-deletable
2. non-force-pushable
3. review-gated
4. status-check gated

Apply with `.github/scripts/apply-branch-guardrails.sh`; ruleset definitions live in
`.github/rulesets/`.

## Cheat sheet

```text
issue (type:feature) ──status:in-progress──▶ feature/123-slug
                                              │
                                              ▼
                                  PR feature/123 → dev
                                              │
                                              ▼  Validation green on dev
                                  PR dev → next
                                              │  merge → Next Staging
                                              ▼  cut vX.Y.Z, or advance the open tag
                                  [ tests + e2e, no publish ]
                                              │  Promote to Main (manual)
                                              ▼  cherry-pick main..vX.Y.Z
                                  PR release/vX.Y.Z → main
                                              │  merge
                                              ▼
                                  tag vX.Y.Z re-anchored on main
                                  + GitHub Release → npm publish
```

## Related files

- `.github/LIFECYCLE.md`
- `.github/scripts/release-version.sh`
- `.github/workflows/ci.yml`
- `.github/workflows/validation.yml`
- `.github/workflows/next-staging.yml`
- `.github/workflows/promote-to-main.yml`
- `.github/workflows/release-tag.yml`
- `.github/workflows/publish.yml`
- `.github/workflows/pr-base-policy.yml`
- `.github/workflows/pr-branch-enforcement.yml`
