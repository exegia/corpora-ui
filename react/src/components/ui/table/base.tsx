"use client";

import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import type React from "react";
import { cn } from "@/lib/utils";
import type { TableProps } from "./types";

export default function Table({
  className,
  variant = "default",
  render,
  ...props
}: TableProps): React.ReactElement {
  const defaultProps = {
    children: (
      <table
        className={cn(
          "w-full caption-bottom in-data-[variant=card]:border-separate in-data-[variant=card]:border-spacing-0 text-sm",
          className,
        )}
        data-slot="table"
        {...props}
      />
    ),
    className: "relative w-full overflow-x-auto",
    "data-slot": "table-container",
    "data-variant": variant,
  };

  return useRender({
    defaultTagName: "div",
    props: mergeProps<"div">(defaultProps, {}),
    render,
  });
}
