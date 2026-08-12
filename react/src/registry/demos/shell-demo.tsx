
import { ShellLayout } from "@/components/blocks/shell/shell-layout"
import { useShellPanels } from "@/components/blocks/shell/use-shell-panels"
import { DemoStage } from "@/components/docs/demo-controls"

export default function ShellDemo() {
  const panels = useShellPanels()

  return (
    <DemoStage controls={null} canvasClassName="w-full p-0">
        <ShellLayout
          {...panels.providerProps}
          panels={{
            right: {
              id: "inspector",
              name: "Inspector",
              component: <ShellDemoInspector />,
              open: false,
              defaultOpen: false,
              side: "right",
            },
          }}
          variant="desktop"
        >
        </ShellLayout>
    </DemoStage>
  )
}

function ShellDemoInspector() {
  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="h-96 rounded-lg border border-border bg-muted-foreground/10" />
    </div>
  )
}
