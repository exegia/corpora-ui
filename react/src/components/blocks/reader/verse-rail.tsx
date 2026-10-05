"use client"

import { useAtomValue } from "jotai"
import { readerRailSpacingAtom } from "./atom"
import { railItemSize } from "./utils"
import { useEffect, useRef, useState } from "react"
import { Compact } from "@/components/composed/navigation/toc/compact"
import type { TCanonItem } from "@/components/composed/navigation/toc/type"

export function ReaderVerseRail({
  verses,
  activeVerse,
  onSelect,
}: {
  verses: readonly TCanonItem[]
  activeVerse?: number
  onSelect: (item: TCanonItem) => void
}) {
  const spacing = useAtomValue(readerRailSpacingAtom)
  const container = useRef<HTMLDivElement>(null)
  const [height, setHeight] = useState(0)
  useEffect(() => {
    const element = container.current
    if (!element) return
    const observer = new ResizeObserver(() => setHeight(element.clientHeight))
    setHeight(element.clientHeight)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return (
    <div
      ref={container}
      data-slot="reader-verse-rail"
      className="my-4 ml-6 w-12 relative z-10 shrink-0 self-stretch"
    >
      {verses.length > 0 && height > 0 && (
        <Compact
          label="Chapter verses"
          className="mx-auto h-full"
          items={verses}
          activeLink={verses.find((verse) => verse.number === activeVerse)}
          itemSize={railItemSize(height, verses.length, spacing)}
          onLinkClick={(item) => {
            const verse = verses.find((entry) => entry.id === item.id)
            if (verse) onSelect(verse)
          }}
        />
      )}
    </div>
  )
}
