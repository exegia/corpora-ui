import type { AtomSize } from "../types";

export type UserType = {
  firstName?: string
  lastName?: string
  email?: string
  role?: string
  avatarUrl?: string
  verified?: boolean
  status?: AvatarStatus
}

export type AvatarSize = Exclude<AtomSize, "xs">
export type AvatarStatus = "online" | "idle" | "offline"

export type AvatarAudio = "muted" | "unmuted" | "speaking"

export interface AvatarProps<T extends UserType> {
  user?: T
  size?: AvatarSize
  className?: string
  audio?: AvatarAudio
  loading?: boolean
}
