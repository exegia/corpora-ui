import { expect, test } from "bun:test"
import {
  isReaderTranslation,
  translationPresentation,
} from "../translation-utils"

test("reader allows English, Hebrew, Greek, Latin and Aramaic editions", () => {
  for (const language of [
    "eng",
    "heb",
    "grc",
    "ell",
    "lat",
    "arc",
    "syc",
    "aii",
  ])
    expect(isReaderTranslation({ language })).toBe(true)
  for (const language of ["fra", "deu", "spa", "ara", "amh"])
    expect(isReaderTranslation({ language })).toBe(false)
})

test("edition icons distinguish modern printing, manuscript sources and the 1611 boundary", () => {
  const edition = (name: string, id = "example") => ({
    id,
    name,
    englishName: name,
    language: "eng",
  })
  expect(
    translationPresentation(edition("American Standard Version (1901)"))
  ).toBe("printed")
  expect(translationPresentation(edition("Modern Hebrew Bible"))).toBe(
    "printed"
  )
  expect(translationPresentation(edition("Brenton Septuagint"))).toBe(
    "manuscript"
  )
  expect(translationPresentation(edition("Hebrew OT (WLC)", "heb_wlc"))).toBe(
    "manuscript"
  )
  expect(translationPresentation(edition("Edition 1611"))).toBe("manuscript")
  expect(translationPresentation(edition("Edition 1612"))).toBe("printed")
})
