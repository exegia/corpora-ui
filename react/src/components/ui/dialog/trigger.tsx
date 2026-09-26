"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import type React from "react";

export default function DialogTrigger(
  props: DialogPrimitive.Trigger.Props,
): React.ReactElement {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}
