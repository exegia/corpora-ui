"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import * as React from "react";
import { cn } from "@/lib/utils";

export default function ComboboxSeparator({
  className,
  ...props
}: ComboboxPrimitive.Separator.Props): React.ReactElement {
  return (
    <ComboboxPrimitive.Separator
      className={cn("mx-2 my-1 h-px bg-border last:hidden", className)}
      data-slot="combobox-separator"
      {...props}
    />
  );
}
