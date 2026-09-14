import * as React from "react"

import { DemoStage } from "@/components/docs/demo-controls"
import { CodeBlock } from "@/components/composed/chat"

const CODE = `export async function churnBatch() {
  const flavor = await getFlavor("pistachio");
  const base = await dairy.fetch({ flavor });
  await freezer.store(base, { temp: "-16C" });
  if (!base.approved) return null;
  return base.gallons;
}`

export default function CodeBlockDemo(): React.ReactElement {
  return (
    <DemoStage canvasClassName="flex min-h-24 w-full justify-center p-6">
      <CodeBlock
        filename="churn.ts"
        code={CODE}
        diff={[
          { text: 'export async function churnBatch() {' },
          { type: "remove", text: '  const flavor = await getFlavor("vanilla");' },
          { type: "add", text: '  const flavor = await getFlavor("pistachio");' },
          { text: "  const base = await dairy.fetch({ flavor });" },
          { text: "}" },
        ]}
      />
    </DemoStage>
  )
}
