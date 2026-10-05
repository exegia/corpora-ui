"use client";

import  { type ToggleGroupItemProps, ToggleGroup as ArkToggleGroup } from "@ark-ui/react/toggle-group";
import { Toggle } from "./toggle";
import { cn } from "@/lib/utils";
import { useToggleGroup } from "./context";



export const ToggleGroupItem = (props: ToggleGroupItemProps) => {
  const { value, className, ...rest } = props;

  const { variant, size, spacing } = useToggleGroup();

  return (
      <ArkToggleGroup.Item asChild data-slot="toggle-group-item" value={value}>
        <Toggle className={cn(
                    "shrink-0 focus:z-10 focus-visible:z-10",
                    "data-[spacing=0]:rounded-none",
                    "data-[spacing=0]:px-2",
                    "data-[orientation=horizontal]:data-[spacing=0]:first:rounded-l-lg",
                    "data-[orientation=vertical]:data-[spacing=0]:first:rounded-t-lg",
                    "data-[orientation=horizontal]:data-[spacing=0]:last:rounded-r-lg",
                    "data-[orientation=vertical]:data-[spacing=0]:last:rounded-b-lg",
                    "data-[orientation=horizontal]:data-[spacing=0]:data-[variant=outline]:border-l-0",
                    "data-[orientation=vertical]:data-[spacing=0]:data-[variant=outline]:border-t-0",
                    "data-[orientation=horizontal]:data-[spacing=0]:data-[variant=outline]:first:border-l",
                    className
                  )} data-spacing={spacing} data-variant={variant} size={size} variant={variant} {...rest} />
    </ArkToggleGroup.Item>
  );
};
