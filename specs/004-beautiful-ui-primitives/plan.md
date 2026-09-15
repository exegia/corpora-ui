# 004 — Plan

Files under `ui/chat/` (tag, signal, source-chip, avatar-stack, stat,
follow-up-row) and `composed/chat/` (streaming-text, recommendation-card,
context-cards, code-block, filter-table, records-table, flowchart,
insight-cards) each with a sibling `*-atom.ts` where state exists.

1. Beautiful-UI sources are read for structure (fetched from
   `https://www.beautifului.dev/r/<name>.json`) but reimplemented: their CSS
   foundation would be a second styling system, so nothing is copied verbatim.
2. Stateful pieces follow the tree `keyed()` pattern; one shared
   `lib/keyed-atom.ts` is extracted so 001/003/004 do not each copy the
   family helper (one helper, three consumers).
3. Streaming reveal uses `motion` with `useReducedMotion`; word timing prop
   `wordMs` default 55.
4. Tables are plain `<table>` markup with Tailwind; no table library.
5. Flowchart layout is static vertical (trigger → condition) as in the frame;
   positions computed by flex, connector drawn with a 2px div.
6. InsightCards reuses `Chart` with `type="line"` and `headerless`.

Dependencies: none new beyond 002/003.
