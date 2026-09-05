import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge, validators } from "tailwind-merge"

/**
 * The `inset-shadow-{lit,dim}-*` bezel family (defined in `index.css`) is
 * ours, not Tailwind's. Left to itself tailwind-merge files every one of them
 * under its built-in `inset-shadow` group — which holds a single `box-shadow`
 * — and keeps only the last, so a bezel written as
 * `inset-shadow-lit-t-2 inset-shadow-dim-b-1` arrives as the dim class alone.
 *
 * Each utility writes exactly one custom property, so the conflict groups
 * mirror those properties: a layer's two axes, its blur and its alpha are
 * independent of each other and of the other layer. `-l-`/`-r-` are the two
 * ends of one axis and `-t-`/`-b-` of the other, so those do collide. Only
 * `inset-shadow-blur-*` spans layers — it writes both blurs — so it alone
 * conflicts across them.
 */
type InsetShadowGroupId =
  | "inset-shadow-bezel"
  | "inset-shadow-lit-x"
  | "inset-shadow-lit-y"
  | "inset-shadow-lit-blur"
  | "inset-shadow-lit-alpha"
  | "inset-shadow-dim-x"
  | "inset-shadow-dim-y"
  | "inset-shadow-dim-blur"
  | "inset-shadow-dim-alpha"
  | "inset-shadow-blur"

const { isAny } = validators

/**
 * Every group in the family writes the whole `box-shadow`, so each one both
 * displaces and is displaced by Tailwind's own shadow utilities. Without
 * this, `shadow-md inset-shadow-lit-t-2` survives `cn` intact and whichever
 * rule the stylesheet happens to sort last silently wins.
 */
const INSET_SHADOW_GROUPS = [
  "inset-shadow-bezel",
  "inset-shadow-lit-x",
  "inset-shadow-lit-y",
  "inset-shadow-lit-blur",
  "inset-shadow-lit-alpha",
  "inset-shadow-dim-x",
  "inset-shadow-dim-y",
  "inset-shadow-dim-blur",
  "inset-shadow-dim-alpha",
  "inset-shadow-blur",
] as const satisfies readonly InsetShadowGroupId[]

const displacesTailwindShadows = Object.fromEntries(
  INSET_SHADOW_GROUPS.map((id) => [id, ["shadow", "inset-shadow"]])
)

const twMerge = extendTailwindMerge<InsetShadowGroupId>({
  extend: {
    classGroups: {
      // The shared base every other utility in the family `@apply`s. Grouped
      // so it collapses against Tailwind's shadows like the rest of them.
      "inset-shadow-bezel": ["inset-shadow-bezel"],
      "inset-shadow-lit-x": [
        { "inset-shadow-lit": [{ l: [isAny], r: [isAny] }] },
      ],
      "inset-shadow-lit-y": [
        { "inset-shadow-lit": [{ t: [isAny], b: [isAny] }] },
      ],
      "inset-shadow-lit-blur": [{ "inset-shadow-lit": [{ blur: [isAny] }] }],
      "inset-shadow-dim-x": [
        { "inset-shadow-dim": [{ l: [isAny], r: [isAny] }] },
      ],
      "inset-shadow-dim-y": [
        { "inset-shadow-dim": [{ t: [isAny], b: [isAny] }] },
      ],
      "inset-shadow-dim-blur": [{ "inset-shadow-dim": [{ blur: [isAny] }] }],
      // The bare classes, which carry the layer opacity as a `/40` modifier.
      "inset-shadow-lit-alpha": ["inset-shadow-lit"],
      "inset-shadow-dim-alpha": ["inset-shadow-dim"],
      "inset-shadow-blur": [{ "inset-shadow": [{ blur: [isAny] }] }],
    },
    conflictingClassGroups: {
      ...displacesTailwindShadows,
      // …and the other way round, so the last one written wins either way.
      shadow: INSET_SHADOW_GROUPS,
      "inset-shadow": INSET_SHADOW_GROUPS,
      // Blurs both layers at once, so it supersedes either single-layer blur.
      "inset-shadow-blur": [
        "inset-shadow-lit-blur",
        "inset-shadow-dim-blur",
        "shadow",
        "inset-shadow",
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
