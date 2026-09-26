"use client";

import { Meter as MeterPrimitive } from "@base-ui/react/meter";
import type React from "react";
import { cn } from "@/lib/utils";

export default function MeterTrack({
  className,
  ...props
}: MeterPrimitive.Track.Props): React.ReactElement {
  return (
    <MeterPrimitive.Track
      className={cn("block h-2 w-full overflow-hidden bg-input", className)}
      data-slot="meter-track"
      {...props}
    />
  );
}
