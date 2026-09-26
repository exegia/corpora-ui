"use client";

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import { useExegiaPortalContainer } from "@/lib/state/portal-context";

export default function SheetPortal(props: SheetPrimitive.Portal.Props) {
  const container = useExegiaPortalContainer(props.container);
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} container={container} />;
}
