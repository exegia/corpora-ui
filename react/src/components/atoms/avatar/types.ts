export type UserType = {
  firstName?: string
  lastName?: string
  email?: string
  role?: string
  avatarUrl?: string
  verified?: boolean
  status?: AvatarStatus
}

export type AvatarSize = "small" | "medium" | "large" | "xlarge"
export type AvatarStatus = "online" | "idle" | "offline"

export type AvatarAudio = "muted" | "unmuted" | "speaking"

export interface AvatarProps<T extends UserType> {
  user?: T
  size?: AvatarSize
  className?: string
  audio?: AvatarAudio
  loading?: boolean
}
