"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type React from "react";
import { cn } from "@/lib/utils";
import DrawerContent from "./content";

export default function DrawerHeader({
  className,
  allowSelection = false,
  render,
  ...props
}: useRender.ComponentProps<"div"> & {
  allowSelection?: boolean;
}): React.ReactElement {
  const defaultProps = {
    className: cn(
      "flex flex-col gap-2 p-6 in-[[data-slot=drawer-popup]:has([data-slot=drawer-panel])]:pb-3 max-sm:pb-4",
      !allowSelection && "cursor-default",
      className,
    ),
    "data-slot": "drawer-header",
  };

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, props),
    render: allowSelection ? <DrawerContent render={render} /> : render,
  });
}
