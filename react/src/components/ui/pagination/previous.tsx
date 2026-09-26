"use client";

import { ChevronLeftIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";
import PaginationLink from "./link";

export default function PaginationPrevious({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>): React.ReactElement {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      className={cn("max-sm:aspect-square max-sm:p-0", className)}
      size="default"
      {...props}
    >
      <ChevronLeftIcon className="sm:-ms-1" />
      <span className="max-sm:hidden">Previous</span>
    </PaginationLink>
  );
}
