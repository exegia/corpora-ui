# 001 — Chat attachments

**Status:** draft · **Sketch:** `Chat Attachments — Light|Dark` (page `Chat UI`, y 455)
**Depends on:** nothing (this spec carries the shared token layer)

## Problem

The Corpora chat needs one way to show a file, image, media clip, corpus text
selection, quoted reply, user handle or URL — both as a composer chip before
sending and as a rendered preview inside a bubble. Today `composed/ai` has a
composer and a user message but no attachment model, and no shared colour
tokens for chat surfaces.

## Solution

- A token layer: 50 CSS variables named after the Sketch swatches
  (`--bg-page`, `--surface-card`, `--accent`, `--chart-series-1` …), light in
  `:root`, dark under `.dark`, exposed to Tailwind via `@theme inline`.
- Atoms (`ui/chat/`): IconTile, Thumbnail, AvatarHandle, RemoveButton,
  PlayButton, SendButton, AddButton, FileTypeBadge, Favicon, Waveform,
  QuoteRail, DurationPill.
- `Attachment` component (`composed/chat/attachment.tsx`) with
  `kind="document|image|media|text-selection|chat-reply|username-handle|url-link"`
  and `variant="default|preview"`; `media` + `preview` + `audio` renders the
  audio row.
- Blocks (`blocks/chat/`): `MessageSender`, `MessageRecipient` (attachment
  slot above / inside the bubble), `ComposerWithAttachments` (chip tray with
  keyed Jotai state).

## Naming convention

Sketch `Component / Attachment / <Kind> / <Variant> — light|dark` →
`<Attachment kind="<kind>" variant="<variant>" />`. Theme suffix dropped;
theme comes from CSS variables. Every file carries `@sketch "<master>"`.

## Acceptance criteria

Taken from the showcase frame. Each holds in light and dark.

### Tokens
- [ ] AC-T1 Every `Light / *` and `Dark / *` swatch (98) maps to one variable with the exact hex from Sketch; `bg-surface-card`, `text-text-secondary`, `border-border-default`, `bg-accent-subtle` classes resolve.
- [ ] AC-T2 Radii scale present: 4 badge · 6 chip · 8 send/tag · 10 chip/tile/quote · 12 card/composer · 14 large thumbnail · 20 bubble.

### Atoms
- [ ] AC-A1 IconTile is 40×40, radius 10, `surface-subtle` fill, icon slot tinted `--icon`.
- [ ] AC-A2 Thumbnail `size="sm"` is 40×40 radius 10; `size="lg"` 240×160 radius 14; image slot covers.
- [ ] AC-A3 AvatarHandle is 20px, initials fallback on `accent-subtle`.
- [ ] AC-A4 RemoveButton 18px circle, `text-primary` fill, inverse ✕; PlayButton 36px scrim circle with white ▶; SendButton 61×31 brand-yellow pill "Send"; AddButton 26px ghost "+".
- [ ] AC-A5 FileTypeBadge 28×14 radius 4 uppercase label; Favicon 16px tile with globe fallback; Waveform 20px tall bars from a `bars` array; QuoteRail 3px accent bar; DurationPill 37×16 scrim pill "0:42".

### Attachment · default (composer chip)
- [ ] AC-D1 240×52 card, radius 10, card surface, default border; H stack: leading 40px tile/thumbnail · title 13px/500 + meta 11px secondary · RemoveButton.
- [ ] AC-D2 All seven kinds render with the frame's leading icon (file-text, image thumbnail, film, text-quote, reply, at-sign, link) and copy: title + meta from props.
- [ ] AC-D3 `onRemove` fires from the ✕; `removable={false}` hides it.
- [ ] AC-D4 Title truncates with ellipsis at chip width (URL Link shows `sketch.com/s/0194…`).

### Attachment · preview (in bubble)
- [ ] AC-P1 image: 240×160 radius 14 cover image.
- [ ] AC-P2 media: poster + centred PlayButton + DurationPill bottom-right; `onPlay` callback. `audio`: 240×56 row, PlayButton · Waveform · meta "0:42 · voice-note.m4a".
- [ ] AC-P3 document: 260×56 row with tile, title, meta "PDF · 2.4 MB · 12 pages", trailing download icon (`onAction`).
- [ ] AC-P4 text-selection: 260 wide, QuoteRail, source row (book-open icon + accent label), quote paragraph on `surface-subtle`, radius 10.
- [ ] AC-P5 chat-reply: QuoteRail, header (reply icon · author accent · time muted), body 2-line clamp.
- [ ] AC-P6 username-handle: 113×24 pill, avatar 20 + accent handle.
- [ ] AC-P7 url-link: 240 card, 120px cover, favicon + domain (mono, secondary), title 13/500, description 2-line clamp.

### Blocks
- [ ] AC-B1 MessageSender: attachment preview above a sender bubble (`surface-bubble-sender`, inverse text, radius 20), right-aligned at 280 max.
- [ ] AC-B2 MessageRecipient: header (name 13/600 + time 11 muted), recipient bubble (`surface-bubble-recipient`), text then attachment preview inside.
- [ ] AC-B3 ComposerWithAttachments: 520 wide card radius 12; chip tray (H, gap 8, wraps); draft text; actions row Add · hint "Press ⌘ + ↵ to send message" · Send. Removing a chip updates the tray; `onSend(draft, attachments)`; ⌘↵ sends.
- [ ] AC-B4 Tray state lives in a keyed Jotai family (`composerAttachmentsAtom(id)`) so an app can add/remove chips by id; drops on unmount for unnamed ids.
- [ ] AC-B5 Empty tray renders no tray row (composer collapses to draft + actions).

### Quality gates
- [ ] Registry entry + demo per exported item; `make check`; `bun test` green with tests for the composer tray and attachment remove.

## Open questions (typed callbacks + TODO, not invented)
- URL Link default shows "Link · fetching preview" — loading is a `status` prop; no fetching is built in.
- Document preview trailing action is download in the frame; kept as generic `onAction` with `actionIcon` default `Download`.
