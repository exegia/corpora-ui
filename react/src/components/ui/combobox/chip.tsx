"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import * as React from "react";
import ComboboxChipRemove from "./chip-remove";

export default function ComboboxChip({
  children,
  removeProps,
  ...props
}: ComboboxPrimitive.Chip.Props & {
  removeProps?: ComboboxPrimitive.ChipRemove.Props;
}): React.ReactElement {
  return (
    <ComboboxPrimitive.Chip
      className="flex items-center rounded-[calc(var(--radius-md)-1px)] bg-accent ps-2 font-medium text-accent-foreground text-sm outline-none sm:text-xs/(--text-xs--line-height) [&_svg:not([class*='size-'])]:size-4 sm:[&_svg:not([class*='size-'])]:size-3.5"
      data-slot="combobox-chip"
      {...props}
    >
      {children}
      <ComboboxChipRemove {...removeProps} />
    </ComboboxPrimitive.Chip>
  );
}
