"use client"

import { use, useEffect, useId, useState } from "react"
import { useTheme } from "next-themes"

const cache = new Map<string, Promise<unknown>>()

function cachePromise<T>(key: string, create: () => Promise<T>) {
  const cached = cache.get(key)
  if (cached) return cached as Promise<T>

  const promise = create()
  cache.set(key, promise)
  return promise
}

export function Mermaid({ chart }: { chart: string }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  return mounted ? <MermaidContent chart={chart} /> : null
}

function MermaidContent({ chart }: { chart: string }) {
  const id = useId()
  const { resolvedTheme } = useTheme()
  const { default: mermaid } = use(
    cachePromise("mermaid", () => import("mermaid"))
  )

  mermaid.initialize({
    startOnLoad: false,
    securityLevel: "strict",
    fontFamily: "inherit",
    theme: resolvedTheme === "dark" ? "dark" : "default",
  })

  const { svg, bindFunctions } = use(
    cachePromise(`${chart}-${resolvedTheme}`, () => mermaid.render(id, chart))
  )

  return (
    <div
      className="my-6 p-4 flex justify-center overflow-x-auto rounded-lg border bg-card"
      ref={(container) => {
        if (container) bindFunctions?.(container)
      }}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  )
}
