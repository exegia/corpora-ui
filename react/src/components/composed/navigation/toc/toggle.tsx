import { Grid2x2, List } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { TNodeType } from "./types"
import type { TocViewModeToggleProps } from "./types"

const GRID_NODE_TYPES = new Set<TNodeType>([
  "book",
  "chapter",
  "verse",
  "surah",
])

export const isGridNodeType = (type: TNodeType): boolean =>
  GRID_NODE_TYPES.has(type)

export function TocViewModeToggle({
  viewMode,
  onValueChange,
}: TocViewModeToggleProps) {
  return (
      <ToggleGroup
          size={"md"}
      aria-label="Table of content view"
      className="shrink-0"
      multiple={false}
      onValueChange={(payload) => {
        const next = payload.value[0]
        if (next === "grid" || next === "list") onValueChange(next)
      }}
      value={[viewMode]}
      variant="outline"
    >
      <ToggleGroupItem aria-label="List view" value="list">
        <List aria-hidden="true" />
        <span className="sm:inline hidden">List</span>
      </ToggleGroupItem>
      <ToggleGroupItem aria-label="Grid view" value="grid">
        <Grid2x2 aria-hidden="true" />
        <span className="sm:inline hidden">Grid</span>
      </ToggleGroupItem>
    </ToggleGroup>
  )
}
