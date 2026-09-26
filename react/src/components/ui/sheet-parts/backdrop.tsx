"use client";

import { Dialog as SheetPrimitive } from "@base-ui/react/dialog";
import SheetOverlay from "./overlay";

export default function SheetBackdrop(props: SheetPrimitive.Backdrop.Props) {
  return <SheetOverlay data-slot="sheet-backdrop" {...props} />;
}
