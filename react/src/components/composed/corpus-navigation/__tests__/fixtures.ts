import { corpusSchemas } from "../adapters"
import type { CorpusData } from "../types"
export function bible(): CorpusData {
  return {
    corpusId: "bible",
    editionId: "sample",
    label: "Sample Bible",
    schema: corpusSchemas.bible,
    nodes: [
      {
        id: "john",
        level: "book",
        label: "John",
        aliases: ["Jn"],
        children: [
          {
            id: "john-1",
            level: "chapter",
            label: "1",
            reference: "1",
            children: Array.from({ length: 5 }, (_, i) => ({
              id: `john-1-${i + 1}`,
              level: "verse",
              label: String(i + 1),
              reference: String(i + 1),
            })),
          },
        ],
      },
    ],
  }
}
