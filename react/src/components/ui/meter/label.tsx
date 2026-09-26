"use client";

import { Meter as MeterPrimitive } from "@base-ui/react/meter";
import type React from "react";
import { cn } from "@/lib/utils";

export default function MeterLabel({
  className,
  ...props
}: MeterPrimitive.Label.Props): React.ReactElement {
  return (
    <MeterPrimitive.Label
      className={cn("font-medium text-foreground text-sm", className)}
      data-slot="meter-label"
      {...props}
    />
  );
}
