"use client";

import * as React from "react";

import {
  PasswordInput,
  getPasswordStrength,
  passwordRequirements,
} from "@/components/composed/password-input";
import {
  SocialProviders,
  type SocialProvider,
} from "@/components/composed/social-providers";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type AuthAccent, authAccentActionStyles } from "@/lib/auth-accent";
import { cn } from "@/lib/utils";
import {
  AuthCard,
  AuthError,
  AuthSeparator,
  AuthSuccess,
  MorphStep,
  Reveal,
  type AuthStatus,
} from "./auth-shell";

export interface SignupBlockProps {
  title?: string;
  description?: string;
  /**
   * Replaces the built-in "terms" link inside the consent label — pass your
   * own dialog trigger to render it inline instead of wiring `onTerms`.
   */
  termsComponent?: React.ReactNode;
  /** Brand mark rendered above the title. Omit for no logo row at all. */
  logo?: React.ReactNode;
  /** Brand accent for the primary action. Omit to keep the default primary. */
  accent?: AuthAccent;
  providers?: SocialProvider[];
  showNameField?: boolean;
  /** Require the terms checkbox before submitting. */
  showTerms?: boolean;
  /**
   * Controls the terms checkbox. Pass it with `onTermsCheckedChange` when
   * something outside the block has to tick the box — an "I agree" action in
   * your own terms dialog, say. Omit to let the block own the state.
   */
  termsChecked?: boolean;
  /** Starting state of the terms checkbox while it is uncontrolled. */
  defaultTermsChecked?: boolean;
  /** Fires on every change, controlled or not. */
  onTermsCheckedChange?: (checked: boolean) => void;
  /** Block submission until every password requirement is met. */
  enforceStrongPassword?: boolean;
  onSubmit?: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void> | void;
  onProviderSelect?: (provider: SocialProvider) => Promise<void> | void;
  onLogin?: () => void;
  onTerms?: () => void;
}

export function SignupBlock({
  title = "Create your account",
  description = "Start exploring manuscripts in minutes",
  logo,
  accent,
  providers = ["google", "apple", "github"],
  showNameField = true,
  showTerms = true,
  termsChecked,
  defaultTermsChecked = false,
  onTermsCheckedChange,
  enforceStrongPassword = true,
  onSubmit,
  termsComponent,
  onProviderSelect,
  onLogin,
  onTerms,
}: SignupBlockProps) {
  const nameId = React.useId();
  const emailId = React.useId();
  const termsId = React.useId();
  const [status, setStatus] = React.useState<AuthStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] =
    React.useState<SocialProvider | null>(null);
  const [password, setPassword] = React.useState("");
  // Controlled when `termsChecked` is passed, uncontrolled otherwise. The
  // internal state is kept either way, so a block that switches between the
  // two mid-life does not lose the box, and the callback fires in both modes.
  const [uncontrolledTerms, setUncontrolledTerms] =
    React.useState(defaultTermsChecked);
  const terms = termsChecked ?? uncontrolledTerms;

  function handleTermsChange(checked: boolean) {
    if (termsChecked === undefined) setUncontrolledTerms(checked);
    onTermsCheckedChange?.(checked);
  }
  // Tracked from each input's own constraint validation rather than a regex.
  // The values stay uncontrolled — only validity is needed, and the form reads
  // values from FormData on submit.
  const [emailValid, setEmailValid] = React.useState(false);
  const [nameValid, setNameValid] = React.useState(false);

  const busy = status === "loading" || loadingProvider !== null;
  const strongEnough =
    !enforceStrongPassword ||
    getPasswordStrength(password) === passwordRequirements.length;

  // The social providers retire once the email path is filled in and valid —
  // the user has committed to a path, so the alternatives are just noise. It
  // comes back if they invalidate a field again.
  const passwordValid = password.trim().length > 0 && strongEnough;
  const emailPathComplete =
    (!showNameField || nameValid) && emailValid && passwordValid;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!strongEnough) {
      setError("Please meet all password requirements.");
      return;
    }
    if (showTerms && !terms) {
      setError("Please accept the terms to continue.");
      return;
    }
    const form = new FormData(event.currentTarget);
    setStatus("loading");
    try {
      await onSubmit?.({
        name: String(form.get("name") ?? ""),
        email: String(form.get("email") ?? ""),
        password,
      });
      setStatus("success");
    } catch (cause) {
      setStatus("idle");
      setError(
        cause instanceof Error ? cause.message : "Unable to create account.",
      );
    }
  }

  async function handleProvider(provider: SocialProvider) {
    setError(null);
    setLoadingProvider(provider);
    try {
      await onProviderSelect?.(provider);
      setStatus("success");
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to create account.",
      );
    } finally {
      setLoadingProvider(null);
    }
  }

  return (
    <AuthCard
      title={title}
      description={description}
      logo={logo}
      accent={accent}
      footer={
        status !== "success" && (
          <>
            Already have an account?{" "}
            <Button variant="link" onClick={onLogin}>
              Login
            </Button>
          </>
        )
      }
    >
      <MorphStep step={status === "success" ? "success" : "form"}>
        {status === "success" ? (
          <AuthSuccess
            title="Account created"
            description="Check your inbox to confirm your email address."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {providers.length > 0 && (
              // gap-4 on the wrapper reproduces the spacing the two children
              // had as direct flex items of the column above.
              <Reveal show={!emailPathComplete} className="flex flex-col gap-4">
                <SocialProviders
                  providers={providers}
                  action="signup"
                  loadingProvider={loadingProvider}
                  disabled={status === "loading"}
                  onSelect={handleProvider}
                />
                <AuthSeparator label="Or with email" />
              </Reveal>
            )}
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              {showNameField && (
                <Field name="name">
                  <FieldLabel htmlFor={nameId}>Name</FieldLabel>
                  <Input
                    aria-label="Name"
                    id={nameId}
                    name="name"
                    autoComplete="name"
                    placeholder="Your name"
                    required
                    disabled={busy}
                    onChange={(event) =>
                      setNameValid(event.currentTarget.validity.valid)
                    }
                  />
                </Field>
              )}
              <Field name="email">
                <FieldLabel htmlFor={emailId}>Email</FieldLabel>
                <Input
                  id={emailId}
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  disabled={busy}
                  onChange={(event) =>
                    setEmailValid(event.currentTarget.validity.valid)
                  }
                />
              </Field>
              <Reveal show={emailValid}>
                <Field name="password">
                  <FieldLabel>Password</FieldLabel>
                  <PasswordInput
                    name="password"
                    autoComplete="new-password"
                    placeholder="Create a password"
                    showStrength
                    required
                    disabled={busy}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                </Field>
              </Reveal>
              {showTerms && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={termsId}
                    checked={terms}
                    onCheckedChange={(checked) =>
                      handleTermsChange(checked === true)
                    }
                    disabled={busy}
                  />
                  <Label htmlFor={termsId} className="font-normal">
                    I agree to the{" "}
                    {termsComponent ?? (
                      <Button variant="link" type="button" onClick={onTerms}>
                        terms
                      </Button>
                    )}
                  </Label>
                </div>
              )}
              <AuthError message={error} />
              <Button
                className={cn("w-full", accent && authAccentActionStyles)}
                type="submit"
                loading={status === "loading"}
                disabled={busy}
              >
                Create account
              </Button>
            </form>
          </div>
        )}
      </MorphStep>
    </AuthCard>
  );
}
