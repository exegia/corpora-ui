"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import type React from "react";
import { useExegiaPortalContainer } from "@/lib/state/portal-context";

export default function DrawerPortal(
  props: DrawerPrimitive.Portal.Props,
): React.ReactElement {
  const container = useExegiaPortalContainer(props.container);
  return <DrawerPrimitive.Portal {...props} container={container} />;
}
