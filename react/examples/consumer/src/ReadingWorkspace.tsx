import { useEffect, useRef } from "react"
import { useAtomValue } from "jotai"
import { ShellLayout, useShellPanels } from "@exegia/corpora-ui/shell"
import { Scaffold, useScaffoldActions, useScaffoldState } from "@exegia/corpora-ui/scaffold"
import { Button } from "@exegia/corpora-ui/button"
import { savedNotesAtom } from "./store"

export default function ReadingWorkspace() {
  const notes = useAtomValue(savedNotesAtom)
  const shell = useShellPanels({ shellId: "reading-shell" })
  const scaffold = useScaffoldState("reading-scaffold")
  const actions = useScaffoldActions("reading-scaffold")
  const inspectorTrigger = useRef<HTMLButtonElement>(null)
  const referenceTrigger = useRef<HTMLButtonElement>(null)
  const wasInspectorOpen = useRef(false)
  const wasReferenceOpen = useRef(false)

  // These are non-modal layout panels. Return focus when their close buttons
  // or Escape hide them, without trapping focus inside the workspace.
  useEffect(() => {
    if (wasInspectorOpen.current && !scaffold.inspectorOpen) inspectorTrigger.current?.focus()
    wasInspectorOpen.current = scaffold.inspectorOpen
  }, [scaffold.inspectorOpen])
  useEffect(() => {
    if (wasReferenceOpen.current && !shell.open.right) referenceTrigger.current?.focus()
    wasReferenceOpen.current = shell.open.right
  }, [shell.open.right])

  return (
    <div id="reading-workspace" onKeyDown={(event) => {
      if (event.key !== "Escape") return
      if (scaffold.inspectorOpen) {
        event.stopPropagation()
        actions.setInspectorOpen(false)
      } else if (shell.open.right) {
        event.stopPropagation()
        shell.setOpen(false, "right")
      }
    }}>
      <div className="workspace-controls">
        <Button ref={referenceTrigger} variant="outline"
          disabled={shell.isNarrow} aria-expanded={shell.open.right}
          onClick={() => shell.toggle("right")}>
          Reference panel
        </Button>
        <Button ref={inspectorTrigger} variant="outline"
          aria-expanded={scaffold.inspectorOpen} aria-controls="scaffold-inspector"
          onClick={actions.toggleInspector}>
          Notebook inspector
        </Button>
        <span role="status">{notes.length} saved · Inspector {scaffold.inspectorOpen ? "open" : "closed"}</span>
      </div>
      {shell.isNarrow && <p className="workspace-hint">The reference panel needs a wider window. Your notebook inspector is still available.</p>}
      <div className="workspace-stage">
        <ShellLayout {...shell.providerProps} variant="web"
          header={<span>Reading desk</span>}
          panels={{ right: {
            id: "reading-reference", name: "Reading reference", side: "right", open: false,
            component: <div className="workspace-content">
              <h3>A closer look</h3>
              <p>Read once for what is said. Read again for what you notice.</p>
              <Button variant="outline" onClick={() => shell.setOpen(false, "right")}>Close reference</Button>
            </div>,
          } }}>
          <Scaffold.Root scaffoldId="reading-scaffold" inspectorWidth={280}>
            <Scaffold.Main>
              <Scaffold.Actions>
                <Scaffold.Tab panelId="workspace-passage">Passage</Scaffold.Tab>
                <Scaffold.Tab panelId="workspace-notes">Notes</Scaffold.Tab>
              </Scaffold.Actions>
              <Scaffold.Canvas>
                <Scaffold.Panel id="workspace-passage" name="Reading passage">
                  <div className="workspace-content">
                    <p className="eyebrow">The space between words</p>
                    <h3>Stay with the text.</h3>
                    <p className="workspace-quotation">A page is more than the words it holds. There are margins left open, marks made by another hand, and the quiet evidence of returning.</p>
                  </div>
                </Scaffold.Panel>
                <Scaffold.Panel id="workspace-notes" name="Saved observations">
                  <div className="workspace-content">
                    <h3>Your observations</h3>
                    {notes.length ? <ol className="saved-notes">{notes.map((note, index) => <li key={index}>{note}</li>)}</ol>
                      : <p>Save an observation in the notebook above to see it here.</p>}
                  </div>
                </Scaffold.Panel>
              </Scaffold.Canvas>
              <Scaffold.Inspector name="Notebook inspector">
                <div className="workspace-content">
                  <h3>This reading session</h3>
                  <p>{notes.length} {notes.length === 1 ? "observation" : "observations"} saved.</p>
                  <p>{notes.at(-1) ?? "Your first thought belongs here."}</p>
                  <p>Notes stay available when panels close. Reloading clears this session.</p>
                </div>
              </Scaffold.Inspector>
            </Scaffold.Main>
          </Scaffold.Root>
        </ShellLayout>
      </div>
    </div>
  )
}
