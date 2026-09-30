"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { ToggleGroupContext } from "./context";
import {
  ToggleGroup as ArkToggleGroup,
} from "@ark-ui/react/toggle-group";
import { tv } from "tailwind-variants";
import type { ToggleGroupProps } from "./type";


const toggleGroupVariants = tv({
  base: [
    "w-fit",
    "flex items-center gap-[--spacing(var(--gap))]",
    "rounded-lg",
  ],
  variants: {
    orientation: {
      horizontal: "flex-row pointer-coarse:*:after:min-w-auto",
      vertical: "flex-col items-stretch pointer-coarse:*:after:min-h-auto",
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

export const ToggleGroup = (props: ToggleGroupProps) => {
  const {
    multiple = true,
    orientation = "horizontal",
    variant = "ghost",
    size = "default",
    spacing = 0,
    className,
    style,
    ...rest
  } = props;

  return (
    <ToggleGroupContext.Provider value={{ variant, size, spacing }}>
      <ArkToggleGroup.Root
        className={cn(toggleGroupVariants({ orientation }), className)}
        data-slot="toggle-group"
        multiple={multiple}
        orientation={orientation}
        style={
          {
            ...style,
            "--gap": spacing,
          } as React.CSSProperties
        }
        {...rest}
      />
    </ToggleGroupContext.Provider>
  );
};
