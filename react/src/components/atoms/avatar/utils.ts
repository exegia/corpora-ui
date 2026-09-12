import type { ClassValue } from "class-variance-authority/types"
import type { AvatarAudio, AvatarSize, UserType } from "./types"

export function initialsFrom(user: string | UserType | undefined): string | undefined {
  // If the user is a string, use it directly to generate initials.
  if (user && typeof user === "string") {
    const parts = user.trim().split(/\s+/).filter(Boolean)
    if (parts.length === 0) return ""
    const first = parts[0]?.[0] ?? ""
    const last = parts.length > 1 ? (parts.at(-1)?.[0] ?? "") : ""
    return (first + last).toUpperCase()
  }
  // If the user is not a string, use firstName and lastName to generate initials.
  if (user && typeof user !== "string" && user.firstName && user.lastName)
    return user.firstName.charAt(0) + user.lastName.charAt(0)
  // If the user does not have a firstName or lastName, return undefined.
  return undefined
}

export const avatarIsSpeakingClass =
  "ring-background size-10 ring-2 transition-transform duration-500 group-hover/avatar:scale-95"

export const ringClasses: Record<NonNullable<AvatarAudio>, ClassValue> = {
  muted: "group-hover/avatar:opacity-0 group-hover/avatar:blur-none  opacity-0",
  unmuted:
    "animate-none group-hover/avatar:opacity-70 group-hover/avatar:blur-sm opacity-30",
  speaking:
    "animate-[spin_3s_linear_infinite] group-hover/avatar:opacity-100 group-hover/avatar:blur-sm opacity-75",
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
