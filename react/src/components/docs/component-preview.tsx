import * as React from "react"

import type { RegistryEntry } from "@/registry"

/**
 * Renders an entry's lazy demo (created at registry module scope) inside a
 * bordered canvas. Falls back to a placeholder while the demo is not
 * implemented yet.
 */
export function ComponentPreview({ entry }: { entry: RegistryEntry }) {
  const Demo = entry.preview

  return (
    <div className="flex min-h-48 items-center justify-center rounded-lg border p-8">
      {Demo ? (
        <React.Suspense
          fallback={<p className="text-sm text-muted-foreground">Loading…</p>}
        >
          <Demo />
        </React.Suspense>
      ) : (
        <p className="text-sm text-muted-foreground">
          Preview coming soon ({entry.status}).
        </p>
      )}
    </div>
  )
}
