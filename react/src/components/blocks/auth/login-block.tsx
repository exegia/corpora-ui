"use client";

import * as React from "react";

import { PasswordInput } from "@/components/composed/password-input";
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

  const busy = status === "loading" || loadingProvider !== null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
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
            <Button variant="link" className="h-auto p-0" onClick={onSignup}>
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
                />
              </Field>
              <Field name="password">
                <div className="flex items-center justify-between">
                  <FieldLabel>Password</FieldLabel>
                  {showForgotPassword && (
                    <Button
                      variant="link"
                      type="button"
                      className="h-auto p-0 text-xs"
                      onClick={onForgotPassword}
                    >
                      Forgot password?
                    </Button>
                  )}
                </div>
                <PasswordInput
                  name="password"
                  autoComplete="current-password"
                  required
                  disabled={busy}
                />
              </Field>
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
              <Button
                className="w-full"
                type="submit"
                loading={status === "loading"}
                disabled={busy}
              >
                Login
              </Button>
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
