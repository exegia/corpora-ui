# Specs

Spec Kit feature folders for corpora-ui. One folder per feature (not per
component): `spec.md` (what and why, acceptance criteria), `plan.md` (how),
`tasks.md` (ordered checklist). Numbering continues from the highest folder.

Source of truth for every component here is the Sketch document `exegia-ui`
(cloud `01945ba6-1dcb-4f55-bc46-c0cf4d09aa7c`), page `Symbols`. Each
component's JSDoc carries `@sketch "<master name>"` so it traces back.

| # | Feature | Sketch masters |
| --- | --- | --- |
| 001 | chat-attachments | Atom / * (attachment set), Component / Attachment / *, Block / Message / *, Block / Composer / * |
| 002 | chart-cards | Atom / Legend Item, Dot / Series *, Pill, Component / Chart / * |
| 003 | ai-presentation-bubbles | Atom / Segmented Toggle, Icon Button, Badge / Agent, Component / Markdown / *, Research Answer, Block / AI Bubble / * |
| 004 | beautiful-ui-primitives | Atom / Tag, Dot, Signal, Checkbox, Source Chip, Avatar Stack, Stat, Follow-up Row, Component / Streaming Text … Insight Cards |

Shared prerequisite (built first, tracked in 001): the token layer
(`react/src/index.css`, 50 `--*` variables from the Sketch swatches).
