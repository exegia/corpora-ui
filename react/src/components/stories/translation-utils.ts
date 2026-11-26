import type { ApiTranslation } from "free-use-bible-api"

type Edition = Pick<ApiTranslation, "id" | "language" | "englishName" | "name">
const READER_LANGUAGES = new Set([
  "eng",
  "heb",
  "grc",
  "ell",
  "lat",
  "arc",
  "syc",
  "syr",
  "aii",
  "amw",
  "sam",
  "tmr",
  "huy",
  "jpa",
  "trg",
  "cld",
  "hrt",
  "lhs",
  "bjf",
  "bhn",
])

export function isReaderTranslation(entry: Pick<Edition, "language">): boolean {
  return READER_LANGUAGES.has(entry.language.toLowerCase())
}

/** The catalog lacks dates: use known source families and explicit edition years. */
export function translationPresentation(
  entry: Edition
): "printed" | "manuscript" {
  const name = `${entry.name} ${entry.englishName}`
  const year = name.match(/\b(1[0-9]{3}|20[0-9]{2})\b/)
  const manuscript =
    /septuagint|\blxx\b|vulgate|targum|peshitta|textus receptus|byzantine|family 35|westminster leningrad/i.test(
      name
    ) ||
    ["heb_wlc", "grc_gtr", "grc_mtk", "grc_tis"].includes(entry.id) ||
    (year !== null && Number(year[1]) <= 1611)
  return manuscript ? "manuscript" : "printed"
}
