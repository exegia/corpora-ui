"use client";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import type React from "react";
import { cn } from "@/lib/utils";

export default function ProgressIndicator({
  className,
  ...props
}: ProgressPrimitive.Indicator.Props): React.ReactElement {
  return (
    <ProgressPrimitive.Indicator
      className={cn("bg-primary transition-all duration-500", className)}
      data-slot="progress-indicator"
      {...props}
    />
  );
}
