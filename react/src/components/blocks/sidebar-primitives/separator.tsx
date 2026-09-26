"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>): React.ReactElement {
  return (
    <Separator
      className={cn("mx-2 w-auto bg-sidebar-border", className)}
      data-sidebar="separator"
      data-slot="sidebar-separator"
      {...props}
    />
  );
}
