import { useState } from "react"
import type { IComposerMenuProps } from "../type"
import { Popover, PopoverPopup, PopoverTrigger } from "@/components/ui/popover"
import { MenuCommandList } from "@/components/ui/menu-command"
import { AddButton } from "./add-button"

/** Compatibility slot for apps that provide their own attachment commands. */
export function CommandMenu({
  items = [],
  onCommand,
  onAttach,
  disabled,
}: IComposerMenuProps): React.ReactElement {
  const [open, setOpen] = useState(false)
  return (
    <Popover open={open && !disabled} onOpenChange={setOpen}>
      <PopoverTrigger
        disabled={disabled}
        render={(props, state) => <AddButton {...props} state={state} />}
      />
      <PopoverPopup
        side="top"
        align="start"
        className="w-80 [&_[data-slot=popover-viewport]]:p-0"
      >
        <MenuCommandList
          items={
            onAttach
              ? [
                  {
                    id: "attach",
                    label: "Add photos & files",
                    onSelect: onAttach,
                  },
                  ...items,
                ]
              : items
          }
          onSelect={(item) => {
            onCommand?.(item)
            setOpen(false)
          }}
        />
      </PopoverPopup>
    </Popover>
  )
}
