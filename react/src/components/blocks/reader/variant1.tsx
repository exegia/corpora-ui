"use client"
import type { ReactNode, Ref } from "react"
import type { TCanonItem } from "@/components/composed/navigation/toc/type"
import { ReaderVerseRail } from "./verse-rail"

export interface ReaderProps {
  children: ReactNode
  ref?: Ref<HTMLDivElement>
  loading?: boolean
  tocCollapsed?: boolean
  verses?: readonly TCanonItem[]
  activeVerse?: number
  onVerseSelect: (item: TCanonItem) => void
}

export function Reader({
  children,
  ref,
  loading = false,
  tocCollapsed = false,
  verses = [],
  activeVerse,
  onVerseSelect,
}: ReaderProps) {
  return (
    <div
      data-slot="reader"
      className="min-h-0 bg-white dark:bg-neutral-950/60 relative flex flex-1"
    >
      {tocCollapsed && !loading && verses.length > 0 && (
        <ReaderVerseRail
          verses={verses}
          activeVerse={activeVerse}
          onSelect={onVerseSelect}
        />
      )}
      <div
        ref={ref}
        aria-busy={loading}
        data-slot="reader-content"
        className="p-4 min-h-0 min-w-0 relative flex-1 overflow-y-auto"
      >
        {children}
      </div>
    </div>
  )
}
