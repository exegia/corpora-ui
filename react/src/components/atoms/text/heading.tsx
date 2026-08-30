import { cn } from "@/lib/utils"
import { TextSelection } from "../text-selection"
import type { TextSelectionProps } from "../text-selection"
import { Text } from "./default"
import type { TextProps } from "./types"
import { twClasses } from "./utils";

export type HeadingProps = Omit<TextProps, "type"> &
  Omit<TextSelectionProps, "children" | "className">

export function Heading({
  children,
  selected,
  popover,
  component,
  componentProps,
  popoverComponent,
  popoverProps,
  renderPopover,
  onSelectionStart,
  onSelectionEnd,
  onPopoverShow,
  onPopoverHide,
  offset,
  zIndex,
  className,
  alignment,
  minSelectionLength,
  ...textProps
}: HeadingProps) {
  return (
    <TextSelection
      alignment={alignment}
      component={component}
      componentProps={componentProps}
      minSelectionLength={minSelectionLength}
      offset={offset}
      onPopoverHide={onPopoverHide}
      onPopoverShow={onPopoverShow}
      onSelectionEnd={onSelectionEnd}
      onSelectionStart={onSelectionStart}
      popover={popover}
      popoverComponent={popoverComponent}
      popoverProps={popoverProps}
      renderPopover={renderPopover}
      selected={selected}
      zIndex={zIndex}
    >
      <Text
        {...textProps}
        className={cn(
          twClasses["default"],
          className
        )}
        type="heading"
      >
        {children}
      </Text>
    </TextSelection>
  )
}
