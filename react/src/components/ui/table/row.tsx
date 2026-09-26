"use client";

import type React from "react";
import { cn } from "@/lib/utils";

export default function TableRow({
  className,
  ...props
}: React.ComponentProps<"tr">): React.ReactElement {
  return (
    <tr
      className={cn(
        "relative border-b not-in-data-[variant=card]:hover:bg-[color-mix(in_srgb,var(--background),var(--color-black)_2%)] not-in-data-[variant=card]:data-[state=selected]:bg-[color-mix(in_srgb,var(--background),var(--color-black)_4%)] dark:not-in-data-[variant=card]:data-[state=selected]:bg-[color-mix(in_srgb,var(--background),var(--color-white)_4%)] dark:not-in-data-[variant=card]:hover:bg-[color-mix(in_srgb,var(--background),var(--color-white)_2%)]",
        className,
      )}
      data-slot="table-row"
      {...props}
    />
  );
}
