"use client";

import * as React from "react";

import { cn } from "@/lib/utils";
import type { TAuthAccent } from "@/lib/auth-accent";
import {
  AuthCard,
  AuthError,
  AuthSuccess,
  MorphStep,
  type TAuthStatus,
} from "./auth-shell";
import { ProfileStep } from "./onboarding/profile-step";

/** Value a single onboarding field can hold. */
export type TOnboardingValue = string | boolean;

export interface IOnboardingSelectOption {
  value: string;
  label: string;
}

interface IOnboardingFieldBase {
  /** Key the value is collected under; unique within the flow. */
  name: string;
  label: string;
  /** Required fields gate the step's advance. */
  required?: boolean;
  placeholder?: string;
  /** Extra validation; return a message to reject, `null` to accept. */
  validate?: (value: string) => string | null;
}

export interface IOnboardingTextField extends IOnboardingFieldBase {
  kind: "text" | "textarea" | "url";
}

export interface IOnboardingCheckboxField extends IOnboardingFieldBase {
  kind: "checkbox";
}

export interface IOnboardingSelectField extends IOnboardingFieldBase {
  kind: "select";
  options: IOnboardingSelectOption[];
}

/** Discriminated on `kind`. */
export type TOnboardingFieldConfig =
  | IOnboardingTextField
  | IOnboardingCheckboxField
  | IOnboardingSelectField;

export interface IOnboardingStepConfig {
  /** Unique within the flow and stable across releases. */
  id: string;
  title: string;
  description?: string;
  fields: TOnboardingFieldConfig[];
}

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

export interface IOnboardingBlockProps {
  /** Declared profile steps. */
  steps?: IOnboardingStepConfig[];
  /** Brand mark rendered above the title. Omit for no logo row at all. */
  logo?: React.ReactNode;
  /** Brand accent for the primary action. Omit to keep the default primary. */
  accent?: TAuthAccent;
  /**
   * Fires per step as it is submitted. Reject (or throw) to keep the user on
   * the step and show the error.
   */
  onStepSubmit?: (
    stepId: string,
    values: Record<string, TOnboardingValue>,
  ) => Promise<void> | void;
  /** Fires once, after the final step is accepted, with the merged profile. */
  onComplete?: (profile: Record<string, TOnboardingValue>) => Promise<void> | void;
  /** Shows a brief success screen once onboarding completes. */
  showCompleteScreen?: boolean;
  /** Move focus to step headings. Disable when embedding a gallery preview. */
  autoFocus?: boolean;
  className?: string;
}

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
      if (!last) setIndex((current) => current + 1);
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
              <ol className="flex flex-wrap gap-x-3 gap-y-1 text-xs">
                {steps.map((item, itemIndex) => (
                  <li
                    key={item.id}
                    aria-current={itemIndex === index ? "step" : undefined}
                    className={cn(
                      "text-muted-foreground",
                      itemIndex === index && "font-medium text-foreground",
                    )}
                  >
                    {item.title}
                    {itemIndex < index && (
                      <span className="sr-only"> (completed)</span>
                    )}
                  </li>
                ))}
              </ol>
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
