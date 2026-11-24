"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

type TPaginationGridVariant = "default" | "verse";

export function paginationGridItemClassName({
  active = false,
  compact = false,
  role = "item",
}: {
  active?: boolean;
  compact?: boolean;
  role?: "branch" | "item";
} = {}) {
  return cn(
    "min-h-11 rounded-md border border-input bg-popover shadow-xs/5",
    "hover:bg-accent hover:text-accent-foreground",
    role === "branch" ? "ps-3 pe-3" : "px-3 py-2",
    compact && "text-xs sm:text-sm",
    active && "font-medium text-primary",
  );
}

export default function PaginationGrid({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & {
  variant?: TPaginationGridVariant;
}): React.ReactElement {
  return (
    <div
      className={cn(
        "grid gap-2",
        variant === "verse"
          ? "grid-cols-4 sm:grid-cols-6 md:grid-cols-8"
          : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
        className,
      )}
      data-slot="pagination-grid"
      {...props}
    />
  );
}
