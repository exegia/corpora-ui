"use client";

import { FingerprintIcon } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AuthError, Reveal } from "./auth-shell";

export interface PasskeySignInBlockProps {
  /**
   * Whether this device can use passkeys. `false` renders nothing at all —
   * a passkey button that is guaranteed to fail is worse than no button.
   */
  available?: boolean;
  /** Button label. */
  label?: string;
  /**
   * Reject (or throw) to show the inline error. Resolving with
   * `{ cancelled: true }` returns silently to idle — a dismissed OS prompt is
   * not a failure and must not surface an error.
   */
  onSignIn?: () => Promise<{ cancelled?: boolean } | void> | void;
  /** Hint shown under an error, pointing at the remaining sign-in methods. */
  fallbackHint?: React.ReactNode;
  className?: string;
}

/**
 * Passkey sign-in entry point — a single button plus its error state, sized
 * to drop into a login card next to the password form rather than to stand on
 * its own. Renders `null` while passkeys are unavailable.
 */
export function PasskeySignInBlock({
  available = true,
  label = "Sign in with a passkey",
  onSignIn,
  fallbackHint = "You can still sign in with your other methods below.",
  className,
}: PasskeySignInBlockProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  if (!available) return null;

  async function handleClick() {
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      await onSignIn?.();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to sign in with a passkey.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={cn("flex w-full flex-col gap-2", className)}>
      <Button
        variant="outline"
        className="w-full"
        type="button"
        loading={loading}
        onClick={() => void handleClick()}
      >
        <FingerprintIcon aria-hidden="true" />
        <span className="flex-1">{label}</span>
      </Button>
      <AuthError message={error} />
      <Reveal show={Boolean(error) && Boolean(fallbackHint)}>
        <p className="text-xs text-muted-foreground">{fallbackHint}</p>
      </Reveal>
    </div>
  );
}
