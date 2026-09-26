/** Load optional sound support without enabling playback or binding listeners. */
export function preloadSounds() {
  return import("../sound")
}

/** Cancel a pending opt-in when its provider unmounts or disables sound. */
export function activateProviderSounds(
  load: () => Promise<Pick<typeof import("../sound"), "bindSounds">> = preloadSounds
) {
  let active = true
  void load().then(
    ({ bindSounds }) => {
      if (active) bindSounds()
    },
    () => {
      // Sound is optional. Failed downloads must not break the application.
      // Explicit preloadSounds callers can observe and handle the rejection.
    }
  )
  return () => { active = false }
}
