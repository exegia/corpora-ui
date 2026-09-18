"use client";

import * as React from "react";

import { Select, SelectTrigger, SelectValue, SelectPopup, SelectItem } from "@/components/ui/select";
import {
  AuthCard,
  AuthError,
  AuthSuccess,
  MorphStep,
} from "./auth-shell";
import { ProfileStep } from "./onboarding/profile-step";
import type { IOnboardingBlockProps, IOnboardingStepConfig, TOnboardingValue, TAuthStatus } from "./type";


/** Default configuration: a single required display-name step. */
export const DEFAULT_ONBOARDING_STEPS: IOnboardingStepConfig[] = [
  {
    id: "profile",
    title: "Your profile",
    fields: [
      { kind: "text", name: "display_name", label: "Display name", required: true },
    ],
  },
];



/**
 * Multi-step profile onboarding: a declared `steps` config renders as
 * progress-tracked forms with back/forward navigation, per-step submission and
 * a single completion signal. Drafts survive back-navigation, and the step
 * heading takes focus on advance so a screen reader announces where the flow
 * moved.
 *
 * Account creation and email confirmation are separate blocks (`SignupBlock`,
 * `CodeAuthBlock`) — this one picks up once the account exists.
 */
export function OnboardingBlock({
  steps = DEFAULT_ONBOARDING_STEPS,
  logo,
  accent,
  onStepSubmit,
  onComplete,
  showCompleteScreen = true,
  autoFocus = true,
  className,
}: IOnboardingBlockProps) {
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  // Unsubmitted per-step drafts. Accumulated in a ref so a keystroke does not
  // re-render the whole flow, then published to state at each navigation —
  // the only moment the seed values are actually read.
  const draftsRef = React.useRef<
    Record<string, Record<string, TOnboardingValue>>
  >({});
  const [drafts, setDrafts] = React.useState<
    Record<string, Record<string, TOnboardingValue>>
  >({});

  const [index, setIndex] = React.useState(0);
  const [furthestIndex, setFurthestIndex] = React.useState(0);
  const [values, setValues] = React.useState<Record<string, TOnboardingValue>>(
    {},
  );
  const [status, setStatus] = React.useState<TAuthStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);

  const done = status === "success";
  const step = steps[index];
  const last = index >= steps.length - 1;

  // Focus the step heading on advance; on error the alert carries the message
  // and stealing focus would talk over it.
  React.useEffect(() => {
    if (error || !autoFocus) return;
    headingRef.current?.focus();
  }, [index, done, error, autoFocus]);

  async function handleStepSubmit(stepValues: Record<string, TOnboardingValue>) {
    if (!step) return;
    const merged = { ...values, ...stepValues };
    setError(null);
    setStatus("loading");
    try {
      await onStepSubmit?.(step.id, stepValues);
      if (last) await onComplete?.(merged);
      setValues(merged);
      delete draftsRef.current[step.id];
      setDrafts({ ...draftsRef.current });
      setStatus(last ? "success" : "idle");
      if (!last) {
        setFurthestIndex((current) => Math.max(current, index + 1));
        setIndex((current) => current + 1);
      }
    } catch (cause) {
      setStatus("idle");
      setError(
        cause instanceof Error ? cause.message : "Unable to save your profile.",
      );
    }
  }

  if (done && !showCompleteScreen) return null;

  const heading = done ? "You're all set" : (step?.title ?? "Your profile");

  return (
    <AuthCard
      title={heading}
      description={done ? undefined : step?.description}
      logo={logo}
      accent={accent}
      className={className}
    >
      <MorphStep step={done ? "done" : `step-${index}`}>
        {done ? (
          <AuthSuccess
            title="Profile saved"
            description="Your account is ready and your profile has been saved."
          />
        ) : step ? (
          <div className="flex flex-col gap-4">
            <nav aria-label="Onboarding progress">
              <Select
                items={steps.map((item) => ({ value: item.id, label: item.title }))}
                value={step.id}
                disabled={status === "loading"}
                onValueChange={(id) => {
                  const next = steps.findIndex((item) => item.id === id);
                  if (next < 0 || next > furthestIndex) return;
                  setError(null);
                  setDrafts({ ...draftsRef.current });
                  setIndex(next);
                }}
              >
                <SelectTrigger aria-label="Onboarding step"><SelectValue /></SelectTrigger>
                <SelectPopup>
                  {steps.map((item, itemIndex) => (
                    <SelectItem key={item.id} value={item.id} disabled={itemIndex > furthestIndex}>
                      {item.title}
                    </SelectItem>
                  ))}
                </SelectPopup>
              </Select>
            </nav>

            {/* The AuthCard title is the visible heading; this one exists to
                take focus on advance without duplicating it on screen. */}
            <h3 ref={headingRef} tabIndex={-1} className="sr-only">
              {step.title}
            </h3>

            <AuthError message={error} />

            <ProfileStep
              key={step.id}
              step={step}
              values={{ ...values, ...drafts[step.id] }}
              submitting={status === "loading"}
              submitLabel={last ? "Finish" : "Continue"}
              onBack={
                index > 0
                  ? () => {
                      setError(null);
                      setDrafts({ ...draftsRef.current });
                      setIndex((current) => current - 1);
                    }
                  : undefined
              }
              onDraftChange={(name, value) => {
                draftsRef.current[step.id] = {
                  ...draftsRef.current[step.id],
                  [name]: value,
                };
              }}
              onSubmit={handleStepSubmit}
            />
          </div>
        ) : null}
      </MorphStep>
    </AuthCard>
  );
}
