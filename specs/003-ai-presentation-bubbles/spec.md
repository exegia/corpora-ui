# 003 — AI presentation bubbles

**Status:** draft · **Sketch:** `AI Presentation — Light|Dark`, rows "COMPONENT / MARKDOWN · RESEARCH ANSWER" and "BLOCK / AI BUBBLE"
**Depends on:** 001 (tokens, IconTile), 002 (Chart), 004 (StreamingText) for the streaming bubble

## Problem

Agent replies need a consistent frame (sparkles tile · "Exegia" · Agent badge
· time) around several content types: rendered markdown with a source
toggle, a research answer with citation meta and actions, a chart card, and a
streaming answer.

## Solution

- Atoms: `SegmentedToggle` (two options, controlled/uncontrolled), `IconButton`
  (24px ghost), `AgentBadge`.
- `Markdown` component: `Preview | Markup` SegmentedToggle, expand + copy
  IconButtons, divider, then rendered markdown (react-markdown) or raw source
  in a code surface.
- `ResearchAnswer` component: kicker row (tile · "Research answer" · sub
  "Answered from 3 passages · 0.8 s" · corpus Pill), content, meta row
  (Source / Date / Author(s) with icons), divider, actions row.
- `AiBubble` block: agent header + one of `markdown | research | chart | streaming` content.

## Acceptance criteria

### Atoms
- [ ] AC-A1 SegmentedToggle 117×24: `surface-subtle` track radius 6, active segment card surface with shadow, labels 11px; keyboard arrows move selection; `value`/`onValueChange` controlled and `defaultValue` uncontrolled; `sound` prop emits toggle cue.
- [ ] AC-A2 IconButton 24px, icon 16px in `--icon`, hover `surface-subtle`, `aria-label` required.
- [ ] AC-A3 AgentBadge 48×20 radius 4, `accent-subtle` fill, `accent-text` label "Agent".

### Markdown
- [ ] AC-M1 360 wide card radius 12; header row: toggle left, expand + copy right; 1px divider.
- [ ] AC-M2 Preview renders h1 15/600, paragraph 13, bullet list, inline code / fenced code in `surface-code` with `--link` coloured command text.
- [ ] AC-M3 Markup shows raw source in a mono block (`surface-code`, 11px) with the same toggle state.
- [ ] AC-M4 `onCopy(source)` and `onExpand()` callbacks; toggle state via keyed atom `markdownViewAtom(id)` so an app can flip Preview/Markup by id.

### ResearchAnswer
- [ ] AC-R1 380 wide card radius 12; kicker row with 28px IconTile (book-open), "Research answer" 13/600, sub 11 secondary, corpus Pill right.
- [ ] AC-R2 Content 13px; divider; three meta columns each icon 12px + label 11 secondary + value 12 primary (Source, Date, Author(s)).
- [ ] AC-R3 Actions row: Copy citation · Share · Add to list (ghost buttons with icons) left, thumbs-up / thumbs-down IconButtons right.
- [ ] AC-R4 Callbacks: `onCopyCitation`, `onShare`, `onAddToList`, `onFeedback("up"|"down")`. Behaviour of "Add to list" is not designed (TODO).

### AiBubble
- [ ] AC-B1 Header: 32px sparkles IconTile, name 13/600, AgentBadge, time 11 muted on second line; content indented 40px.
- [ ] AC-B2 `content="markdown"` renders Markdown; `"research"` renders ResearchAnswer; `"chart"` renders Chart; `"streaming"` renders StreamingText — each accepting that component's props.
- [ ] AC-B3 Light/dark by tokens; registry entries + demos; tests for SegmentedToggle keyboard/controlled and Markdown toggle; `make check`.

## Open questions
- Expand: frame shows a maximize icon only. Callback only.
- Copy: copies markdown source in both views (assumption).
