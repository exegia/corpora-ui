"use client"

import { useEffect, useRef, useState } from "react"
import { BookOpenText, Sidebar } from "lucide-react"
import { Group, Panel, Separator } from "motion-panels/react"
import { defineStory } from "@/registry/story"
import { BrowserFrame } from "@/components/docs/browser"
import { Button, Scaffold, useScaffold } from "@/library"
import Breadcrumb from "@/components/composed/breadcrumb"
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
  const [width, setWidth] = useState(320)
  const [collapsed, setCollapsed] = useState(false)
  const [items, setItems] = useState<readonly TCanonItem[]>([])
  const [passage, setPassage] = useState<Passage>()
  const [status, setStatus] = useState("Loading books…")
  const [loading, setLoading] = useState(true)
  const request = useRef(0)

  const loadPassage = async (location: CanonLocation) => {
    const current = ++request.current
    setLoading(true)
    setStatus(`Loading ${location.bookName} ${location.chapter}…`)
    try {
      const chapter = await bibleApi.getTranslationBookChapter(
        BIBLE_TRANSLATION,
        location.bookId,
        location.chapter
      )
      if (request.current !== current) return
      setPassage({ location, chapter })
      setStatus(
        `${chapter.book.commonName} ${chapter.chapter.number} · ${chapter.numberOfVerses} verses`
      )
    } catch {
      if (request.current === current) {
        setStatus(`Could not load ${location.bookName} ${location.chapter}.`)
      }
    } finally {
      if (request.current === current) setLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    fetchCanonItems()
      .then((next) => {
        if (!active) return
        setItems(next)
        const genesis = canonBooks(next)[0]
        const location = genesis && canonLocation(genesis, next)
        if (location) void loadPassage(location)
        else setLoading(false)
      })
      .catch(() => {
        if (active) {
          setStatus("Could not load books from the Bible API.")
          setLoading(false)
        }
      })
    return () => {
      active = false
      request.current += 1
    }
  }, [])

  const selectItem = (item: TCanonItem) => {
    const location = canonLocation(item, items)
    if (location) void loadPassage(location)
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
            <Breadcrumb.Item
              variant="link"
              href={`/bibles/${book?.id ?? "GEN"}`}
              label={book?.commonName ?? "Genesis"}
            />
            {chapter !== undefined && (
              <>
                <Breadcrumb.Separator variant="default" />
                <Breadcrumb.Item
                  variant="link"
                  href={`/bibles/${book?.id}/${chapter}`}
                  label={`Chapter ${chapter}`}
                />
              </>
            )}
          </Breadcrumb.List>
        </Breadcrumb.Root>
        <p
          className="min-w-0 px-4 text-sm font-medium flex items-center truncate"
          title={passage?.chapter.translation.name ?? BIBLE_TRANSLATION}
        >
          <BookOpenText className="mr-1.5 h-4 w-4 shrink-0" />
          {passage?.chapter.translation.name ?? BIBLE_TRANSLATION}
        </p>
      </div>
    )
  }

  const renderStatusBar = () => (
    <div className="px-2 h-10 flex w-full shrink-0 items-center border-t border-t-border">
      <div className="flex w-full items-center justify-between">
        <div className="text-xs text-muted-foreground" role="status">
          {status}
        </div>
        <div className="text-xs text-muted-foreground">{BIBLE_TRANSLATION}</div>
      </div>
    </div>
  )

  const renderPassage = () => {
    if (loading) {
      return (
        <div className="max-w-3xl mx-auto" aria-hidden="true">
          <div className="mb-8 space-y-3">
            <Skeleton className="h-3 w-12 motion-reduce:animate-none" />
            <Skeleton className="h-6 w-40 motion-reduce:animate-none" />
          </div>
          <div className="space-y-6">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="space-y-3">
                <Skeleton className="h-4 w-32 motion-reduce:animate-none" />
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
      <article className="max-w-3xl mx-auto">
        <header className="mb-6">
          <p className="text-xs text-muted-foreground">
            {chapter.translation.shortName ?? BIBLE_TRANSLATION}
          </p>
          <h2 className="text-lg font-semibold">
            {chapter.book.commonName} {chapter.chapter.number}
          </h2>
        </header>
        <div className="gap-3 text-sm leading-7 flex flex-col">
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
                <h3 key={`heading-${index}`} className="font-medium">
                  {text}
                </h3>
              )
            }
            if (block.type === "line_break") return null
            const active = block.number === activeVerse
            return (
              <p
                key={`${chapter.book.id}-${chapter.chapter.number}-${block.number}`}
                id={`verse-${block.number}`}
                className={active ? "rounded px-1 bg-muted/60" : undefined}
              >
                <sup className="mr-1 text-xs text-muted-foreground">
                  {block.number}
                </sup>
                {bibleApi.getVerseText(block)}
              </p>
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
                    <CanonPreview fillHeight onItemSelect={selectItem} />
                  </Panel>
                  <Separator />
                  <Panel className="min-h-0 flex flex-1 flex-col">
                    {renderBreadcrumb()}
                    <div
                      aria-busy={loading}
                      className="p-4 min-h-0 relative w-full flex-1 overflow-y-auto bg-background"
                    >
                      {renderPassage()}
                    </div>
                    {renderStatusBar()}
                  </Panel>
                </Group>
              </div>
            </Scaffold.Panel>
          </Scaffold.Canvas>
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
