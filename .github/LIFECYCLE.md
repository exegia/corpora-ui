# Feature lifecycle workflows

Automation for the `feature/** → dev → next → main` lifecycle, built on
[GitHub Agentic Workflows (`gh-aw`)](https://github.com/githubnext/gh-aw) plus deterministic
GitHub Actions workflows where an agent would add no value.

Bootstrapped from `repo-template`, with the release stages rewritten — see
[`BRANCH-AND-RELEASE-POLICY.md`](./BRANCH-AND-RELEASE-POLICY.md) for the definitive policy.

## How this is wired

Agentic workflows are authored as Markdown (`*.md`) with YAML frontmatter and compiled into
hardened Actions workflows (`*.lock.yml`). The agent job stays read-only; mutations happen through
safe outputs. Deterministic enforcement, testing, tagging, and publishing stay in plain `*.yml`.

> [!NOTE]
> After editing any agentic workflow source file, re-run:
>
> ```sh
> gh aw compile
> ```

## Conventions assumed

| Concern | Decision | Where to change |
|---|---|---|
| Issue status | `status:in-progress`, `status:in-review`, `status:qa` | workflow safe outputs |
| Branch → issue | `<prefix>/123-slug` where prefix is one of `feature`, `bug`, `doc`, `chore` | `issue-start-branch.yml` + prompts |
| AI engine | `copilot` for agentic workflows | `engine:` frontmatter |
| Base branches | `dev` (integration), `next` (staging), `main` (production) | triggers + `pr-base-policy.yml` |
| Toolchain | `bun` | `ci.yml`, `validation.yml`, `next-staging.yml`, `publish.yml` |
| Versioning | Lines-changed semver bump, cut on `next` | `.github/scripts/release-version.sh` |
| Promotion | Cherry-pick `next` → `release/vX.Y.Z` → `main` | `promote-to-main.yml` |
| Publishing | npm, from the GitHub Release only | `publish.yml` |

Create these labels once via `.github/scripts/create-triage-labels.sh`: `status:todo`,
`status:in-progress`, `status:in-review`, `status:qa`, `release:approved`, `needs-base-fix`,
`wiki-update`.

## The stages

| # | Trigger | File | Kind | What it does |
|---|---|---|---|---|
| 1 | branch `feature/**` created | `feature-branch-context-prime.md` | agentic | Load compact context for the new branch |
| 2 | branch `feature/**` created | `feature-branch-scenarios.md` | agentic | Parse the issue and write behavior scenarios |
| 3 | PR `feature/** → dev` opened | `pr-feature-draft.yml` | plain | Convert the new PR to draft |
| 4 | PR `feature/** → dev` opened | `pr-auto-unit-tests.md` | agentic | Add targeted tests when the repo already has a suitable harness |
| 5a | PR → `dev` or `next` | `ci.yml` | plain | Lint, typecheck, unit tests, verification build |
| 5b | `ci.yml` failed | `ci-failure-diagnose.md` | agentic | Diagnose CI failure and open a sub-issue |
| 6 | PR `feature/** → dev` ready for review | `pr-feature-review.md` | agentic | Perform pragmatic review and move the issue to `status:in-review` |
| 7 | PR `feature/** → dev` merged | `pr-merged-qa-scenarios.md` | agentic | Move the issue to `status:qa` and propose acceptance coverage |
| 7e | push to `dev` | `validation.yml` | plain | Promotion gate |
| 8 | `Validation` passed on `dev` | `dev-to-next.md` | agentic | Open the `dev → next` promotion PR and update release-facing docs |
| 9 | PR `* → *` opened | `pr-base-policy.yml` | plain | Enforce the `dev → next → release/* → main` base-branch policy |
| 10 | PR `<non-lifecycle> → *` opened | `pr-branch-enforcement.yml` | plain | Open a tracking issue for non-lifecycle branches |
| 11a | push to `next` | `next-staging.yml` (job `test`) | plain | Full staging suite including e2e; no publish |
| 11b | job `test` passed | `next-staging.yml` (job `tag`) | plain | Cut `vX.Y.Z`, or advance the open release tag |
| 12 | manual dispatch | `promote-to-main.yml` | plain | Cherry-pick the release onto `release/vX.Y.Z`, stamp the changelog, open the PR to `main` |
| 13 | PR `release/** → main` merged | `release-tag.yml` | plain | Re-anchor the tag on `main` and publish the GitHub Release |
| 14 | release published | `publish.yml` | plain | Build and publish to npm |

## Differences from `repo-template`

- **No `next-to-main-wiki` stage.** It assumed a `next → main` merge PR; promotion here is a
  cherry-picked `release/*` branch.
- **`release-tag.yml` is rewritten.** The template's version gates on `github.head_ref == 'next'`
  and computes a conventional-commit bump. Under cherry-pick promotion that condition never
  matches, so the trigger is `release/v*` and the version comes from the branch name.
- **Tagging moved to `next`.** The template tags on merge into `main`; here the tag is cut on
  staging and only re-anchored at promotion.
- **`main` runs no tests.** The template's `ci.yml` included `main` in its PR base branches.

## Notes

- Stages 1 and 2 both fire on branch creation and self-guard when the branch is outside the
  lifecycle prefixes.
- Stage 4 is intentionally conservative: it should reuse an existing test harness, not invent a stack.
- Stage 8 is gated: it opens the `dev → next` PR but does not silently merge it.
- `validation.yml` is the promotion gate on `dev`, so the workflow name must stay `Validation`
  unless `dev-to-next.md` is updated too.
- Stage 11b is serialized by a `concurrency` group so two merges cannot both cut a tag, and it
  refuses to advance the tag while a `release/*` promotion PR is open.
- Every package step is guarded on `package.json` being present, so the pipeline stays green while
  the library is still being scaffolded.
