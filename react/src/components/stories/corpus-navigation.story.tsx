"use client"

import { useEffect, useId, useRef, useState } from "react"
import { BookOpenText, Sidebar } from "lucide-react"
import { Group, Panel, Separator } from "motion-panels/react"
import { defineStory } from "@/registry/story"
import { BrowserFrame } from "@/components/docs/browser"
import { Button, Scaffold, useScaffold } from "@/library"
import Breadcrumb from "@/components/composed/breadcrumb"
import {
  useCanon,
  removeCanonInstance,
} from "@/components/composed/navigation/toc"
import { withChapterVerses } from "./corpus-reader-data"
import {
  ReaderLocationPicker,
  BibleTranslationPicker,
} from "./corpus-reader-pickers"
import { Reader, ReaderChapter } from "@/components/blocks/reader"
import { Skeleton } from "@/components/ui/skeleton"
import { useVisibleReference } from "@/lib/hooks/use-visible-reference"
import type { TCanonItem } from "@/components/composed/navigation/toc/type"
import {
  BIBLE_TRANSLATION,
  bibleApi,
  canonBooks,
  canonLocation,
  CanonPreview,
  fetchCanonItems,
  type CanonLocation,
} from "./toc.story"
import type { ApiTranslationBookChapter } from "free-use-bible-api"

interface Passage {
  readonly location: CanonLocation
  readonly chapter: ApiTranslationBookChapter
}

export default function CorpusNavigationDemo() {
  const scaffold = useScaffold()
  const canonId = useId()
  const canon = useCanon(canonId)
  const [width, setWidth] = useState(320)
  const [collapsed, setCollapsed] = useState(false)
  const [items, setItems] = useState<readonly TCanonItem[]>([])
  const [passage, setPassage] = useState<Passage>()
  const [status, setStatus] = useState("Loading books…")
  const [loading, setLoading] = useState(true)
  const [reader, setReader] = useState<HTMLDivElement | null>(null)
  const request = useRef(0)
  const lifetime = useRef({ generation: 0 })
  const [translation, setTranslation] = useState(BIBLE_TRANSLATION)
  const [loadingBooks, setLoadingBooks] = useState(true)
  const [editionError, setEditionError] = useState("")
  const translationButton = useRef<HTMLButtonElement>(null)
  const pendingScroll = useRef<{ verse?: number } | null>(null)
  const books = canonBooks(items)
  const currentBook = books.find((book) => book.id === passage?.location.bookId)
  const currentChapter = currentBook?.nodes?.find(
    (chapter) => chapter.number === passage?.location.chapter
  )

  const loadEdition = async (nextTranslation: string) => {
    if (nextTranslation === translation && passage) {
      scaffold.setInspectorOpen(false)
      translationButton.current?.focus({ preventScroll: true })
      return
    }
    const current = ++request.current
    setEditionError("")
    setLoading(true)
    setLoadingBooks(true)
    setStatus(`Loading ${nextTranslation}…`)
    try {
      const nextItems = await fetchCanonItems(nextTranslation)
      if (request.current !== current) return
      const availableBooks = canonBooks(nextItems)
      const book =
        availableBooks.find((entry) => entry.id === passage?.location.bookId) ??
        availableBooks[0]
      const chapterItem =
        book?.nodes?.find(
          (entry) => entry.number === passage?.location.chapter
        ) ?? book?.nodes?.[0]
      const location = chapterItem && canonLocation(chapterItem, nextItems)
      if (!location) throw new Error("No readable chapters")
      const chapter = await bibleApi.getTranslationBookChapter(
        nextTranslation,
        location.bookId,
        location.chapter
      )
      if (request.current !== current) return
      const verse =
        passage?.location.bookId === location.bookId &&
        passage.location.chapter === location.chapter &&
        chapter.chapter.content.some(
          (block) =>
            block.type === "verse" && block.number === passage.location.verse
        )
          ? passage.location.verse
          : undefined
      setTranslation(nextTranslation)
      setItems(withChapterVerses(nextItems, location.bookId, chapter))
      setPassage({ location: { ...location, verse }, chapter })
      pendingScroll.current = { verse }
      canon.reset()
      setStatus("")
      scaffold.setInspectorOpen(false)
      if (passage) translationButton.current?.focus({ preventScroll: true })
    } catch {
      if (request.current === current) {
        const message = `Could not load ${nextTranslation}. Please try again.`
        setStatus(message)
        setEditionError(message)
      }
    } finally {
      if (request.current === current) {
        setLoading(false)
        setLoadingBooks(false)
      }
    }
  }

  const loadPassage = async (location: CanonLocation) => {
    const current = ++request.current
    if (
      !loading &&
      passage?.chapter.translation.id === translation &&
      passage.location.bookId === location.bookId &&
      passage.location.chapter === location.chapter
    ) {
      pendingScroll.current = { verse: location.verse }
      setPassage({ ...passage, location })
      setStatus("")
      return
    }
    setLoading(true)
    setStatus(`Loading ${location.bookName} ${location.chapter}…`)
    try {
      const chapter = await bibleApi.getTranslationBookChapter(
        translation,
        location.bookId,
        location.chapter
      )
      if (request.current !== current) return
      setItems((currentItems) =>
        withChapterVerses(currentItems, location.bookId, chapter)
      )
      pendingScroll.current = { verse: location.verse }
      setPassage({ location, chapter })
      setStatus("")
    } catch {
      if (request.current === current) {
        setStatus(`Could not load ${location.bookName} ${location.chapter}.`)
      }
    } finally {
      if (request.current === current) setLoading(false)
    }
  }

  useEffect(() => {
    const ownedLifetime = lifetime.current
    const generation = ++ownedLifetime.generation

    async function loadInitialCanon() {
      await loadEdition(BIBLE_TRANSLATION)
    }

    void loadInitialCanon()
    return () => {
      request.current += 1
      queueMicrotask(() => {
        if (ownedLifetime.generation === generation)
          removeCanonInstance(canonId)
      })
    }
    // Load the default edition once. Later editions go through the picker.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canonId])

  useEffect(() => {
    if (!reader || loading || !passage || !pendingScroll.current) return
    const { verse } = pendingScroll.current
    const target =
      verse === undefined
        ? null
        : reader.querySelector<HTMLElement>(`[data-verse="${verse}"]`)
    if (verse !== undefined && !target) return
    pendingScroll.current = null
    reader.scrollTo({
      top: target
        ? reader.scrollTop +
          target.getBoundingClientRect().top -
          reader.getBoundingClientRect().top -
          32
        : 0,
      behavior:
        target && !window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "smooth"
          : "instant",
    })
  }, [reader, passage, loading])

  const reference = passage
    ? `${passage.chapter.book.commonName} ${passage.chapter.chapter.number}`
    : ""
  const visibleReference = useVisibleReference(reader, {
    label: reference,
    generation: passage,
    enabled: !loading && passage !== undefined,
  })

  const selectItem = (item: TCanonItem) => {
    const location = canonLocation(item, items)
    if (!location || loadingBooks) return
    const section = items.find((entry) =>
      entry.nodes?.some((book) => book.id === location.bookId)
    )
    if (section) canon.setSection(section.id)
    canon.select(item)
    canon.browse(
      item.type === "book"
        ? item.link
        : `#demo-${location.bookId}-${location.chapter}-chapter`
    )
    void loadPassage(location)
  }

  const renderBreadcrumb = () => {
    const book = passage?.chapter.book
    const chapter = passage?.chapter.chapter.number
    return (
      <div className="px-2 py-1 gap-2 flex w-full shrink-0 items-center border-b border-b-border">
        <Button
          variant="ghost"
          size="icon-lg"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? "Show navigator" : "Hide navigator"}
        >
          <Sidebar />
        </Button>
        <Breadcrumb.Root className="min-w-0 flex-1 overflow-x-auto">
          <Breadcrumb.List>
            <Breadcrumb.Item variant="link" label="Home" href="/" />
            <Breadcrumb.Separator variant="default" />
            <Breadcrumb.Item variant="link" href="/bibles" label="Bibles" />
            <Breadcrumb.Separator variant="default" />
            <ReaderLocationPicker
              title={passage?.chapter.translation.name ?? translation}
              label={book?.commonName ?? "Books"}
              items={books}
              selectedLink={currentBook?.link}
              disabled={loadingBooks}
              onSelect={selectItem}
            />
            {chapter !== undefined && (
              <>
                <Breadcrumb.Separator variant="default" />
                <ReaderLocationPicker
                  title={book?.commonName ?? "Chapters"}
                  label={`Chapter ${chapter}`}
                  items={currentBook?.nodes ?? []}
                  selectedLink={currentChapter?.link}
                  disabled={loadingBooks}
                  onSelect={selectItem}
                />
              </>
            )}
          </Breadcrumb.List>
        </Breadcrumb.Root>
        <Button
          ref={translationButton}
          variant="ghost"
          size="sm"
          className="min-w-0 max-w-[40%]"
          aria-label="Choose Bible translation"
          aria-expanded={scaffold.inspectorOpen}
          aria-controls="bible-translation-inspector"
          onClick={() => scaffold.setInspectorOpen(true)}
          title={passage?.chapter.translation.name ?? translation}
        >
          <BookOpenText className="mr-1.5 h-4 w-4 shrink-0" />
          <span className="truncate">
            {passage?.chapter.translation.name ?? translation}
          </span>
        </Button>
      </div>
    )
  }

  const renderStatusBar = () => (
    <div className="px-2 h-10 flex w-full shrink-0 items-center border-t border-t-border">
      <div className="flex w-full items-center justify-between">
        <div className="text-xs text-muted-foreground" role="status">
          {loading ? (
            <>
              <Skeleton
                aria-hidden="true"
                className="h-3 w-28 motion-reduce:animate-none"
              />
              <span className="sr-only">{status}</span>
            </>
          ) : (
            status || visibleReference
          )}
        </div>
        <div className="text-xs text-muted-foreground">{translation}</div>
      </div>
    </div>
  )

  const renderPassage = () => {
    if (loading) {
      return (
        <div className="max-w-3xl mx-auto" aria-hidden="true">
          <div className="mb-8 space-y-3">
            <Skeleton className="h-3 w-12 motion-reduce:animate-none" />
            <Skeleton className="h-6 w-40 mx-auto motion-reduce:animate-none" />
          </div>
          <div className="space-y-6">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-3 w-24 mx-auto motion-reduce:animate-none" />
                <Skeleton className="h-4 w-full motion-reduce:animate-none" />
                <Skeleton className="h-4 w-11/12 motion-reduce:animate-none" />
                <Skeleton className="h-4 w-4/5 motion-reduce:animate-none" />
              </div>
            ))}
          </div>
        </div>
      )
    }
    if (!passage) {
      return (
        <p className="text-sm text-muted-foreground">
          Choose a book or chapter to read it here.
        </p>
      )
    }
    return (
      <ReaderChapter
        chapter={passage.chapter}
        activeVerse={passage.location.verse}
        getVerseText={(verse) => bibleApi.getVerseText(verse)}
      />
    )
  }

  return (
    <BrowserFrame
      title="Corpus reader"
      titleStyle="hidden"
      className="min-h-0 relative h-[80dvh] max-h-[min(80dvh,56rem)] items-stretch select-none"
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
            <Scaffold.Tab key="draft">Corpus Navigator</Scaffold.Tab>
          </Scaffold.Actions>

          <Scaffold.Canvas>
            <Scaffold.Panel key="draft">
              <div className="min-h-0 h-full">
                <Group className="min-h-0 h-full">
                  <Panel
                    size={width}
                    minSize={220}
                    collapsed={collapsed}
                    onCollapsedChange={setCollapsed}
                    onSizeChange={setWidth}
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                    transition={{
                      bounce: 0.1,
                      duration: 0.2,
                      type: "tween",
                    }}
                    style={{ originX: 1 }}
                    className="min-h-0 p-4 border-r border-border"
                  >
                    <CanonPreview
                      fillHeight
                      canonId={canonId}
                      items={items}
                      loadingBooks={loadingBooks}
                      loadingChapter={loading}
                      translation={translation}
                      onItemSelect={selectItem}
                    />
                  </Panel>
                  <Separator />
                  <Panel className="min-h-0 flex flex-1 flex-col">
                    {renderBreadcrumb()}
                    <Reader
                      ref={setReader}
                      loading={loading}
                      tocCollapsed={collapsed}
                      verses={
                        currentChapter?.nodes?.filter(
                          (node) => node.type === "verse"
                        ) ?? []
                      }
                      activeVerse={passage?.location.verse}
                      onVerseSelect={selectItem}
                    >
                      {renderPassage()}
                    </Reader>
                    {renderStatusBar()}
                  </Panel>
                </Group>
              </div>
            </Scaffold.Panel>
          </Scaffold.Canvas>
          <Scaffold.Inspector
            id="bible-translation-inspector"
            surface="solid"
            minWidth={360}
            name="Bible translation"
            onKeyDown={(event) => {
              if (event.key === "Escape") {
                scaffold.setInspectorOpen(false)
                translationButton.current?.focus()
              }
            }}
          >
            {scaffold.inspectorOpen && (
              <BibleTranslationPicker
                selectedId={translation}
                busy={loadingBooks}
                selectionError={editionError}
                onSelect={(id) => void loadEdition(id)}
              />
            )}
          </Scaffold.Inspector>
        </Scaffold.Main>
      </Scaffold.Root>
    </BrowserFrame>
  )
}

export const story = defineStory({
  Component: CorpusNavigationDemo,
  centered: false,
})
export const Preview = story.WithControl
