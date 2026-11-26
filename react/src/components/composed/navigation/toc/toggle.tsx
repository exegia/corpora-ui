import { Grid2x2, List } from "lucide-react"
import { ToggleGroup } from "@/components/ui/toggle-group/base"
import { ToggleGroup as ArkToggleGroup } from "@ark-ui/react/toggle-group"
import { buttonVariants } from "@/components/ui/button"
import type { TNodeType } from "./type"
import type { TocViewModeToggleProps } from "./type"

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
      size={"default"}
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
      <ArkToggleGroup.Item
        className={buttonVariants({ variant: "outline" })}
        aria-label="List view"
        value="list"
      >
        <List aria-hidden="true" />
        <span className="sm:inline hidden">List</span>
      </ArkToggleGroup.Item>
      <ArkToggleGroup.Item
        className={buttonVariants({ variant: "outline" })}
        aria-label="Grid view"
        value="grid"
      >
        <Grid2x2 aria-hidden="true" />
        <span className="sm:inline hidden">Grid</span>
      </ArkToggleGroup.Item>
    </ToggleGroup>
  )
}
