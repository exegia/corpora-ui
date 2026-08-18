import { describe, expect, test } from "bun:test"
import { act, fireEvent, render, screen } from "@testing-library/react"
import { createStore, Provider } from "jotai"

import { UserAvatar } from "../component"
import {
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
} from "../user-avatar-atom"
import { useUserAvatarActions, useUserAvatarState } from "../use-user-avatar-state"
import type { UserAvatarActions, UserAvatarState } from "../type"

const badge = () => document.querySelector('[data-slot="user-avatar-presence"]')
const bezel = () => document.querySelector('[data-slot="user-avatar-bezel"]')
const frame = () =>
  document.querySelector<HTMLElement>('[data-slot="user-avatar-frame"]')

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
    expect(root?.className).toContain("shadow-[inset")
    // Rests at the classic top-left light until a pointer moves.
    expect(bezel()?.getAttribute("style")).toContain(
      `rotate(${DEFAULT_BEZEL_ANGLE}deg)`
    )
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
    expect(bezel()?.getAttribute("style")).toContain("rotate(90deg)")

    // Straight below → 6 o'clock → 180°.
    await act(async () => {
      fireEvent.pointerMove(window, { clientX: 120, clientY: 300 })
      await new Promise((r) => requestAnimationFrame(() => r(null)))
    })
    expect(bezel()?.getAttribute("style")).toContain("rotate(180deg)")
    removeUserAvatarInstance("lit")
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
