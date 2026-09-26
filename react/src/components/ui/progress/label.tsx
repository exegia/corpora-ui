"use client";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import type React from "react";
import { cn } from "@/lib/utils";

export default function ProgressLabel({
  className,
  ...props
}: ProgressPrimitive.Label.Props): React.ReactElement {
  return (
    <ProgressPrimitive.Label
      className={cn("font-medium text-sm", className)}
      data-slot="progress-label"
      {...props}
    />
  );
}
