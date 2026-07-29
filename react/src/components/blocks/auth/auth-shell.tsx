"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import * as React from "react";

import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Frame, FrameFooter } from "@/components/ui/frame";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

/** transitions.dev motion scale, shared by all auth blocks. */
export const EASE = [0.22, 1, 0.36, 1] as const;

export type AuthStatus = "idle" | "loading" | "success" | "error";

/**
 * Frame shell shared by the auth blocks (coss particle p-card-8): a raised
 * Card inside a muted Frame, with the footer in the frame strip below the
 * card. Wraps content in a MotionConfig that honors prefers-reduced-motion
 * and layout-animates height changes so step swaps morph instead of jumping.
 */
export function AuthCard({
  title,
  description,
  children,
  footer,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  return (
    <MotionConfig reducedMotion="user">
      <Frame className={cn("w-full max-w-sm", className)}>
        <motion.div
          layout
          transition={{ duration: 0.3, ease: EASE }}
          className="flex flex-col"
        >
          <Card>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
              {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            <CardPanel className="overflow-hidden">{children}</CardPanel>
          </Card>
          {footer && (
            <FrameFooter className="text-center text-sm text-muted-foreground">
              {footer}
            </FrameFooter>
          )}
        </motion.div>
      </Frame>
    </MotionConfig>
  );
}

/** Cross-morphs between steps (form → success, …) keyed by `step`. */
export function MorphStep({
  step,
  children,
  className,
}: {
  step: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.div
        key={step}
        className={className}
        initial={{ opacity: 0, y: 8, filter: "blur(2px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -8, filter: "blur(2px)" }}
        transition={{ duration: 0.25, ease: EASE }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/** Inline error message that shakes each time `message` changes. */
export function AuthError({ message }: { message: string | null }) {
  return (
    <AnimatePresence initial={false}>
      {message && (
        <motion.p
          key={message}
          role="alert"
          className="text-sm text-destructive-foreground"
          initial={{ opacity: 0, height: 0 }}
          animate={{
            opacity: 1,
            height: "auto",
            x: [0, -6, 6, -4, 4, 0],
          }}
          exit={{ opacity: 0, height: 0 }}
          transition={{
            duration: 0.25,
            ease: EASE,
            x: { duration: 0.4, ease: "easeInOut" },
          }}
        >
          {message}
        </motion.p>
      )}
    </AnimatePresence>
  );
}

/** Success panel with a stroke-drawn check. */
export function AuthSuccess({
  title,
  description,
  children,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <motion.span
        className="flex size-12 items-center justify-center rounded-full bg-emerald-500/12 text-emerald-600"
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: EASE }}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-6"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <motion.path
            d="M4 12.5l5 5L20 6.5"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.4, delay: 0.15, ease: EASE }}
          />
        </svg>
      </motion.span>
      <div className="flex flex-col gap-1">
        <p className="font-medium">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
}

/** "Or continue with" style divider. */
export function AuthSeparator({ label = "Or" }: { label?: string }) {
  return (
    <div className="flex items-center gap-3">
      <Separator className="flex-1" />
      <span className="text-xs text-muted-foreground uppercase">{label}</span>
      <Separator className="flex-1" />
    </div>
  );
}

/** Countdown for resend links; restarts when `restartKey` changes. */
export function useCountdown(seconds: number, restartKey: number) {
  const [state, setState] = React.useState({ restartKey, seconds, remaining: seconds });

  // Reset during render (not in an effect) when the inputs change.
  if (state.restartKey !== restartKey || state.seconds !== seconds) {
    setState({ restartKey, seconds, remaining: seconds });
  }

  React.useEffect(() => {
    if (seconds <= 0) return;
    const interval = window.setInterval(() => {
      setState((current) =>
        current.remaining <= 0
          ? current
          : { ...current, remaining: current.remaining - 1 },
      );
    }, 1000);
    return () => window.clearInterval(interval);
  }, [seconds, restartKey]);

  return state.remaining;
}
