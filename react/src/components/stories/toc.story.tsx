"use client"

import { useEffect, useRef, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { TOC } from "@/components/composed/navigation"
import type {
  ITocProps,
  TCanonItem,
  TTocItem,
} from "@/components/composed/navigation/toc/type"
import { OSIS_BOOKS } from "@/lib/canonical"
import { defineStory } from "@/registry/story"
import {
  FreeUseBibleApi,
  type ApiTranslationBook,
  type ApiTranslationBookChapter,
  type BookId,
} from "free-use-bible-api"

/** Public-domain translation used by the corpus demos. */
export const BIBLE_TRANSLATION = "BSB"

export const bibleApi = new FreeUseBibleApi()

export interface CanonLocation {
  readonly bookId: BookId
  readonly bookName: string
  readonly chapter: number
  readonly verse?: number
}

function isBookId(value: string): value is BookId {
  return Object.hasOwn(OSIS_BOOKS, value)
}

function sectionId(
  apocryphal: boolean,
  bookNumber: number | undefined
): string {
  if (apocryphal || bookNumber === undefined) return "demo-apocrypha"
  return bookNumber <= 39 ? "demo-ot" : "demo-nt"
}

type CanonBook = TCanonItem<number, BookId, "book">

function bookItem(book: ApiTranslationBook): CanonBook | undefined {
  if (!isBookId(book.id)) return undefined
  const bookId = book.id
  const metadata = OSIS_BOOKS[bookId]
  const chapters = Array.from(
    { length: book.numberOfChapters },
    (_, index) => book.firstChapterNumber + index
  )
  return {
    id: bookId,
    label: metadata.name,
    abbreviation: bookId,
    number: metadata.bookNumber ?? book.order,
    link: `#demo-${bookId}-book`,
    level: 2,
    type: "book",
    nodes: chapters.map((chapter) => ({
      id: `${bookId}-${chapter}`,
      label: `${metadata.name} ${chapter}`,
      abbreviation: bookId,
      number: chapter,
      link: `#demo-${bookId}-${chapter}-chapter`,
      level: 3,
      type: "chapter",
    })),
  }
}

function section(
  id: string,
  label: string,
  nodes: readonly CanonBook[]
): TCanonItem {
  return {
    id,
    label,
    link: `#${id}-section`,
    level: 1,
    type: "section",
    nodes,
  }
}

/**
 * Books and their chapters for a translation, grouped into canon sections.
 * Chapter counts come from `getTranslationBooks`; verse lists are not part of
 * that payload, so they load with the selected chapter instead.
 */
export async function fetchCanonItems(
  translation: string = BIBLE_TRANSLATION
): Promise<readonly TCanonItem[]> {
  const { books } = await bibleApi.getTranslationBooks(translation)
  const grouped = new Map<string, CanonBook[]>()
  for (const book of books) {
    const item = bookItem(book)
    if (!item) continue
    const id = sectionId(book.isApocryphal === true, item.number)
    const items = grouped.get(id) ?? []
    items.push(item)
    grouped.set(id, items)
  }
  return [
    section("demo-ot", "Old Testament", grouped.get("demo-ot") ?? []),
    section("demo-nt", "New Testament", grouped.get("demo-nt") ?? []),
    section("demo-apocrypha", "Apocrypha", grouped.get("demo-apocrypha") ?? []),
  ].filter((item) => item.nodes?.length)
}

function isBook(item: TCanonItem): item is CanonBook {
  return (
    item.type === "book" &&
    item.abbreviation !== undefined &&
    isBookId(item.abbreviation)
  )
}

/** Books directly under the canon sections. */
export function canonBooks(items: readonly TCanonItem[]): readonly CanonBook[] {
  const books: CanonBook[] = []
  for (const item of items) {
    for (const node of item.nodes ?? []) {
      if (isBook(node)) books.push(node)
    }
  }
  return books
}

/** Book, chapter, and optional verse behind a canon outline item. */
export function canonLocation(
  item: TCanonItem,
  items: readonly TCanonItem[] = []
): CanonLocation | undefined {
  const abbreviation = item.abbreviation
  if (!abbreviation || !isBookId(abbreviation)) return undefined
  const book =
    canonBooks(items).find(
      (candidate) => candidate.abbreviation === abbreviation
    ) ?? (isBook(item) ? item : undefined)
  if (!book) return undefined
  const chapter = chapterNumber(item, book)
  if (chapter === undefined) return undefined
  return {
    bookId: abbreviation,
    bookName: String(book.label),
    chapter,
    verse: item.type === "verse" ? item.number : undefined,
  }
}

function chapterNumber(item: TCanonItem, book: CanonBook): number | undefined {
  if (item.type === "chapter") return item.number
  if (item.type === "verse") {
    const match = item.id.match(/-(\d+)-\d+$/)
    return match ? Number(match[1]) : book.nodes?.[0]?.number
  }
  return book.nodes?.[0]?.number
}

/** A translation chapter, with verses flattened to plain text. */
export async function fetchChapterPassage(
  bookId: BookId,
  chapter: number,
  translation: string = BIBLE_TRANSLATION
): Promise<ApiTranslationBookChapter> {
  return bibleApi.getTranslationBookChapter(translation, bookId, chapter)
}

const regularItems: TTocItem[] = [
  {
    id: "demo-handbook",
    label: "Research handbook",
    link: "#demo-handbook-book",
    level: 1,
    type: "book",
    nodes: [
      {
        id: "demo-foundations",
        label: "Part I: Foundations",
        link: "#demo-foundations-section",
        level: 2,
        type: "section",
        nodes: [
          {
            id: "demo-reading",
            label: "Chapter 1: Reading a corpus",
            link: "#demo-reading-chapter",
            level: 3,
            type: "chapter",
            nodes: [
              {
                id: "demo-text",
                label: "Paragraph 1: Establish the text",
                link: "#demo-text-paragraph",
                level: 4,
                type: "paragraph",
              },
              {
                id: "demo-context",
                label: "Paragraph 2: Read in context",
                link: "#demo-context-paragraph",
                level: 4,
                type: "paragraph",
              },
            ],
          },
          {
            id: "demo-comparison",
            label: "Chapter 2: Comparing passages",
            link: "#demo-comparison-chapter",
            level: 3,
            type: "chapter",
            nodes: [
              {
                id: "demo-variants",
                label: "Paragraph 1: Record variants",
                link: "#demo-variants-paragraph",
                level: 4,
                type: "paragraph",
              },
            ],
          },
        ],
      },
    ],
  },
]

export function CanonPreview({
  onItemSelect,
  fillHeight = false,
  items: suppliedItems,
  loadingBooks: suppliedLoadingBooks,
  loadingChapter: suppliedLoadingChapter,
  translation = BIBLE_TRANSLATION,
  canonId,
}: {
  onItemSelect?: ITocProps<"canon">["onLinkClick"]
  fillHeight?: boolean
  items?: readonly TCanonItem[]
  loadingBooks?: boolean
  loadingChapter?: boolean
  translation?: string
  canonId?: string
}) {
  const [localItems, setItems] = useState<readonly TCanonItem[]>([])
  const [status, setStatus] = useState("Loading books…")
  const [message, setMessage] = useState("")
  const [localLoadingBooks, setLoadingBooks] = useState(true)
  const [localLoadingChapter, setLoadingChapter] = useState(false)
  const chapterRequest = useRef(0)
  const items = suppliedItems ?? localItems
  const loadingBooks = suppliedLoadingBooks ?? localLoadingBooks
  const loadingChapter = suppliedLoadingChapter ?? localLoadingChapter

  useEffect(() => {
    if (suppliedItems !== undefined) return
    let active = true
    fetchCanonItems(translation)
      .then((next) => {
        if (!active) return
        setItems(next)
        const count = next.reduce(
          (total, item) => total + (item.nodes?.length ?? 0),
          0
        )
        setStatus(`${count} books in ${translation}`)
      })
      .catch(() => {
        if (active) setStatus("Could not load books from the Bible API.")
      })
      .finally(() => {
        if (active) setLoadingBooks(false)
      })
    return () => {
      active = false
      chapterRequest.current += 1
    }
  }, [suppliedItems, translation])

  const selectItem = (item: TCanonItem) => {
    if (suppliedItems !== undefined) {
      onItemSelect?.(item)
      return
    }
    const current = ++chapterRequest.current
    setLoadingChapter(false)
    const location = canonLocation(item, items)
    setMessage(
      location
        ? `Selected ${location.bookName} ${location.chapter}${
            location.verse ? `:${location.verse}` : ""
          }`
        : `Selected ${String(item.label)}`
    )
    if (onItemSelect) onItemSelect(item)
    if (!location || item.type === "book") return
    setLoadingChapter(true)
    fetchChapterPassage(location.bookId, location.chapter, translation)
      .then((passage) => {
        if (chapterRequest.current !== current) return
        setMessage(
          `${passage.book.commonName} ${passage.chapter.number} · ${passage.numberOfVerses} verses`
        )
      })
      .catch(() => {
        if (chapterRequest.current === current) {
          setMessage(`Could not load ${location.bookName} ${location.chapter}.`)
        }
      })
      .finally(() => {
        if (chapterRequest.current === current) setLoadingChapter(false)
      })
  }

  return (
    <div
      className={
        fillHeight
          ? "min-h-0 gap-2 flex h-full w-full flex-col"
          : "max-w-lg p-2 sm:p-6 relative mx-auto w-full"
      }
      data-toc-demo="canon"
    >
      {loadingBooks || (suppliedItems !== undefined && loadingChapter) ? (
        <div
          aria-busy="true"
          aria-label="Loading table of contents"
          className={
            fillHeight
              ? "min-h-0 gap-3 flex flex-1 flex-col overflow-hidden"
              : "h-128 gap-3 flex flex-col overflow-hidden"
          }
        >
          <h1 className="text-lg font-bold shrink-0">Table of Content</h1>
          <div
            aria-hidden="true"
            className="min-h-0 gap-3 flex flex-1 flex-col"
          >
            <Skeleton className="h-9 w-full shrink-0 motion-reduce:animate-none" />
            <div className="gap-2 py-2 flex shrink-0">
              <Skeleton className="h-4 w-24 motion-reduce:animate-none" />
              <Skeleton className="h-4 w-24 motion-reduce:animate-none" />
            </div>
            <div className="min-h-0 overflow-hidden">
              <div className="gap-2 grid grid-cols-5">
                {Array.from({ length: 40 }, (_, index) => (
                  <Skeleton
                    key={index}
                    className="min-h-12 aspect-square w-full motion-reduce:animate-none"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <TOC.Canonical
          canonId={canonId}
          className={fillHeight ? "min-h-0 h-auto max-w-none flex-1" : "h-128"}
          items={items}
          onLinkClick={selectItem}
          contextMenuItems={[
            {
              id: "open",
              label: "Open location",
              onSelect: (item) => setMessage(`Opened ${String(item.label)}`),
            },
            {
              id: "bookmark",
              label: "Bookmark location",
              onSelect: (item) =>
                setMessage(`Bookmarked ${String(item.label)}`),
            },
          ]}
        />
      )}
      <div
        role="status"
        className="mt-2 min-h-5 text-sm shrink-0 text-muted-foreground"
      >
        {loadingBooks || loadingChapter ? (
          <>
            <Skeleton
              aria-hidden="true"
              className="h-4 w-28 motion-reduce:animate-none"
            />
            <span className="sr-only">
              {loadingBooks ? "Loading books…" : "Loading chapter…"}
            </span>
          </>
        ) : suppliedItems !== undefined ? (
          `${canonBooks(items).length} books in ${translation}`
        ) : (
          message || status
        )}
      </div>
    </div>
  )
}

function RegularPreview() {
  return (
    <div className="max-w-lg p-6 relative mx-auto w-full">
      <TOC.Root items={regularItems} onLinkClick={() => {}} />
    </div>
  )
}

export const story = defineStory({ Component: CanonPreview, centered: false })
export const regularStory = defineStory({
  Component: RegularPreview,
  centered: false,
})
export const Preview = story.WithControl
export const RegularTreePreview = regularStory.WithControl

function CompactPreview() {
  const [activeLink, setActiveLink] = useState<TTocItem>(regularItems[0])
  return (
    <div className="min-h-80 max-w-lg gap-6 p-6 mx-auto flex w-full items-center">
      <TOC.Compact
        items={regularItems}
        activeLink={activeLink}
        onLinkClick={setActiveLink}
      />
      <div className="min-w-0 flex-1">
        <p className="mb-2 text-xs text-muted-foreground">RESEARCH HANDBOOK</p>
        <p className="font-medium" role="status">
          {activeLink.label}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Hover or focus a tick to preview its place in the outline. Select it
          to navigate.
        </p>
      </div>
    </div>
  )
}

export const compactStory = defineStory({
  Component: CompactPreview,
  centered: false,
})
export const CompactPreviewRail = compactStory.WithControl
