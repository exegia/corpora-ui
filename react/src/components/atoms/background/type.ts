export type TextureVariant =
  | "fabric"
  | "paper"
  | "none"
export interface TextureProps {
  variant?: TextureVariant
  opacity?: number
  className?: string
  children?: React.ReactNode
}