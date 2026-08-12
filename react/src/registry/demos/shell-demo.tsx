import { SparklesIcon, XIcon } from "lucide-react"

import { ShellLayout } from "@/components/blocks/shell/shell-layout"
import { AnimatedSidebarClose } from "@/components/motion/animated-sidebar"
import { DemoStage } from "@/components/docs/demo-controls"

export default function ShellDemo() {
  return (
    <DemoStage controls={null} canvasClassName="w-full p-0">
      <div className="h-[42rem] w-full overflow-hidden rounded-lg border bg-background">
        <ShellLayout
          className="min-h-full"
          rightDrawer={<ShellDemoInspector />}
          variant="web"
        >
          <div className="grid gap-5">
            <div className="grid gap-5 lg:grid-cols-3">
              <DashboardCard label="Sources indexed" value="12,842" />
              <DashboardCard label="Open annotations" value="248" />
              <DashboardCard label="New insights" value="37" />
            </div>
            <div className="rounded-2xl border bg-background/70 p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-semibold">Active collection</h2>
                  <p className="text-sm text-muted-foreground">
                    Toggle the left rail and the right drawer from the header.
                  </p>
                </div>
                <SparklesIcon className="size-5 text-muted-foreground" />
              </div>
              <div className="grid gap-3">
                {[
                  "Codex Sinaiticus collation",
                  "P.Oxy fragment review",
                  "Marginalia extraction queue",
                ].map((item) => (
                  <div
                    className="rounded-xl border bg-card px-4 py-3 text-sm"
                    key={item}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ShellLayout>
      </div>
    </DemoStage>
  )
}

function ShellDemoInspector() {
  return (
    <>
      <div className="flex h-16 shrink-0 items-center justify-between gap-3 px-4">
        <span className="text-sm font-semibold">Inspector</span>
        <AnimatedSidebarClose
          aria-label="Close panel"
          className="text-muted-foreground hover:text-foreground"
          side="right"
        >
          <XIcon className="size-4" />
        </AnimatedSidebarClose>
      </div>
      <div className="min-h-0 flex-1 space-y-4 overflow-auto px-4 pb-4">
        {[
          { label: "Shelfmark", value: "Add. MS 43725" },
          { label: "Provenance", value: "Saint Catherine's Monastery" },
          { label: "Script", value: "Biblical majuscule" },
          { label: "Folios", value: "347" },
        ].map((field) => (
          <div key={field.label}>
            <div className="text-xs text-muted-foreground">{field.label}</div>
            <div className="mt-1 text-sm">{field.value}</div>
          </div>
        ))}
      </div>
    </>
  )
}

function DashboardCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-background/70 p-5 shadow-sm">
      <div className="text-sm text-muted-foreground">{label}</div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
    </div>
  )
}
