import { BarChart3, Globe, Layers, Paperclip, Plus } from "lucide-react"
import * as React from "react"

import { DemoStage } from "@/components/docs/demo-controls"
import { Button } from "@/components/ui/button"
import { MenuCommand, type MenuCommandItem } from "@/components/ui/menu-command"

const ITEMS: MenuCommandItem[] = [
  { id: "upload", label: "Add photos & files", description: "Upload from your computer", icon: <Paperclip /> },
  { id: "scoop", label: "Scoop Data", description: "Sales & churn metrics", icon: <BarChart3 /> },
  { id: "flavors", label: "Flavor records", description: "26 makers, tags, links", icon: <Layers /> },
  { id: "web", label: "Web search", description: "Real-time news and info", icon: <Globe />, trailing: "Connected" },
]

export default function MenuCommandDemo(): React.ReactElement {
  const [picked, setPicked] = React.useState<string | null>(null)
  return (
    <DemoStage canvasClassName="flex min-h-64 w-full flex-col items-center justify-center gap-3 p-6">
      <MenuCommand items={ITEMS} onSelect={(item) => setPicked(item.id)} side="bottom">
        <Button aria-label="Open commands" size="icon-lg" variant="outline">
          <Plus className="size-4" />
        </Button>
      </MenuCommand>
      {picked ? <p className="text-xs text-muted-foreground">Selected: {picked}</p> : null}
    </DemoStage>
  )
}
