"use client";

import { MoreHorizontalIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

export default function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">): React.ReactElement {
  return (
    <span
      aria-hidden
      className={cn("flex min-w-7 justify-center", className)}
      data-slot="pagination-ellipsis"
      {...props}
    >
      <MoreHorizontalIcon className="size-5 sm:size-4" />
      <span className="sr-only">More pages</span>
    </span>
  );
}
