import { TextSelection } from "../text-selection"
import type { TextSelectionProps } from "../text-selection"
import { Text } from "./default"
import type { TextProps } from "./types"
import { cn } from "@/lib/utils"
import { twClasses } from "./utils"

export type ParagraphProps = Omit<TextProps, "type"> &
  Omit<TextSelectionProps, "children" | "className">

export function Paragraph({
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
  alignment,
  className,
  minSelectionLength,
  ...textProps
}: ParagraphProps) {
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
        className={cn(twClasses["default"], className)}
        type="paragraph"
      >
        {children}
      </Text>
    </TextSelection>
  )
}
