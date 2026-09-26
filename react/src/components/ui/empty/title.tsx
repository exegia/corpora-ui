"use client";

import type React from "react";
import { cn } from "@/lib/utils";

export default function EmptyTitle({
  className,
  ...props
}: React.ComponentProps<"div">): React.ReactElement {
  return (
    <div
      className={cn("font-heading font-semibold text-xl", className)}
      data-slot="empty-title"
      {...props}
    />
  );
}
