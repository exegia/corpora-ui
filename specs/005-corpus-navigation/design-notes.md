# Corpus navigation · Sketch handoff

Open **Corpus-Navigation.sketch**. The document contains nine artboards across Reading layouts, Schema & behavior, and Components. Text, shapes and icons remain editable. Four native symbol sources are included; 100 number cells in the layouts and schema examples use shared symbols with text overrides.

## Review in two minutes

1. Start at **Wide · Bible study**. Click the top reference field in Sketch Preview to open Quick jump; click the result or Esc control to return.
2. Start at **Compact · Quran reading**. Click the bottom location button, then **Read Al-Ikhlas 112:3**. The next screen highlights the ayah and offers **Return to 112:1**.
3. Inspect **Schema · Six corpus adapters** for the six corpus mappings and **Behavior · Responsive and motion** for interaction requirements.

These are linked design mockups. Text entry, keyboard shortcuts, filtering, scrolling, schema switching, and continuous resizing are specified rather than implemented. Prototype links were checked for valid destinations; a full interactive application or keyboard test was not performed.

## Two contrasting layout treatments

**Wide reading/research workspace · 1440 × 960.** A persistent hierarchical contents pane, a long-form reading column, and a context pane support browsing and exact reference entry at the same time. The selected chapter and verse are distinct. The current book expands into a chapter grid; surrounding books remain visible. Direct entry handles known references; chapter outlines help when the reader knows a subject instead.

**Compact reading surface · 390 × 844.** Arabic text gets the reading area. A fixed location control opens a bottom sheet with a searchable surah list and an optional ayah grid. A draft choice requires one explicit commit, preventing accidental jumps while exploring. A return action preserves the previous anchor. Arabic reading content is right-aligned; this mockup uses English interface chrome. A fully Arabic interface should mirror directional UI and isolate numeric references with bidirectional text handling.

**Intermediate view · 768 × 1024.** The same Bible location retains the reading column and a compact location bar. Contents moves to a drawer, and the context pane is secondary. The drawer state is specified, not separately linked.

## Schema mapping

| Corpus | Supported location path | Behavior |
| --- | --- | --- |
| Bible | Book → Chapter → optional Verse | Book order and verse ranges come from the selected canon and edition. |
| Quran | Surah → optional Ayah | Surah is the chapter level; omit a redundant book selector. Juz may be an alternate index, not a mandatory ancestor. |
| Book of Mormon | Book → Chapter → optional Verse | Same controls as Bible; use its own corpus order and bounds. Alma demonstrates a 63-chapter book. |
| Library book | Optional Section → optional Chapter → Page or stable text anchor → optional Paragraph | Paths skip absent levels. Display print pages only when the edition has a reliable page map. |
| Booklet | Optional Chapter → Page → optional Paragraph | The shown page-only example collapses directly to page selection. |
| Research paper | Page → optional Paragraph | A heading outline can be an alternate index. Paragraph addressing requires a reliable extraction map. |

Pagination in the library, booklet and paper examples is explicitly sample data. Bible excerpts are KJV; Quran Arabic is Al-Ikhlas. No invented academic text or claims are presented as research content.

## Interaction contract

**Search and keyboard.** ⌘/Ctrl K opens the location command. Recognized references appear before textual matches and are labeled separately. Up/Down changes the highlighted result, Enter commits, and Escape cancels and restores the trigger's focus. Avoid overriding browser shortcuts outside the reader. When a numeric grid has focus, arrows move among cells, Home/End reach its bounds, and Enter commits. Tab moves between controls, not through hundreds of cells.

**Hierarchy and scale.** The schema supplies ordered levels, IDs, names, aliases, direction, child counts, bounds and optional alternate indexes. Only the current branch expands. Long chapter or ayah lists use bounded ranges and direct entry, with the selected item retained. The six-card board shows excerpts of longer grids, not complete lists.

**Location model.** Keep committed location, draft selection, expanded branches, query and return history separate. Persist a stable corpus/edition/anchor identifier; do not use screen coordinates as the location. Switching corpus restores that corpus's last location. Changing edition must resolve the anchor or explain that no mapping exists. Do not silently convert pages into paragraphs or verse numbers across incompatible editions.

**Responsive rules use component width.** At 1200 px and above, show three panes where the available reading width permits. From 640–1199 px, use a contents drawer. Below 640 px, use the location sheet. At narrower embedding sizes or enlarged text, choose the compact mode earlier. Keep the text column near 60–70 characters. Honor device safe areas; let the sheet body scroll when the keyboard or larger text reduces height.

**State coverage for implementation.** While loading, preserve the location label and show a static skeleton in the changing list. A no-match query keeps the input and offers Clear search. An invalid reference reports the valid bound, for example “Al-Ikhlas has 4 ayahs.” An unavailable paragraph index removes that level and explains why. A fetch failure keeps the committed reading position and offers Retry. These exceptional states are specified here, not separate artboards.

## Motion and accessibility

Taste informed restrained color, spacing, consistent shapes and typography. MotionDesign informed purposeful transitions and a preflight review for legibility, clipping and state continuity. This is a reading interface: marketing-page heroes, decorative scroll pinning and animated text reveals would interfere with its purpose.

| Transition | Proposed duration | Purpose |
| --- | --- | --- |
| Open location sheet | 240 ms | Translate the sheet upward while fading its scrim; keep the reader stationary. |
| Change hierarchy level | 160 ms | Translate a short distance in the navigation direction; reverse on Back. |
| Commit a location | 180 ms | Dismiss the sheet, resolve the anchor and reveal the selected line. |
| Reduced motion | 0 ms | Apply the state immediately; preserve focus and selected-state color. |

Sketch uses native artboard transitions as an approximation. Exact independent sheet/scrim animation, focus management and reduced-motion handling require implementation. A future GSAP implementation should compose one cancellable timeline for each transition: animate transforms and opacity only, clear interrupted timelines, preserve the reading scroll position, and branch on `prefers-reduced-motion`. No GSAP runtime executes inside this Sketch document.

Primary mobile controls are at least 44 px. Small visual labels, icons and tabs need 44 px interaction wrappers in implementation. Make focus visible, use real dialog/listbox/grid semantics, announce selected locations, and trap focus only while a modal is open. Keep a Close button even if swipe dismissal is added. Body text is dark green on white or a pale neutral; the accent is reserved for actionable or selected states.

## Source research

Reviewed September 26, 2026. Findings below come from current official documentation and page structure, rather than a visual reproduction of each product. Design implications are our proposals.

| Source | Verified pattern | Applied decision |
| --- | --- | --- |
| [Logos: Navigate within your Bible](https://support.logos.com/hc/en-us/articles/360036510891-2-Navigate-within-Your-Bible) | Editable current-reference box, toggled contents, back/forward history and navigation by structural unit. | Keep direct reference entry, visible current location and reversible jumps. |
| [JW Library: Search in a Bible or publication](https://www.jw.org/en/online-help/jw-library/windows/search/) | Suggestions while typing, Enter to search, and result views including canonical book order. | Make search keyboard-friendly and distinguish location hits from textual results. |
| [Bible Gateway: Passage lookup](https://www.biblegateway.com/passage/) | Separate passage lookup and keyword search, with version selection. | Label reference jumps separately; keep edition/version outside the hierarchy. |
| [Quran.com](https://quran.com/) and [Al-Ikhlas](https://quran.com/al-ikhlas) | Search, surah and juz indexes, surah names/numbers, ayah counts and addressable verses. | Use surah → ayah, Arabic-capable content and optional alternate indexes. |
| [Church of Jesus Christ: Alma](https://www.churchofjesuschrist.org/study/scriptures/bofm/alma?lang=eng) | Corpus contents, chapters 1–63 and chapter summaries. | Keep the book hierarchy visible in wide mode; support long chapter ranges and topic context. |
| [Apple Books: Read books on iPhone](https://support.apple.com/guide/iphone/read-books-iphc1af7c57/ios) | Contents, search by words/phrases/page numbers, location return and contents scrubbing. | Unify the entry point while distinguishing result types; offer Return after a jump. |
| [Kindle: Table of contents navigation](https://kdp.amazon.com/en_US/help/topic/G201605710) | A logical contents hierarchy with parts, sections and chapters, available through Go To. | Derive the control from actual document structure rather than forcing three levels. |

Icons: [Phosphor](https://phosphoricons.com/), core 2.1.1, MIT license. Native Sketch API was used to create the editable document. Avenir Next, Georgia and Geeza Pro are local macOS fonts; fonts are not embedded.
