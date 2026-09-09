# 004 — Beautiful-UI primitives

**Status:** draft · **Sketch:** `AI Presentation — Light|Dark`, rows "COMPONENTS — Beautiful-UI design language" and the flowchart/insights row
**Depends on:** 001 (tokens), 002 (Chart plot for Insight Cards)
**Reference:** beautifului.dev registry (`streaming-text`, `recommendation-card`, `context-cards`, `code-block`, `filter-table`, `records-table`, `flowchart`, `insight-cards`) for structure and spacing only. Their `foundation.css` is NOT imported — colours come from the Exegia tokens and styling is Tailwind.

## Solution

Atoms: `Tag` (`tone="amber|purple|blue|green"`), `Dot` (semantic tones, shared with 002), `Signal` (`level="high|medium|low"`, 3 bars), `Checkbox` (reuse `ui/checkbox`), `SourceChip`, `AvatarStack`, `Stat` (`trend`), `FollowUpRow`, `PrimaryPillButton` / `SecondaryPillButton` / `GhostButton` (Button variants).

Components (`composed/chat/`): StreamingText, RecommendationCard, ContextCards, CodeBlock, FilterTable, RecordsTable, Flowchart, InsightCards.

## Acceptance criteria

### Atoms
- [ ] AC-A1 Tag 22px tall radius 8, per-tone text/fill/border from `--tag-<tone>-*`.
- [ ] AC-A2 Signal 16×10, three 4px bars; high = 3 warning-coloured… per frame: high = 3 green, medium = 2 orange, low = 1 grey (colours from frame swatches).
- [ ] AC-A3 SourceChip 18px pill `surface-subtle`: 14px favicon + mono domain 10.5px secondary.
- [ ] AC-A4 AvatarStack: 14px circles overlapping −6px, series colours, up to 3 + count text supplied by parent.
- [ ] AC-A5 Stat 152×64: dot + label 11 secondary, value 17/600 coloured by trend (success / danger), delta 11 mono same colour.
- [ ] AC-A6 FollowUpRow 380×32: corner-down-left icon muted, label 12.5, bottom hairline divider; button semantics, `onSelect`.

### StreamingText
- [ ] AC-S1 Paragraph 13px; second paragraph begins with an inline SourceChip; a 2×12 caret blinks after the last token while `streaming`.
- [ ] AC-S2 Action row: copy · refresh · thumbs-up · thumbs-down IconButtons, then AvatarStack + "10 sources" toggle.
- [ ] AC-S3 Sources panel (collapsible, `surface-subtle`, radius 10) lists favicon · name 12.5 · mono domain rows; open state in keyed atom `streamingSourcesOpenAtom(id)`.
- [ ] AC-S4 "Follow-ups" label 11/600 + FollowUpRow list; `onFollowUp(text)`.
- [ ] AC-S5 Streaming animation: tokens revealed word by word when `streaming`; reduced-motion shows all text immediately.

### RecommendationCard
- [ ] AC-RC1 380 card radius 12; title 14/600; description line with an entity pill (avatar 16 + name) and lead-time pill (green tag).
- [ ] AC-RC2 "Other options" box `surface-subtle`: rows Signal + label + status text right (muted).
- [ ] AC-RC3 Footer: Signal + "High confidence" left; SecondaryPill "Alternatives" + PrimaryPill "Accept" right. `onAccept`, `onAlternatives`, `onSelectOption(i)`.

### ContextCards
- [ ] AC-CC1 Header "All chunks" 13/600 + count Pill. Cards 380×114 radius 12: icon 12 + title 13/600, "290 characters" right muted; snippet 12 secondary 2-line clamp; file pill (FileTypeBadge + name + external-link 9px). `onOpen(card)`.

### CodeBlock
- [ ] AC-CB1 420 card: header file-code icon + filename mono 12/600, SegmentedToggle "Code | Diff", ghost "Copy" button; divider; `surface-code` body with gutter line numbers (11 mono muted) and code 11.5 mono; keyword tokens in `--code-keyword`, strings in `--code-string`.
- [ ] AC-CB2 Highlighting is a minimal tokenizer (keywords + string literals) — no new dependency. `diff` view renders `lines[].type` add/remove with success/danger subtle backgrounds. `onCopy(code)`.

### FilterTable
- [ ] AC-FT1 Filter pills row: "All" (active: `surface-subtle`, count in a small pill), others dot + label + count. Clicking filters rows; active filter in keyed atom `filterTableFilterAtom(id)`.
- [ ] AC-FT2 Table 450 wide radius 12: head 11 secondary (Task name, Date, Status, Advisor), rows 13 with status Dot + text; hairline row dividers.

### RecordsTable
- [ ] AC-RT1 Head: Checkbox, Company, Categories ⇅, Last interaction ⇅, Connection ⇅ (sort icons chevrons-up-down).
- [ ] AC-RT2 Rows: index 11 muted, 20px initial avatar, name 13/500, up to 2 Tags + "+N" overflow, relative date 12, strength text. Row checkbox selection in keyed atom `recordsTableSelectionAtom(id)`; `onSortChange(column)` callback only (sorting itself is the caller's — not shown).

### Flowchart
- [ ] AC-F1 480×320 canvas `surface-canvas` radius 12 with 24px dot grid (CSS radial-gradient, not 260 DOM nodes).
- [ ] AC-F2 Trigger node: purple Tag "Trigger" label, card with 36px icon tile (zap), title 13/600, desc 11 secondary; 2px connector + 8px dot to the If/Else node.
- [ ] AC-F3 If/Else node: amber Tag label, card with condition rows built from words and pills ("If [order] [flavor] is [Rocky Road]"). Data-driven: `nodes` array with `kind: "trigger" | "condition"`.

### InsightCards
- [ ] AC-I1 Header "Insights" 13/600 + count, prev/next IconButtons (chevron-up / chevron-down per frame). `index`/`onIndexChange`.
- [ ] AC-I2 Summary 13 secondary with an inline dot before the entity name; card with two Stats; "Trend snapshot" box (`surface-subtle`) with Pill "Snapshot", a two-series line plot (Chart line, headerless) and legend; FollowUpRow below.

### Quality gates
- [ ] Every component: light + dark, registry entry + demo, `make check`, tests for FilterTable filter, RecordsTable selection, StreamingText sources toggle.

## Open questions
- Records table sort direction UI is not shown; only a callback.
- Insight prev/next behaviour with a single insight: buttons disabled.
