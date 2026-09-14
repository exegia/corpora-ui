import * as React from "react"

import { BrowserFrame } from "@/registry/browser/frame"
import type { RegistryEntry } from "@/registry"

/** Renders a registry entry's lazy demo inside a browser-shaped canvas. */
export function ComponentPreview({ entry }: { entry: RegistryEntry }) {
  const Demo = entry.preview

  return (
    <BrowserFrame
      title={entry.name}
      titleStyle={entry.titleStyle ?? "expanded"}
    >
      {Demo ? (
        <React.Suspense
          fallback={<p className="text-sm text-muted-foreground">Loading…</p>}
        >
          <div className="relative h-full min-h-96 w-full">
            <Demo />
          </div>
        </React.Suspense>
      ) : (
        <p className="text-sm text-muted-foreground">
          Preview coming soon ({entry.status}).
        </p>
      )}
    </BrowserFrame>
  )
}
