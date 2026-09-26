"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

export default function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">): React.ReactElement {
  return (
    <ul
      className={cn("flex flex-row items-center gap-1", className)}
      data-slot="pagination-content"
      {...props}
    />
  );
}
