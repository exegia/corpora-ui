"use client";

import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { XIcon } from "lucide-react";
import { ChevronsUpDownIcon } from "lucide-react";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import ComboboxTrigger from "./trigger";
import ComboboxClear from "./clear";

export default function ComboboxInput({
  className,
  showTrigger = true,
  showClear = false,
  startAddon,
  size,
  triggerProps,
  clearProps,
  ...props
}: Omit<ComboboxPrimitive.Input.Props, "size"> & {
  showTrigger?: boolean;
  showClear?: boolean;
  startAddon?: React.ReactNode;
  size?: "sm" | "default" | "lg" | number;
  ref?: React.Ref<HTMLInputElement>;
  triggerProps?: ComboboxPrimitive.Trigger.Props;
  clearProps?: ComboboxPrimitive.Clear.Props;
}): React.ReactElement {
  const sizeValue = (size ?? "default") as "sm" | "default" | "lg" | number;

  return (
    <ComboboxPrimitive.InputGroup
      className="relative not-has-[>*.w-full]:w-fit w-full text-foreground has-disabled:opacity-64"
      data-slot="combobox-input-group"
    >
      {startAddon && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 start-px z-10 flex items-center ps-[calc(--spacing(3)-1px)] opacity-80 has-[+[data-size=sm]]:ps-[calc(--spacing(2.5)-1px)] [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:-mx-0.5"
          data-slot="combobox-start-addon"
        >
          {startAddon}
        </div>
      )}
      <ComboboxPrimitive.Input
        className={cn(
          startAddon &&
            "data-[size=sm]:*:data-[slot=combobox-input]:ps-[calc(--spacing(7.5)-1px)] *:data-[slot=combobox-input]:ps-[calc(--spacing(8.5)-1px)] sm:data-[size=sm]:*:data-[slot=combobox-input]:ps-[calc(--spacing(7)-1px)] sm:*:data-[slot=combobox-input]:ps-[calc(--spacing(8)-1px)]",
          sizeValue === "sm"
            ? "has-[+[data-slot=combobox-trigger],+[data-slot=combobox-clear]]:*:data-[slot=combobox-input]:pe-6.5"
            : "has-[+[data-slot=combobox-trigger],+[data-slot=combobox-clear]]:*:data-[slot=combobox-input]:pe-7",
          className,
        )}
        data-slot="combobox-input"
        render={
          <Input
            className="has-disabled:opacity-100"
            nativeInput
            size={sizeValue}
          />
        }
        {...props}
      />
      {showTrigger && (
        <ComboboxTrigger
          className={cn(
            "absolute top-1/2 inline-flex size-8 shrink-0 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border border-transparent opacity-80 outline-none transition-opacity pointer-coarse:after:absolute pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 hover:opacity-100 has-[+[data-slot=combobox-clear]]:hidden sm:size-7 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
            sizeValue === "sm" ? "end-0" : "end-0.5",
          )}
          {...triggerProps}
        >
          <ComboboxPrimitive.Icon data-slot="combobox-icon">
            <ChevronsUpDownIcon />
          </ComboboxPrimitive.Icon>
        </ComboboxTrigger>
      )}
      {showClear && (
        <ComboboxClear
          className={cn(
            "absolute top-1/2 inline-flex size-8 shrink-0 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md border border-transparent opacity-80 outline-none transition-opacity pointer-coarse:after:absolute pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11 hover:opacity-100 has-[+[data-slot=combobox-clear]]:hidden sm:size-7 [&_svg:not([class*='size-'])]:size-4.5 sm:[&_svg:not([class*='size-'])]:size-4 [&_svg]:pointer-events-none [&_svg]:shrink-0",
            sizeValue === "sm" ? "end-0" : "end-0.5",
          )}
          {...clearProps}
        >
          <XIcon />
        </ComboboxClear>
      )}
    </ComboboxPrimitive.InputGroup>
  );
}
