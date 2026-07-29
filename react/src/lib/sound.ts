/**
 * Interaction sound for the library, powered by cuelume (Web Audio synthesis,
 * zero runtime deps, SSR-safe).
 *
 * Components only emit inert `data-cuelume-*` attributes — nothing plays
 * until the consuming app opts in once:
 *
 *   import { bindSounds } from "@corpora/ui"
 *   bindSounds()
 *
 * The app owns preferences via setSoundEnabled / setSoundVolume.
 */
export {
  bind as bindSounds,
  play as playSound,
  setEnabled as setSoundEnabled,
  setVolume as setSoundVolume,
  sounds,
} from "cuelume";
export type { SoundName } from "cuelume";
