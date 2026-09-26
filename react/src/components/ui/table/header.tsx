"use client";

import type React from "react";
import { cn } from "@/lib/utils";

export default function TableHeader({
  className,
  ...props
}: React.ComponentProps<"thead">): React.ReactElement {
  return (
    <thead
      className={cn("[&_tr]:border-b", className)}
      data-slot="table-header"
      {...props}
    />
  );
}
