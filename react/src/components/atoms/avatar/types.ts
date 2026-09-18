import type { TAtomSize } from "../types";

export type TUserType = {
  firstName?: string
  lastName?: string
  email?: string
  role?: string
  avatarUrl?: string
  verified?: boolean
  status?: TAvatarStatus
}

export type TAvatarSize = Exclude<TAtomSize, "xs">
export type TAvatarStatus = "online" | "idle" | "offline"

export type TAvatarAudio = "muted" | "unmuted" | "speaking"

export interface IAvatarProps<T extends TUserType> {
  user?: T
  size?: TAvatarSize
  className?: string
  audio?: TAvatarAudio
  loading?: boolean
}
