"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import type React from "react";
import { cn } from "@/lib/utils";

export default function DialogDescription({
  className,
  ...props
}: DialogPrimitive.Description.Props): React.ReactElement {
  return (
    <DialogPrimitive.Description
      className={cn("text-muted-foreground text-sm", className)}
      data-slot="dialog-description"
      {...props}
    />
  );
}
