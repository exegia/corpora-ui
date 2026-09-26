"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import * as React from "react";

export default function ComboboxRow({
  className,
  ...props
}: ComboboxPrimitive.Row.Props): React.ReactElement {
  return (
    <ComboboxPrimitive.Row
      className={className}
      data-slot="combobox-row"
      {...props}
    />
  );
}
