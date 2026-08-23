"use client";

import * as React from "react";

import {
  getPasswordStrength,
  PasswordInput,
} from "@/components/composed/password-input";
import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { type AuthAccent, authAccentActionStyles } from "@/lib/auth-accent";
import { cn } from "@/lib/utils";
import {
  AuthCard,
  AuthError,
  AuthSuccess,
  MorphStep,
  Reveal,
  type AuthStatus,
} from "./auth-shell";

export interface UpdatePasswordBlockProps {
  title?: string;
  description?: string;
  /** Brand mark rendered above the title. Omit for no logo row at all. */
  logo?: React.ReactNode;
  /** Brand accent for the primary action. Omit to keep the default primary. */
  accent?: AuthAccent;
  /**
   * Minimum strength (0-4, as scored by `getPasswordStrength`) the new
   * password must reach before the confirm field is revealed. 0 disables the
   * gate.
   */
  minStrength?: number;
  /** Reject (or throw) to show the error state with the error's message. */
  onSubmit?: (data: { password: string }) => Promise<void> | void;
  onDone?: () => void;
}

/**
 * Password change form for an already-authenticated user: a strength-metered
 * new password gates the confirm field, which in turn gates the submit
 * button. Mismatch is caught client-side; everything else comes back as a
 * rejection from `onSubmit`.
 */
export function UpdatePasswordBlock({
  title = "Update your password",
  description = "Choose a new password for your account",
  logo,
  accent,
  minStrength = 4,
  onSubmit,
  onDone,
}: UpdatePasswordBlockProps) {
  const passwordId = React.useId();
  const confirmId = React.useId();
  const [status, setStatus] = React.useState<AuthStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  // Progressive disclosure, matching the signup block: the confirm field
  // appears once the new password clears the policy, the submit button once
  // the two match.
  const strongEnough = getPasswordStrength(password) >= minStrength;
  const matches = confirmPassword.length > 0 && confirmPassword === password;
  const canSubmit = strongEnough && matches;

  // Only flag a mismatch once the confirmation has diverged — while it is
  // still a prefix of the new password the user is simply mid-keystroke, and
  // nagging on every character would shake the field the whole way through.
  const mismatch =
    confirmPassword.length > 0 && !password.startsWith(confirmPassword);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Enter in any field submits the form even while the button is hidden.
    if (!canSubmit) return;
    setError(null);
    setStatus("loading");
    try {
      await onSubmit?.({ password });
      setStatus("success");
    } catch (cause) {
      setStatus("idle");
      setError(
        cause instanceof Error ? cause.message : "Unable to update password.",
      );
    }
  }

  return (
    <AuthCard
      title={title}
      description={description}
      logo={logo}
      accent={accent}
    >
      <MorphStep step={status === "success" ? "success" : "form"}>
        {status === "success" ? (
          <AuthSuccess
            title="Password updated"
            description="Your password has been changed successfully."
          >
            {onDone && (
              <Button variant="link" onClick={onDone}>
                Continue
              </Button>
            )}
          </AuthSuccess>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <Field name="password">
              <FieldLabel htmlFor={passwordId}>New password</FieldLabel>
              <PasswordInput
                id={passwordId}
                name="password"
                autoComplete="new-password"
                required
                showStrength
                disabled={status === "loading"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </Field>
            <Reveal show={strongEnough}>
              <Field name="confirmPassword">
                <FieldLabel htmlFor={confirmId}>Confirm new password</FieldLabel>
                <PasswordInput
                  id={confirmId}
                  name="confirmPassword"
                  autoComplete="new-password"
                  required
                  disabled={status === "loading"}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                />
              </Field>
            </Reveal>
            <AuthError
              message={error ?? (mismatch ? "Passwords do not match." : null)}
            />
            <Reveal show={canSubmit}>
              <Button
                className={cn("w-full", accent && authAccentActionStyles)}
                type="submit"
                loading={status === "loading"}
              >
                Update password
              </Button>
            </Reveal>
          </form>
        )}
      </MorphStep>
    </AuthCard>
  );
}
