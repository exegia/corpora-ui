export type TTextureVariant =
  | "fabric"
  | "paper"
  | "none"
export interface ITextureProps {
  variant?: TTextureVariant
  opacity?: number
  className?: string
  children?: React.ReactNode
}