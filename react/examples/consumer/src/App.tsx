import { lazy, Suspense, useEffect, useState } from "react"
import { useAtom } from "jotai"
import { Button } from "@exegia/corpora-ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardPanel,
} from "@exegia/corpora-ui/card"
import { Input } from "@exegia/corpora-ui/input"
import { Label } from "@exegia/corpora-ui/label"
import { useExegiaStore } from "@exegia/corpora-ui/state"
import {
  Modal, ModalTrigger, ModalPopup, ModalTitle, ModalDescription, ModalClose,
  Tooltip, TooltipTrigger, TooltipPopup,
  Popover, PopoverTrigger, PopoverPopup, useToastManager,
} from "@exegia/corpora-ui/overlays"
import { readingStore, savedNotesAtom, notebookDetailsOpenAtom } from "./store"

const ReadingWorkspace = lazy(() => import("./ReadingWorkspace"))

export function App() {
  const [notes, setNotes] = useAtom(savedNotesAtom)
  const [detailsOpen, setDetailsOpen] = useAtom(notebookDetailsOpenAtom)
  const toast = useToastManager()
  const store = useExegiaStore()
  const [note, setNote] = useState("")
  const [dark, setDark] = useState(false)
  const [workspaceOpen, setWorkspaceOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])

  return (
    <main className="reading-room">
      <header className="masthead">
        <a className="wordmark" href="#reading">
          corpora<span> / reading room</span>
        </a>
        <Tooltip>
          <TooltipTrigger render={<Button
            variant="outline"
            aria-pressed={dark}
            onClick={() => setDark(!dark)}
          />}>
            {dark ? "Light mode" : "Dark mode"}
          </TooltipTrigger>
          <TooltipPopup>Change the reading theme</TooltipPopup>
        </Tooltip>
      </header>

      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">A place for close reading</p>
        <h1 id="page-title">Stay with the text.</h1>
        <p>Read a little. Notice something. Keep a thought for later.</p>
      </section>

      <div className="reading-grid">
        <Card id="reading" className="passage-card">
          <CardHeader>
            <p className="eyebrow">01 / A field note</p>
            <CardTitle>The space between words</CardTitle>
            <CardDescription>
              A short passage for your next observation.
            </CardDescription>
          </CardHeader>
          <CardPanel>
            <div className="passage">
              <p>
                A page is more than the words it holds. There are margins left
                open, marks made by another hand, and the quiet evidence of
                returning.
              </p>
              <p>Read once for what is said. Read again for what you notice.</p>
            </div>
            <div className="passage-footer">
              <span>Reading practice</span>
              <span>About 1 minute</span>
            </div>
          </CardPanel>
        </Card>

        <Card className="notes-card">
          <CardHeader>
            <p className="eyebrow">Your notebook</p>
            <CardTitle>Keep an observation</CardTitle>
            <CardDescription>
              Notes stay here while this page is open.
            </CardDescription>
          </CardHeader>
          <CardPanel>
            <form
              onSubmit={(event) => {
                event.preventDefault()
                if (!note.trim()) return
                setNotes((previous) => [...previous, note.trim()])
                setNote("")
                toast.add({ title: "Observation saved", type: "success" })
              }}
            >
              <Label htmlFor="observation">What caught your attention?</Label>
              <Input
                id="observation"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="The idea of returning to a page…"
                maxLength={240}
              />
              <Button type="submit" disabled={!note.trim()}>
                Save observation
              </Button>
            </form>
            <p className="note-count" role="status">
              {notes.length}{" "}
              {notes.length === 1 ? "observation" : "observations"} saved
            </p>
            {notes.length > 0 ? (
              <ol className="saved-notes">
                {notes.map((text, index) => (
                  <li key={index}>{text}</li>
                ))}
              </ol>
            ) : (
              <p className="empty-notes">Your first thought belongs here.</p>
            )}
          </CardPanel>
        </Card>
      </div>

      <section className="workspace-section" aria-labelledby="workspace-title">
        <h2 id="workspace-title">Room to compare</h2>
        <p>Keep the passage, your observations, and a reference side by side.</p>
        <Button variant="outline" aria-expanded={workspaceOpen}
          onClick={() => setWorkspaceOpen(!workspaceOpen)}>
          {workspaceOpen ? "Close reading workspace" : "Open reading workspace"}
        </Button>
        {workspaceOpen && <Suspense fallback={<p role="status">Opening your workspace…</p>}>
          <ReadingWorkspace />
        </Suspense>}
      </section>

      <footer className="page-footer">
        <Modal open={detailsOpen} onOpenChange={setDetailsOpen}>
          <ModalTrigger render={<Button variant="ghost" />}>Notebook details</ModalTrigger>
          <ModalPopup>
            <ModalTitle className="notebook-modal-title">Your reading notebook</ModalTitle>
            <ModalDescription className="notebook-modal-description">
              {notes.length} {notes.length === 1 ? "observation" : "observations"} saved in this session. Notes disappear when you reload the page.
            </ModalDescription>
            <ModalClose render={<Button />}>Back to reading</ModalClose>
          </ModalPopup>
        </Modal>
        <Popover>
          <PopoverTrigger render={<Button variant="ghost" />}>About this example</PopoverTrigger>
          <PopoverPopup className="notebook-about">
            <p>A small notebook built with Corpora UI. One provider supplies its overlays and shared state.</p>
          </PopoverPopup>
        </Popover>
        <span data-testid="provider-status">
          {store === readingStore
            ? "Shared provider connected"
            : "Provider mismatch"}
        </span>
      </footer>
    </main>
  )
}
