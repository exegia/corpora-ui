import { AudioWave } from "./audio-wave"
import { UserAvatar } from "./component"
import { Fallback } from "./fallback"

export { AudioWave } from "./audio-wave"
export { UserAvatar } from "./component"
export { Fallback } from "./fallback"
export { initialsFrom } from "./utils"
export type * from "./type"

export const Avatar = {
  AudioWave,
  Component: UserAvatar,
  Fallback,
}
