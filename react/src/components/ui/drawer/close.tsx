"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import type React from "react";

export default function DrawerClose(
  props: DrawerPrimitive.Close.Props,
): React.ReactElement {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}
