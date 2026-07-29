# Branching and release

Three long-lived things: `main`, npm, and the tags. Everything else is temporary.

```
feat/add-tooltip ──PR──> release/v0.4.0 ──PR──> main ──> npm + tag v0.4.0
      (deleted on merge)   (deleted on release)          (opens release/v0.5.0)
```

## Feature branches

Named `<type>/<slug>` — `feat`, `fix`, `chore`, `docs`, `ci`, `refactor`,
`test`, `perf`, `build`, `style`, `revert`. (Git forbids `:` in a ref name, so
the conventional-commit form lives in the **PR title**: `feat: add tooltip`.)

Branch off the open release branch and open a PR back into it. While the PR is
a draft only the guard runs; marking it **ready for review** starts the tests
and the AI review, which then re-run on every push.

When it merges the branch deletes itself, and the release's draft PR into `main`
is opened or refreshed with a changelog of everything on the branch so far.

## Release branches

Named `release/vX.Y.Z`, and always carry that version in `react/package.json` —
the guard rejects a PR into `main` where the two disagree.

Exactly one is open at a time. It is cut automatically after each release, and
its draft PR into `main` accumulates changes as features land. Marking that PR
ready for review runs the tests plus a real `npm pack`, uploaded as an artifact.

## `main`

No direct pushes; PRs only from `release/vX.Y.Z`. Merging one publishes to npm
with provenance, creates the `vX.Y.Z` tag and GitHub Release, deletes the
release branch and opens the next one (minor bump by default).

## Workflows

| File            | Trigger                     | Does                                       |
|-----------------|-----------------------------|--------------------------------------------|
| `pr.yml`        | PR opened / ready / pushed  | `guard`, `check`, `package`, `review`      |
| `pr-merged.yml` | PR merged into `release/v*` | deletes the branch, upserts the release PR |
| `release.yml`   | PR merged into `main`       | publishes, tags, cuts the next release     |

Every step is a `make` target, so anything CI does can be reproduced locally.

## Bootstrap and manual operations

There is no release branch to start from on a fresh repo. Run the **Release**
workflow manually (`Actions → Release → Run workflow`, pick a bump) — the
publish job skips and the next-release job opens the branch. Locally:

```bash
make release-branch BUMP=minor
```

Other useful targets:

```bash
make ci                            # what CI runs on a PR
make next-version BUMP=patch       # what the next release would be called
make release-notes RANGE=origin/main..HEAD
make rulesets-diff                 # rulesets GitHub actually has
make rulesets-apply                # push .github/rulesets/*.json
```

`make publish` and `make tag-release` are idempotent — a version already on npm
or a tag already released is skipped, not an error.

## Secrets

| Name                                               | Where            | Used by                  |
|----------------------------------------------------|------------------|--------------------------|
| `NPM_TOKEN`                                        | `production` env | `release.yml` publish    |
| `AUTOMATION_APP_ID` / `AUTOMATION_APP_PRIVATE_KEY` | repository       | opening PRs and branches |
| `CLAUDE_CODE_OAUTH_TOKEN`                          | repository       | the AI review (optional) |

Without `CLAUDE_CODE_OAUTH_TOKEN` the review job skips with a note in the job
summary rather than failing.
