"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import type React from "react";

export default function DialogClose(
  props: DialogPrimitive.Close.Props,
): React.ReactElement {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}
