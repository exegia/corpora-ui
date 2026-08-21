import * as React from "react"

import {
  FileBadgeCfm,
  FileBadgeCorpus,
  FileBadgePdf,
  FileBadgeTei,
  FileBadgeTf,
  FileBadgeTxt,
  FileBadgeXml,
  FileWordmarkCfm,
  FileWordmarkCorpus,
  FileWordmarkPdf,
  FileWordmarkTei,
  FileWordmarkTf,
  FileWordmarkTxt,
  FileWordmarkXml,
} from "@/components/icons"
import {
  DemoSelect,
  DemoStage,
  DemoToggle,
} from "@/components/docs/demo-controls"
import { cn } from "@/lib/utils"

const SIZES = ["48", "64", "96"] as const

const FORMATS = [
  { name: "TEI", Badge: FileBadgeTei, Wordmark: FileWordmarkTei },
  { name: "XML", Badge: FileBadgeXml, Wordmark: FileWordmarkXml },
  { name: "TXT", Badge: FileBadgeTxt, Wordmark: FileWordmarkTxt },
  { name: "TF", Badge: FileBadgeTf, Wordmark: FileWordmarkTf },
  { name: "CFM", Badge: FileBadgeCfm, Wordmark: FileWordmarkCfm },
  { name: "PDF", Badge: FileBadgePdf, Wordmark: FileWordmarkPdf },
  { name: "Corpus", Badge: FileBadgeCorpus, Wordmark: FileWordmarkCorpus },
] as const

export default function FileIconsDemo() {
  const [size, setSize] = React.useState<(typeof SIZES)[number]>("64")
  const [dark, setDark] = React.useState(false)

  return (
    <DemoStage
      controls={
        <>
          <DemoSelect
            label="size"
            value={size}
            options={SIZES}
            onChange={setSize}
          />
          <DemoToggle label="dark" checked={dark} onChange={setDark} />
        </>
      }
    >
      {/* The `dark` class is all it takes: each icon's layers switch on
          Tailwind's dark variant, so scoping the class flips the artwork. */}
      <div
        className={cn(
          "flex w-full flex-col gap-8 rounded-lg p-6 transition-colors",
          dark && "dark bg-neutral-950"
        )}
      >
        {(["Badge", "Wordmark"] as const).map((family) => (
          <section key={family}>
            <h3 className="text-muted-foreground mb-4 text-sm font-medium">
              {family}
            </h3>
            <div className="grid grid-cols-4 gap-x-4 gap-y-6 sm:grid-cols-7">
              {FORMATS.map(({ name, Badge, Wordmark }) => {
                const Icon = family === "Badge" ? Badge : Wordmark
                return (
                  <figure
                    key={name}
                    className="flex flex-col items-center gap-2"
                  >
                    <Icon size={Number(size)} title={`${name} file`} />
                    <figcaption className="text-muted-foreground text-xs">
                      {name}
                    </figcaption>
                  </figure>
                )
              })}
            </div>
          </section>
        ))}
      </div>
    </DemoStage>
  )
}
