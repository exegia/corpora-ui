"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import { ChevronRightIcon } from "lucide-react";
import type React from "react";
import { cn } from "@/lib/utils";
import DrawerTrigger from "./trigger";

export default function DrawerMenuTrigger({
  className,
  children,
  ...props
}: DrawerPrimitive.Trigger.Props): React.ReactElement {
  return (
    <DrawerTrigger
      className={cn(
        "flex min-h-9 w-full cursor-default select-none items-center gap-2 rounded-sm px-2 py-1 text-base text-foreground outline-none hover:bg-accent hover:text-accent-foreground sm:min-h-8 sm:text-sm [&_svg:not(:last-child)]:-mx-0.5 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      data-slot="drawer-menu-trigger"
      {...props}
    >
      {children}
      <ChevronRightIcon className="ms-auto -me-0.5 opacity-80" />
    </DrawerTrigger>
  );
}
