# 003 — Plan

Files: `ui/chat/segmented-toggle.tsx`, `ui/chat/icon-button.tsx`,
`ui/chat/agent-badge.tsx`, `composed/chat/markdown.tsx` +
`markdown-atom.ts`, `composed/chat/research-answer.tsx`,
`blocks/chat/ai-bubble.tsx`, tests under `__tests__/`.

1. `bun add react-markdown` (no plugins; the frame needs headings, paragraphs,
   lists, inline + fenced code). Components map restricted to those tags,
   styled with Tailwind + tokens.
2. SegmentedToggle: `role="radiogroup"` with `role="radio"` buttons, arrow
   keys, `motion` layoutId for the active pill (reduced-motion guarded).
3. Markdown view state: keyed atom family (`markdownViewAtom(id)`), hook
   `useMarkdownView(id)`; component accepts `view`/`defaultView`.
4. AiBubble reuses `Bubble.Header`-like layout but its own DOM (no bubble
   fill in the frame — content cards float under the header).
5. Chart and StreamingText are imported from 002/004; AiBubble `content`
   is a discriminated union so props type-check per content kind.

Dependencies: `react-markdown` (new).
