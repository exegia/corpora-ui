"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type React from "react";
import { cn } from "@/lib/utils";

export function Label({
  className,
  render,
  sound = true,
  ...props
}: useRender.ComponentProps<"label"> & {
  /** Emit the cuelume hover tick. Inert until the app calls bindSounds(). */
  sound?: boolean;
}): React.ReactElement {
  const defaultProps = {
    className: cn(
      "inline-flex items-center gap-2 font-medium text-base/4.5 text-foreground sm:text-sm/4",
      className,
    ),
    "data-cuelume-hover": sound ? "tick" : undefined,
    "data-slot": "label",
  };

  return useRender({
    defaultTagName: "label",
    props: mergeProps<"label">(defaultProps, props),
    render,
  });
}
