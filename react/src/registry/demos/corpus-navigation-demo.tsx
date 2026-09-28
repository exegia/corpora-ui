"use client"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { CorpusNavigator } from "@/components/blocks/corpus-navigation"
import {
  anchorFor,
  formatReference,
} from "@/components/composed/corpus-navigation"
import { navigationSamples, firstReadingNode } from "./corpus-navigation-data"
export default function CorpusNavigationDemo({
  initialWidth = 0,
}: {
  initialWidth?: number
}) {
  const [sample, setSample] = useState(0)
  const [width, setWidth] = useState(initialWidth)
  const data = navigationSamples[sample]
  const first = firstReadingNode(data)
  return (
    <div className="not-prose space-y-4">
      <div
        className="gap-2 flex flex-wrap"
        role="group"
        aria-label="Corpus samples"
      >
        {navigationSamples.map((corpus, index) => (
          <Button
            key={corpus.corpusId}
            variant={sample === index ? "default" : "outline"}
            className="min-h-11"
            aria-pressed={sample === index}
            onClick={() => setSample(index)}
          >
            {corpus.label}
          </Button>
        ))}
      </div>
      <div
        className="gap-2 flex flex-wrap items-center"
        role="group"
        aria-label="Container width"
      >
        <span className="text-xs text-muted-foreground">Embed width</span>
        {[0, 320, 390, 768, 1440].map((size) => (
          <Button
            key={size}
            variant="ghost"
            aria-pressed={width === size}
            onClick={() => setWidth(size)}
            className="min-h-11"
          >
            {size || "Fluid"}
          </Button>
        ))}
      </div>
      <div className="max-w-full overflow-x-auto">
        <div
          style={{
            width: width || "100%",
            maxWidth: width ? undefined : "100%",
          }}
        >
          <CorpusNavigator
            data={data}
            defaultLocation={first ? anchorFor(data, first.id) : null}
            shortcut="global"
            contextSlot={
              <div className="space-y-3">
                <h3 className="font-semibold">About this sample</h3>
                <p className="text-muted-foreground">
                  Navigation excerpts show the hierarchy. Books, booklets and
                  papers use illustrative page maps.
                </p>
                <p className="text-muted-foreground">
                  The host supplies text, routes, annotations and edition
                  bounds.
                </p>
              </div>
            }
          >
            {(state) => (
              <article className="max-w-prose space-y-5 py-6 mx-auto">
                <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                  {data.schema.label}
                </p>
                <h2 className="text-3xl font-semibold tracking-tight">
                  <bdi>{formatReference(data, state.location)}</bdi>
                </h2>
                {data.corpusId === "bible" ? (
                  <p className="text-lg leading-relaxed">
                    In the beginning was the Word, and the Word was with God,
                    and the Word was God.
                  </p>
                ) : data.corpusId === "quran" ? (
                  <p lang="ar" className="text-3xl leading-loose">
                    قُلْ هُوَ ٱللَّهُ أَحَدٌ
                  </p>
                ) : (
                  <p className="text-lg leading-relaxed">
                    A reading surface supplied by the host application.
                  </p>
                )}
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Browse another location without losing your place. Choose Go
                  to location to commit; Return takes you back. This sample
                  keeps the excerpt text fixed so navigation and rendering
                  remain separate.
                </p>
              </article>
            )}
          </CorpusNavigator>
        </div>
      </div>
    </div>
  )
}
