"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type React from "react";
import { cn } from "@/lib/utils";

export default function DrawerMenu({
  className,
  render,
  ...props
}: useRender.ComponentProps<"nav">): React.ReactElement {
  const defaultProps = {
    className: cn("-m-2 flex flex-col", className),
    "data-slot": "drawer-menu",
  };

  return useRender({
    defaultTagName: "nav",
    props: mergeProps<"nav">(defaultProps, props),
    render,
  });
}
