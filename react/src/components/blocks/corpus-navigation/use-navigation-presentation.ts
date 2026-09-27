"use client"
import { useEffect, useState } from "react"
import type { NavigationPresentation } from "./types"
/** Width belongs to the embed container, never to the window. */
export function useNavigationPresentation() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [presentation, setPresentation] =
    useState<NavigationPresentation>("compact")
  useEffect(() => {
    if (!container || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width
      setPresentation(
        width >= 1100 ? "wide" : width >= 600 ? "medium" : "compact"
      )
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [container])
  return { containerRef: setContainer, presentation }
}
