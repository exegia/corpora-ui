import type { ReactNode } from "react"

export type TTitleStyleType = "hidden" | "titlebar" | "expanded"

export interface IBrowserProps {
  url?: string
  title?: string
  className?: string
  children: ReactNode
  titleStyle: TTitleStyleType
}
