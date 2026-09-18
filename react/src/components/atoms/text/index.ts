import { Text as TextDefault } from "./default"
import { Heading } from "./heading"
import { Paragraph } from "./paragraph"
import { Span } from "./span"
import { Label } from "./label"
export type { THeadingProps } from "./heading"
export type { TParagraphProps } from "./paragraph"
export type { TSpanProps } from "./span"
export type { TTextProps, TTextSize, TTextVariant } from "./types"

export const Text = {
  /** The polymorphic base the presets below are built on — the only member
   * that takes `type`, so it is what reaches `link` and `subscript`. The
   * presets are reachable through the atoms barrel, and without this it
   * would not be: `export *` does not carry a default export. */
  Root: TextDefault,
  Heading,
  Paragraph,
  Span,
  Label,
}

export { TextDefault as default }

