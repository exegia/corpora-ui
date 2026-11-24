/**
 *
 * Fetches verses, chapters, books, and full Bibles
 *
 * @example
 *   import { getVerse } from '@lib/canonical';
 *   const verse = await getVerse('kjv', 'John', 3, 16);
 *   console.log(verse.text); // "For God so loved the world..."
 */

import type { BookId } from "free-use-bible-api"

export type LicenseTag =
  "public-domain" | "cc0" | "cc-by" | "cc-by-sa" | "wlc-license"

export type Testament = "OT" | "NT"

export type OsisBookType =
  | "apocrypha"
  | "OT"
  | "NT"
  | "ralph"
  | "latin"
  | "ethiopian"
  | "peshitta"
  | "armenian"
  | "fathers"

export interface OsisBookMetadata {
  readonly name: string
  readonly alternateNames: readonly string[]
  /** Standard 66-book numbering (Genesis = 1, Revelation = 66); undefined otherwise. */
  readonly bookNumber: number | undefined
  readonly type: OsisBookType
}

/**
 * Book metadata keyed by USFM `BookId` (see free-use-bible-api).
 * Names and alternate names follow OSIS where the two standards differ.
 * Source: https://ubsicap.github.io/usfm/identification/books.html
 * This registry does not imply availability in a particular Bible version.
 */
export const OSIS_BOOKS: Record<BookId, OsisBookMetadata> = {
  // Old Testament
  GEN: { name: "Genesis", alternateNames: [], bookNumber: 1, type: "OT" },
  EXO: { name: "Exodus", alternateNames: [], bookNumber: 2, type: "OT" },
  LEV: { name: "Leviticus", alternateNames: [], bookNumber: 3, type: "OT" },
  NUM: { name: "Numbers", alternateNames: [], bookNumber: 4, type: "OT" },
  DEU: { name: "Deuteronomy", alternateNames: [], bookNumber: 5, type: "OT" },
  JOS: { name: "Joshua", alternateNames: [], bookNumber: 6, type: "OT" },
  JDG: { name: "Judges", alternateNames: [], bookNumber: 7, type: "OT" },
  RUT: { name: "Ruth", alternateNames: [], bookNumber: 8, type: "OT" },
  "1SA": { name: "1 Samuel", alternateNames: [], bookNumber: 9, type: "OT" },
  "2SA": { name: "2 Samuel", alternateNames: [], bookNumber: 10, type: "OT" },
  "1KI": { name: "1 Kings", alternateNames: [], bookNumber: 11, type: "OT" },
  "2KI": { name: "2 Kings", alternateNames: [], bookNumber: 12, type: "OT" },
  "1CH": {
    name: "1 Chronicles",
    alternateNames: [],
    bookNumber: 13,
    type: "OT",
  },
  "2CH": {
    name: "2 Chronicles",
    alternateNames: [],
    bookNumber: 14,
    type: "OT",
  },
  EZR: { name: "Ezra", alternateNames: [], bookNumber: 15, type: "OT" },
  NEH: { name: "Nehemiah", alternateNames: [], bookNumber: 16, type: "OT" },
  // EST is Hebrew Esther; Greek Esther is ESG.
  EST: { name: "Esther", alternateNames: [], bookNumber: 17, type: "OT" },
  JOB: { name: "Job", alternateNames: [], bookNumber: 18, type: "OT" },
  PSA: { name: "Psalms", alternateNames: [], bookNumber: 19, type: "OT" },
  PRO: { name: "Proverbs", alternateNames: [], bookNumber: 20, type: "OT" },
  ECC: {
    name: "Ecclesiastes",
    alternateNames: ["Qohelet"],
    bookNumber: 21,
    type: "OT",
  },
  SNG: {
    name: "Song of Solomon",
    alternateNames: ["Canticle of Canticles"],
    bookNumber: 22,
    type: "OT",
  },
  ISA: { name: "Isaiah", alternateNames: [], bookNumber: 23, type: "OT" },
  JER: { name: "Jeremiah", alternateNames: [], bookNumber: 24, type: "OT" },
  LAM: { name: "Lamentations", alternateNames: [], bookNumber: 25, type: "OT" },
  EZK: { name: "Ezekiel", alternateNames: [], bookNumber: 26, type: "OT" },
  DAN: { name: "Daniel", alternateNames: [], bookNumber: 27, type: "OT" },
  HOS: { name: "Hosea", alternateNames: [], bookNumber: 28, type: "OT" },
  JOL: { name: "Joel", alternateNames: [], bookNumber: 29, type: "OT" },
  AMO: { name: "Amos", alternateNames: [], bookNumber: 30, type: "OT" },
  OBA: { name: "Obadiah", alternateNames: [], bookNumber: 31, type: "OT" },
  JON: { name: "Jonah", alternateNames: [], bookNumber: 32, type: "OT" },
  MIC: { name: "Micah", alternateNames: [], bookNumber: 33, type: "OT" },
  NAM: { name: "Nahum", alternateNames: [], bookNumber: 34, type: "OT" },
  HAB: { name: "Habakkuk", alternateNames: [], bookNumber: 35, type: "OT" },
  ZEP: { name: "Zephaniah", alternateNames: [], bookNumber: 36, type: "OT" },
  HAG: { name: "Haggai", alternateNames: [], bookNumber: 37, type: "OT" },
  ZEC: { name: "Zechariah", alternateNames: [], bookNumber: 38, type: "OT" },
  MAL: { name: "Malachi", alternateNames: [], bookNumber: 39, type: "OT" },

  // New Testament
  MAT: { name: "Matthew", alternateNames: [], bookNumber: 40, type: "NT" },
  MRK: { name: "Mark", alternateNames: [], bookNumber: 41, type: "NT" },
  LUK: { name: "Luke", alternateNames: [], bookNumber: 42, type: "NT" },
  JHN: { name: "John", alternateNames: [], bookNumber: 43, type: "NT" },
  ACT: { name: "Acts", alternateNames: [], bookNumber: 44, type: "NT" },
  ROM: { name: "Romans", alternateNames: [], bookNumber: 45, type: "NT" },
  "1CO": {
    name: "1 Corinthians",
    alternateNames: [],
    bookNumber: 46,
    type: "NT",
  },
  "2CO": {
    name: "2 Corinthians",
    alternateNames: [],
    bookNumber: 47,
    type: "NT",
  },
  GAL: { name: "Galatians", alternateNames: [], bookNumber: 48, type: "NT" },
  EPH: { name: "Ephesians", alternateNames: [], bookNumber: 49, type: "NT" },
  PHP: { name: "Philippians", alternateNames: [], bookNumber: 50, type: "NT" },
  COL: { name: "Colossians", alternateNames: [], bookNumber: 51, type: "NT" },
  "1TH": {
    name: "1 Thessalonians",
    alternateNames: [],
    bookNumber: 52,
    type: "NT",
  },
  "2TH": {
    name: "2 Thessalonians",
    alternateNames: [],
    bookNumber: 53,
    type: "NT",
  },
  "1TI": { name: "1 Timothy", alternateNames: [], bookNumber: 54, type: "NT" },
  "2TI": { name: "2 Timothy", alternateNames: [], bookNumber: 55, type: "NT" },
  TIT: { name: "Titus", alternateNames: [], bookNumber: 56, type: "NT" },
  PHM: { name: "Philemon", alternateNames: [], bookNumber: 57, type: "NT" },
  HEB: { name: "Hebrews", alternateNames: [], bookNumber: 58, type: "NT" },
  JAS: { name: "James", alternateNames: [], bookNumber: 59, type: "NT" },
  "1PE": { name: "1 Peter", alternateNames: [], bookNumber: 60, type: "NT" },
  "2PE": { name: "2 Peter", alternateNames: [], bookNumber: 61, type: "NT" },
  "1JN": { name: "1 John", alternateNames: [], bookNumber: 62, type: "NT" },
  "2JN": { name: "2 John", alternateNames: [], bookNumber: 63, type: "NT" },
  "3JN": { name: "3 John", alternateNames: [], bookNumber: 64, type: "NT" },
  JUD: { name: "Jude", alternateNames: [], bookNumber: 65, type: "NT" },
  REV: { name: "Revelation", alternateNames: [], bookNumber: 66, type: "NT" },

  // Apocrypha / Deuterocanon
  TOB: {
    name: "Tobit",
    alternateNames: [],
    bookNumber: undefined,
    type: "apocrypha",
  },
  JDT: {
    name: "Judith",
    alternateNames: [],
    bookNumber: undefined,
    type: "apocrypha",
  },
  ESG: {
    name: "Greek Esther",
    alternateNames: [],
    bookNumber: undefined,
    type: "apocrypha",
  },
  WIS: {
    name: "Wisdom",
    alternateNames: ["Wisdom of Solomon"],
    bookNumber: undefined,
    type: "apocrypha",
  },
  SIR: {
    name: "Sirach",
    alternateNames: ["Ecclesiasticus"],
    bookNumber: undefined,
    type: "apocrypha",
  },
  BAR: {
    name: "Baruch",
    alternateNames: [],
    bookNumber: undefined,
    type: "apocrypha",
  },
  LJE: {
    name: "Letter of Jeremiah",
    alternateNames: [],
    bookNumber: undefined,
    type: "apocrypha",
  },
  // USFM folds the Prayer of Azariah into the Song of the Three.
  S3Y: {
    name: "Prayer of Azariah",
    alternateNames: ["Song of the Three Children"],
    bookNumber: undefined,
    type: "apocrypha",
  },
  SUS: {
    name: "Susanna",
    alternateNames: [],
    bookNumber: undefined,
    type: "apocrypha",
  },
  BEL: {
    name: "Bel and the Dragon",
    alternateNames: [],
    bookNumber: undefined,
    type: "apocrypha",
  },
  "1MA": {
    name: "1 Maccabees",
    alternateNames: [],
    bookNumber: undefined,
    type: "apocrypha",
  },
  "2MA": {
    name: "2 Maccabees",
    alternateNames: [],
    bookNumber: undefined,
    type: "apocrypha",
  },
  "3MA": {
    name: "3 Maccabees",
    alternateNames: [],
    bookNumber: undefined,
    type: "apocrypha",
  },
  "4MA": {
    name: "4 Maccabees",
    alternateNames: [],
    bookNumber: undefined,
    type: "apocrypha",
  },
  "1ES": {
    name: "1 Esdras",
    alternateNames: [],
    bookNumber: undefined,
    type: "apocrypha",
  },
  // Latin Esdras (EZA, 5EZ, 6EZ), not the LXX Ezra–Nehemiah book.
  "2ES": {
    name: "2 Esdras",
    alternateNames: [],
    bookNumber: undefined,
    type: "apocrypha",
  },
  MAN: {
    name: "Prayer of Manasseh",
    alternateNames: [],
    bookNumber: undefined,
    type: "apocrypha",
  },
  PS2: {
    name: "Psalm 151",
    alternateNames: [],
    bookNumber: undefined,
    type: "apocrypha",
  },

  // Rahlfs' LXX
  ODA: {
    name: "Odes",
    alternateNames: [],
    bookNumber: undefined,
    type: "ralph",
  },
  PSS: {
    name: "Psalms of Solomon",
    alternateNames: [],
    bookNumber: undefined,
    type: "ralph",
  },

  // Vulgate and other later Latin manuscripts
  LAO: {
    name: "Epistle to the Laodiceans",
    alternateNames: [],
    bookNumber: undefined,
    type: "latin",
  },
  // 4 Ezra is the Ezra Apocalypse; 5 Ezra and 6 Ezra are its Latin prefixes and appendix.
  "5EZ": {
    name: "5 Ezra",
    alternateNames: [],
    bookNumber: undefined,
    type: "latin",
  },
  EZA: {
    name: "4 Ezra",
    alternateNames: ["Ezra Apocalypse"],
    bookNumber: undefined,
    type: "latin",
  },
  "6EZ": {
    name: "6 Ezra",
    alternateNames: [],
    bookNumber: undefined,
    type: "latin",
  },
  DAG: {
    name: "Greek Daniel",
    alternateNames: [],
    bookNumber: undefined,
    type: "apocrypha",
  },

  // Peshitta / Syriac Orthodox canon
  PS3: {
    name: "Additional Syriac Psalms",
    alternateNames: ["5 Apocryphal Syriac Psalms"],
    bookNumber: undefined,
    type: "peshitta",
  },
  "2BA": {
    name: "2 Baruch",
    alternateNames: ["(Syriac) Apocalypse of Baruch"],
    bookNumber: undefined,
    type: "peshitta",
  },
  LBA: {
    name: "Letter of Baruch",
    alternateNames: [],
    bookNumber: undefined,
    type: "peshitta",
  },

  // Ethiopian Orthodox canon / Ge'ez translation additions
  JUB: {
    name: "Jubilees",
    alternateNames: [],
    bookNumber: undefined,
    type: "ethiopian",
  },
  ENO: {
    name: "1 Enoch",
    alternateNames: ["Ethiopic (Apocalypse of) Enoch"],
    bookNumber: undefined,
    type: "ethiopian",
  },
  "1MQ": {
    name: "1 Meqabyan",
    alternateNames: [],
    bookNumber: undefined,
    type: "ethiopian",
  },
  "2MQ": {
    name: "2 Meqabyan",
    alternateNames: [],
    bookNumber: undefined,
    type: "ethiopian",
  },
  "3MQ": {
    name: "3 Meqabyan",
    alternateNames: [],
    bookNumber: undefined,
    type: "ethiopian",
  },
  REP: {
    name: "Reproof",
    alternateNames: ["Tegsas", "Tegsats", "Taagsas"],
    bookNumber: undefined,
    type: "ethiopian",
  },
  "4BA": {
    name: "4 Baruch",
    alternateNames: ["Paraleipomena Jeremiou"],
    bookNumber: undefined,
    type: "ethiopian",
  },
} as const satisfies Record<BookId, OsisBookMetadata>

export type OsisCode = keyof typeof OSIS_BOOKS

/** Supported OSIS IDs in source-table order, excluding the Other section. */
export const OSIS_CODES: readonly OsisCode[] = Object.keys(
  OSIS_BOOKS
) as OsisCode[]

export interface Verse {
  number: number
  text: string
}

export interface Chapter {
  chapter: number
  verses: Verse[]
}

export interface Book {
  book: string
  bookId: number
  englishName: string
  testament: Testament
  chapters: Chapter[]
}

export interface BibleFile {
  version: string
  name: string
  language: string
  license: LicenseTag
  books: Book[]
}

export interface VersionMetadata {
  slug: string
  shortName: string
  name: string
  language: string
  year: number
  license: LicenseTag
  licenseNote: string
  attribution: string | null
  sourceUrl: string | null
  stats: { books: number; chapters: number; verses: number }
  readerUrl: string
  schema: string
}

const DEFAULT_BASE_URL =
  "https://raw.githubusercontent.com/midvash/bible-data/main"

export interface ClientOptions {
  /** Override the base URL (default: midvash/bible-data on main). Useful for pinning a release tag, mirroring, or testing. */
  baseUrl?: string
  /** Custom fetch implementation (defaults to global fetch). */
  fetch?: typeof fetch
}

let _options: Required<ClientOptions> = {
  baseUrl: DEFAULT_BASE_URL,
  fetch: globalThis.fetch.bind(globalThis),
}

/** Configure global client options (base URL, custom fetch). */
export function configure(options: ClientOptions): void {
  _options = {
    baseUrl: options.baseUrl ?? _options.baseUrl,
    fetch: options.fetch ?? _options.fetch,
  }
}

async function fetchJson<T>(path: string): Promise<T> {
  const url = `${_options.baseUrl}${path}`
  const res = await _options.fetch(url)
  if (!res.ok) {
    throw new Error(`bible-data fetch failed (${res.status}) for ${url}`)
  }
  return (await res.json()) as T
}

/**
 * Look up the directory for a version slug — `versions/<lang>/<slug>/`.
 * Needs the version's language; resolves it from the version registry on miss.
 */
async function resolveLang(slug: string): Promise<string> {
  const meta = await getVersionMetadata(slug)
  return meta.language
}

/** Returns metadata for a single version (license, stats, year, etc). */
export async function getVersionMetadata(
  slug: string
): Promise<VersionMetadata> {
  for (const lang of KNOWN_LANGUAGES) {
    try {
      return await fetchJson<VersionMetadata>(
        `/versions/${lang}/${slug}/metadata.json`
      )
    } catch {
      // try next lang
    }
  }
  throw new Error(`Unknown version slug: ${slug}`)
}

/**
 * Fetches a single book (e.g. `getBook('kjv', 'John')`).
 * Book code uses OSIS — see https://wiki.crosswire.org/OSIS_Book_Abbreviations
 */
export async function getBook(slug: string, osisBook: string): Promise<Book> {
  const lang = await resolveLang(slug)
  const file = await fetchJson<Book & { version: string }>(
    `/versions/${lang}/${slug}/books/${osisBook}.json`
  )
  return file
}

/** Fetches a single chapter of a book. */
export async function getChapter(
  slug: string,
  osisBook: string,
  chapter: number
): Promise<Chapter> {
  const book = await getBook(slug, osisBook)
  const ch = book.chapters.find((c) => c.chapter === chapter)
  if (!ch) {
    throw new Error(`Chapter ${chapter} not found in ${osisBook} (${slug})`)
  }
  return ch
}

/** Fetches a single verse. */
export async function getVerse(
  slug: string,
  osisBook: string,
  chapter: number,
  verse: number
): Promise<Verse> {
  const ch = await getChapter(slug, osisBook, chapter)
  const v = ch.verses.find((x) => x.number === verse)
  if (!v) {
    throw new Error(`${osisBook} ${chapter}:${verse} not found in ${slug}`)
  }
  return v
}

/** Fetches the entire Bible for a version as a single object (large — ~5-10MB). */
export async function getBible(slug: string): Promise<BibleFile> {
  const lang = await resolveLang(slug)
  return fetchJson<BibleFile>(`/versions/${lang}/${slug}/${slug}.json`)
}

/** Languages with at least one version in bible-data. */
export const KNOWN_LANGUAGES = [
  "ar",
  "en",
  "eo",
  "fr",
  "gr",
  "he",
  "la",
  "nb",
] as const

export type KnownLanguage = (typeof KNOWN_LANGUAGES)[number]

/** Slugs of all available versions, grouped by language. */
export const VERSIONS_BY_LANGUAGE: Record<KnownLanguage, readonly string[]> = {
  ar: ["svd"],
  en: ["kjv", "asv", "web", "geneva1599", "dra"],
  eo: ["lsb"],
  fr: ["lsg", "darby-fr", "martin1744"],
  gr: ["tr"],
  he: ["wlc", "aleppo"],
  la: ["vulg", "clem"],
  nb: ["nb1930"],
}

/** Flat list of every version slug. */
export const ALL_VERSION_SLUGS: readonly string[] =
  Object.values(VERSIONS_BY_LANGUAGE).flat()
