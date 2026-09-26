"use client";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import type React from "react";
import { cn } from "@/lib/utils";

export default function ProgressValue({
  className,
  ...props
}: ProgressPrimitive.Value.Props): React.ReactElement {
  return (
    <ProgressPrimitive.Value
      className={cn("text-sm tabular-nums", className)}
      data-slot="progress-value"
      {...props}
    />
  );
}
