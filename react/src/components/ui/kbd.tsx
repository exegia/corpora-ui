import type * as React from "react";
import { cn } from "@/lib/utils";

export function Kbd({
  className,
  ...props
}: React.ComponentProps<"kbd">): React.ReactElement {
  return (
    <kbd
      className={cn(
        "pointer-events-none inline-flex h-5 min-w-5 select-none items-center justify-center gap-1 rounded-[.35rem] font-medium font-sans text-muted-foreground text-xs [&_svg:not([class*='size-'])]:size-3 border border-border bg-black/5 px-1",
        "shadow-[inset_0_-1px_0_rgb(0_0_0/0.08)] dark:border-white/10 dark:bg-white/6 dark:shadow-[inset_0_-1px_0_rgb(0_0_0/0.4)]",
        className,
      )}
      data-slot="kbd"
      {...props}
    />
  );
}

export function KbdGroup({
  className,
  ...props
}: React.ComponentProps<"kbd">): React.ReactElement {
  return (
    <kbd
      className={cn("inline-flex items-center gap-1", className)}
      data-slot="kbd-group"
      {...props}
    />
  );
}
