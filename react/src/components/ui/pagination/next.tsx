"use client";

import { ChevronRightIcon } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";
import PaginationLink from "./link";

export default function PaginationNext({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>): React.ReactElement {
  return (
    <PaginationLink
      aria-label="Go to next page"
      className={cn("max-sm:aspect-square max-sm:p-0", className)}
      size="default"
      {...props}
    >
      <span className="max-sm:hidden">Next</span>
      <ChevronRightIcon className="sm:-me-1" />
    </PaginationLink>
  );
}
