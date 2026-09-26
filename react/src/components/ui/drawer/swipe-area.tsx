"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import type React from "react";
import { useContext } from "react";
import { cn } from "@/lib/utils";
import type { DrawerPosition } from "./types";
import { DrawerContext } from "./context";

export default function DrawerSwipeArea({
  className,
  position: positionProp,
  ...props
}: DrawerPrimitive.SwipeArea.Props & {
  position?: DrawerPosition;
}): React.ReactElement {
  const { position: contextPosition } = useContext(DrawerContext);
  const position = positionProp ?? contextPosition;

  return (
    <DrawerPrimitive.SwipeArea
      className={cn(
        "fixed z-50 touch-none",
        position === "bottom" && "inset-x-0 bottom-0 h-8",
        position === "top" && "inset-x-0 top-0 h-8",
        position === "left" && "inset-y-0 left-0 w-8",
        position === "right" && "inset-y-0 right-0 w-8",
        className,
      )}
      data-slot="drawer-swipe-area"
      {...props}
    />
  );
}
