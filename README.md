# corpora-ui

Repository for all UI related components and libraries. The publishable
package lives in [`react/`](react/).

## Branching, CI, and releases

Full details: [`.github/WORKFLOW.md`](.github/WORKFLOW.md).

```
feat/add-tooltip ──PR──> dev ──(daily/manual)──> next ──cut──> release/vX.Y.Z ──PR──> main
                    (deleted on merge)         (pack)                    (npm + tag)
```

| Flow | What happens |
| --- | --- |
| `<type>/<slug>` → PR to `dev` | `guard` (branch name + conventional-commit PR title), `check` (typecheck, lint, test, build), and an AI review once the PR is ready for review |
| **Promote to next** (22:00 UTC or manual) | Opens `dev` → `next` with a version from line-count churn (`< 100` patch, `100–999` minor, `≥ 1000` major) and auto-merges after CI |
| Push to `next` | Packs an npm tarball; cuts or refreshes `release/vX.Y.Z`; the draft PR into `main` is opened or updated |
| `release/vX.Y.Z` → PR to `main` | `guard` also asserts `react/package.json` matches the branch version; `package` uploads the tarball as an artifact |
| Release PR merged | Publishes to npm with provenance, tags `vX.Y.Z`, publishes a GitHub Release, syncs `main` back into `next` and `dev`, deletes leftover branches |

Exactly one release branch is in flight at a time. `main` takes PRs only from
`release/vX.Y.Z`; the ruleset requires the `guard`, `check` and `package`
checks. `dev` and `next` require `guard` and `check`.

Every CI step is a `make` target, so anything CI does can be reproduced
locally — `make ci` is what runs on a PR. `make help` lists the rest.
