"use client";

import type React from "react";
import { cn } from "@/lib/utils";

export default function Empty({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={cn(
        "flex min-w-0 flex-1 flex-col items-center justify-center gap-6 text-balance px-6 py-12 text-center md:py-20",
        className,
      )}
      data-slot="empty"
      {...props}
    />
  );
}
