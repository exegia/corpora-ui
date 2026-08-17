export type ImageStatus = Parameters<
  NonNullable<AvatarPrimitive.Image.Props["onLoadingStatusChange"]>
>[0]

export interface UserAvatarProps extends Omit<
  AvatarPrimitive.Root.Props,
  "children"
> {
  /** Image URL. Without one the initials show immediately — no skeleton. */
  src?: string
  /** Drives the initials, and the alt text unless `alt` overrides it. */
  name?: string
  /** Overrides the initials derived from `name`. */
  initials?: string
  /**
   * Alt text for the image. Pass "" when adjacent text already names the
   * person — the image is then decorative.
   */
  alt?: string
  /**
   * Force the skeleton, for when the identity itself is still being fetched.
   * Omitted, it follows the image: a passed `src` skeletons until it resolves.
   */
  loading?: boolean
}

export interface IAudioWaveProps {
  className?: string
  children?: React.ReactNode
  volume?: number
}
