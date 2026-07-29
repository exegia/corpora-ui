"use client";

import {
  RiAppleFill,
  RiGithubFill,
  RiGoogleFill,
  RiTwitterXFill,
} from "@remixicon/react";
import type * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type SocialProvider = "google" | "apple" | "github" | "x";

const PROVIDERS: Record<
  SocialProvider,
  { label: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  google: { label: "Google", Icon: RiGoogleFill },
  apple: { label: "Apple", Icon: RiAppleFill },
  github: { label: "GitHub", Icon: RiGithubFill },
  x: { label: "X", Icon: RiTwitterXFill },
};

const ACTION_LABELS = {
  login: "Login with",
  signup: "Sign up with",
  continue: "Continue with",
} as const;

export interface SocialProvidersProps {
  providers?: SocialProvider[];
  /** Verb used in the stacked layout labels. */
  action?: keyof typeof ACTION_LABELS;
  /** "stack" = full-width labeled buttons; "row" = icon-only buttons. */
  layout?: "stack" | "row";
  /** Shows the matching button in its loading state and disables the rest. */
  loadingProvider?: SocialProvider | null;
  disabled?: boolean;
  onSelect?: (provider: SocialProvider) => void;
  className?: string;
}

/** Social auth buttons (coss particle p-button-38). UI only — wire onSelect. */
export function SocialProviders({
  providers = ["google", "apple", "github"],
  action = "continue",
  layout = "stack",
  loadingProvider = null,
  disabled = false,
  onSelect,
  className,
}: SocialProvidersProps) {
  const row = layout === "row";

  return (
    <div
      className={cn(
        "flex w-full gap-2",
        row ? "flex-row justify-center" : "flex-col",
        className,
      )}
    >
      {providers.map((provider) => {
        const { label, Icon } = PROVIDERS[provider];
        return (
          <Button
            key={provider}
            variant="outline"
            size={row ? "icon" : "default"}
            className={row ? undefined : "w-full"}
            aria-label={`${ACTION_LABELS[action]} ${label}`}
            loading={loadingProvider === provider}
            disabled={disabled || (loadingProvider !== null && loadingProvider !== provider)}
            onClick={() => onSelect?.(provider)}
          >
            <Icon aria-hidden="true" />
            {!row && (
              <span className="flex-1">
                {ACTION_LABELS[action]} {label}
              </span>
            )}
          </Button>
        );
      })}
    </div>
  );
}
