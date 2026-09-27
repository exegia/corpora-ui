import { useState } from "react"
import { Button } from "@exegia/corpora-ui/button"
import {
  CorpusNavigator,
  corpusSchemas,
  useCorpusNavigationActions,
  useCorpusNavigationState,
  type CorpusData,
} from "@exegia/corpora-ui/corpus-navigation"
const data: CorpusData = {
  corpusId: "consumer-paper",
  editionId: "Illustrative print map",
  label: "Research paper",
  schema: corpusSchemas.paper,
  nodes: Array.from({ length: 12 }, (_, i) => ({
    id: `page-${i + 1}`,
    level: "page",
    label: String(i + 1),
    reference: String(i + 1),
  })),
}
function RemoteNavigation() {
  const state = useCorpusNavigationState("consumer-navigation")
  const actions = useCorpusNavigationActions("consumer-navigation")
  return (
    <div className="navigation-remote">
      <Button variant="outline" onClick={actions.openPicker}>
        Browse from external hook
      </Button>
      <span data-testid="navigation-anchor">
        {state.location?.nodeId ?? "Choose a location"}
      </span>
    </div>
  )
}
export default function CorpusNavigationExample() {
  const [narrow, setNarrow] = useState(false)
  return (
    <section
      aria-label="Corpus navigation example"
      className="workspace-section"
    >
      <h2>Navigate a corpus</h2>
      <p>
        This illustrative map exercises the published package, shared store and
        inherited theme.
      </p>
      <Button variant="outline" onClick={() => setNarrow(!narrow)}>
        {narrow ? "Use full width" : "Embed at 390px"}
      </Button>
      <RemoteNavigation />
      <div style={{ width: narrow ? 390 : "100%", maxWidth: "100%" }}>
        <CorpusNavigator
          navigatorId="consumer-navigation"
          data={data}
          defaultLocation={{
            corpusId: data.corpusId,
            editionId: data.editionId,
            nodeId: "page-1",
          }}
        >
          {(state) => (
            <p>
              Host reading content for {state.location?.nodeId ?? "no page"}.
            </p>
          )}
        </CorpusNavigator>
      </div>
    </section>
  )
}
