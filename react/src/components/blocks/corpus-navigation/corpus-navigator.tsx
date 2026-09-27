"use client"

import { useRef } from "react"
import { BookOpenIcon, Undo2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerPopup,
  DrawerTitle,
  DrawerDescription,
  DrawerClose,
} from "@/components/ui/drawer"
import {
  LocationBar,
  ReferenceCommand,
  useCorpusNavigation,
  formatReference,
} from "@/components/composed/corpus-navigation"
import { cn } from "@/lib/utils"
import NavigationPicker from "./navigation-picker"
import { useNavigationPresentation } from "./use-navigation-presentation"
import type { CorpusNavigatorProps } from "./types"

export default function CorpusNavigator({
  children,
  corpusSlot,
  contextSlot,
  shortcut = "focused",
  portalProps,
  className,
  ...options
}: CorpusNavigatorProps) {
  const nav = useCorpusNavigation(options)
  const { presentation, containerRef } = useNavigationPresentation()
  const trigger = useRef<HTMLButtonElement>(null)
  const wide = presentation === "wide"
  return (
    <div
      ref={containerRef}
      data-corpus-navigator={nav.navigatorId}
      data-presentation={presentation}
      dir={options.data.direction}
      className={cn(
        "min-w-0 overflow-hidden rounded-xl border bg-background text-foreground",
        className
      )}
    >
      <Drawer
        open={!wide && nav.pickerOpen}
        onOpenChange={(open) => {
          if (open) nav.openPicker()
          else nav.cancel()
        }}
        position={
          presentation === "compact"
            ? "bottom"
            : options.data.direction === "rtl"
              ? "right"
              : "left"
        }
      >
        <header className="gap-3 p-3 flex flex-wrap items-center border-b">
          <div className="min-w-0 flex-1">
            {corpusSlot ?? (
              <p className="text-sm font-semibold truncate">
                {options.data.label}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {options.data.editionId}
            </p>
          </div>
          <Button
            ref={trigger}
            variant="outline"
            className="min-h-11"
            aria-label={`Browse ${options.data.label}`}
            onClick={nav.openPicker}
          >
            <BookOpenIcon />
            <span>Browse</span>
          </Button>
          <div
            className={cn(
              "min-w-0",
              presentation === "compact" ? "basis-full" : "w-64"
            )}
          >
            <ReferenceCommand
              navigatorId={nav.navigatorId}
              shortcut={shortcut}
              portalProps={portalProps}
            />
          </div>
        </header>
        <LocationBar navigatorId={nav.navigatorId} className="px-3 border-b" />
        <div
          className={cn(
            "min-w-0",
            wide && "grid grid-cols-[18rem_minmax(0,1fr)]"
          )}
        >
          {wide && (
            <aside aria-label="Browse locations" className="border-e">
              <NavigationPicker navigatorId={nav.navigatorId} />
            </aside>
          )}
          <div className="min-w-0">
            {nav.history.length > 0 && (
              <div className="px-4 py-2 border-b">
                <Button
                  variant="ghost"
                  className="min-h-11 text-xs max-w-full"
                  disabled={nav.pending}
                  onClick={() => {
                    void nav.returnToPrevious()
                  }}
                >
                  <Undo2Icon />
                  <span className="truncate">
                    Return to{" "}
                    <bdi>
                      {formatReference(options.data, nav.history.at(-1)!)}
                    </bdi>
                  </span>
                </Button>
              </div>
            )}
            <div
              className={cn(
                "min-w-0",
                wide && contextSlot && "grid grid-cols-[minmax(0,1fr)_14rem]"
              )}
            >
              <div className="min-w-0 p-5">
                {typeof children === "function" ? children(nav) : children}
              </div>
              {contextSlot && (
                <aside
                  aria-label="Reading context"
                  className={cn(
                    "min-w-0 p-4 text-sm border-t",
                    wide && "border-s border-t-0"
                  )}
                >
                  {contextSlot}
                </aside>
              )}
            </div>
            {nav.error && !nav.pickerOpen && !nav.commandOpen && (
              <p role="alert" className="px-5 pb-4 text-sm text-destructive">
                {nav.error}
              </p>
            )}
            <p role="status" className="sr-only">
              {nav.location
                ? `Reading ${formatReference(options.data, nav.location)}`
                : "No reading location selected"}
            </p>
          </div>
        </div>
        <DrawerPopup
          portalProps={portalProps}
          finalFocus={trigger}
          showBar={presentation === "compact"}
          dir={options.data.direction}
          className="max-h-[min(85dvh,50rem)] duration-240 data-ending-style:duration-240 motion-reduce:transition-none!"
        >
          <div className="gap-3 p-4 flex items-start justify-between border-b">
            <div>
              <DrawerTitle className="font-semibold">
                Choose a location
              </DrawerTitle>
              <DrawerDescription className="text-sm text-muted-foreground">
                Browse first. Your reading position stays until you choose Go.
              </DrawerDescription>
            </div>
            <DrawerClose
              render={<Button variant="ghost" className="min-h-11 min-w-11" />}
            >
              Close
            </DrawerClose>
          </div>
          {!wide && <NavigationPicker navigatorId={nav.navigatorId} />}
        </DrawerPopup>
      </Drawer>
    </div>
  )
}
