# Implementation plan

One feature, five bounded implementation issues, tracked by an epic. Use feature branches with lowercase `<type>/<slug>` names targeting `dev`, following repository guards; actual implementation branches are not created by this planning task.

1. **Schema and state:** typed adapters, pure reference/anchor helpers, keyed Jotai store/actions/hooks and lifecycle/controlled-mode tests. Deliver the public behavior contract before UI.
2. **Compositions:** LocationBar, HierarchyPicker and LocationGrid using existing atoms and Tree. Test semantic/keyboard behavior and long-list limits.
3. **Reference command:** use the verified Command API, connect the state/actions, implement typed resolution and async search boundaries. May proceed alongside stage 2 after stage 1.
4. **Responsive block:** compose the prior stages into inline/drawer/sheet presentations, provider-aware portals, return behavior and host integration. Depends on stages 2 and 3.
5. **Docs and distribution:** Fumapress stories, package exports, accessibility/visual matrix and packed consumer validation. Integrates all earlier stages.

## Reuse and implementation constraints

Use current Base UI/COSS `render` trigger composition and the locally customized exports. Keep `base-mira`, Tailwind v4 and Lucide conventions from `components.json`; no `shadcn init`, Radix replacement or `--overwrite`. COSS particles are composition references, not copy-paste APIs that override local wrappers. Existing Dialog/Drawer/Sheet own modal semantics. Keep shared portal destination inheritance and explicit container/null overrides through the existing ExegiaProvider helpers.

The actual export shape may be compound (`Modal`, `Scaffold`) or focused (`UI` subpaths). Verify exact named parts before implementation rather than inventing `Reader`, `CommandDialog` or COSS `DialogContent` props. Create a small generic extension only after a demonstrated gap. Follow one default component per file and named barrels, as requested; isolate types, pure utilities, atoms and hooks from rendering files.

Tree is not currently a virtualization engine. Prefer bounded numeric ranges, filtering and direct jumps. If the use case requires virtualization, assess existing tools first and track it as an explicit generic change rather than importing a large list framework as incidental work.

## Validation

Run focused Bun tests from `react/` with the existing happy-dom preload. Cover per-instance state, controlled/uncontrolled parity, race cancellation, draft/cancel/commit/return, parser bounds, keyboard grid/command handling and portal inheritance. After integration, run repository `make check`, `make test`, `make build`, `bun run build:docs` and `bun run check:consumer` from the documented working directories. Avoid plain `tsc --noEmit` at the references-only root.

Use browser checks for 320/390/768/1440 px, a narrow embedded container, 200% text zoom, light/dark and existing theme accents, LTR/RTL, reduced motion, keyboard-only use, virtual keyboard and safe-area behavior. Browser accessibility checks supplement unit tests; verify real focus restoration and scroll behavior. Check a large schema and multiple simultaneous instances without shared shortcut collisions.

## Risks and boundaries

Edition/canon mappings belong to supplied data. Reflowable text may not support stable page numbers; disable missing address modes instead of faking them. Tree expansion and navigator expansion must not form competing stores. Existing Shell has a historical mobile TODO; compact navigation must use the verified modal/drawer primitive and must not imply that TODO is already solved. Spec screenshots show content-first light mode; production styling is inherited from the library, including dark mode.

## Publishing status

This is a specification branch, not a component release or docs deployment. No Mintlify connector is available and this repository uses Fumapress. Documentation implementation is tracked as an issue; no live publishing is claimed.
