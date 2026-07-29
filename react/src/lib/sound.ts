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
import { bind, play } from "cuelume";
import type { SoundName } from "cuelume";

let bound = false;

/** Opt into interaction sound. Delegated and idempotent (see cuelume bind). */
export function bindSounds(root?: ParentNode): void {
  bound = true;
  bind(root);
}

/**
 * Imperative cue used by library components for keyboard-driven interactions
 * the data attributes can't cover (OTP typing, visibility toggles, …).
 * No-op until the app has opted in via bindSounds().
 */
export function playCue(name: SoundName, options?: { volume?: number }): void {
  if (bound) play(name, options);
}

export {
  play as playSound,
  setEnabled as setSoundEnabled,
  setVolume as setSoundVolume,
  sounds,
} from "cuelume";
export type { SoundName };
