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
import { GlobalRegistrator } from "@happy-dom/global-registrator";

if (!globalThis.document) {
  GlobalRegistrator.register({ url: "https://localhost" });
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

// happy-dom ships no Web Animations API. motion falls back to its own
// timer-driven path when `animate` is missing, so a no-op stub is enough to
// keep AnimatePresence exits from throwing.
if (!Element.prototype.animate) {
  Element.prototype.animate = (() => ({
    cancel: () => {},
    finish: () => {},
    play: () => {},
    pause: () => {},
    reverse: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    finished: Promise.resolve(),
    onfinish: null,
    playState: "finished",
  })) as unknown as typeof Element.prototype.animate;
}

const { afterEach } = await import("bun:test");
const { cleanup } = await import("@testing-library/react");

afterEach(() => {
  cleanup();
});
