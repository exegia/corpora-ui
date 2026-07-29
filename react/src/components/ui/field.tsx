"use client";

import { Field as FieldPrimitive } from "@base-ui/react/field";
import type React from "react";
import { cn } from "@/lib/utils";

export function Field({
  className,
  ...props
}: FieldPrimitive.Root.Props): React.ReactElement {
  return (
    <FieldPrimitive.Root
      className={cn("flex flex-col items-start gap-2", className)}
      data-slot="field"
      {...props}
    />
  );
}

export function FieldLabel({
  className,
  ...props
}: FieldPrimitive.Label.Props): React.ReactElement {
  return (
    <FieldPrimitive.Label
      className={cn(
        "inline-flex items-center gap-2 font-medium text-base/4.5 text-foreground data-disabled:opacity-64 sm:text-sm/4",
        className,
      )}
      data-slot="field-label"
      {...props}
    />
  );
}

export function FieldItem({
  className,
  ...props
}: FieldPrimitive.Item.Props): React.ReactElement {
  return (
    <FieldPrimitive.Item
      className={cn("flex", className)}
      data-slot="field-item"
      {...props}
    />
  );
}

export function FieldDescription({
  className,
  ...props
}: FieldPrimitive.Description.Props): React.ReactElement {
  return (
    <FieldPrimitive.Description
      // Entrance morph when conditionally shown: height tweens from 0 via
      // interpolate-size (set on :root) plus a fade/blur rise. Removal is
      // unmount-instant; wrap in AnimatePresence when an exit is needed.
      className={cn(
        "overflow-hidden text-muted-foreground text-xs transition-[height,opacity,filter,translate] duration-300 ease-smooth-out starting:h-0 starting:translate-y-1 starting:opacity-0 starting:blur-[2px] motion-reduce:transition-none",
        className,
      )}
      data-slot="field-description"
      {...props}
    />
  );
}

export function FieldError({
  className,
  ...props
}: FieldPrimitive.Error.Props): React.ReactElement {
  return (
    <FieldPrimitive.Error
      className={cn(
        "overflow-hidden text-destructive-foreground text-xs transition-[height,opacity,filter,translate] duration-300 ease-smooth-out starting:h-0 starting:translate-y-1 starting:opacity-0 starting:blur-[2px] motion-reduce:transition-none",
        className,
      )}
      data-slot="field-error"
      {...props}
    />
  );
}

export const FieldControl: typeof FieldPrimitive.Control =
  FieldPrimitive.Control;
export const FieldValidity: typeof FieldPrimitive.Validity =
  FieldPrimitive.Validity;

export { FieldPrimitive };
