"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export default function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>): React.ReactElement {
  return (
    <Input
      className={cn("h-8 w-full bg-background shadow-none", className)}
      data-sidebar="input"
      data-slot="sidebar-input"
      {...props}
    />
  );
}
