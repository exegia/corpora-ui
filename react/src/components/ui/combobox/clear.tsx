"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import * as React from "react";

export default function ComboboxClear({
  className,
  ...props
}: ComboboxPrimitive.Clear.Props): React.ReactElement {
  return (
    <ComboboxPrimitive.Clear
      className={className}
      data-slot="combobox-clear"
      {...props}
    />
  );
}
