"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";


export default function SidebarMenu({
  className,
  ...props
}: React.ComponentProps<"ul">): React.ReactElement {
  return (
    <ul
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      data-sidebar="menu"
      data-slot="sidebar-menu"
      {...props}
    />
  );
}
