"use client";

import type React from "react";
import { cn } from "@/lib/utils";

export default function TableHead({
  className,
  ...props
}: React.ComponentProps<"th">): React.ReactElement {
  return (
    <th
      className={cn(
        "h-10 whitespace-nowrap px-2.5 text-left align-middle font-medium text-muted-foreground leading-none has-[[data-slot=checkbox]]:w-px last:has-[[data-slot=checkbox]]:ps-0 first:has-[[data-slot=checkbox]]:pe-0",
        className,
      )}
      data-slot="table-head"
      {...props}
    />
  );
}
