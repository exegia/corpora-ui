import { Unlink } from "lucide-react"
import { IconButton } from "@/components/ui/chat"
import { cn } from "@/lib/utils"
import type { Edge } from "./types"
import type { Point } from "./utils"

const WIDTHS = [1.25, 2, 3]
const COLORS = ["var(--line-strong)", "var(--tag-purple-text)", "var(--tag-amber-text)", "var(--tag-blue-text)", "var(--tag-green-text)"]

/** Floats at a selected connector's midpoint: stroke widths, colours, disconnect. */
export function EdgeToolbar({
  edge,
  at,
  onChange,
  onRemove,
}: {
  edge: Edge
  at: Point
  onChange?: (id: string, patch: Pick<Edge, "strokeWidth" | "color">) => void
  onRemove?: (id: string) => void
}) {
  const width = edge.strokeWidth ?? 1.25
  const color = edge.color ?? COLORS[0]
  return (
    <div
      data-ui
      data-slot="edge-toolbar"
      role="toolbar"
      aria-label="Connector"
      onClick={(event) => event.stopPropagation()}
      className="absolute z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-md bg-surface p-1 shadow-btn"
      style={{ left: at.x, top: at.y }}
    >
      {onChange
        ? WIDTHS.map((w) => (
            <button
              key={w}
              type="button"
              aria-label={`Stroke ${w}`}
              aria-pressed={width === w}
              onClick={() => onChange(edge.id, { strokeWidth: w })}
              className={cn("flex size-6 items-center justify-center rounded-sm hover:bg-hover-2", width === w && "bg-hover-2")}
            >
              <span className="w-3.5 rounded-full bg-ink" style={{ height: w }} />
            </button>
          ))
        : null}
      {onChange ? <span aria-hidden className="mx-0.5 h-4 w-px bg-line" /> : null}
      {onChange
        ? COLORS.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Colour ${c}`}
              aria-pressed={color === c}
              onClick={() => onChange(edge.id, { color: c })}
              className={cn("flex size-6 items-center justify-center rounded-sm hover:bg-hover-2", color === c && "bg-hover-2")}
            >
              <span className="size-3 rounded-full" style={{ background: c }} />
            </button>
          ))
        : null}
      {onRemove ? (
        <>
          {onChange ? <span aria-hidden className="mx-0.5 h-4 w-px bg-line" /> : null}
          <IconButton aria-label="Disconnect" onClick={() => onRemove(edge.id)}>
            <Unlink />
          </IconButton>
        </>
      ) : null}
    </div>
  )
}
