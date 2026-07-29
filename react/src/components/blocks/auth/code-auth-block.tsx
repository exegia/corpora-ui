"use client";

import { MailIcon, SmartphoneIcon } from "lucide-react";
import { motion } from "motion/react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { OTPField, OTPFieldInput } from "@/components/ui/otp-field";
import { type AuthAccent, authAccentActionStyles } from "@/lib/auth-accent";
import { cn } from "@/lib/utils";
import {
  AuthCard,
  AuthError,
  AuthSuccess,
  EASE,
  MorphStep,
  useCountdown,
  type AuthStatus,
} from "./auth-shell";

export interface CodeAuthBlockProps {
  /** Brand mark rendered above the title. Omit for no logo row at all. */
  logo?: React.ReactNode;
  /** Brand accent for the primary action. Omit to keep the default primary. */
  accent?: AuthAccent;
  /** Where the code was sent; drives copy and icon. */
  channel?: "email" | "sms";
  /** Masked destination shown in the description, e.g. "y•••@example.com". */
  destination?: string;
  length?: number;
  /** Submit automatically once all digits are entered. */
  autoSubmit?: boolean;
  /** Seconds before "Resend code" becomes available. 0 disables the wait. */
  resendSeconds?: number;
  /** Reject (or throw) to show the error shake and clear the code. */
  onVerify?: (code: string) => Promise<void> | void;
  onResend?: () => Promise<void> | void;
  onBack?: () => void;
}

export function CodeAuthBlock({
  channel = "email",
  logo,
  accent,
  destination,
  length = 6,
  autoSubmit = true,
  resendSeconds = 30,
  onVerify,
  onResend,
  onBack,
}: CodeAuthBlockProps) {
  const [status, setStatus] = React.useState<AuthStatus>("idle");
  const [error, setError] = React.useState<string | null>(null);
  const [code, setCode] = React.useState("");
  const [resendCount, setResendCount] = React.useState(0);
  const remaining = useCountdown(resendSeconds, resendCount);

  const ChannelIcon = channel === "sms" ? SmartphoneIcon : MailIcon;
  const channelLabel = channel === "sms" ? "phone" : "email";

  const verify = React.useCallback(
    async (value: string) => {
      setError(null);
      setStatus("loading");
      try {
        await onVerify?.(value);
        setStatus("success");
      } catch (cause) {
        setStatus("idle");
        setCode("");
        setError(cause instanceof Error ? cause.message : "Invalid code.");
      }
    },
    [onVerify],
  );

  function handleChange(value: string) {
    setCode(value);
    if (error) setError(null);
    if (autoSubmit && value.length === length && status === "idle") {
      void verify(value);
    }
  }

  async function handleResend() {
    setResendCount((count) => count + 1);
    setCode("");
    setError(null);
    await onResend?.();
  }

  return (
    <AuthCard
      title="Enter verification code"
      logo={logo}
      accent={accent}
      description={
        <span className="inline-flex items-center gap-1.5">
          <ChannelIcon className="size-3.5 shrink-0" />
          <span>
            We sent a {length}-digit code to your {channelLabel}
            {destination ? (
              <>
                {" "}
                <span className="font-medium text-foreground">
                  {destination}
                </span>
              </>
            ) : null}
            .
          </span>
        </span>
      }
      footer={
        status !== "success" && (
          <Button variant="link" onClick={onBack}>
            Use a different {channelLabel}
          </Button>
        )
      }
    >
      <MorphStep step={status === "success" ? "success" : "form"}>
        {status === "success" ? (
          <AuthSuccess
            title="Verified"
            description="Your identity has been confirmed."
          />
        ) : (
          <div className="flex flex-col items-center gap-4">
            <motion.div
              // Shake the whole field on error; keying by message replays it.
              key={error ?? "steady"}
              animate={error ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
            >
              <OTPField
                length={length}
                value={code}
                onValueChange={handleChange}
                disabled={status === "loading"}
              >
                {Array.from({ length }, (_, index) => (
                  <OTPFieldInput
                    key={`slot-${index}`}
                    aria-invalid={error ? true : undefined}
                    aria-label={`Digit ${index + 1} of ${length}`}
                  />
                ))}
              </OTPField>
            </motion.div>
            <AuthError message={error} />
            {!autoSubmit && (
              <Button
                className={cn("w-full", accent && authAccentActionStyles)}
                loading={status === "loading"}
                disabled={code.length !== length}
                onClick={() => void verify(code)}
              >
                Verify
              </Button>
            )}
            <motion.p
              layout
              transition={{ duration: 0.25, ease: EASE }}
              className="text-center text-sm text-muted-foreground"
            >
              {remaining > 0 ? (
                <>
                  Resend code in{" "}
                  <span className="font-medium tabular-nums text-foreground">
                    {remaining}s
                  </span>
                </>
              ) : (
                <Button
                  variant="link"
                  disabled={status === "loading"}
                  onClick={() => void handleResend()}
                >
                  Resend code
                </Button>
              )}
            </motion.p>
          </div>
        )}
      </MorphStep>
    </AuthCard>
  );
}
