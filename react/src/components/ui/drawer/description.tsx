"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import type React from "react";
import { cn } from "@/lib/utils";

export default function DrawerDescription({
  className,
  ...props
}: DrawerPrimitive.Description.Props): React.ReactElement {
  return (
    <DrawerPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="drawer-description"
      {...props}
    />
  );
}
