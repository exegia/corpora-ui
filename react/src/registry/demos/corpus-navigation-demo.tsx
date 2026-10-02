"use client"
import { BrowserFrame } from "@/components/docs/browser"
import { Scaffold, useScaffold } from "@/library"
import Breadcrumb from "@/components/composed/breadcrumb"
export default function CorpusNavigationDemo() {
  const scaffold = useScaffold()

  const renderCorpusNavigator = () => (
    <div>
      <div className="my-3 px-2 w-full border-b border-b-secondary">
        <Breadcrumb.Root>
          <span>test</span>
        </Breadcrumb.Root>
      </div>
    </div>
  )

  return (
    <div className="not-prose space-y-4 relative">
      <BrowserFrame
        title="Corpus reader"
        titleStyle="hidden"
        className="max-h-96 relative items-stretch"
      >
        <Scaffold.Root
          {...scaffold.providerProps}
          className="min-h-0 relative h-full flex-1"
        >
          <Scaffold.Sidebar className="h-full shrink-0">
            <div className="p-2"></div>
          </Scaffold.Sidebar>
          <Scaffold.Main>
            <Scaffold.Actions>
              <Scaffold.Tab key="draft">Draft</Scaffold.Tab>
            </Scaffold.Actions>

            <Scaffold.Canvas>
              <Scaffold.Panel key="draft">
                {renderCorpusNavigator()}
              </Scaffold.Panel>
            </Scaffold.Canvas>
          </Scaffold.Main>
        </Scaffold.Root>
      </BrowserFrame>
    </div>
  )
}
