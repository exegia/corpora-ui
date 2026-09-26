"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

export default function Pagination({
  className,
  ...props
}: React.ComponentProps<"nav">): React.ReactElement {
  return (
    <nav
      aria-label="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      data-slot="pagination"
      {...props}
    />
  );
}
