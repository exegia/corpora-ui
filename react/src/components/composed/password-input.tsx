"use client";

import { CheckIcon, EyeIcon, EyeOffIcon, XIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { playCue } from "@/lib/sound";
import { cn } from "@/lib/utils";

// transitions.dev motion scale
const EASE = [0.22, 1, 0.36, 1] as const;

export const passwordRequirements = [
  { regex: /.{8,}/, text: "At least 8 characters" },
  { regex: /[0-9]/, text: "At least 1 number" },
  { regex: /[a-z]/, text: "At least 1 lowercase letter" },
  { regex: /[A-Z]/, text: "At least 1 uppercase letter" },
] as const;

export function getPasswordStrength(password: string): number {
  return passwordRequirements.filter((req) => req.regex.test(password)).length;
}

const STRENGTH_COLORS = [
  "bg-border",
  "bg-red-500",
  "bg-orange-500",
  "bg-amber-500",
  "bg-emerald-500",
] as const;

export interface PasswordInputProps
  extends Omit<React.ComponentProps<typeof InputGroupInput>, "type" | "size"> {
  /** Render the eye toggle button. */
  visibilityToggle?: boolean;
  /** Render the animated strength meter and requirement checklist. */
  showStrength?: boolean;
  /** Play reveal/hide cues on the visibility toggle. Inert until bindSounds(). */
  sound?: boolean;
}

/**
 * Password field with visibility toggle and optional strength meter.
 * Composition of InputGroup + Button (coss particles p-input-9 and
 * p-input-group-26).
 */
export function PasswordInput({
  visibilityToggle = true,
  showStrength = false,
  sound = true,
  className,
  value: valueProp,
  defaultValue,
  onChange,
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);
  const [uncontrolled, setUncontrolled] = React.useState(
    String(defaultValue ?? ""),
  );
  const value = valueProp !== undefined ? String(valueProp) : uncontrolled;
  const score = getPasswordStrength(value);

  return (
    <div className={cn("flex w-full flex-col gap-3", className)}>
      <InputGroup>
        <InputGroupInput
          placeholder="Enter your password"
          {...props}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => {
            setUncontrolled(event.target.value);
            onChange?.(event);
          }}
        />
        {visibilityToggle && (
          <InputGroupAddon align="inline-end">
            <Button
              aria-label={visible ? "Hide password" : "Show password"}
              onClick={() => {
                // Semantic cues from the cuelume palette: bloom = reveal,
                // droplet = dismiss. Press/release stays off to avoid layering.
                if (sound) playCue(visible ? "droplet" : "bloom");
                setVisible((v) => !v);
              }}
              size="icon-xs"
              variant="ghost"
              sound={false}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={visible ? "off" : "on"}
                  className="inline-flex"
                  initial={{ opacity: 0, scale: 0.8, filter: "blur(2px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, scale: 0.8, filter: "blur(2px)" }}
                  transition={{ duration: 0.15, ease: EASE }}
                >
                  {visible ? (
                    <EyeOffIcon aria-hidden="true" />
                  ) : (
                    <EyeIcon aria-hidden="true" />
                  )}
                </motion.span>
              </AnimatePresence>
            </Button>
          </InputGroupAddon>
        )}
      </InputGroup>

      <AnimatePresence initial={false}>
        {showStrength && (
          <motion.div
            className="flex flex-col gap-2 overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: EASE }}
          >
            <div
              aria-label="Password strength"
              aria-valuemax={4}
              aria-valuemin={0}
              aria-valuenow={score}
              className="h-1 w-full overflow-hidden rounded-full bg-border"
              role="progressbar"
            >
              <motion.div
                className={cn("h-full rounded-full", STRENGTH_COLORS[score])}
                animate={{ width: `${(score / 4) * 100}%` }}
                transition={{ duration: 0.4, ease: EASE }}
              />
            </div>
            <ul
              aria-label="Password requirements"
              className="flex flex-col gap-1"
            >
              {passwordRequirements.map((req) => {
                const met = req.regex.test(value);
                return (
                  <li className="flex items-center gap-2 text-xs" key={req.text}>
                    {met ? (
                      <CheckIcon
                        aria-hidden="true"
                        className="size-3.5 text-emerald-500"
                      />
                    ) : (
                      <XIcon
                        aria-hidden="true"
                        className="size-3.5 text-muted-foreground/80"
                      />
                    )}
                    <span
                      className={
                        met ? "text-emerald-600" : "text-muted-foreground"
                      }
                    >
                      {req.text}
                      <span className="sr-only">
                        {met ? " - met" : " - not met"}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
