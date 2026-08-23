# corpora-ui

Repo root holds only tooling (Makefile, CI, docs). The app/library lives in
`react/` — see `react/CLAUDE.md` and `react/ARCHITECTURE.md`.

## Dependencies

Install node libraries ONLY in `react/` — never at the repo root. The root
has no package.json on purpose; a stray root install shadows `react/`'s
resolution and pollutes the repo. Always run
`cd react && bun add <pkg>` (use an absolute `cd` in the same command — the
shell's working directory can reset between commands).

## Pull requests: the title takes no emoji

CI runs `make pr-guard` over the base, the branch name and the **PR title**.
Commit *subjects* in this repo carry an emoji (`✨ feat: …`) — a PR title must
not. The guard matches `<type>: summary` from the first character, so any
leading emoji fails it:

```
feat: rework the tree collapse          # passes
✨ feat: rework the tree collapse       # ::error:: PR title must read '<type>: summary'
```

`<type>` is one of `feat fix chore docs ci refactor test perf build style
revert`, optionally `(scope)` and `!`. Branches into `dev` (or an in-flight
`release/v*`) must read `<type>/<slug>`, lowercase; `next` only accepts `dev`;
`main` only accepts `release/vX.Y.Z` matching the `react/package.json` version.

**Retitling a red PR does not re-run the guard.** `.github/workflows/pr.yml`
fires on `opened / reopened / ready_for_review / synchronize` — not `edited` —
and re-running the job replays the original payload, stale title and all. Close
and reopen the PR to get a fresh one.
