"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import * as React from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ComboboxList({
  className,
  ...props
}: ComboboxPrimitive.List.Props): React.ReactElement {
  return (
    <ScrollArea scrollbarGutter scrollFade>
      <ComboboxPrimitive.List
        className={cn(
          "not-empty:scroll-py-1 not-empty:px-1 not-empty:py-1 in-data-has-overflow-y:pe-3",
          className,
        )}
        data-slot="combobox-list"
        {...props}
      />
    </ScrollArea>
  );
}
