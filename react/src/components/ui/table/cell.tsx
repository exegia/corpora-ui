"use client";

import type React from "react";
import { cn } from "@/lib/utils";

export default function TableCell({
  className,
  ...props
}: React.ComponentProps<"td">): React.ReactElement {
  return (
    <td
      className={cn(
        "whitespace-nowrap bg-clip-padding p-2.5 in-data-[slot=table-footer]:py-3.5 align-middle leading-none in-data-[variant=card]:first:ps-[calc(--spacing(2.5)-1px)] in-data-[variant=card]:last:pe-[calc(--spacing(2.5)-1px)] has-[[data-slot=checkbox]]:w-px last:has-[[data-slot=checkbox]]:ps-0 first:has-[[data-slot=checkbox]]:pe-0",
        className,
      )}
      data-slot="table-cell"
      {...props}
    />
  );
}
