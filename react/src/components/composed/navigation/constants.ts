import type { TTocItem } from "./types"

export const items: TTocItem[] = [
  {
    id: "" + Math.floor(Math.random() * 1e16).toString(16),
    label: "Old Testament",
    description: "Traditionally includes the Pentateuch, tunim and the katunim",
    link: "#old-testament-section",
    level: 1,
    type: "section",
  },
  {
    id: "" + Math.floor(Math.random() * 1e16).toString(16),
    label: "New Testament",
    description:
      "Traditionally includes the Gospels, Acts, Epistles, and Revelation",
    link: "#new-testament-section",
    level: 1,
    type: "section",
  },
]
