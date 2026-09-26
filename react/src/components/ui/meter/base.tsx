"use client";

import { Meter as MeterPrimitive } from "@base-ui/react/meter";
import type React from "react";
import { cn } from "@/lib/utils";
import MeterTrack from "./track";
import MeterIndicator from "./indicator";

export default function Meter({
  className,
  children,
  ...props
}: MeterPrimitive.Root.Props): React.ReactElement {
  return (
    <MeterPrimitive.Root
      className={cn("flex w-full flex-col gap-2", className)}
      {...props}
    >
      {children ? (
        children
      ) : (
        <MeterTrack>
          <MeterIndicator />
        </MeterTrack>
      )}
    </MeterPrimitive.Root>
  );
}
