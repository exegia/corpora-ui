"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import type React from "react";

export default function DrawerTrigger(
  props: DrawerPrimitive.Trigger.Props,
): React.ReactElement {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}
