"use client"

import * as React from "react"
import { MotionConfig } from "motion/react"

import { cn } from "@/lib/utils"
import { AuthCard, AuthSuccess, MorphStep } from "./auth-shell"
import { CodeAuthBlock } from "./code-auth-block"
import {
  ForgotPasswordBlock,
} from "./forgot-password-block"
import { LoginBlock } from "./login-block"
import {
  OnboardingBlock,
} from "./onboarding-block"
import { SignupBlock } from "./signup-block"
import {
  UpdatePasswordBlock,
} from "./update-password-block"
import { useAuthFlow, useAuthFlowActions } from "./use-auth-state"
import type { IAuthFlowBlockProps, TAuthFlowDirective, TAuthFlowHandler } from "./type"

/**
 * Where the flow goes after a step callback resolves. Returned from every
 * `AuthFlowBlock` handler:
 *
 * - `{ user }` — the attempt signed someone in: mark the flow complete AND
 *   sign the session in (one atomic write, `completeAuthFlowAtom`).
 * - `{ verify }` — a code went out: record the identifier and move to the
 *   verification step (`beginAuthVerificationAtom`).
 * - `{ step }` — plain navigation with a clean slate (`goToAuthStepAtom`).
 * - `void` — stay put; the block renders its own success state.
 *
 * Rejections are NOT handled here — they propagate back into the block,
 * which owns its transient error/shake state (see `react/CLAUDE.md`,
 * "Third implementation: auth").
 */

/**
 * Renders the right auth block for the flow's current step with the store
 * wiring built in — the switchboard every host app was hand-rolling around
 * `useAuthFlow`. Navigation links between steps (login ↔ signup, forgot
 * password, back from verification) are pre-wired to `goToStep`; each
 * submit-shaped prop awaits your handler and applies the returned
 * {@link TAuthFlowDirective}.
 *
 * The blocks themselves stay untouched: passwords, codes and field drafts
 * live in their local state, and a rejected handler renders as the block's
 * own error — the orchestrator never mirrors transients into the store.
 * Needs `ExegiaProvider` above it, like every stateful block.
 *
 * ```tsx
 * <AuthFlowBlock
 *   onLogin={async ({ email, password }) => {
 *     const outcome = await api.signIn(email, password)
 *     return outcome.mfa ? { verify: { identifier: email } } : { user: outcome.user }
 *   }}
 *   onVerifyCode={async (code) => ({ user: await api.verify(code) })}
 * />
 * ```
 */
export function AuthFlowBlock({
  flowId,
  logo,
  accent,
  providers,
  onLogin,
  onSignup,
  onProviderSelect,
  onRequestReset,
  onVerifyCode,
  onResendCode,
  onUpdatePassword,
  onOnboardingComplete,
  onboardingSteps,
  steps,
  renderStep,
  success,
  successTitle = "Welcome",
  successDescription,
  className,
}: IAuthFlowBlockProps): React.ReactElement {
  const flow = useAuthFlow(flowId)
  const { goToStep, beginVerification, complete } = useAuthFlowActions(flowId)

  const apply = React.useCallback(
    (directive: TAuthFlowDirective) => {
      if (!directive) return
      if ("user" in directive) complete(directive.user)
      else if ("verify" in directive) beginVerification(directive.verify)
      else goToStep(directive.step)
    },
    [complete, beginVerification, goToStep]
  )

  /** Wrap a handler so its directive lands in the store. Errors propagate —
   * the block owns the error rendering. Absent handlers stay absent, so a
   * block keeps its "no handler" affordances (hidden buttons etc.). */
  function run<Data>(handler: TAuthFlowHandler<Data> | undefined) {
    if (!handler) return undefined
    return async (data: Data) => {
      apply(await handler(data))
    }
  }

  const content = ((): React.ReactNode => {
    const custom = renderStep?.(flow.step, flow)
    if (custom !== undefined) return custom

    switch (flow.step) {
      case "login":
        return (
          <LoginBlock
            logo={logo}
            accent={accent}
            providers={providers}
            onSubmit={run(onLogin)}
            onProviderSelect={run(onProviderSelect)}
            onForgotPassword={() => goToStep("forgot-password")}
            onSignup={() => goToStep("signup")}
            {...steps?.login}
          />
        )
      case "signup":
        return (
          <SignupBlock
            logo={logo}
            accent={accent}
            providers={providers}
            onSubmit={run(onSignup)}
            onProviderSelect={run(onProviderSelect)}
            onLogin={() => goToStep("login")}
            {...steps?.signup}
          />
        )
      case "verify-code":
        return (
          <CodeAuthBlock
            logo={logo}
            accent={accent}
            channel={flow.channel}
            destination={flow.maskedIdentifier ?? undefined}
            onVerify={run(onVerifyCode)}
            onResend={run(onResendCode)}
            onBack={() => goToStep("login")}
            {...steps?.["verify-code"]}
          />
        )
      case "forgot-password":
        return (
          <ForgotPasswordBlock
            logo={logo}
            accent={accent}
            onSubmit={run(onRequestReset)}
            onBackToLogin={() => goToStep("login")}
            {...steps?.["forgot-password"]}
          />
        )
      case "update-password":
        return (
          <UpdatePasswordBlock
            logo={logo}
            accent={accent}
            onSubmit={run(onUpdatePassword)}
            onDone={() => goToStep("login")}
            {...steps?.["update-password"]}
          />
        )
      case "onboarding":
        return (
          <OnboardingBlock
            logo={logo}
            accent={accent}
            steps={onboardingSteps}
            onComplete={run(onOnboardingComplete)}
            // The flow's success step is the completion screen — showing the
            // block's own too would stack two checkmarks.
            showCompleteScreen={false}
            {...steps?.onboarding}
          />
        )
      case "success":
        return (
          success ?? (
            // Header names the moment, the check screen names the outcome —
            // the same split the onboarding block's completion screen uses.
            <AuthCard title={successTitle} logo={logo} accent={accent}>
              <AuthSuccess
                title="You're signed in"
                description={successDescription}
              />
            </AuthCard>
          )
        )
    }
  })()

  return (
    <MotionConfig reducedMotion="user">
      <div
        className={cn("flex w-full justify-center", className)}
        data-slot="auth-flow"
        data-step={flow.step}
      >
        <MorphStep step={flow.step} className="flex w-full justify-center">
          {content}
        </MorphStep>
      </div>
    </MotionConfig>
  )
}
