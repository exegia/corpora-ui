"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { XIcon } from "lucide-react";
import * as React from "react";

export default function ComboboxChipRemove(
  props: ComboboxPrimitive.ChipRemove.Props,
): React.ReactElement {
  return (
    <ComboboxPrimitive.ChipRemove
      aria-label="Remove"
      className="h-full shrink-0 cursor-pointer px-1.5 opacity-80 hover:opacity-100 [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-3.5"
      data-slot="combobox-chip-remove"
      {...props}
    >
      <XIcon />
    </ComboboxPrimitive.ChipRemove>
  );
}
