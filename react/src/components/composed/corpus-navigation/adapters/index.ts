import type { CorpusLevel, CorpusSchema } from "../types"

const level = (
  id: string,
  label: string,
  kind: CorpusLevel["kind"],
  optional = false
): CorpusLevel => ({ id, label, kind, optional })
/** Presets provide vocabulary only. Counts, canons and page maps belong to the host. */
export const corpusSchemas = {
  bible: {
    id: "bible",
    label: "Bible",
    levels: [
      level("book", "Book", "hierarchy"),
      level("chapter", "Chapter", "number"),
      level("verse", "Verse", "number", true),
    ],
  },
  quran: {
    id: "quran",
    label: "Quran",
    levels: [
      level("surah", "Surah", "hierarchy"),
      level("ayah", "Ayah", "number", true),
    ],
  },
  bookOfMormon: {
    id: "book-of-mormon",
    label: "Book of Mormon",
    levels: [
      level("book", "Book", "hierarchy"),
      level("chapter", "Chapter", "number"),
      level("verse", "Verse", "number", true),
    ],
  },
  library: {
    id: "library",
    label: "Library book",
    levels: [
      level("section", "Section", "hierarchy", true),
      level("chapter", "Chapter", "hierarchy", true),
      level("page", "Page", "number", true),
      level("paragraph", "Paragraph", "number", true),
    ],
  },
  booklet: {
    id: "booklet",
    label: "Booklet",
    levels: [
      level("chapter", "Chapter", "hierarchy", true),
      level("page", "Page", "number"),
      level("paragraph", "Paragraph", "number", true),
    ],
  },
  paper: {
    id: "paper",
    label: "Research paper",
    levels: [
      level("page", "Page", "number"),
      level("paragraph", "Paragraph", "number", true),
    ],
  },
} satisfies Record<string, CorpusSchema>
