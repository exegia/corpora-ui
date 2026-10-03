"use client"

import { useState } from "react"
import { TOC } from "@/components/composed/navigation"
import type {
  TBookAbbreviation,
  TCanonItem,
  TTocItem,
} from "@/components/composed/navigation/toc/type"
import { OSIS_BOOKS, type Testament } from "@/lib/canonical"
import { defineStory } from "@/registry/story"
import { canonDemoCounts } from "./canon-demo-counts"

function isBookAbbreviation(value: string): value is TBookAbbreviation {
  return Object.hasOwn(OSIS_BOOKS, value)
}

const bookAbbreviations = Object.keys(OSIS_BOOKS).filter(isBookAbbreviation)

function canonBooks(
  testament: Testament
): TCanonItem<number, TBookAbbreviation, "book">[] {
  return bookAbbreviations
    .filter(
      (abbreviation) =>
        OSIS_BOOKS[abbreviation].type === testament &&
        OSIS_BOOKS[abbreviation].bookNumber !== undefined
    )
    .sort(
      (left, right) =>
        (OSIS_BOOKS[left].bookNumber ?? 0) - (OSIS_BOOKS[right].bookNumber ?? 0)
    )
    .map((abbreviation) => ({
      id: abbreviation,
      label: OSIS_BOOKS[abbreviation].name,
      abbreviation,
      number: OSIS_BOOKS[abbreviation].bookNumber,
      link: `#demo-${abbreviation}-book`,
      level: 2,
      type: "book",
      nodes: (canonDemoCounts[abbreviation] ?? []).map(
        (verseCount, chapterIndex) => ({
          id: `${abbreviation}-${chapterIndex + 1}`,
          label: `${OSIS_BOOKS[abbreviation].name} ${chapterIndex + 1}`,
          link: `#demo-${abbreviation}-${chapterIndex + 1}-chapter`,
          level: 3,
          type: "chapter",
          number: chapterIndex + 1,
          nodes: Array.from({ length: verseCount }, (_, verseIndex) => ({
            id: `${abbreviation}-${chapterIndex + 1}-${verseIndex + 1}`,
            label: `${OSIS_BOOKS[abbreviation].name} ${chapterIndex + 1}:${verseIndex + 1}`,
            link: `#demo-${abbreviation}-${chapterIndex + 1}-${verseIndex + 1}-verse`,
            level: 4,
            type: "verse",
            number: verseIndex + 1,
          })),
        })
      ),
    }))
}

const canonItems: TCanonItem[] = [
  {
    id: "demo-ot",
    label: "Old Testament",
    link: "#demo-ot-section",
    level: 1,
    type: "section",
    nodes: canonBooks("OT"),
  },
  {
    id: "demo-nt",
    label: "New Testament",
    link: "#demo-nt-section",
    level: 1,
    type: "section",
    nodes: canonBooks("NT"),
  },
]

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

function CanonPreview() {
  const [message, setMessage] = useState("")
  return (
    <div
      className="max-w-lg p-2 sm:p-6 relative mx-auto w-full"
      data-toc-demo="canon"
    >
      <TOC.Canonical
        className="h-[32rem]"
        items={canonItems}
        onLinkClick={(item) => setMessage(`Selected ${String(item.label)}`)}
        contextMenuItems={[
          {
            id: "open",
            label: "Open location",
            onSelect: (item) => setMessage(`Opened ${String(item.label)}`),
          },
          {
            id: "bookmark",
            label: "Bookmark location",
            onSelect: (item) => setMessage(`Bookmarked ${String(item.label)}`),
          },
        ]}
      />
      <p role="status" className="mt-2 text-sm text-muted-foreground">
        {message}
      </p>
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
