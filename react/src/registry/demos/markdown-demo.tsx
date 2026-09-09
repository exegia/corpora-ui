import * as React from "react"

import { DemoStage } from "@/components/docs/demo-controls"
import { Markdown } from "@/components/composed/chat"

export const SAMPLE = `# Boundary check — ¶12

The walker keeps ¶12 inside **RC003**. Two defects were found in the sub-tree and one case feature is missing.

- Defect · orphaned clause after §12.4
- Defect · duplicated ref-id \`RC003-17\`
- Missing · case feature on node 30,102

\`\`\`
walker --check RC003 --node 30102
\`\`\``

export default function MarkdownDemo(): React.ReactElement {
  return (
    <DemoStage canvasClassName="flex min-h-24 w-full flex-wrap items-start justify-center gap-4 p-6">
      <Markdown markdownId="demo-preview" source={SAMPLE} />
      <Markdown markdownId="demo-markup" source={SAMPLE} defaultView="markup" />
    </DemoStage>
  )
}
