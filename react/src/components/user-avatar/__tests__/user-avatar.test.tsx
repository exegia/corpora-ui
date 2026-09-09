import { describe, expect, test } from "bun:test"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { createStore, Provider } from "jotai"

import { UserAvatar } from "../component"
import {
  DEFAULT_BEZEL_ANGLE,
  removeUserAvatarInstance,
  resetUserAvatarAtom,
  setUserAvatarBezelAngleAtom,
  setUserAvatarImageToneAtom,
  setUserAvatarPresenceAtom,
  toggleUserAvatarPresenceAtom,
  userAvatarBezelAngleAtom,
  userAvatarImageToneAtom,
  userAvatarIsOnlineAtom,
  userAvatarPresenceAtom,
  userAvatarStateAtom,
} from "../user-avatar-atom"
import { bezelAlphasForTone } from "../utils"
import { useUserAvatarActions, useUserAvatarState } from "../use-user-avatar-state"
import type { UserAvatarActions, UserAvatarState } from "../type"

const badge = () => document.querySelector('[data-slot="user-avatar-presence"]')
const bezel = () => document.querySelector('[data-slot="user-avatar-bezel"]')
const frame = () =>
  document.querySelector<HTMLElement>('[data-slot="user-avatar-frame"]')
/** The rim's rotation, parsed. The component damps the stored bearing
 * (`bezelAngle * 0.8`) so the highlight trails the pointer slightly. */
const BEZEL_DAMPING = 0.8
const rimRotation = () => {
  const match = /rotate\((-?[\d.]+)deg\)/.exec(bezel()?.getAttribute("style") ?? "")
  return match ? Number(match[1]) : Number.NaN
}

describe("UserAvatar · presence badge", () => {
  test("no presence, no badge", () => {
    render(<UserAvatar name="Jenny Hamilton" />)
    expect(badge()).toBeNull()
  })

  test("online is a filled dot named for AT; offline a hollow ring", () => {
    const { rerender } = render(
      <UserAvatar name="Jenny Hamilton" presence="online" />
    )
    expect(badge()?.getAttribute("data-presence")).toBe("online")
    expect(screen.getByRole("img", { name: "Online" })).toBeDefined()
    expect(badge()?.className).toContain("bg-emerald-500")

    rerender(<UserAvatar name="Jenny Hamilton" presence="offline" />)
    expect(screen.getByRole("img", { name: "Offline" })).toBeDefined()
    expect(badge()?.className).toContain("border-2")

    // Releasing the prop clears the badge — a real transition for a user.
    rerender(<UserAvatar name="Jenny Hamilton" />)
    expect(badge()).toBeNull()
  })

  test("online reflects the badge colour onto the disc; offline does not", async () => {
    const reflection = () =>
      document.querySelector('[data-slot="user-avatar-reflection"]')
    const { rerender } = render(
      <UserAvatar name="Jenny Hamilton" presence="online" />
    )
    expect(reflection()).not.toBeNull()
    // Static — no transform, unlike the bezel rim.
    expect(reflection()?.getAttribute("style")).toBeNull()
    expect(reflection()?.className).toContain("radial-gradient")
    // Initials disc: the smaller, fainter pool.
    expect(reflection()?.hasAttribute("data-image")).toBe(false)
    expect(reflection()?.className).toContain("[--reflect-peak:16%]")
    // A requested-but-not-loaded src still shows initials — still the small
    // pool; only a loaded photo gets the larger one.
    // happy-dom's Image reports naturalWidth 0 (Base UI reads that as a
    // failed preload) — a broken src keeps the initials and the small pool.
    rerender(
      <UserAvatar name="Jenny Hamilton" presence="online" src="/broken.jpg" />
    )
    expect(reflection()?.hasAttribute("data-image")).toBe(false)

    // Stand in a preload that succeeds: now a photo is on screen.
    const RealImage = window.Image
    window.Image = class {
      complete = true
      naturalWidth = 72
      onload: (() => void) | null = null
      onerror: (() => void) | null = null
      src = ""
    } as unknown as typeof window.Image
    try {
      rerender(
        <UserAvatar name="Jenny Hamilton" presence="online" src="/ok.jpg" />
      )
      await act(async () => {
        await new Promise((r) => setTimeout(r, 0))
      })
      expect(reflection()?.hasAttribute("data-image")).toBe(true)
      expect(reflection()?.className).toContain("[--reflect-peak:30%]")
    } finally {
      window.Image = RealImage
    }
    rerender(<UserAvatar name="Jenny Hamilton" presence="offline" />)
    expect(reflection()).toBeNull()
  })

  test("the badge carries a sheen lit from the bezel angle; none without a bezel", async () => {
    const sheen = () =>
      document.querySelector('[data-slot="user-avatar-presence-sheen"]')
    const { rerender } = render(
      <UserAvatar avatarId="sheen" name="Jenny Hamilton" presence="online" />
    )
    expect(sheen()).not.toBeNull()
    const rot = () =>
      Number(/rotate\((-?[\d.]+)deg\)/.exec(sheen()?.getAttribute("style") ?? "")?.[1])
    expect(rot()).toBeCloseTo(DEFAULT_BEZEL_ANGLE * BEZEL_DAMPING, 5)

    // Same light as the rim: a pointer move rotates both together.
    const host = frame() as HTMLElement
    host.getBoundingClientRect = () =>
      ({ left: 100, top: 100, width: 40, height: 40, right: 140, bottom: 140 }) as DOMRect
    await act(async () => {
      fireEvent.pointerMove(window, { clientX: 200, clientY: 120 })
      await new Promise((r) => requestAnimationFrame(() => r(null)))
    })
    expect(rot()).toBeCloseTo(90 * BEZEL_DAMPING, 5)
    expect(rot()).toBeCloseTo(rimRotation(), 5)

    rerender(<UserAvatar bezel={false} name="Jenny Hamilton" presence="online" />)
    expect(sheen()).toBeNull()
    removeUserAvatarInstance("sheen")
  })

  test("the root carries data-presence for styling hooks", () => {
    render(<UserAvatar name="Jenny Hamilton" presence="online" />)
    expect(
      document
        .querySelector('[data-slot="user-avatar"]')
        ?.getAttribute("data-presence")
    ).toBe("online")
  })
})

describe("UserAvatar · bezel", () => {
  test("on by default: an emboss shadow on the root and a rotated rim", () => {
    render(<UserAvatar name="Jenny Hamilton" />)
    const root = document.querySelector('[data-slot="user-avatar"]')
    expect(root?.hasAttribute("data-bezel")).toBe(true)
    // Both emboss layers, in both themes. Asserted class by class rather than
    // as "some inset shadow": the family is custom, so a `cn()` that does not
    // know it folds the lot into one built-in group and keeps only the last —
    // which still passes a laxer check while the emboss is gone from screen.
    for (const expected of [
      "inset-shadow-lit-t-3",
      "inset-shadow-lit-blur-3",
      "inset-shadow-lit/80",
      "dark:inset-shadow-lit/5",
      "inset-shadow-dim-b-1",
      "inset-shadow-dim-blur-2",
      "inset-shadow-dim/15",
      "dark:inset-shadow-dim-b-8",
    ]) {
      expect(root?.className).toContain(expected)
    }
    // Rests at the classic top-left light until a pointer moves.
    expect(rimRotation()).toBeCloseTo(DEFAULT_BEZEL_ANGLE * BEZEL_DAMPING, 5)
  })

  test("bezel={false} renders a flat disc", () => {
    render(<UserAvatar bezel={false} name="Jenny Hamilton" />)
    expect(bezel()).toBeNull()
    expect(
      document.querySelector('[data-slot="user-avatar"]')?.hasAttribute("data-bezel")
    ).toBe(false)
  })

  test("the rim follows the pointer's bearing from the avatar's centre", async () => {
    render(<UserAvatar avatarId="lit" name="Jenny Hamilton" />)
    const host = frame() as HTMLElement
    // happy-dom rects are 0×0; give the frame a box the hook can measure.
    host.getBoundingClientRect = () =>
      ({ left: 100, top: 100, width: 40, height: 40, right: 140, bottom: 140 }) as DOMRect

    // Pointer straight to the right of centre (120,120) → 3 o'clock → 90°.
    await act(async () => {
      fireEvent.pointerMove(window, { clientX: 200, clientY: 120 })
      await new Promise((r) => requestAnimationFrame(() => r(null)))
    })
    expect(rimRotation()).toBeCloseTo(90 * BEZEL_DAMPING, 5)

    // Straight below → 6 o'clock → 180°.
    await act(async () => {
      fireEvent.pointerMove(window, { clientX: 120, clientY: 300 })
      await new Promise((r) => requestAnimationFrame(() => r(null)))
    })
    expect(rimRotation()).toBeCloseTo(180 * BEZEL_DAMPING, 5)
    removeUserAvatarInstance("lit")
  })
})

describe("UserAvatar · bezel tone", () => {
  test("alphas lean on the shadow over a pale rim and ease the highlight over a dark one", () => {
    const dark = bezelAlphasForTone(0)
    const light = bezelAlphasForTone(1)
    expect(dark.hi).toBeLessThan(light.hi)
    expect(dark.lo).toBeGreaterThan(light.lo)
    // Out-of-range input clamps rather than extrapolating past [0, 1].
    expect(bezelAlphasForTone(-3)).toEqual(dark)
    expect(bezelAlphasForTone(7)).toEqual(light)
  })

  test("without a sampled tone the rim carries no inline alphas — the theme's defaults apply", () => {
    render(<UserAvatar name="Jenny Hamilton" />)
    const rim = bezel()
    expect(rim?.hasAttribute("data-tone")).toBe(false)
    expect(rim?.getAttribute("style")).not.toContain("--bezel-hi-a")
    // The defaults live in classes, per theme, so a photo-less disc is lit
    // for the page it sits on.
    expect(rim?.className).toContain("[--bezel-hi-a:1]")
    expect(rim?.className).toContain("dark:[--bezel-hi-a:0.18]")
  })

  test("the tone atom clamps and clears", () => {
    const store = createStore()
    store.set(setUserAvatarImageToneAtom("t"), 1.7)
    expect(store.get(userAvatarImageToneAtom("t"))).toBe(1)
    store.set(setUserAvatarImageToneAtom("t"), 0.3)
    expect(store.get(userAvatarImageToneAtom("t"))).toBe(0.3)
    store.set(setUserAvatarImageToneAtom("t"), Number.NaN)
    expect(store.get(userAvatarImageToneAtom("t"))).toBeNull()
    store.set(setUserAvatarImageToneAtom("t"), 0.5)
    store.set(resetUserAvatarAtom("t"))
    expect(store.get(userAvatarImageToneAtom("t"))).toBeNull()
    removeUserAvatarInstance("t")
  })
})

describe("UserAvatar · store", () => {
  test("presence, toggle, isOnline and reset on an isolated store", () => {
    const store = createStore()
    expect(store.get(userAvatarPresenceAtom("a"))).toBeNull()
    store.set(setUserAvatarPresenceAtom("a"), "online")
    expect(store.get(userAvatarIsOnlineAtom("a"))).toBe(true)
    store.set(toggleUserAvatarPresenceAtom("a"))
    expect(store.get(userAvatarPresenceAtom("a"))).toBe("offline")
    // A badge-less avatar comes online on toggle.
    store.set(setUserAvatarPresenceAtom("a"), null)
    store.set(toggleUserAvatarPresenceAtom("a"))
    expect(store.get(userAvatarPresenceAtom("a"))).toBe("online")

    store.set(setUserAvatarBezelAngleAtom("a"), 400)
    // Continuous — not wrapped — so a CSS rotation takes the short way.
    expect(store.get(userAvatarBezelAngleAtom("a"))).toBe(400)
    store.set(setUserAvatarBezelAngleAtom("a"), Number.NaN)
    expect(store.get(userAvatarBezelAngleAtom("a"))).toBe(400)

    store.set(resetUserAvatarAtom("a"))
    expect(store.get(userAvatarStateAtom("a"))).toEqual({
      presence: null,
      bezelAngle: DEFAULT_BEZEL_ANGLE,
      imageStatus: "idle",
      imageTone: null,
    })
    removeUserAvatarInstance("a")
  })

  test("a controlled presence prop wins over store writes; hooks by id read and drive", () => {
    let actions!: UserAvatarActions
    let state!: UserAvatarState
    function Probe() {
      actions = useUserAvatarActions("me")
      state = useUserAvatarState("me")
      return null
    }
    const store = createStore()
    const { rerender } = render(
      <Provider store={store}>
        <UserAvatar avatarId="me" name="Jenny Hamilton" presence="offline" />
        <Probe />
      </Provider>
    )
    expect(state.presence).toBe("offline")
    act(() => actions.setPresence("online"))
    // Controlled: the store write is inert, the badge stays offline.
    expect(badge()?.getAttribute("data-presence")).toBe("offline")

    // Uncontrolled: the store drives the badge from anywhere.
    rerender(
      <Provider store={store}>
        <UserAvatar avatarId="me" name="Jenny Hamilton" />
        <Probe />
      </Provider>
    )
    expect(badge()).toBeNull()
    act(() => actions.setPresence("online"))
    expect(badge()?.getAttribute("data-presence")).toBe("online")
    expect(state.presence).toBe("online")
    act(() => actions.togglePresence())
    expect(badge()?.getAttribute("data-presence")).toBe("offline")
    removeUserAvatarInstance("me")
  })
})
