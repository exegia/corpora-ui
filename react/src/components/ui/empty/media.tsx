"use client";

import { type VariantProps } from "class-variance-authority";
import type React from "react";
import { cn } from "@/lib/utils";
import { emptyMediaVariants } from "./utils";

export default function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof emptyMediaVariants>): React.ReactElement {
  return (
    <div
      className={cn("relative mb-6", className)}
      data-slot="empty-media"
      data-variant={variant}
      {...props}
    >
      {variant === "icon" && (
        <>
          <div
            aria-hidden="true"
            className={cn(
              emptyMediaVariants({ className, variant }),
              "pointer-events-none absolute bottom-px origin-bottom-left -translate-x-0.5 -rotate-10 scale-84 shadow-none",
            )}
          />
          <div
            aria-hidden="true"
            className={cn(
              emptyMediaVariants({ className, variant }),
              "pointer-events-none absolute bottom-px origin-bottom-right translate-x-0.5 rotate-10 scale-84 shadow-none",
            )}
          />
        </>
      )}
      <div
        className={cn(emptyMediaVariants({ className, variant }))}
        {...props}
      />
    </div>
  );
}
