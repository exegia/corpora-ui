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
import {
  AuthCard,
  AuthError,
  AuthSeparator,
  AuthSuccess,
  MorphStep,
  Reveal,
  type AuthStatus,
} from "./auth-shell";

export interface LoginBlockProps {
  title?: string;
  description?: string;
  /** Social providers to offer; empty array hides the social section. */
  providers?: SocialProvider[];
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
  /** Reject (or throw) to show the error state with the error's message. */
  onSubmit?: (data: {
    email: string;
    password: string;
    remember: boolean;
  }) => Promise<void> | void;
  onProviderSelect?: (provider: SocialProvider) => Promise<void> | void;
  onForgotPassword?: () => void;
  onSignup?: () => void;
}

export function LoginBlock({
  title = "Login to your account",
  description = "Enter your email and password to login",
  providers = ["google", "apple", "github"],
  showRememberMe = true,
  showForgotPassword = true,
  onSubmit,
  onProviderSelect,
  onForgotPassword,
  onSignup,
}: LoginBlockProps) {
  const emailId = React.useId();
  const rememberId = React.useId();
  const [status, setStatus] = React.useState<AuthStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] =
    React.useState<SocialProvider | null>(null);
  const [remember, setRemember] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [emailValid, setEmailValid] = React.useState(false);
  const [password, setPassword] = React.useState("");

  const busy = status === "loading" || loadingProvider !== null;

  // Progressive disclosure: each step unlocks the next. The password field is
  // gated on the email input's own constraint validation (required + type
  // email), the submit button on the shared password requirements. The submit
  // gate re-checks emailValid so a stale password (typed, then the email was
  // edited back into an invalid state) can't leave the button on its own.
  const passwordValid =
    getPasswordStrength(password) === passwordRequirements.length;
  const canSubmit = emailValid && passwordValid;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // Enter in any field submits the form even while the button is hidden.
    if (!canSubmit) return;
    const form = new FormData(event.currentTarget);
    setError(null);
    setStatus("loading");
    try {
      await onSubmit?.({
        email: String(form.get("email") ?? ""),
        password: String(form.get("password") ?? ""),
        remember,
      });
      setStatus("success");
    } catch (cause) {
      setStatus("idle");
      setError(cause instanceof Error ? cause.message : "Unable to login.");
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
        cause instanceof Error ? cause.message : "Unable to login.",
      );
    } finally {
      setLoadingProvider(null);
    }
  }

  return (
    <AuthCard
      title={title}
      description={description}
      footer={
        status !== "success" && (
          <>
            Don&apos;t have an account?{" "}
            <Button variant="link" onClick={onSignup}>
              Sign up
            </Button>
          </>
        )
      }
    >
      <MorphStep step={status === "success" ? "success" : "form"}>
        {status === "success" ? (
          <AuthSuccess
            title="Welcome back"
            description="You are now logged in."
          />
        ) : (
          <div className="flex flex-col gap-4">
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
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
                  value={email}
                  onChange={(event) => {
                    setEmail(event.currentTarget.value);
                    setEmailValid(event.currentTarget.validity.valid);
                  }}
                />
              </Field>
              <Reveal show={emailValid}>
                <Field name="password">
                  <FieldLabel>Password</FieldLabel>
                  <PasswordInput
                    name="password"
                    autoComplete="current-password"
                    required
                    disabled={busy}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                  />
                  {showForgotPassword && (
                    // self-end: Field root is items-start, so this aligns the
                    // link with the input's trailing edge. sm:text-xs is
                    // required — the cva's sm:text-sm survives tailwind-merge
                    // and would otherwise win at the breakpoint.
                    <Button
                      variant="link"
                      type="button"
                      className="self-end font-normal text-muted-foreground text-xs hover:text-foreground sm:text-xs"
                      onClick={onForgotPassword}
                    >
                      Forgot password?
                    </Button>
                  )}
                </Field>
              </Reveal>
              {showRememberMe && (
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={rememberId}
                    checked={remember}
                    onCheckedChange={(checked) => setRemember(checked === true)}
                    disabled={busy}
                  />
                  <Label htmlFor={rememberId} className="font-normal">
                    Remember me
                  </Label>
                </div>
              )}
              <AuthError message={error} />
              <Reveal show={canSubmit}>
                <Button
                  className="w-full"
                  type="submit"
                  loading={status === "loading"}
                  disabled={busy}
                >
                  Login
                </Button>
              </Reveal>
            </form>
            {providers.length > 0 && (
              <>
                <AuthSeparator label="Or continue with" />
                <SocialProviders
                  providers={providers}
                  action="login"
                  loadingProvider={loadingProvider}
                  disabled={status === "loading"}
                  onSelect={handleProvider}
                />
              </>
            )}
          </div>
        )}
      </MorphStep>
    </AuthCard>
  );
}
