"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { LiquidGlass } from "@/components/ui/glasscn/liquid-glass";
import {
  type FrostGlassVariant,
  glassVariantStyles,
  liquidRefractStyles,
} from "@/lib/glass-variants";

export const buttonVariants = cva(
  "relative inline-flex shrink-0 cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg border font-medium text-base outline-none transition-[scale,box-shadow,width,height,background-color,border-color] [transition-duration:150ms,150ms,300ms,300ms,150ms,150ms] ease-smooth-out active:scale-97 data-pressed:scale-97 motion-reduce:transition-none motion-reduce:active:scale-100 motion-reduce:data-pressed:scale-100 [&_svg]:transition-transform [&_svg]:duration-150 [&_svg]:ease-smooth-out motion-reduce:[&_svg]:transition-none before:pointer-events-none before:absolute before:inset-0 before:rounded-[calc(var(--radius-lg)-1px)] pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-64 data-loading:select-none sm:text-sm [&_svg:not([class*='opacity-'])]:opacity-80 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:-mx-0.5 [&_svg]:shrink-0",
  {
    compoundVariants: [
      {
        // `link` is inline text, not a control surface: drop the button box so
        // it sits with the surrounding copy instead of riding high in a 32/36px
        // flex box. Both the bare and `sm:` heights have to be reset —
        // tailwind-merge keeps modifier-prefixed classes in a separate group,
        // so a call-site `h-auto` alone still loses to `sm:h-8`. border-0 makes
        // the inline box exactly one line-height so it doesn't grow the line.
        //
        // align-middle is the alignment that holds: an inline-flex box exposes
        // the baseline of its *first* flex item, which here is the always-
        // mounted loading indicator rather than the label, so plain baseline
        // alignment leaves the text ~3px high. `items-baseline` fixes that but
        // then hangs icons 3px above the label. Centering the box lands within
        // ~1px in every state without touching the loading-morph machinery.
        //
        // Icon sizes are excluded; they keep their square hit area.
        class: "h-auto border-0 px-0 align-middle sm:h-auto",
        size: ["xs", "sm", "default", "lg", "xl"],
        variant: "link",
      },
    ],
    defaultVariants: {
      size: "default",
      variant: "default",
    },
    variants: {
      size: {
        default: "h-9 px-[calc(--spacing(3)-1px)] sm:h-8",
        icon: "size-9 sm:size-8",
        "icon-lg": "size-8 sm:size-8",
        "icon-sm": "size-7 sm:size-6",
        "icon-xl":
          "size-10 sm:size-9 [&_svg:not([class*='size-'])]:size-5 sm:[&_svg:not([class*='size-'])]:size-4.5",
        "icon-xs":
          "size-7 rounded-md before:rounded-[calc(var(--radius-md)-1px)] sm:size-6 not-in-data-[slot=input-group]:[&_svg:not([class*='size-'])]:size-4 sm:not-in-data-[slot=input-group]:[&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-10 px-[calc(--spacing(3.5)-1px)] sm:h-9",
        sm: "h-8 gap-1.5 px-[calc(--spacing(2.5)-1px)] sm:h-7",
        xl: "h-11 px-[calc(--spacing(4)-1px)] text-lg sm:h-10 sm:text-base [&_svg:not([class*='size-'])]:size-5 sm:[&_svg:not([class*='size-'])]:size-4.5",
        xs: "h-7 gap-1 rounded-md px-[calc(--spacing(2)-1px)] text-sm before:rounded-[calc(var(--radius-md)-1px)] sm:h-6 sm:text-xs [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-3.5",
      },
      variant: {
        default:
          "not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)] border-primary bg-primary text-primary-foreground shadow-primary/24 shadow-xs hover:bg-primary/90 data-pressed:bg-primary/90 *:data-[slot=button-loading-indicator]:text-primary-foreground [:active,[data-pressed]]:inset-shadow-[0_1px_--theme(--color-black/8%)] [:disabled,:active,[data-pressed]]:shadow-none",
        destructive:
          "not-disabled:inset-shadow-[0_1px_--theme(--color-white/16%)] border-destructive bg-destructive text-white shadow-destructive/24 shadow-xs hover:bg-destructive/90 data-pressed:bg-destructive/90 *:data-[slot=button-loading-indicator]:text-white [:active,[data-pressed]]:inset-shadow-[0_1px_--theme(--color-black/8%)] [:disabled,:active,[data-pressed]]:shadow-none",
        "destructive-outline":
          "border-input bg-popover not-dark:bg-clip-padding text-destructive-foreground shadow-xs/5 not-disabled:not-active:not-data-pressed:before:shadow-[0_1px_--theme(--color-black/4%)] hover:border-destructive/32 hover:bg-destructive/4 data-pressed:border-destructive/32 data-pressed:bg-destructive/4 *:data-[slot=button-loading-indicator]:text-foreground dark:bg-input/32 dark:not-disabled:before:shadow-[0_-1px_--theme(--color-white/2%)] dark:not-disabled:not-active:not-data-pressed:before:shadow-[0_-1px_--theme(--color-white/6%)] [:disabled,:active,[data-pressed]]:shadow-none",
        ghost:
          "border-transparent text-foreground hover:bg-accent data-pressed:bg-accent *:data-[slot=button-loading-indicator]:text-foreground",
        // Base for the glass treatment. The finish itself (blur, tint, bevel)
        // comes from glassVariantStyles keyed by the `glassVariant` prop,
        // which is only accepted when variant is "glass".
        glass:
          "border-transparent text-foreground *:data-[slot=button-loading-indicator]:text-foreground",
        link: "border-transparent text-foreground underline-offset-4 hover:underline data-pressed:underline *:data-[slot=button-loading-indicator]:text-foreground",
        outline:
          "border-input bg-popover not-dark:bg-clip-padding text-foreground shadow-xs/5 not-disabled:not-active:not-data-pressed:before:shadow-[0_1px_--theme(--color-black/4%)] hover:bg-accent/50 data-pressed:bg-accent/50 *:data-[slot=button-loading-indicator]:text-foreground dark:bg-input/32 dark:data-pressed:bg-input/64 dark:hover:bg-input/64 dark:not-disabled:before:shadow-[0_-1px_--theme(--color-white/2%)] dark:not-disabled:not-active:not-data-pressed:before:shadow-[0_-1px_--theme(--color-white/6%)] [:disabled,:active,[data-pressed]]:shadow-none",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/90 data-pressed:bg-secondary/90 *:data-[slot=button-loading-indicator]:text-secondary-foreground [:active,[data-pressed]]:bg-secondary/80",
      },
    },
  },
);

type ButtonVariant = VariantProps<typeof buttonVariants>["variant"];

interface ButtonBaseProps extends useRender.ComponentProps<"button"> {
  size?: VariantProps<typeof buttonVariants>["size"];
  loading?: boolean;
  /**
   * Emit cuelume press/release attributes. Inert unless the app opts into
   * interaction sound by calling `bindSounds()` once.
   */
  sound?: boolean;
}

export type ButtonProps = ButtonBaseProps &
  (
    | {
        variant: "glass";
        /** Glass finish. Only available when `variant` is "glass". */
        glassVariant?: FrostGlassVariant;
      }
    | {
        variant?: Exclude<ButtonVariant, "glass">;
        glassVariant?: never;
      }
  );

export function Button({
  className,
  variant,
  size,
  render,
  children,
  loading = false,
  disabled: disabledProp,
  glassVariant,
  sound = true,
  ...props
}: ButtonProps): React.ReactElement {
  const isDisabled: boolean = Boolean(loading || disabledProp);
  const typeValue: React.ButtonHTMLAttributes<HTMLButtonElement>["type"] =
    render ? undefined : "button";

  const resolvedGlassVariant: FrostGlassVariant | undefined =
    variant === "glass" ? (glassVariant ?? "liquid-refract") : undefined;
  const isLiquidRefract = resolvedGlassVariant === "liquid-refract";

  // Icon-only sizes overlay the spinner on top of the (hidden) icon; text
  // sizes keep the label visible and show the spinner inline before it.
  const isIconSize = (size ?? "default").startsWith("icon");

  const defaultProps = {
    children: (
      <>
        {!isIconSize && (
          // Always mounted so the button width morphs as the slot collapses
          // and expands; the closed state cancels the flex gap (which varies
          // per size) with a matching negative margin.
          <span
            aria-hidden={loading ? undefined : true}
            data-slot="button-loading-indicator"
            className={cn(
              "pointer-events-none inline-flex shrink-0 items-center overflow-hidden transition-[max-width,margin-inline-start,opacity,filter] duration-300 ease-smooth-out motion-reduce:transition-none",
              loading
                ? "max-w-6"
                : cn(
                    "max-w-0 opacity-0 blur-[2px]",
                    size === "xs" ? "-ms-1" : size === "sm" ? "-ms-1.5" : "-ms-2",
                  ),
            )}
          >
            <Spinner className={loading ? undefined : "animate-none"} />
          </span>
        )}
        {children}
        {loading && isIconSize && (
          <Spinner
            className="pointer-events-none absolute"
            data-slot="button-loading-indicator"
          />
        )}
      </>
    ),
    className: cn(
      buttonVariants({ size, variant }),
      // Label + icon buttons: icons do a gentle scale bump on hover. The
      // class-based :not() skips the spinner (animate-spin / animate-none).
      !isIconSize &&
        "hover:[&_svg:not([class*='animate-'])]:scale-110 motion-reduce:hover:[&_svg]:scale-100",
      loading && isIconSize && "data-loading:text-transparent",
      resolvedGlassVariant && glassVariantStyles[resolvedGlassVariant],
      isLiquidRefract && liquidRefractStyles,
      className,
    ),
    "aria-disabled": loading || undefined,
    "data-cuelume-press": sound ? "" : undefined,
    "data-cuelume-release": sound ? "" : undefined,
    "data-loading": loading ? "" : undefined,
    "data-glass-variant": resolvedGlassVariant,
    "data-slot": "button",
    disabled: isDisabled,
    type: typeValue,
  };

  const element = useRender({
    defaultTagName: "button",
    props: mergeProps<"button">(defaultProps, props),
    render,
  });

  // liquid-refract delegates the finish to the LiquidGlass wrapper, which
  // renders the SVG-displacement backdrop behind an unstyled button.
  if (isLiquidRefract) {
    return <LiquidGlass>{element}</LiquidGlass>;
  }

  return element;
}
