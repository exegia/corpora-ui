"use client";

import { NumberField as NumberFieldPrimitive } from "@base-ui/react/number-field";
import * as React from "react";
import { cn } from "@/lib/utils";
import { NumberFieldContext } from "./context";

export default function NumberField({
  id,
  className,
  size = "default",
  ...props
}: NumberFieldPrimitive.Root.Props & {
  size?: "sm" | "default" | "lg";
}): React.ReactElement {
  const generatedId = React.useId();
  const fieldId = id ?? generatedId;

  return (
    <NumberFieldContext.Provider value={{ fieldId }}>
      <NumberFieldPrimitive.Root
        className={cn("flex w-full flex-col items-start gap-2", className)}
        data-size={size}
        data-slot="number-field"
        id={fieldId}
        {...props}
      />
    </NumberFieldContext.Provider>
  );
}
