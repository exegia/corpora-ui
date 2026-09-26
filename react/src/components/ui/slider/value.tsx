"use client";

import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import * as React from "react";
import { cn } from "@/lib/utils";

export default function SliderValue({
  className,
  ...props
}: SliderPrimitive.Value.Props): React.ReactElement {
  return (
    <SliderPrimitive.Value
      className={cn("flex justify-end text-sm", className)}
      data-slot="slider-value"
      {...props}
    />
  );
}
