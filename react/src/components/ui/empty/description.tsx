"use client";

import type React from "react";
import { cn } from "@/lib/utils";

export default function EmptyDescription({
  className,
  ...props
}: React.ComponentProps<"p">): React.ReactElement {
  return (
    <div
      className={cn(
        "text-muted-foreground text-sm [&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4 [[data-slot=empty-title]+&]:mt-1",
        className,
      )}
      data-slot="empty-description"
      {...props}
    />
  );
}
