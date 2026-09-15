# 001 — Plan

## Files

```
react/src/index.css                         # tokens (root + .dark + @theme inline)
react/src/components/ui/chat/
  icon-tile.tsx thumbnail.tsx avatar-handle.tsx
  chat-buttons.tsx        # RemoveButton PlayButton SendButton AddButton (Button variants)
  file-type-badge.tsx favicon.tsx waveform.tsx quote-rail.tsx duration-pill.tsx
  index.ts
react/src/components/composed/chat/
  attachment.tsx          # Attachment + AttachmentKind/Variant types
  attachment-icons.ts     # kind → lucide icon map
  index.ts
react/src/components/blocks/chat/
  message-sender.tsx message-recipient.tsx
  composer-with-attachments.tsx composer-attachments-atom.ts
  __tests__/composer-with-attachments.test.tsx __tests__/attachment.test.tsx
  index.ts
react/src/registry/{atoms,components,blocks}.ts + demos/*
react/src/index.ts
```

## Approach

1. Tokens: hex straight from the swatch dump (see spec). `@theme inline`
   exposes `--color-<name>: var(--<name>)` so Tailwind classes exist; radii
   are used literally (`rounded-[10px]`) — no new radius tokens beyond the
   existing scale.
2. Buttons reuse `ui/button.tsx` via `size`/`variant` + className where the
   shape fits; Send is a `variant="brand"` addition to the cva (one line),
   Remove/Play/Add are thin wrappers over `size="icon-xs"`.
3. `Attachment` is one component with a `kind` switch. Default variant shares
   one chip layout; preview variant branches per kind. Icons from `lucide-react`.
4. Blocks compose the existing `Bubble` atom from `atoms/bubble` (sender /
   recipient variants) rather than new bubble CSS. Composer tray state uses
   the tree `keyed()` pattern copied into `composer-attachments-atom.ts`.
5. Tests: `@testing-library/react` — remove chip, ⌘↵ send, empty tray.

## Dependencies
None new. `lucide-react`, `jotai`, `motion` already present.
