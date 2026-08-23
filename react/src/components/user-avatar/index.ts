import { AudioWave } from "./audio-wave"
import { UserAvatar } from "./component"
import { Fallback } from "./fallback"

export { AudioWave } from "./audio-wave"
export { UserAvatar } from "./component"
export { Fallback } from "./fallback"
export { PresenceBadge } from "./presence-badge"
export { initialsFrom } from "./utils"
export { useUserAvatar } from "./use-user-avatar"
export type { UseUserAvatarOptions, UserAvatarBinding } from "./use-user-avatar"
export { useUserAvatarActions, useUserAvatarState } from "./use-user-avatar-state"
// The public atom surface. `@internal` atoms (config, image status, the
// props projection) stay unexported on purpose — `export *` would make every
// internal a breaking-change surface for consumer apps.
export {
  DEFAULT_BEZEL_ANGLE,
  removeUserAvatarInstance,
  resetUserAvatarAtom,
  setUserAvatarBezelAngleAtom,
  setUserAvatarPresenceAtom,
  toggleUserAvatarPresenceAtom,
  userAvatarBezelAngleAtom,
  userAvatarIsOnlineAtom,
  userAvatarPresenceAtom,
  userAvatarStateAtom,
} from "./user-avatar-atom"
export type * from "./type"

export const Avatar = {
  AudioWave,
  Component: UserAvatar,
  Fallback,
}
