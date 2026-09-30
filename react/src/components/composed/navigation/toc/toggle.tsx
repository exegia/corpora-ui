import { Grid2x2, List } from "lucide-react"
import { ToggleGroup } from "@/components/ui/toggle-group/base"
import { ToggleGroup as ArkToggleGroup } from "@ark-ui/react/toggle-group"
import { buttonVariants } from "@/components/ui/button"
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
      /*/* Grid layout belongs to this demo, preserving Canon's configurable toggle groups. */
      // [data-toc-demo="canon"] [data-slot="toggle-group"] {
      //   display: grid;
      //   grid-template-columns: repeat(auto-fill, minmax(3rem, 1fr));
      //   width: 100%;
      //   gap: 4px;
      // }
      // 
      // [data-toc-demo="canon"] [data-slot="toggle-group-item"] {
      //   width: 100%;
      //   height: auto;
      //   min-width: 0;
      //   aspect-ratio: 1;
      //   padding: 0;
      // }*/


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
