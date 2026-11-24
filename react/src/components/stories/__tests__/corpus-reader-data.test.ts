import { expect, test } from "bun:test"
import type { TCanonItem } from "@/components/composed/navigation/toc/type"
import { withChapterVerses } from "../corpus-reader-data"

test("verse navigation uses actual verse numbers and preserves other chapters", () => {
  const nextChapter: TCanonItem = {
    id: "GEN-2",
    label: "Genesis 2",
    link: "#demo-GEN-2-chapter",
    type: "chapter",
    level: 3,
    abbreviation: "GEN",
    number: 2,
  }
  const items: TCanonItem[] = [
    {
      id: "ot",
      label: "Old Testament",
      link: "#ot-section",
      type: "section",
      level: 1,
      nodes: [
        {
          id: "GEN",
          label: "Genesis",
          abbreviation: "GEN",
          link: "#demo-GEN-book",
          type: "book",
          level: 2,
          nodes: [
            {
              id: "GEN-1",
              label: "Genesis 1",
              link: "#demo-GEN-1-chapter",
              type: "chapter",
              level: 3,
              abbreviation: "GEN",
              number: 1,
            },
            nextChapter,
          ],
        },
      ],
    },
  ]
  const result = withChapterVerses(items, "GEN", {
    book: { commonName: "Genesis" },
    chapter: {
      number: 1,
      content: [
        { type: "heading", content: ["Creation"] },
        { type: "verse", number: 1, content: ["First verse"] },
        { type: "line_break" },
        { type: "verse", number: 3, content: ["Third verse"] },
      ],
    },
  })
  const chapters = result[0].nodes?.[0]?.nodes
  expect(
    chapters?.[0]?.nodes?.map((verse) => ({
      number: verse.number,
      link: verse.link,
    }))
  ).toEqual([
    { number: 1, link: "#demo-GEN-1-1-verse" },
    { number: 3, link: "#demo-GEN-1-3-verse" },
  ])
  expect(chapters?.[1]).toBe(nextChapter)
  expect(items[0].nodes?.[0]?.nodes?.[0]?.nodes).toBeUndefined()
  const replacement = withChapterVerses(result, "GEN", {
    book: { commonName: "Genesis" },
    chapter: {
      number: 1,
      content: [{ type: "verse", number: 2, content: ["Revised edition"] }],
    },
  })
  expect(
    replacement[0].nodes?.[0]?.nodes?.[0]?.nodes?.map((verse) => verse.number)
  ).toEqual([2])
})
