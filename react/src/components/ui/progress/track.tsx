"use client";

import { Progress as ProgressPrimitive } from "@base-ui/react/progress";
import type React from "react";
import { cn } from "@/lib/utils";

export default function ProgressTrack({
  className,
  ...props
}: ProgressPrimitive.Track.Props): React.ReactElement {
  return (
    <ProgressPrimitive.Track
      className={cn(
        "block h-1.5 w-full overflow-hidden rounded-full bg-input",
        className,
      )}
      data-slot="progress-track"
      {...props}
    />
  );
}
