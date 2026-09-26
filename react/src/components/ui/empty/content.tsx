"use client";

import type React from "react";
import { cn } from "@/lib/utils";

export default function EmptyContent({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={cn(
        "flex w-full min-w-0 max-w-sm flex-col items-center gap-4 text-balance text-sm",
        className,
      )}
      data-slot="empty-content"
      {...props}
    />
  );
}
