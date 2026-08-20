import { describe, expect, mock, test } from "bun:test"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { createStore } from "jotai"

import { ExegiaProvider } from "@/state"
import { AuthFlowBlock } from "../auth-flow-block"
import {
  DEFAULT_AUTH_FLOW_ID,
  authFlowStepAtom,
  authUserAtom,
  goToAuthStepAtom,
  isAuthenticatedAtom,
} from "../auth-state"
import type { AuthUser } from "../auth-state"

const USER: AuthUser = {
  id: "u-1",
  name: "Yona Appletree",
  email: "yo@example.com",
}

type Store = ReturnType<typeof createStore>

function mount(store: Store, ui: React.ReactElement) {
  return render(<ExegiaProvider store={store}>{ui}</ExegiaProvider>)
}

/** MorphStep exits run under AnimatePresence; happy-dom serves stale
 * selector-cache results to `waitFor` queries that start while an exit is
 * still running — let the exit settle on real timers, then query once. */
const settleExit = () => new Promise((resolve) => setTimeout(resolve, 400))

async function submitLogin(email = "yo@example.com", password = "hunter22!") {
  const user = userEvent.setup()
  await user.type(screen.getByLabelText("Email"), email)
  await user.type(screen.getByLabelText("Password"), password)
  await user.click(screen.getByRole("button", { name: "Login" }))
  return user
}

describe("AuthFlowBlock · step switching", () => {
  test("renders the login step by default with pre-wired navigation", async () => {
    const user = userEvent.setup()
    const store = createStore()
    mount(store, <AuthFlowBlock />)

    expect(screen.getByText("Login to your account")).toBeDefined()

    await user.click(screen.getByRole("button", { name: "Sign up" }))
    expect(store.get(authFlowStepAtom(DEFAULT_AUTH_FLOW_ID))).toBe("signup")
    await settleExit()
    expect(screen.getByText("Create your account")).toBeDefined()

    // Signup's footer goes back to login.
    await user.click(screen.getByRole("button", { name: "Login" }))
    expect(store.get(authFlowStepAtom(DEFAULT_AUTH_FLOW_ID))).toBe("login")
    await settleExit()

    // The forgot-password link sits in the password row, which the login
    // block reveals once the email is valid.
    await user.type(screen.getByLabelText("Email"), "yo@example.com")
    await user.click(
      await screen.findByRole("button", { name: "Forgot password?" })
    )
    expect(store.get(authFlowStepAtom(DEFAULT_AUTH_FLOW_ID))).toBe(
      "forgot-password"
    )
  })

  test("follows the store when something else drives the flow", async () => {
    const store = createStore()
    mount(store, <AuthFlowBlock />)

    store.set(goToAuthStepAtom(DEFAULT_AUTH_FLOW_ID), "update-password")
    expect(await screen.findByText("Update your password")).toBeDefined()
  })
})

describe("AuthFlowBlock · directives", () => {
  test("{ verify } moves to the code step with the masked destination", async () => {
    const store = createStore()
    const onLogin = mock(() => ({
      verify: { identifier: "yo@example.com" } as const,
    }))
    mount(store, <AuthFlowBlock onLogin={onLogin} />)

    await submitLogin()
    expect(onLogin).toHaveBeenCalledTimes(1)
    expect(store.get(authFlowStepAtom(DEFAULT_AUTH_FLOW_ID))).toBe(
      "verify-code"
    )
    // The masked identifier feeds CodeAuthBlock's destination copy.
    expect(await screen.findByText(/y•••@example\.com/)).toBeDefined()
  })

  test("{ user } completes the flow and signs the session in", async () => {
    const store = createStore()
    mount(store, <AuthFlowBlock onLogin={() => ({ user: USER })} />)

    await submitLogin()
    expect(store.get(authFlowStepAtom(DEFAULT_AUTH_FLOW_ID))).toBe("success")
    expect(store.get(isAuthenticatedAtom)).toBe(true)
    expect(store.get(authUserAtom)?.id).toBe("u-1")
    await settleExit()
    expect(screen.getByText("Welcome")).toBeDefined()
    expect(screen.getByText("You're signed in")).toBeDefined()
  })

  test("a resolved handler without a directive stays on the step", async () => {
    const store = createStore()
    mount(store, <AuthFlowBlock onLogin={() => undefined} />)

    await submitLogin()
    expect(store.get(authFlowStepAtom(DEFAULT_AUTH_FLOW_ID))).toBe("login")
  })

  test("a rejected handler stays on the step and shows the block's error", async () => {
    const store = createStore()
    mount(
      store,
      <AuthFlowBlock
        onLogin={() => {
          throw new Error("Wrong password")
        }}
      />
    )

    await submitLogin()
    expect(store.get(authFlowStepAtom(DEFAULT_AUTH_FLOW_ID))).toBe("login")
    expect(await screen.findByText("Wrong password")).toBeDefined()
    expect(store.get(isAuthenticatedAtom)).toBe(false)
  })
})

describe("AuthFlowBlock · customization", () => {
  test("steps overrides merge over the wiring", async () => {
    const store = createStore()
    mount(
      store,
      <AuthFlowBlock
        steps={{ login: { title: "Sign in to Corpora", providers: [] } }}
      />
    )

    expect(screen.getByText("Sign in to Corpora")).toBeDefined()
  })

  test("renderStep replaces a step; undefined keeps the default", async () => {
    const store = createStore()
    mount(
      store,
      <AuthFlowBlock
        renderStep={(step) =>
          step === "success" ? <p>Custom landing</p> : undefined
        }
      />
    )

    expect(screen.getByText("Login to your account")).toBeDefined()
    store.set(goToAuthStepAtom(DEFAULT_AUTH_FLOW_ID), "success")
    expect(await screen.findByText("Custom landing")).toBeDefined()
  })

  test("two flow ids orchestrate independently", async () => {
    const store = createStore()
    mount(
      store,
      <>
        <AuthFlowBlock flowId="page" />
        <AuthFlowBlock flowId="modal" />
      </>
    )

    store.set(goToAuthStepAtom("modal"), "forgot-password")
    expect(await screen.findByText("Reset your password")).toBeDefined()
    // The page flow is still on login.
    await waitFor(() =>
      expect(screen.getByText("Login to your account")).toBeDefined()
    )
    expect(store.get(authFlowStepAtom("page"))).toBe("login")
  })
})
