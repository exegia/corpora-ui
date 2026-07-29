/**
 * Brand accents for the auth blocks.
 *
 * An accent is a set of custom properties set on the AuthCard root plus one
 * class string applied to the card's primary action. Splitting it this way
 * keeps the accent inheritable — anything else inside the card can opt into
 * `var(--auth-accent)` without the shell knowing about it.
 */

/** Brand accents available to the auth blocks. */
export type AuthAccent = "corpora" | "exegia";

/**
 * Custom properties an accent contributes, set on the AuthCard root.
 *
 * The gradient lives in `--auth-accent-image` because `background-color` can't
 * hold one; `--auth-accent` sits underneath as the solid that paints wherever
 * the image is `none`. Foregrounds are fixed rather than themed — the accent
 * itself is a constant, so its contrast pair has to be too (white on the
 * corpora yellow fails badly).
 */
export const authAccentVars: Record<AuthAccent, Record<string, string>> = {
  corpora: {
    "--auth-accent": "#E8B124",
    "--auth-accent-image": "none",
    "--auth-accent-foreground": "oklch(0.145 0 0)",
  },
  exegia: {
    "--auth-accent": "#3B0080",
    "--auth-accent-image":
      "linear-gradient(44deg in oklab, rgba(29,0,202,0.66) 3%, #3B0080 37%, rgba(36,0,72,0.86) 98%)",
    "--auth-accent-foreground": "oklch(0.985 0 0)",
  },
};

/**
 * Applied to the primary action inside an accented AuthCard, after the button
 * cva output so tailwind-merge lets it win over `bg-primary`. The hover and
 * pressed background entries are required: `hover:bg-primary/90` lives in a
 * different modifier group from `bg-*` and would otherwise survive and repaint
 * the button on hover.
 *
 * Hover uses `brightness` rather than a background tween because the button's
 * `transition-property` list is shared with its press/size animations — adding
 * `filter` to it means restating the whole list and its per-property
 * durations. The trade is an instant hover change instead of a 150ms one.
 */
export const authAccentActionStyles =
  "border-transparent bg-[var(--auth-accent)] bg-[image:var(--auth-accent-image)] text-[var(--auth-accent-foreground)] shadow-none hover:bg-[var(--auth-accent)] hover:brightness-110 data-pressed:bg-[var(--auth-accent)] data-pressed:brightness-110 *:data-[slot=button-loading-indicator]:text-[var(--auth-accent-foreground)]";
