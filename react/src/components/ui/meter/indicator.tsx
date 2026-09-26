"use client";

import { Meter as MeterPrimitive } from "@base-ui/react/meter";
import type React from "react";
import { cn } from "@/lib/utils";

export default function MeterIndicator({
  className,
  ...props
}: MeterPrimitive.Indicator.Props): React.ReactElement {
  return (
    <MeterPrimitive.Indicator
      className={cn("bg-primary transition-all duration-500", className)}
      data-slot="meter-indicator"
      {...props}
    />
  );
}
