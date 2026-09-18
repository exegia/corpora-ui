// Props interfaces from `atoms`, `blocks`, `composed`
import type * as NAtomsProps from "./atoms/types"
import type * as NComposedProps from "./composed/types"
import type * as NBlockProps from "./blocks/types"

type TAtomsProps = typeof NAtomsProps[keyof typeof NAtomsProps]
type TComposedProps = typeof NComposedProps[keyof typeof NComposedProps]
type TBlockProps = typeof NBlockProps[keyof typeof NBlockProps]
type TStoryComponentProps = TAtomsProps | TComposedProps | TBlockProps
export type { NAtomsProps, NComposedProps, NBlockProps, TStoryComponentProps }
