"use client";

import type { FrostGlassVariantProp } from "@/lib/glass-variants";

import { Button, type ButtonProps } from "../button";

type GlassButtonProps = Omit<ButtonProps, "variant" | "glassVariant"> &
  FrostGlassVariantProp;

/** @deprecated Use `<Button variant="glass" glassVariant="…">` instead. */
function GlassButton({
  glassVariant = "liquid-refract",
  ...props
}: GlassButtonProps) {
  return (
    <Button
      data-slot="glass-button"
      variant="glass"
      glassVariant={glassVariant}
      {...props}
    />
  );
}

export { GlassButton };
