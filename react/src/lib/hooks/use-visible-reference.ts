"use client"

import { useEffect, useState } from "react"

interface VisibleReference {
  /** Chapter heading the verse range is appended to, e.g. "Genesis 1". */
  readonly label: string
  /**
   * Bumps when the measured nodes are replaced, so a new passage is measured
   * even when the reader element itself stays mounted.
   */
  readonly generation: unknown
  readonly enabled?: boolean
}

/**
 * Verse range currently inside a scroll container.
 *
 * Reads `[data-verse]` nodes under the container's `article` and reports
 * `label:first-last`, including verses only partly in view. Scroll and resize
 * are coalesced to one measurement per frame.
 */
export function useVisibleReference(
  container: HTMLElement | null,
  { label, generation, enabled = true }: VisibleReference
): string {
  const [reference, setReference] = useState(label)

  useEffect(() => {
    const article = container?.querySelector("article")
    if (!container || !article || !enabled) return

    const verses = Array.from(
      article.querySelectorAll<HTMLElement>("[data-verse]")
    )
    let frame = 0
    const updateRange = () => {
      const viewport = container.getBoundingClientRect()
      const top = viewport.top + container.clientTop
      const bottom = top + container.clientHeight
      const visible = verses.filter((verse) =>
        // Include partially visible verses at either edge of the container.
        Array.from(verse.getClientRects()).some(
          (bounds) =>
            bounds.height > 0 && bounds.bottom > top && bounds.top < bottom
        )
      )
      const first = visible[0]?.dataset.verse
      const last = visible.at(-1)?.dataset.verse
      setReference(
        first ? `${label}:${first}${first === last ? "" : `-${last}`}` : label
      )
    }
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(updateRange)
    }

    scheduleUpdate()
    container.addEventListener("scroll", scheduleUpdate, { passive: true })
    const observer = new ResizeObserver(scheduleUpdate)
    observer.observe(container)
    observer.observe(article)
    return () => {
      cancelAnimationFrame(frame)
      container.removeEventListener("scroll", scheduleUpdate)
      observer.disconnect()
    }
  }, [container, label, generation, enabled])

  return reference
}
