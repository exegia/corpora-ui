import type { ClassValue } from "class-variance-authority/types";
import type { AvatarAudio, AvatarSize, UserType } from "./types"

export const initials = (user: UserType | undefined) => {
  if (user && user.firstName && user.lastName)
    return user.firstName.charAt(0) + user.lastName.charAt(0)
  return undefined
}

export const avatarIsSpeakingClass = "ring-background size-10 ring-2 transition-transform duration-500 group-hover/avatar:scale-95"

export const ringClasses: Record<NonNullable<AvatarAudio>, ClassValue> = {
  muted: "group-hover/avatar:opacity-0 group-hover/avatar:blur-none  opacity-0",
  unmuted: "animate-none group-hover/avatar:opacity-70 group-hover/avatar:blur-sm opacity-30",
  speaking: "animate-[spin_3s_linear_infinite] group-hover/avatar:opacity-100 group-hover/avatar:blur-sm opacity-75",
}

export const sizeClasses: Record<AvatarSize, string> = {
  small: "size-4",
  medium: "size-6",
  large: "size-8",
  xlarge: "size-10",
}

export const statusClasses = {
  online: "bg-success",
  idle: "bg-warning",
  offline: "bg-danger",
}