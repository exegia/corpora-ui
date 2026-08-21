/**
 * Shared theming for the Corpora file icons.
 *
 * Every icon embeds both a light and a dark artwork layer and shows exactly one
 * of them via CSS. No JavaScript, no props and no context are required.
 *
 * Resolution order (later rules win):
 *   1. `prefers-color-scheme` — follows the operating system by default.
 *   2. `.dark` class on any ancestor — Tailwind's `darkMode: 'class'` convention.
 *   3. `[data-theme="light" | "dark"]` on any ancestor — explicit override.
 */
export const FILE_ICON_CLASS = 'cui-file-icon';

export const FILE_ICON_THEME_CSS = `
.${FILE_ICON_CLASS} [data-theme-layer='light']{display:inline}
.${FILE_ICON_CLASS} [data-theme-layer='dark']{display:none}
@media (prefers-color-scheme:dark){
.${FILE_ICON_CLASS} [data-theme-layer='light']{display:none}
.${FILE_ICON_CLASS} [data-theme-layer='dark']{display:inline}
}
.dark .${FILE_ICON_CLASS} [data-theme-layer='light']{display:none}
.dark .${FILE_ICON_CLASS} [data-theme-layer='dark']{display:inline}
[data-theme='light'] .${FILE_ICON_CLASS} [data-theme-layer='light']{display:inline}
[data-theme='light'] .${FILE_ICON_CLASS} [data-theme-layer='dark']{display:none}
[data-theme='dark'] .${FILE_ICON_CLASS} [data-theme-layer='light']{display:none}
[data-theme='dark'] .${FILE_ICON_CLASS} [data-theme-layer='dark']{display:inline}
`;
