"use client"

import {
  RiAppleFill,
  RiGithubFill,
  RiGoogleFill,
  RiTwitterXFill,
} from "@remixicon/react"
import type * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { TSocialProvider } from "./types"


/** Google's four-color "G" — the only provider whose mark isn't monochrome. */
function GoogleColorIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.09-1.92 3.28-4.74 3.28-8.09Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.05-3.72 1.05-2.86 0-5.28-1.93-6.15-4.53H2.18v2.85A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.85 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.35-2.1V7.05H2.18a11 11 0 0 0 0 9.9l3.67-2.85Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.05L5.85 9.9C6.72 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  )
}

/**
 * Label + brand mark per provider, shared with the auth blocks. `Icon` is the
 * monochrome mark that inherits the current text color; `BrandIcon` +
 * `brandClassName` render it in the provider's own colors.
 */
export const SOCIAL_PROVIDERS: Record<
  TSocialProvider,
  {
    label: string
    Icon: React.ComponentType<{ className?: string }>
    BrandIcon: React.ComponentType<{ className?: string }>
    brandClassName?: string
    buttonClassName?: string
    labelClassName?: string
  }
> = {
  google: {
    label: "Google",
    Icon: RiGoogleFill,
    BrandIcon: GoogleColorIcon,
    brandClassName: "fill-black dark:fill-white"
  },
  apple: {
    label: "Apple",
    Icon: RiAppleFill,
    BrandIcon: RiAppleFill,
    brandClassName: "fill-white! dark:fill-black!",
    buttonClassName: "bg-neutral-950 hover:bg-black dark:bg-white dark:hover:bg-neutral-100 shadow-bezel dark:shadow-bubble-dim border-border dark:border-muted",
    labelClassName: "text-white dark:text-black"
  },
  github: {
    label: "GitHub",
    Icon: RiGithubFill,
    BrandIcon: RiGithubFill
  },
  x: {
    label: "X",
    Icon: RiTwitterXFill,
    BrandIcon: RiTwitterXFill
  },
}

const ACTION_LABELS = {
  login: "Login with",
  signup: "Sign up with",
  continue: "Continue with",
} as const

export interface ISocialProvidersProps {
  providers?: TSocialProvider[]
  /** Verb used in the stacked layout labels. */
  action?: keyof typeof ACTION_LABELS
  /** "stack" = full-width labeled buttons; "row" = icon-only buttons. */
  layout?: "stack" | "row"
  /** Shows the matching button in its loading state and disables the rest. */
  loadingProvider?: TSocialProvider | null
  disabled?: boolean
  onSelect?: (provider: TSocialProvider) => void
  className?: string
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
}: ISocialProvidersProps) {
  const row = layout === "row"

  return (
    <div
      className={cn(
        "flex w-full gap-2",
        row ? "flex-row justify-center" : "flex-col",
        className
      )}
    >
      {providers.map((provider) => {
        const {
          label,
          BrandIcon,
          brandClassName,
          buttonClassName,
          labelClassName,
        } = SOCIAL_PROVIDERS[provider]
        return (
          <Button
            key={provider}
            variant="outline"
            size={row ? "icon" : "default"}
            className={cn(buttonClassName, row ? undefined : "w-full")}
            aria-label={`${ACTION_LABELS[action]} ${label}`}
            loading={loadingProvider === provider}
            disabled={
              disabled ||
              (loadingProvider !== null && loadingProvider !== provider)
            }
            onClick={() => onSelect?.(provider)}
          >
            <BrandIcon aria-hidden="true" className={brandClassName} />
            {!row && (
              <span className={cn("flex-1", labelClassName)}>
                {ACTION_LABELS[action]} {label}
              </span>
            )}
          </Button>
        )
      })}
    </div>
  )
}
