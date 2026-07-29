import * as React from "react"

import { DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card"
import { Frame, FrameFooter } from "@/components/ui/frame"

export default function CardDemo() {
  const [header, setHeader] = React.useState(true)
  const [footer, setFooter] = React.useState(true)
  const [framed, setFramed] = React.useState(false)

  const card = (
    <Card className={framed ? undefined : "w-full max-w-xs"}>
      {header && (
        <CardHeader className={framed ? undefined : "border-b"}>
          <CardTitle>Codex Vaticanus</CardTitle>
          <CardDescription>4th-century Greek manuscript</CardDescription>
        </CardHeader>
      )}
      <CardPanel className="text-sm text-muted-foreground">
        One of the oldest extant manuscripts of the Greek Bible, held in the
        Vatican Library.
      </CardPanel>
      {footer && !framed && (
        <CardFooter className="border-t">
          <Button size="sm" variant="outline">
            Consult
          </Button>
        </CardFooter>
      )}
    </Card>
  )

  return (
    <DemoStage
      controls={
        <>
          <DemoToggle label="header" checked={header} onChange={setHeader} />
          <DemoToggle label="footer" checked={footer} onChange={setFooter} />
          <DemoToggle label="framed" checked={framed} onChange={setFramed} />
        </>
      }
    >
      {framed ? (
        // p-card-8 composition: raised card in a muted frame, footer in the
        // frame strip below the card.
        <Frame className="w-full max-w-xs">
          {card}
          {footer && (
            <FrameFooter className="flex justify-end">
              <Button size="sm" variant="outline">
                Consult
              </Button>
            </FrameFooter>
          )}
        </Frame>
      ) : (
        card
      )}
    </DemoStage>
  )
}
