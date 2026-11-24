import { Reader } from "@exegia/corpora-ui/reader"
import { useState } from "react"
import { Button } from "@exegia/corpora-ui/button"
import { CanonGrid, useCanon, type TCanonItem } from "@exegia/corpora-ui/toc"

const chapters: readonly TCanonItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: `chapter-${i + 1}`,
  type: "chapter",
  level: 2,
  label: String(i + 1),
  number: i + 1,
  link: `#consumer-${i + 1}-chapter`,
}))

function RemoteNavigation() {
  const canon = useCanon("consumer-navigation")
  return (
    <div className="navigation-remote">
      <Button variant="outline" onClick={() => canon.select(chapters[0])}>
        Select first chapter from external hook
      </Button>
      <span data-testid="navigation-anchor">
        {canon.selectedLink ?? "Choose a chapter"}
      </span>
    </div>
  )
}

export default function CorpusNavigationExample() {
  const [narrow, setNarrow] = useState(false)
  const canon = useCanon("consumer-navigation")
  return (
    <section
      aria-label="Corpus navigation example"
      className="workspace-section"
    >
      <h2>Navigate a corpus</h2>
      <p>
        This illustrative map exercises the published Canon grid, shared store
        and Reader.
      </p>
      <Button variant="outline" onClick={() => setNarrow(!narrow)}>
        {narrow ? "Use full width" : "Embed at 390px"}
      </Button>
      <RemoteNavigation />
      <div style={{ width: narrow ? 390 : "100%", maxWidth: "100%" }}>
        <CanonGrid
          items={chapters}
          selectedLink={canon.selectedLink}
          onLinkClick={canon.select}
          title="Chapters"
        />
        <Reader onVerseSelect={canon.select}>
          <p>Host reading content for {canon.selectedLink ?? "no chapter"}.</p>
        </Reader>
      </div>
    </section>
  )
}
