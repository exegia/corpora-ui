"use client"

import { Dialog } from "@base-ui/react/dialog"
import type { ReactElement } from "react"
import { useExegiaPortalContainer } from "@/lib/state/portal-context"
import { cn } from "@/lib/utils"

// Each modal owns its focus/trigger context. ExegiaProvider supplies the
// shared portal destination and Jotai store for controlled open-state atoms.
export const Modal: typeof Dialog.Root = Dialog.Root
export const ModalTrigger: typeof Dialog.Trigger = Dialog.Trigger
export const ModalClose: typeof Dialog.Close = Dialog.Close
export const ModalTitle: typeof Dialog.Title = Dialog.Title
export const ModalDescription: typeof Dialog.Description = Dialog.Description

export function ModalPopup({
  children,
  className,
  portalProps,
  ...props
}: Dialog.Popup.Props & { portalProps?: Dialog.Portal.Props }): ReactElement {
  const container = useExegiaPortalContainer(portalProps?.container)
  return (
    <Dialog.Portal {...portalProps} container={container}>
      <Dialog.Backdrop
        data-slot="modal-backdrop"
        className="fixed inset-0 z-50 bg-black/40 transition-opacity data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none"
      />
      <Dialog.Popup
        {...props}
        data-slot="modal-popup"
        className={cn(
          "fixed top-1/2 left-1/2 z-50 max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border bg-popover p-6 text-popover-foreground shadow-lg outline-none transition-opacity data-starting-style:opacity-0 data-ending-style:opacity-0 motion-reduce:transition-none",
          className
        )}
      >
        {children}
      </Dialog.Popup>
    </Dialog.Portal>
  )
}
