"use client"

import type * as React from "react"
import { cn } from "@/lib/utils"
import { accentText, mutedText } from "./shared"
import type { IVersionHistoryRecordProps } from "./types"



export function VersionHistoryRecord({
  entry,
  className,
}: IVersionHistoryRecordProps): React.ReactElement {
  const timestamp =
    entry.timestamp instanceof Date
      ? entry.timestamp.toLocaleString()
      : entry.timestamp
  return (
    <article
      className={cn("border-l border-border pl-3", className)}
      data-slot="version-history-record"
    >
      <p className="text-xs text-foreground/85">
        <span className={cn("font-medium", accentText)}>
          resp=&quot;{entry.responseId}&quot;
        </span>
        {entry.applyingUser ? ` · ${entry.applyingUser}` : ""}
      </p>
      <p className={cn("mt-1 text-xs", mutedText)}>
        Node <code>{entry.nodeId}</code> · v{entry.version} · {timestamp}
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        Previous value: <del>{entry.previousValue}</del>
      </p>
    </article>
  )
}
