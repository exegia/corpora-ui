/** Illustrative corpus fixtures for the docs, not counts from a published edition. */
export const wordOccurrences = [
  { label: "Romans", occurrences: 14 },
  { label: "1 Cor.", occurrences: 13 },
  { label: "Eph.", occurrences: 9 },
  { label: "1 John", occurrences: 18 },
]

export const commentariesByAuthor = [
  { label: "Augustine", commentaries: 14 },
  { label: "Chrysostom", commentaries: 9 },
  { label: "Calvin", commentaries: 7 },
  { label: "M. Henry", commentaries: 6 },
]

export const crossReferencesByVerse = [
  { label: "3:14", oldTestament: 5, newTestament: 3 },
  { label: "3:15", oldTestament: 3, newTestament: 9 },
  { label: "3:16", oldTestament: 9, newTestament: 14 },
  { label: "3:17", oldTestament: 4, newTestament: 6 },
  { label: "3:18", oldTestament: 2, newTestament: 5 },
]

export const cumulativeCrossReferences = crossReferencesByVerse.map(
  (row, index) => ({
    label: row.label,
    references: crossReferencesByVerse
      .slice(0, index + 1)
      .reduce(
        (total, verse) => total + verse.oldTestament + verse.newTestament,
        0
      ),
  })
)
