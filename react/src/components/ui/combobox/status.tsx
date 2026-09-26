"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import * as React from "react";
import { cn } from "@/lib/utils";

export default function ComboboxStatus({
  className,
  ...props
}: ComboboxPrimitive.Status.Props): React.ReactElement {
  return (
    <ComboboxPrimitive.Status
      className={cn(
        "px-3 py-2 font-medium text-muted-foreground text-xs empty:m-0 empty:p-0",
        className,
      )}
      data-slot="combobox-status"
      {...props}
    />
  );
}
