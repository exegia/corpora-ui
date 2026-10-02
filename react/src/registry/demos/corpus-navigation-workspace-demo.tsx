"use client"
import { BrowserFrame } from "@/components/docs/browser"
import { useState } from "react"
import { BookOpenIcon, PanelRightIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Scaffold } from "@/components/blocks/scaffold"
import { CorpusNavigator } from "@/components/blocks/corpus-navigation"
import {
  anchorFor,
  formatReference,
} from "@/components/composed/corpus-navigation"
import { navigationSamples, firstReadingNode } from "./corpus-navigation-data"
export default function CorpusNavigationWorkspaceDemo() {
  const [inspectorOpen, setInspectorOpen] = useState(false)
  const data = navigationSamples[0]
  return (
    <BrowserFrame
      title="Research workspace"
      titleStyle="titlebar"
      className="not-prose"
    >
      <div className="h-168 w-full overflow-hidden">
        <Scaffold.Root
          inspectorOpen={inspectorOpen}
          onInspectorOpenChange={setInspectorOpen}
        >
          <Scaffold.Sidebar>
            <Button
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11"
              aria-label="Reading workspace"
            >
              <BookOpenIcon />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="min-h-11 min-w-11"
              aria-label="Toggle research context"
              aria-pressed={inspectorOpen}
              onClick={() => setInspectorOpen(!inspectorOpen)}
            >
              <PanelRightIcon />
            </Button>
          </Scaffold.Sidebar>
          <Scaffold.Main>
            <div className="min-h-0 p-3 flex-1 overflow-y-auto">
              <CorpusNavigator
                data={data}
                defaultLocation={anchorFor(data, firstReadingNode(data)!.id)}
                shortcut="focused"
              >
                {(state) => (
                  <article className="space-y-5 py-6">
                    <h3 className="text-2xl font-semibold">
                      {formatReference(data, state.location)}
                    </h3>
                    <p className="text-lg leading-relaxed">
                      In the beginning was the Word, and the Word was with God,
                      and the Word was God.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      A fixed KJV excerpt; the host owns reading content. The
                      surrounding rail and context panel reuse Scaffold.
                    </p>
                  </article>
                )}
              </CorpusNavigator>
            </div>
            <Scaffold.Inspector name="Research context">
              <div className="space-y-3 p-5">
                <h3 className="font-semibold">Research context</h3>
                <p className="text-sm text-muted-foreground">
                  Host notes and related sources belong here.
                </p>
                <Button
                  variant="outline"
                  onClick={() => setInspectorOpen(false)}
                >
                  Close context
                </Button>
              </div>
            </Scaffold.Inspector>
          </Scaffold.Main>
        </Scaffold.Root>
      </div>
    </BrowserFrame>
  )
}
