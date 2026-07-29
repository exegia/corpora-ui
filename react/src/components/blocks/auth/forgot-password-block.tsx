"use client";

import { ArrowLeftIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type AuthAccent, authAccentActionStyles } from "@/lib/auth-accent";
import { cn } from "@/lib/utils";
import {
  AuthCard,
  AuthError,
  AuthSuccess,
  MorphStep,
  type AuthStatus,
} from "./auth-shell";

export interface ForgotPasswordBlockProps {
  title?: string;
  description?: string;
  /** Brand mark rendered above the title. Omit for no logo row at all. */
  logo?: React.ReactNode;
  /** Brand accent for the primary action. Omit to keep the default primary. */
  accent?: AuthAccent;
  onSubmit?: (data: { email: string }) => Promise<void> | void;
  onBackToLogin?: () => void;
}

export function ForgotPasswordBlock({
  title = "Reset your password",
  logo,
  accent,
  description = "Enter your email and we will send you a reset link",
  onSubmit,
  onBackToLogin,
}: ForgotPasswordBlockProps) {
  const emailId = React.useId();
  const [status, setStatus] = React.useState<AuthStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setStatus("loading");
    try {
      await onSubmit?.({ email });
      setStatus("success");
    } catch (cause) {
      setStatus("idle");
      setError(
        cause instanceof Error ? cause.message : "Unable to send reset link.",
      );
    }
  }

  return (
    <AuthCard
      title={title}
      description={description}
      logo={logo}
      accent={accent}
      footer={
        <Button
          variant="link"
          className="gap-1"
          onClick={onBackToLogin}
        >
          <ArrowLeftIcon className="size-3.5" />
          Back to login
        </Button>
      }
    >
      <MorphStep step={status === "success" ? "success" : "form"}>
        {status === "success" ? (
          <AuthSuccess
            title="Check your inbox"
            description={
              <>
                We sent a password reset link to{" "}
                <span className="font-medium text-foreground">{email}</span>.
              </>
            }
          >
            <Button
              variant="link"
              className="text-xs sm:text-xs"
              onClick={() => setStatus("idle")}
            >
              Use a different email
            </Button>
          </AuthSuccess>
        ) : (
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
                disabled={status === "loading"}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </Field>
            <AuthError message={error} />
            <Button
              className={cn("w-full", accent && authAccentActionStyles)}
              type="submit"
              loading={status === "loading"}
            >
              Send reset link
            </Button>
          </form>
        )}
      </MorphStep>
    </AuthCard>
  );
}
