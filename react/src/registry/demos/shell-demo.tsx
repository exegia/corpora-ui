import { ShellLayout } from "@/components/blocks/shell/shell-layout"
import { useShellPanels } from "@/components/blocks/shell/use-shell-panels"
import { DemoStage } from "@/components/docs/demo-controls"

export default function ShellDemo() {
  const panels = useShellPanels()

  return (
    <DemoStage controls={null} canvasClassName="h-[480px] w-full p-0">
      <ShellLayout
        {...panels.providerProps}
        panels={{
          left: {
            id: "left",
            name: "Left",
            component: <ShellDemoLeft />,
            open: false,
            defaultOpen: false,
            side: "left",
          },
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
      ></ShellLayout>
    </DemoStage>
  )
}

function ShellDemoLeft() {
  return (
    <div className="flex flex-1 flex-col gap-y-4 p-4">
      <h4>Sidebar</h4>
      <div className="h-3 rounded-lg border border-border bg-muted-foreground/10" />
      <div className="h-3 w-1/2 rounded-lg border border-border bg-muted-foreground/10" />
      <div className="h-3 rounded-lg border border-border bg-muted-foreground/10" />
      <div className="h-3 w-1/2 rounded-lg border border-border bg-muted-foreground/10" />
      <div className="h-3 rounded-lg border border-border bg-muted-foreground/10" />
      <div className="h-3 w-1/2 rounded-lg border border-border bg-muted-foreground/10" />
      <div className="h-3 rounded-lg border border-border bg-muted-foreground/10" />
    </div>
  )
}

function ShellDemoInspector() {
  return (
    <div className="flex flex-1 flex-col p-4">
      <div className="h-96 rounded-lg border border-border bg-muted-foreground/10" />
    </div>
  )
}
