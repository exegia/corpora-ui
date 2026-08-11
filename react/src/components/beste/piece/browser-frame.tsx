"use client"

import { Globe } from "lucide-react"
import { cn } from "@/lib/utils"
import type { IBrowserProps } from "./type"
import { titleBarStyle } from "./utils"

export function BrowserFrame({
  url,
  title,
  className,
  titleStyle,
  children,
}: IBrowserProps) {



  return (
    <div
      className={cn(
        "relative flex size-full items-center justify-center",
        className
      )}
    >
      <div className="flex min-h-96 w-full flex-col overflow-hidden rounded-lg border border-border bg-neutral-50 shadow-lg dark:bg-neutral-900 relative">
        <div id="title-bar" className={cn("flex flex-1 w-full items-center gap-2 px-4 py-3 z-20", titleBarStyle(titleStyle, 'title'))}>
          <div className="flex items-center gap-2" aria-hidden="true">
            <span className="size-3 cursor-pointer rounded-full bg-rose-500 shadow-md outline outline-rose-800" />
            <span className="size-3 cursor-pointer rounded-full bg-amber-500 shadow-md outline outline-amber-800" />
            <span className="size-3 cursor-pointer rounded-full bg-emerald-500 shadow-md outline outline-emerald-800" />
          </div>
          {url && !title && (
            <div className="flex max-w-1/3 flex-1 items-center gap-1.5 rounded-sm border border-border bg-card p-1">
              <Globe
                className="size-3 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
              <span className="truncate font-mono text-xs text-muted-foreground">
                {url}
              </span>
            </div>
          )}
          {title && !url && (
            <div className="flex w-full flex-1 justify-center select-none">
              <span className="text-sm text-foreground ml-2">{title}</span>
            </div>
          )}
        </div>
        <div className={cn("flex flex-1 ", titleBarStyle(titleStyle, "frame"))}>
          {children}
        </div>
      </div>
    </div>
  )
}
