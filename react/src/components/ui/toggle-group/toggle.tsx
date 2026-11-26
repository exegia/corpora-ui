"use client";

import { Toggle as ArkToggle, useToggleContext } from "@ark-ui/react/toggle";
import type React from "react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { toggleVariants } from "./utils";
import type { ToggleProps } from "./type";

export const useToggle = useToggleContext;

export const Toggle = (props: ToggleProps) => {
  const { variant = "ghost", size = "default", className, ...rest } = props;

  return (
    <ArkToggle.Root
      className={cn(
        buttonVariants({ variant, size }),
        toggleVariants({ size }),
        className
      )}
      data-slot="toggle"
      {...rest}
    />
  );
};

export const ToggleIndicator = (
  props: React.ComponentProps<typeof ArkToggle.Indicator>
) => {
  const { children, ...rest } = props;

  return (
    <ArkToggle.Indicator
      className="flex items-center gap-2"
      data-slot="toggle-indicator"
      {...rest}
    >
      {children}
    </ArkToggle.Indicator>
  );
};
