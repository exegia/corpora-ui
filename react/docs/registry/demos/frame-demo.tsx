import { CircleAlertIcon } from "lucide-react"
import * as React from "react"

import { DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card"
import { Frame, FrameFooter } from "@/components/ui/frame"

export default function FrameDemo() {
  const [footer, setFooter] = React.useState(true)

  return (
    <DemoStage
      controls={
        <DemoToggle label="footer" checked={footer} onChange={setFooter} />
      }
    >
      <Frame className="w-full max-w-xs">
        <Card>
          <CardHeader>
            <CardTitle>Create project</CardTitle>
            <CardDescription>Deploy your new project in one-click.</CardDescription>
          </CardHeader>
          <CardPanel className="text-sm text-muted-foreground">
            Framed cards sit raised above the muted frame surface.
          </CardPanel>
        </Card>
        {footer && (
          <FrameFooter>
            <div className="flex gap-1 text-muted-foreground text-xs">
              <CircleAlertIcon className="size-3 h-lh shrink-0" />
              <p>This will take a few seconds to complete.</p>
            </div>
          </FrameFooter>
        )}
      </Frame>
    </DemoStage>
  )
}
