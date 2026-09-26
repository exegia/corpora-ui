"use client";

import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import type React from "react";
import { cn } from "@/lib/utils";

export default function DialogTitle({
  className,
  ...props
}: DialogPrimitive.Title.Props): React.ReactElement {
  return (
    <DialogPrimitive.Title
      className={cn(
        "font-heading font-semibold text-xl leading-none",
        className,
      )}
      data-slot="dialog-title"
      {...props}
    />
  );
}
