# Automation GitHub App

Two workflows need an identity that `GITHUB_TOKEN` cannot provide:

| workflow | why the built-in token is not enough |
|---|---|
| `promotion-merge.yml` | Pushes directly to `main`/`next` to fast-forward a release. A ruleset requiring pull requests blocks that push, and the built-in token **cannot be granted a bypass** — repo-level rulesets reject it with `Actor GitHub Actions integration must be part of the ruleset source or owner organization`. |
| `pr-feature-draft.yml` | `convertPullRequestToDraft` is not available to `GITHUB_TOKEN` at *any* permission level; it returns `Resource not accessible by integration` regardless of what `permissions:` declares. |

Both workflows fall back to `GITHUB_TOKEN` when the app is not configured, so the repository
works without it. Setting it up is what allows `main` to be locked down.

## 1. Create the app

**Organization settings → Developer settings → GitHub Apps → New GitHub App**

| field | value |
|---|---|
| Name | `corpora-ui automation` (any unique name) |
| Homepage URL | the repository URL |
| Webhook | **uncheck Active** — this app is never called, only impersonated |

Repository permissions — grant only these:

| permission | access | needed for |
|---|---|---|
| Contents | Read and write | the fast-forward push in `promotion-merge` |
| Pull requests | Read and write | commenting, closing, and drafting PRs |
| Metadata | Read-only | mandatory, granted automatically |

Nothing else. In particular **do not** grant Actions, Administration, or Secrets — the app
never needs them, and a leaked key with those scopes is far more damaging.

## 2. Install it

**Install App → this organization → Only select repositories → `corpora-ui`**

Installing on the whole org widens the blast radius for no benefit.

## 3. Record the credentials

From the app's settings page, note the **App ID**, then **Generate a private key** — this
downloads a `.pem` file. It is shown once.

Add both as repository secrets under
**Settings → Secrets and variables → Actions**:

| secret | value |
|---|---|
| `AUTOMATION_APP_ID` | the numeric App ID |
| `AUTOMATION_APP_PRIVATE_KEY` | the entire `.pem` contents, including the `-----BEGIN`/`-----END` lines |

```bash
gh secret set AUTOMATION_APP_ID --repo exegia/corpora-ui
```

```bash
gh secret set AUTOMATION_APP_PRIVATE_KEY --repo exegia/corpora-ui < ~/Downloads/your-app.private-key.pem
```

Delete the `.pem` afterwards. Do not paste the key as a command-line argument — it would land
in shell history and, briefly, in the process list.

## 4. Verify before locking anything down

Run **Promote to Main**, or re-run `promotion-merge` on a promotion PR, and confirm the push
succeeds. The job log names the identity it pushed as.

Verify *before* step 5. If the app is misconfigured and the ruleset is already tightened, every
release fails at its last step.

## 5. Lock down `main` — done

Applied 2026-07-29 as the `main-no-direct-push` ruleset (id `19980985`):

| | |
|---|---|
| scope | `refs/heads/main` |
| rule | `pull_request` — no direct pushes |
| merge methods | `merge` only — **squash and rebase are forbidden**, since both rewrite SHAs and sever `main` from `next` |
| bypass | `Integration:4425676` — the app, so `promotion-merge` can still fast-forward |

Deliberately a **new** ruleset rather than an edit to `prod` (id `19884404`). `prod` covers
`refs/heads/next` as well, and until this change `promote-to-main.yml` pushed the changelog
stamp to `next` with `GITHUB_TOKEN`. Adding a `pull_request` rule there would have broken
promotion — but only once a `CHANGELOG.md` existed, since the stamp block is skipped without
one. The breakage would have surfaced long after the rule was set.

### `next` — done

Applied 2026-07-29 to the `prod` ruleset (id `19884404`), which covers `refs/heads/main` and
`refs/heads/next`:

| | |
|---|---|
| rules | `deletion`, `non_fast_forward`, **`pull_request`** |
| merge methods | `merge` only — squash and rebase forbidden |
| bypass | `Integration:4425676` added alongside the existing actors |

Applied in two separate writes — bypass actor first, verified, then the rule — so there was no
window in which the rule existed without the app being able to bypass it.

This was only safe once `promote-to-main.yml` reached `next`, because that workflow pushes the
changelog stamp there and is `workflow_dispatch`-only: it runs the file from the dispatched ref,
so a dispatch against an older `next` would still have pushed as `GITHUB_TOKEN`.

`main` is additionally covered by `main-no-direct-push` (id `19980985`). The two rulesets
compose; both are active.

## Rotation

The private key does not expire. Rotate it by generating a new one in the app settings,
updating `AUTOMATION_APP_PRIVATE_KEY`, and deleting the old key — in that order, so there is no
window where no valid key exists.
