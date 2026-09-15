import type { ReactNode } from "react"

export type TitleStyleType = "hidden" | "titlebar" | "expanded"

export interface IBrowserProps {
  url?: string
  title?: string
  className?: string
  children: ReactNode
  titleStyle: TitleStyleType
}
