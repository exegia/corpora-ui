"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { PanelLeftIcon } from "lucide-react";
import { useSidebar } from "./use-sidebar";

export default function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>): React.ReactElement {
  const { toggleSidebar } = useSidebar();

  return (
    <Button
      className={cn("size-7", className)}
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);
        toggleSidebar();
      }}
      type="button"
      size="icon"
      variant="ghost"
      {...props}
    >
      <PanelLeftIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  );
}
