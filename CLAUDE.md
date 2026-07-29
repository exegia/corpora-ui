# corpora-ui

Repo root holds only tooling (Makefile, CI, docs). The app/library lives in
`react/` — see `react/CLAUDE.md` and `react/ARCHITECTURE.md`.

## Dependencies

Install node libraries ONLY in `react/` — never at the repo root. The root
has no package.json on purpose; a stray root install shadows `react/`'s
resolution and pollutes the repo. Always run
`cd react && bun add <pkg>` (use an absolute `cd` in the same command — the
shell's working directory can reset between commands).
