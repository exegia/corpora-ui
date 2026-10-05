import type { ApiTranslationBookChapter, BookId } from "free-use-bible-api"
import type { TCanonItem } from "@/components/composed/navigation/toc/type"

/** Preserve the canon while adding only verse numbers present in this edition. */
export function withChapterVerses(
  items: readonly TCanonItem[],
  bookId: BookId,
  passage: {
    chapter: Pick<ApiTranslationBookChapter["chapter"], "number" | "content">
    book: Pick<ApiTranslationBookChapter["book"], "commonName">
  }
): readonly TCanonItem[] {
  const number = passage.chapter.number
  const verses: TCanonItem<number, BookId, "verse">[] =
    passage.chapter.content.flatMap((block) =>
      block.type === "verse"
        ? [
            {
              id: `${bookId}-${number}-${block.number}`,
              label: `${passage.book.commonName} ${number}:${block.number}`,
              abbreviation: bookId,
              number: block.number,
              link: `#demo-${bookId}-${number}-${block.number}-verse` as const,
              level: 4 as const,
              type: "verse" as const,
            },
          ]
        : []
    )
  return items.map((section) =>
    section.type !== "section"
      ? section
      : {
          ...section,
          nodes: section.nodes?.map((book) =>
            book.type !== "book" || book.id !== bookId
              ? book
              : {
                  ...book,
                  nodes: book.nodes?.map((chapter) =>
                    chapter.type !== "chapter" || chapter.number !== number
                      ? chapter
                      : {
                          ...chapter,
                          nodes: verses,
                        }
                  ),
                }
          ),
        }
  )
}
