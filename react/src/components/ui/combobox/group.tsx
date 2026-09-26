"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import * as React from "react";
import { cn } from "@/lib/utils";

export default function ComboboxGroup({
  className,
  ...props
}: ComboboxPrimitive.Group.Props): React.ReactElement {
  return (
    <ComboboxPrimitive.Group
      className={cn("[[role=group]+&]:mt-1.5", className)}
      data-slot="combobox-group"
      {...props}
    />
  );
}
