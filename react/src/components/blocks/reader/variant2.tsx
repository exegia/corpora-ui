"use client"
import type { ApiTranslationBookChapter } from "free-use-bible-api"

export function ReaderChapter({
  chapter,
  activeVerse,
  getVerseText,
}: {
  chapter: ApiTranslationBookChapter
  activeVerse?: number
  getVerseText: (
    verse: Extract<
      ApiTranslationBookChapter["chapter"]["content"][number],
      { type: "verse" }
    >
  ) => string
}) {
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
                : getVerseText({
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
              {getVerseText(block)}{" "}
            </span>
          )
        })}
      </div>
    </article>
  )
}
