import * as React from "react"

import { BrowserFrame } from "@/components/beste/piece/browser-frame"
import type { RegistryEntry } from "@/registry"

/**
 * Renders an entry's lazy demo (created at registry module scope) inside a
 * bordered canvas. Falls back to a placeholder while the demo is not
 * implemented yet.
 */
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
