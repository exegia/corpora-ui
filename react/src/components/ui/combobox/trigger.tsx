"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import * as React from "react";

export default function ComboboxTrigger({
  className,
  children,
  ...props
}: ComboboxPrimitive.Trigger.Props): React.ReactElement {
  return (
    <ComboboxPrimitive.Trigger
      className={className}
      data-slot="combobox-trigger"
      {...props}
    >
      {children}
    </ComboboxPrimitive.Trigger>
  );
}
