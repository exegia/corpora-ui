"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

export default function BreadcrumbList({
  className,
  ...props
}: React.ComponentProps<"ol">): React.ReactElement {
  return (
    <ol
      className={cn(
        "wrap-break-word flex flex-wrap items-center gap-1.5 text-muted-foreground text-sm sm:gap-2.5",
        className,
      )}
      data-slot="breadcrumb-list"
      {...props}
    />
  );
}
