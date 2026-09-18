"use client";

import type { TFrostGlassVariantProp } from "@/lib/glass-variants";

import { Button, type TButtonProps } from "../button";

type TGlassButtonProps = Omit<TButtonProps, "variant" | "glassVariant"> &
  TFrostGlassVariantProp;

/** @deprecated Use `<Button variant="glass" glassVariant="…">` instead. */
function GlassButton({
  glassVariant = "liquid-refract",
  ...props
}: TGlassButtonProps) {
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
