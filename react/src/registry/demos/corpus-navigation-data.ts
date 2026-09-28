import { corpusSchemas } from "@/components/composed/corpus-navigation"
import type {
  CorpusData,
  CorpusNode,
} from "@/components/composed/corpus-navigation"
const numbered = (
  level: string,
  prefix: string,
  start: number,
  count: number
): CorpusNode[] =>
  Array.from({ length: count }, (_, i) => ({
    id: `${prefix}-${i + start}`,
    level,
    label: String(i + start),
    reference: String(i + start),
  }))
/** Navigation excerpts, not full editions or production page maps. */
export const navigationSamples: CorpusData[] = [
  {
    corpusId: "bible",
    editionId: "KJV · John 1 excerpt",
    label: "Bible",
    schema: corpusSchemas.bible,
    nodes: [
      {
        id: "john",
        label: "John",
        aliases: ["Jn"],
        level: "book",
        children: [
          {
            id: "john-1",
            label: "1",
            reference: "1",
            level: "chapter",
            children: numbered("verse", "john-1", 1, 5),
          },
        ],
      },
    ],
  },
  {
    corpusId: "quran",
    editionId: "Al-Ikhlas · navigation excerpt",
    label: "Quran",
    schema: corpusSchemas.quran,
    direction: "rtl",
    nodes: [
      {
        id: "112",
        label: "الإخلاص",
        reference: "112",
        aliases: ["Al-Ikhlas"],
        level: "surah",
        children: numbered("ayah", "112", 1, 4),
      },
    ],
  },
  {
    corpusId: "mormon",
    editionId: "Alma 32 · navigation excerpt",
    label: "Book of Mormon",
    schema: corpusSchemas.bookOfMormon,
    nodes: [
      {
        id: "alma",
        level: "book",
        label: "Alma",
        children: [
          {
            id: "alma-32",
            level: "chapter",
            label: "32",
            reference: "32",
            children: numbered("verse", "alma-32", 21, 3),
          },
        ],
      },
    ],
  },
  {
    corpusId: "library",
    editionId: "Illustrative print page map",
    label: "Library book",
    schema: corpusSchemas.library,
    nodes: [
      {
        id: "part-1",
        level: "section",
        label: "Part I",
        children: [
          {
            id: "chapter-1",
            level: "chapter",
            label: "Ways of reading",
            aliases: ["Chapter 1"],
            children: numbered("page", "book", 1, 120),
          },
        ],
      },
    ],
  },
  {
    corpusId: "booklet",
    editionId: "Illustrative page map",
    label: "Booklet",
    schema: corpusSchemas.booklet,
    nodes: numbered("page", "booklet", 1, 12),
  },
  {
    corpusId: "paper",
    editionId: "Illustrative extraction map",
    label: "Research paper",
    schema: corpusSchemas.paper,
    nodes: numbered("page", "paper", 1, 8).map((node) => ({
      ...node,
      children: numbered("paragraph", node.id, 1, 4),
    })),
  },
  {
    corpusId: "letters",
    editionId: "Custom schema sample",
    label: "Letters",
    schema: {
      id: "letters",
      label: "Letters",
      levels: [{ id: "letter", label: "Letter", kind: "hierarchy" }],
    },
    nodes: [
      { id: "letter-a", level: "letter", label: "Letter A" },
      { id: "letter-b", level: "letter", label: "Letter B" },
    ],
  },
]
export function firstReadingNode(data: CorpusData): CorpusNode | undefined {
  let node = data.nodes[0]
  while (node?.children?.length) node = node.children[0]
  return node
}

// A small real text-search example. Full-text indexing remains host-owned.
navigationSamples[0].search = async (query, signal) => {
  signal.throwIfAborted()
  const excerpt =
    "And the light shineth in darkness; and the darkness comprehended it not."
  return excerpt.toLocaleLowerCase().includes(query.toLocaleLowerCase())
    ? [
        {
          anchor: {
            corpusId: "bible",
            editionId: navigationSamples[0].editionId,
            nodeId: "john-1-5",
          },
          label: "John 1:5",
          excerpt,
        },
      ]
    : []
}
