/**
 * `bun test` preload (wired in `bunfig.toml`).
 *
 * Registers happy-dom globals so component tests can render, then patches the
 * two browser APIs happy-dom does not implement that our components reach for:
 * `matchMedia` (motion's `MotionConfig reducedMotion="user"` calls it on every
 * render) and the element animation hooks motion uses for its WAAPI path.
 *
 * Never call `bindSounds()` here — sound stays opt-in for the consumer, and
 * the `data-cuelume-*` attributes are inert until an app binds them.
 */
import { GlobalRegistrator } from "@happy-dom/global-registrator"

if (!globalThis.document) {
  GlobalRegistrator.register({ url: "https://localhost" })
}

if (!window.matchMedia) {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  })) as typeof window.matchMedia;
}

// happy-dom ships no Web Animations API. Defining `animate` makes motion take
// its WAAPI path, so the stub must also COMPLETE: exits that never fire
// `onfinish` leave AnimatePresence holding removed children forever (the
// element only unmounted when an entering sibling happened to flush it).
// Finishing on a macrotask lets exit animations resolve instantly.
if (!Element.prototype.animate) {
  Element.prototype.animate = (() => {
    const animation = {
      cancel: () => {},
      finish: () => {},
      play: () => {},
      pause: () => {},
      reverse: () => {},
      commitStyles: () => {},
      persist: () => {},
      addEventListener: (type: string, listener: () => void) => {
        if (type === "finish") setTimeout(listener, 0)
      },
      removeEventListener: () => {},
      finished: Promise.resolve(),
      onfinish: null as (() => void) | null,
      playState: "finished",
    }
    setTimeout(() => animation.onfinish?.(), 0)
    return animation
  }) as unknown as typeof Element.prototype.animate
}

const { afterEach } = await import("bun:test");
const { cleanup } = await import("@testing-library/react");

afterEach(() => {
  cleanup();
});
