import { describe, expect, test } from "bun:test"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createStore } from "jotai"

import { ExegiaProvider } from "@/state"
import {
  DEFAULT_AUTH_FLOW_ID,
  authFlowErrorAtom,
  authFlowIdentifierAtom,
  authFlowMaskedIdentifierAtom,
  authFlowStateAtom,
  authFlowStatusAtom,
  authFlowStepAtom,
  authSessionStatusAtom,
  authUserAtom,
  beginAuthVerificationAtom,
  completeAuthFlowAtom,
  endAuthSessionAtom,
  failAuthFlowAtom,
  goToAuthStepAtom,
  isAuthenticatedAtom,
  maskAuthIdentifier,
  removeAuthFlowInstance,
  resetAuthFlowAtom,
  signInAtom,
  updateAuthUserAtom,
  useAuthFlow,
  useAuthFlowActions,
} from "../auth-state"
import type { AuthUser } from "../auth-state"

const USER: AuthUser = {
  id: "u-1",
  name: "Yona Appletree",
  email: "yo@example.com",
}

describe("auth flow atoms · instance isolation", () => {
  test("two flow ids never share state", () => {
    const store = createStore()
    store.set(beginAuthVerificationAtom("modal"), {
      identifier: "yo@example.com",
    })

    expect(store.get(authFlowStepAtom("modal"))).toBe("verify-code")
    expect(store.get(authFlowStepAtom("page"))).toBe("login")
    expect(store.get(authFlowIdentifierAtom("page"))).toBeNull()
  })

  test("two stores never share state under one id", () => {
    const one = createStore()
    const two = createStore()
    one.set(beginAuthVerificationAtom("shared"), {
      identifier: "yo@example.com",
    })

    expect(one.get(authFlowStepAtom("shared"))).toBe("verify-code")
    expect(two.get(authFlowStepAtom("shared"))).toBe("login")
  })
})

describe("auth flow atoms · flow drives the session", () => {
  test("beginVerification → complete(user) drives flow and session together", () => {
    const store = createStore()
    const other = createStore()
    store.set(beginAuthVerificationAtom(DEFAULT_AUTH_FLOW_ID), {
      identifier: "+15551234567",
      channel: "sms",
    })
    store.set(completeAuthFlowAtom(DEFAULT_AUTH_FLOW_ID), USER)

    const flow = store.get(authFlowStateAtom(DEFAULT_AUTH_FLOW_ID))
    expect(flow.step).toBe("success")
    expect(flow.status).toBe("success")
    expect(flow.error).toBeNull()
    expect(flow.channel).toBe("sms")
    expect(store.get(authUserAtom)).toEqual(USER)
    expect(store.get(isAuthenticatedAtom)).toBe(true)

    // The other store's session never moved.
    expect(other.get(authSessionStatusAtom)).toBe("unknown")
    expect(other.get(authUserAtom)).toBeNull()
  })

  test("complete() without a user leaves the session alone", () => {
    const store = createStore()
    store.set(completeAuthFlowAtom(DEFAULT_AUTH_FLOW_ID))

    expect(store.get(authFlowStatusAtom(DEFAULT_AUTH_FLOW_ID))).toBe("success")
    expect(store.get(authSessionStatusAtom)).toBe("unknown")
  })
})

describe("auth flow atoms · status transitions", () => {
  test("fail sets status and error; goToStep clears them", () => {
    const store = createStore()
    store.set(failAuthFlowAtom(DEFAULT_AUTH_FLOW_ID), "Wrong code")

    expect(store.get(authFlowStatusAtom(DEFAULT_AUTH_FLOW_ID))).toBe("error")
    expect(store.get(authFlowErrorAtom(DEFAULT_AUTH_FLOW_ID))).toBe(
      "Wrong code"
    )

    store.set(goToAuthStepAtom(DEFAULT_AUTH_FLOW_ID), "forgot-password")
    expect(store.get(authFlowStepAtom(DEFAULT_AUTH_FLOW_ID))).toBe(
      "forgot-password"
    )
    expect(store.get(authFlowStatusAtom(DEFAULT_AUTH_FLOW_ID))).toBe("idle")
    expect(store.get(authFlowErrorAtom(DEFAULT_AUTH_FLOW_ID))).toBeNull()
  })
})

describe("maskAuthIdentifier", () => {
  test("masks emails, keeping the first character and the domain", () => {
    expect(maskAuthIdentifier("yo@example.com")).toBe("y•••@example.com")
    expect(maskAuthIdentifier("y@ex.co")).toBe("y•••@ex.co")
  })

  test("masks phone numbers down to the last 4 characters", () => {
    expect(maskAuthIdentifier("+15551234567")).toBe("•••4567")
    expect(maskAuthIdentifier("123")).toBe("•••")
    // Exactly 4 chars: last-4 would reveal everything — mask it all.
    expect(maskAuthIdentifier("1234")).toBe("•••")
  })

  test("the derived atom masks the identifier in flight", () => {
    const store = createStore()
    expect(store.get(authFlowMaskedIdentifierAtom("m"))).toBeNull()

    store.set(beginAuthVerificationAtom("m"), {
      identifier: "yo@example.com",
    })
    expect(store.get(authFlowMaskedIdentifierAtom("m"))).toBe(
      "y•••@example.com"
    )
  })
})

describe("auth session atoms · sign out", () => {
  test("endAuthSession clears the session and resets the default flow", () => {
    const store = createStore()
    store.set(beginAuthVerificationAtom(DEFAULT_AUTH_FLOW_ID), {
      identifier: "yo@example.com",
    })
    store.set(completeAuthFlowAtom(DEFAULT_AUTH_FLOW_ID), USER)

    store.set(endAuthSessionAtom)
    expect(store.get(authSessionStatusAtom)).toBe("unauthenticated")
    expect(store.get(authUserAtom)).toBeNull()
    expect(store.get(isAuthenticatedAtom)).toBe(false)

    const flow = store.get(authFlowStateAtom(DEFAULT_AUTH_FLOW_ID))
    expect(flow.step).toBe("login")
    expect(flow.identifier).toBeNull()
    expect(flow.maskedIdentifier).toBeNull()
    expect(flow.status).toBe("idle")
  })
})

describe("auth session atoms · updateAuthUser", () => {
  test("shallow-merges a patch into the signed-in user", () => {
    const store = createStore()
    store.set(signInAtom, USER)
    store.set(updateAuthUserAtom, { name: "Yona A.", avatar: "/a.png" })

    expect(store.get(authUserAtom)).toEqual({
      ...USER,
      name: "Yona A.",
      avatar: "/a.png",
    })
  })

  test("is a no-op when signed out", () => {
    const store = createStore()
    store.set(updateAuthUserAtom, { name: "Nobody" })
    expect(store.get(authUserAtom)).toBeNull()
  })
})

describe("auth flow atoms · reset and teardown", () => {
  test("resetAuthFlow restores the initial values", () => {
    const store = createStore()
    store.set(beginAuthVerificationAtom("r"), {
      identifier: "+15551234567",
      channel: "sms",
      step: "signup",
    })
    store.set(failAuthFlowAtom("r"), "nope")

    store.set(resetAuthFlowAtom("r"))
    expect(store.get(authFlowStateAtom("r"))).toEqual({
      step: "login",
      identifier: null,
      maskedIdentifier: null,
      channel: "email",
      status: "idle",
      error: null,
    })
  })

  test("removeAuthFlowInstance drops the slice back to its defaults", () => {
    const store = createStore()
    store.set(beginAuthVerificationAtom("gone"), {
      identifier: "yo@example.com",
    })

    removeAuthFlowInstance("gone")
    expect(store.get(authFlowStepAtom("gone"))).toBe("login")
    expect(store.get(authFlowIdentifierAtom("gone"))).toBeNull()
  })
})

describe("ExegiaProvider · siblings share one flow", () => {
  /** Drives the flow; holds no state of its own. */
  function Begin() {
    const { beginVerification } = useAuthFlowActions()
    return (
      <button
        onClick={() => beginVerification({ identifier: "yo@example.com" })}
        type="button"
      >
        begin
      </button>
    )
  }

  /** Reads the flow; no relationship to `Begin` beyond the default id. */
  function Destination() {
    const flow = useAuthFlow()
    return <p>{flow.maskedIdentifier ?? "no destination"}</p>
  }

  test("one sibling's beginVerification shows in the other's read", async () => {
    const user = userEvent.setup()
    render(
      <ExegiaProvider store={createStore()}>
        <Begin />
        <Destination />
      </ExegiaProvider>
    )

    expect(screen.getByText("no destination")).toBeDefined()
    await user.click(screen.getByRole("button", { name: "begin" }))
    expect(await screen.findByText("y•••@example.com")).toBeDefined()
  })
})
