/**
 * Back-compat path. The avatar moved to `components/user-avatar/` (split
 * into component / atoms / hooks); this module re-exports it so existing
 * imports keep resolving to the one implementation. Prefer the new path.
 */
export {
  UserAvatar,
  initialsFrom,
  useUserAvatar,
  useUserAvatarActions,
  useUserAvatarState,
} from "@/components/user-avatar"
export type { UserAvatarProps, UserPresence } from "@/components/user-avatar"
