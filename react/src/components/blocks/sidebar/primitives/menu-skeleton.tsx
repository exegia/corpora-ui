"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean;
}): React.ReactElement {
  // Random width between 50 to 90%.
  const [width] = React.useState(() => {
    return `${Math.floor(Math.random() * 40) + 50}%`;
  });

  return (
    <div
      className={cn("flex h-8 items-center gap-2 rounded-lg px-2", className)}
      data-sidebar="menu-skeleton"
      data-slot="sidebar-menu-skeleton"
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-lg"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  );
}
