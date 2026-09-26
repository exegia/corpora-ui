"use client";

import { Meter as MeterPrimitive } from "@base-ui/react/meter";
import type React from "react";
import { cn } from "@/lib/utils";

export default function MeterValue({
  className,
  ...props
}: MeterPrimitive.Value.Props): React.ReactElement {
  return (
    <MeterPrimitive.Value
      className={cn("text-foreground text-sm tabular-nums", className)}
      data-slot="meter-value"
      {...props}
    />
  );
}
