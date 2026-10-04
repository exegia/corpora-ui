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
import { Skeleton } from "@/components/ui/skeleton"
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
  const [visibleReference, setVisibleReference] = useState("")
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
    setVisibleReference("")
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
    setVisibleReference("")
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
    const current = ++request.current
    fetchCanonItems(BIBLE_TRANSLATION)
      .then(async (nextItems) => {
        if (request.current !== current) return
        const book = canonBooks(nextItems)[0]
        const location = book && canonLocation(book, nextItems)
        if (!location) throw new Error("No readable chapters")
        const chapter = await bibleApi.getTranslationBookChapter(
          BIBLE_TRANSLATION,
          location.bookId,
          location.chapter
        )
        if (request.current !== current) return
        setItems(withChapterVerses(nextItems, location.bookId, chapter))
        setPassage({ location, chapter })
        pendingScroll.current = {}
        setStatus("")
      })
      .catch(() => {
        if (request.current === current)
          setStatus("Could not load books from the Bible API.")
      })
      .finally(() => {
        if (request.current === current) {
          setLoading(false)
          setLoadingBooks(false)
        }
      })
    return () => {
      request.current += 1
      queueMicrotask(() => {
        if (ownedLifetime.generation === generation)
          removeCanonInstance(canonId)
      })
    }
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

  useEffect(() => {
    const article = reader?.querySelector("article")
    if (!reader || !article || !passage || loading) return

    const verses = Array.from(
      article.querySelectorAll<HTMLElement>("[data-verse]")
    )
    const reference = `${passage.chapter.book.commonName} ${passage.chapter.chapter.number}`
    let frame = 0
    const updateRange = () => {
      const viewport = reader.getBoundingClientRect()
      const top = viewport.top + reader.clientTop
      const bottom = top + reader.clientHeight
      const visible = verses.filter((verse) => {
        // Include partially visible verses at either edge of the reader.
        return Array.from(verse.getClientRects()).some(
          (bounds) =>
            bounds.height > 0 && bounds.bottom > top && bounds.top < bottom
        )
      })
      const first = visible[0]?.dataset.verse
      const last = visible.at(-1)?.dataset.verse
      setVisibleReference(
        first
          ? `${reference}:${first}${first === last ? "" : `-${last}`}`
          : reference
      )
    }
    const scheduleUpdate = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(updateRange)
    }

    scheduleUpdate()
    reader.addEventListener("scroll", scheduleUpdate, { passive: true })
    const observer = new ResizeObserver(scheduleUpdate)
    observer.observe(reader)
    observer.observe(article)
    return () => {
      cancelAnimationFrame(frame)
      reader.removeEventListener("scroll", scheduleUpdate)
      observer.disconnect()
    }
  }, [reader, passage, loading])

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
    const { chapter } = passage
    const activeVerse = passage.location.verse
    return (
      <article
        dir={chapter.translation.textDirection}
        className="max-w-3xl py-6 mx-auto"
      >
        <header className="mb-4">
          <h2 className="text-lg font-semibold text-center">
            {chapter.book.commonName} {chapter.chapter.number}
          </h2>
        </header>
        <div className="font-corpus text-base leading-6 selection:bg-indigo-700 dark:selection:bg-indigo-500 select-text">
          {chapter.chapter.content.map((block, index) => {
            if (block.type === "heading" || block.type === "hebrew_subtitle") {
              const text =
                block.type === "heading"
                  ? block.content.join(" ")
                  : bibleApi.getVerseText({
                      type: "verse",
                      number: 0,
                      content: block.content,
                    })
              return (
                <h3
                  key={`heading-${index}`}
                  className="my-3 text-xs leading-5 font-medium text-center font-sans text-muted-foreground"
                >
                  {text}
                </h3>
              )
            }
            if (block.type === "line_break") return null
            const active = block.number === activeVerse
            return (
              <span
                key={`${chapter.book.id}-${chapter.chapter.number}-${block.number}`}
                id={`verse-${block.number}`}
                data-verse={block.number}
                data-active={active || undefined}
                aria-current={active ? "location" : undefined}
                className="rounded-sm box-decoration-clone transition-colors data-active:bg-primary/15 data-active:text-foreground motion-reduce:transition-none"
              >
                <sup className="mr-1 text-xs font-sans text-muted-foreground">
                  {block.number}
                </sup>
                {bibleApi.getVerseText(block)}{" "}
              </span>
            )
          })}
        </div>
      </article>
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
                    <div
                      ref={setReader}
                      aria-busy={loading}
                      className="p-4 min-h-0 bg-white dark:bg-neutral-950/60 relative w-full flex-1 overflow-y-auto"
                    >
                      {renderPassage()}
                    </div>
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
