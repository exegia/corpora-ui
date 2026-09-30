/**
 *
 * Fetches verses, chapters, books, and full Bibles
 *
 * @example
 *   import { getVerse } from '@lib/canonical';
 *   const verse = await getVerse('kjv', 'John', 3, 16);
 *   console.log(verse.text); // "For God so loved the world..."
 */

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
 * OSIS book abbreviations, including extended canons and compound IDs.
 * Source: https://wiki.crosswire.org/OSIS_Book_Abbreviations
 * Editorial markers and reference footnotes are not part of book names.
 * This registry does not imply availability in a particular Bible version.
 */
export const OSIS_BOOKS = {
  // Old Testament
  Gen: { name: "Genesis", alternateNames: [], bookNumber: 1, type: "OT" },
  Exod: { name: "Exodus", alternateNames: [], bookNumber: 2, type: "OT" },
  Lev: { name: "Leviticus", alternateNames: [], bookNumber: 3, type: "OT" },
  Num: { name: "Numbers", alternateNames: [], bookNumber: 4, type: "OT" },
  Deut: { name: "Deuteronomy", alternateNames: [], bookNumber: 5, type: "OT" },
  Josh: { name: "Joshua", alternateNames: [], bookNumber: 6, type: "OT" },
  Judg: { name: "Judges", alternateNames: [], bookNumber: 7, type: "OT" },
  Ruth: { name: "Ruth", alternateNames: [], bookNumber: 8, type: "OT" },
  "1Sam": { name: "1 Samuel", alternateNames: [], bookNumber: 9, type: "OT" },
  "2Sam": { name: "2 Samuel", alternateNames: [], bookNumber: 10, type: "OT" },
  "1Kgs": { name: "1 Kings", alternateNames: [], bookNumber: 11, type: "OT" },
  "2Kgs": { name: "2 Kings", alternateNames: [], bookNumber: 12, type: "OT" },
  "1Chr": { name: "1 Chronicles", alternateNames: [], bookNumber: 13, type: "OT" },
  "2Chr": { name: "2 Chronicles", alternateNames: [], bookNumber: 14, type: "OT" },
  Ezra: { name: "Ezra", alternateNames: [], bookNumber: 15, type: "OT" },
  Neh: { name: "Nehemiah", alternateNames: [], bookNumber: 16, type: "OT" },
  // Esth applies to both Hebrew Esther and the longer Greek text.
  Esth: { name: "Esther", alternateNames: [], bookNumber: 17, type: "OT" },
  Job: { name: "Job", alternateNames: [], bookNumber: 18, type: "OT" },
  Ps: { name: "Psalms", alternateNames: [], bookNumber: 19, type: "OT" },
  Prov: { name: "Proverbs", alternateNames: [], bookNumber: 20, type: "OT" },
  Eccl: { name: "Ecclesiastes", alternateNames: ["Qohelet"], bookNumber: 21, type: "OT" },
  Song: {
    name: "Song of Solomon",
    alternateNames: ["Canticle of Canticles"],
    bookNumber: 22,
    type: "OT",
  },
  Isa: { name: "Isaiah", alternateNames: [], bookNumber: 23, type: "OT" },
  Jer: { name: "Jeremiah", alternateNames: [], bookNumber: 24, type: "OT" },
  Lam: { name: "Lamentations", alternateNames: [], bookNumber: 25, type: "OT" },
  Ezek: { name: "Ezekiel", alternateNames: [], bookNumber: 26, type: "OT" },
  Dan: { name: "Daniel", alternateNames: [], bookNumber: 27, type: "OT" },
  Hos: { name: "Hosea", alternateNames: [], bookNumber: 28, type: "OT" },
  Joel: { name: "Joel", alternateNames: [], bookNumber: 29, type: "OT" },
  Amos: { name: "Amos", alternateNames: [], bookNumber: 30, type: "OT" },
  Obad: { name: "Obadiah", alternateNames: [], bookNumber: 31, type: "OT" },
  Jonah: { name: "Jonah", alternateNames: [], bookNumber: 32, type: "OT" },
  Mic: { name: "Micah", alternateNames: [], bookNumber: 33, type: "OT" },
  Nah: { name: "Nahum", alternateNames: [], bookNumber: 34, type: "OT" },
  Hab: { name: "Habakkuk", alternateNames: [], bookNumber: 35, type: "OT" },
  Zeph: { name: "Zephaniah", alternateNames: [], bookNumber: 36, type: "OT" },
  Hag: { name: "Haggai", alternateNames: [], bookNumber: 37, type: "OT" },
  Zech: { name: "Zechariah", alternateNames: [], bookNumber: 38, type: "OT" },
  Mal: { name: "Malachi", alternateNames: [], bookNumber: 39, type: "OT" },

  // New Testament
  Matt: { name: "Matthew", alternateNames: [], bookNumber: 40, type: "NT" },
  Mark: { name: "Mark", alternateNames: [], bookNumber: 41, type: "NT" },
  Luke: { name: "Luke", alternateNames: [], bookNumber: 42, type: "NT" },
  John: { name: "John", alternateNames: [], bookNumber: 43, type: "NT" },
  Acts: { name: "Acts", alternateNames: [], bookNumber: 44, type: "NT" },
  Rom: { name: "Romans", alternateNames: [], bookNumber: 45, type: "NT" },
  "1Cor": { name: "1 Corinthians", alternateNames: [], bookNumber: 46, type: "NT" },
  "2Cor": { name: "2 Corinthians", alternateNames: [], bookNumber: 47, type: "NT" },
  Gal: { name: "Galatians", alternateNames: [], bookNumber: 48, type: "NT" },
  Eph: { name: "Ephesians", alternateNames: [], bookNumber: 49, type: "NT" },
  Phil: { name: "Philippians", alternateNames: [], bookNumber: 50, type: "NT" },
  Col: { name: "Colossians", alternateNames: [], bookNumber: 51, type: "NT" },
  "1Thess": { name: "1 Thessalonians", alternateNames: [], bookNumber: 52, type: "NT" },
  "2Thess": { name: "2 Thessalonians", alternateNames: [], bookNumber: 53, type: "NT" },
  "1Tim": { name: "1 Timothy", alternateNames: [], bookNumber: 54, type: "NT" },
  "2Tim": { name: "2 Timothy", alternateNames: [], bookNumber: 55, type: "NT" },
  Titus: { name: "Titus", alternateNames: [], bookNumber: 56, type: "NT" },
  Phlm: { name: "Philemon", alternateNames: [], bookNumber: 57, type: "NT" },
  Heb: { name: "Hebrews", alternateNames: [], bookNumber: 58, type: "NT" },
  Jas: { name: "James", alternateNames: [], bookNumber: 59, type: "NT" },
  "1Pet": { name: "1 Peter", alternateNames: [], bookNumber: 60, type: "NT" },
  "2Pet": { name: "2 Peter", alternateNames: [], bookNumber: 61, type: "NT" },
  "1John": { name: "1 John", alternateNames: [], bookNumber: 62, type: "NT" },
  "2John": { name: "2 John", alternateNames: [], bookNumber: 63, type: "NT" },
  "3John": { name: "3 John", alternateNames: [], bookNumber: 64, type: "NT" },
  Jude: { name: "Jude", alternateNames: [], bookNumber: 65, type: "NT" },
  Rev: { name: "Revelation", alternateNames: [], bookNumber: 66, type: "NT" },

  // Apocrypha / Deuterocanon
  Tob: { name: "Tobit", alternateNames: [], bookNumber: undefined, type: "apocrypha" },
  Jdt: { name: "Judith", alternateNames: [], bookNumber: undefined, type: "apocrypha" },
  EsthGr: { name: "Greek Esther", alternateNames: [], bookNumber: undefined, type: "apocrypha" },
  AddEsth: { name: "Additions to Esther", alternateNames: [], bookNumber: undefined, type: "apocrypha" },
  Wis: {
    name: "Wisdom",
    alternateNames: ["Wisdom of Solomon"],
    bookNumber: undefined,
    type: "apocrypha",
  },
  SirP: { name: "Sirach Prologue", alternateNames: [], bookNumber: undefined, type: "apocrypha" },
  Sir: { name: "Sirach", alternateNames: ["Ecclesiasticus"], bookNumber: undefined, type: "apocrypha" },
  Bar: { name: "Baruch", alternateNames: [], bookNumber: undefined, type: "apocrypha" },
  EpJer: { name: "Letter of Jeremiah", alternateNames: [], bookNumber: undefined, type: "apocrypha" },
  DanGr: { name: "Greek Daniel", alternateNames: [], bookNumber: undefined, type: "apocrypha" },
  AddDan: { name: "Additions to Daniel", alternateNames: [], bookNumber: undefined, type: "apocrypha" },
  PrAzar: {
    name: "Prayer of Azariah",
    alternateNames: ["Song of the Three Children"],
    bookNumber: undefined,
    type: "apocrypha",
  },
  Sus: { name: "Susanna", alternateNames: [], bookNumber: undefined, type: "apocrypha" },
  Bel: { name: "Bel and the Dragon", alternateNames: [], bookNumber: undefined, type: "apocrypha" },
  "1Macc": { name: "1 Maccabees", alternateNames: [], bookNumber: undefined, type: "apocrypha" },
  "2Macc": { name: "2 Maccabees", alternateNames: [], bookNumber: undefined, type: "apocrypha" },
  "3Macc": { name: "3 Maccabees", alternateNames: [], bookNumber: undefined, type: "apocrypha" },
  "4Macc": { name: "4 Maccabees", alternateNames: [], bookNumber: undefined, type: "apocrypha" },
  PrMan: { name: "Prayer of Manasseh", alternateNames: [], bookNumber: undefined, type: "apocrypha" },
  "1Esd": { name: "1 Esdras", alternateNames: [], bookNumber: undefined, type: "apocrypha" },
  // Latin Esdras (4Ezra, 5Ezra, 6Ezra), not the LXX Ezra–Nehemiah book.
  "2Esd": { name: "2 Esdras", alternateNames: [], bookNumber: undefined, type: "apocrypha" },
  // Sword uses AddPs because a book ID ending in a number is not legal there.
  AddPs: { name: "Psalm 151", alternateNames: [], bookNumber: undefined, type: "apocrypha" },

  // Rahlfs' LXX
  Odes: { name: "Odes", alternateNames: [], bookNumber: undefined, type: "ralph" },
  PssSol: { name: "Psalms of Solomon", alternateNames: [], bookNumber: undefined, type: "ralph" },

  // Rahlfs' variant books
  JoshA: { name: "Joshua A", alternateNames: [], bookNumber: undefined, type: "ralph" },
  JudgB: { name: "Judges B", alternateNames: [], bookNumber: undefined, type: "ralph" },
  TobS: { name: "Tobit S", alternateNames: [], bookNumber: undefined, type: "ralph" },
  SusTh: { name: "Susanna θ", alternateNames: [], bookNumber: undefined, type: "ralph" },
  DanTh: { name: "Daniel θ", alternateNames: [], bookNumber: undefined, type: "ralph" },
  BelTh: { name: "Bel and the Dragon θ", alternateNames: [], bookNumber: undefined, type: "ralph" },

  // Vulgate and other later Latin manuscripts
  EpLao: {
    name: "Epistle to the Laodiceans",
    alternateNames: [],
    bookNumber: undefined,
    type: "latin",
  },
  "5Ezra": { name: "5 Ezra", alternateNames: [], bookNumber: undefined, type: "latin" },
  "4Ezra": {
    name: "4 Ezra",
    alternateNames: ["Ezra Apocalypse"],
    bookNumber: undefined,
    type: "latin",
  },
  "6Ezra": { name: "6 Ezra", alternateNames: [], bookNumber: undefined, type: "latin" },
  PrSol: { name: "Prayer of Solomon", alternateNames: [], bookNumber: undefined, type: "latin" },
  PrJer: { name: "Prayer of Jeremiah", alternateNames: [], bookNumber: undefined, type: "latin" },

  // Ethiopian Orthodox canon / Ge'ez translation additions
  "1En": {
    name: "1 Enoch",
    alternateNames: ["Ethiopic (Apocalypse of) Enoch"],
    bookNumber: undefined,
    type: "ethiopian",
  },
  Jub: { name: "Jubilees", alternateNames: [], bookNumber: undefined, type: "ethiopian" },
  "4Bar": {
    name: "4 Baruch",
    alternateNames: ["Paraleipomena Jeremiou"],
    bookNumber: undefined,
    type: "ethiopian",
  },
  "1Meq": { name: "1 Meqabyan", alternateNames: [], bookNumber: undefined, type: "ethiopian" },
  "2Meq": { name: "2 Meqabyan", alternateNames: [], bookNumber: undefined, type: "ethiopian" },
  "3Meq": { name: "3 Meqabyan", alternateNames: [], bookNumber: undefined, type: "ethiopian" },
  Rep: {
    name: "Reproof",
    alternateNames: ["Tegsas", "Tegsats", "Taagsas"],
    bookNumber: undefined,
    type: "ethiopian",
  },
  AddJer: {
    name: "Additions to Jeremiah",
    alternateNames: ["Rest of Jeremiah"],
    bookNumber: undefined,
    type: "ethiopian",
  },
  PsJos: {
    name: "Pseudo-Josephus",
    alternateNames: [
      "Jossipon",
      "Joseph ben Gorion's Medieval History of the Jews",
    ],
    bookNumber: undefined,
    type: "ethiopian",
  },

  // Armenian Orthodox canon additions
  EpCorPaul: {
    name: "Epistle of the Corinthians to Paul",
    alternateNames: [],
    bookNumber: undefined,
    type: "armenian",
  },
  "3Cor": { name: "3 Corinthians", alternateNames: [], bookNumber: undefined, type: "armenian" },
  WSir: { name: "Words of Sirach", alternateNames: [], bookNumber: undefined, type: "armenian" },
  PrEuth: { name: "Prayer of Euthalius", alternateNames: [], bookNumber: undefined, type: "armenian" },
  DormJohn: { name: "Dormition of John", alternateNames: [], bookNumber: undefined, type: "armenian" },
  JosAsen: { name: "Joseph and Asenath", alternateNames: [], bookNumber: undefined, type: "armenian" },
  T12Patr: {
    name: "Testaments of the Twelve Patriarchs",
    alternateNames: [],
    bookNumber: undefined,
    type: "armenian",
  },
  "T12Patr.TAsh": {
    name: "Testament of Asher",
    alternateNames: [],
    bookNumber: undefined,
    type: "armenian",
  },
  "T12Patr.TBenj": {
    name: "Testament of Benjamin",
    alternateNames: [],
    bookNumber: undefined,
    type: "armenian",
  },
  "T12Patr.TDan": {
    name: "Testament of Dan",
    alternateNames: [],
    bookNumber: undefined,
    type: "armenian",
  },
  "T12Patr.TGad": {
    name: "Testament of Gad",
    alternateNames: [],
    bookNumber: undefined,
    type: "armenian",
  },
  "T12Patr.TIss": {
    name: "Testament of Issachar",
    alternateNames: [],
    bookNumber: undefined,
    type: "armenian",
  },
  "T12Patr.TJos": {
    name: "Testament of Joseph",
    alternateNames: [],
    bookNumber: undefined,
    type: "armenian",
  },
  "T12Patr.TJud": {
    name: "Testament of Judah",
    alternateNames: [],
    bookNumber: undefined,
    type: "armenian",
  },
  "T12Patr.TLevi": {
    name: "Testament of Levi",
    alternateNames: [],
    bookNumber: undefined,
    type: "armenian",
  },
  "T12Patr.TNaph": {
    name: "Testament of Naphtali",
    alternateNames: [],
    bookNumber: undefined,
    type: "armenian",
  },
  "T12Patr.TReu": {
    name: "Testament of Reuben",
    alternateNames: [],
    bookNumber: undefined,
    type: "armenian",
  },
  "T12Patr.TSim": {
    name: "Testament of Simeon",
    alternateNames: [],
    bookNumber: undefined,
    type: "armenian",
  },
  "T12Patr.TZeb": {
    name: "Testament of Zebulun",
    alternateNames: [],
    bookNumber: undefined,
    type: "armenian",
  },

  // Peshitta / Syriac Orthodox canon
  "2Bar": {
    name: "2 Baruch",
    alternateNames: ["(Syriac) Apocalypse of Baruch"],
    bookNumber: undefined,
    type: "peshitta",
  },
  EpBar: { name: "Letter of Baruch", alternateNames: [], bookNumber: undefined, type: "peshitta" },
  "5ApocSyrPss": {
    name: "Additional Syriac Psalms",
    alternateNames: ["5 Apocryphal Syriac Psalms"],
    bookNumber: undefined,
    type: "peshitta",
  },
  JosephusJWvi: {
    name: "Josephus' Jewish War VI",
    alternateNames: [],
    bookNumber: undefined,
    type: "peshitta",
  },

  // Apostolic Fathers
  "1Clem": { name: "1 Clement", alternateNames: [], bookNumber: undefined, type: "fathers" },
  "2Clem": { name: "2 Clement", alternateNames: [], bookNumber: undefined, type: "fathers" },
  IgnEph: {
    name: "Ignatius to the Ephesians",
    alternateNames: [],
    bookNumber: undefined,
    type: "fathers",
  },
  IgnMagn: {
    name: "Ignatius to the Magnesians",
    alternateNames: [],
    bookNumber: undefined,
    type: "fathers",
  },
  IgnTrall: {
    name: "Ignatius to the Trallians",
    alternateNames: [],
    bookNumber: undefined,
    type: "fathers",
  },
  IgnRom: {
    name: "Ignatius to the Romans",
    alternateNames: [],
    bookNumber: undefined,
    type: "fathers",
  },
  IgnPhld: {
    name: "Ignatius to the Philadelphians",
    alternateNames: [],
    bookNumber: undefined,
    type: "fathers",
  },
  IgnSmyrn: {
    name: "Ignatius to the Smyrnaeans",
    alternateNames: [],
    bookNumber: undefined,
    type: "fathers",
  },
  IgnPol: { name: "Ignatius to Polycarp", alternateNames: [], bookNumber: undefined, type: "fathers" },
  PolPhil: {
    name: "Polycarp to the Philippians",
    alternateNames: [],
    bookNumber: undefined,
    type: "fathers",
  },
  MartPol: {
    name: "Martyrdom of Polycarp",
    alternateNames: [],
    bookNumber: undefined,
    type: "fathers",
  },
  Did: { name: "Didache", alternateNames: [], bookNumber: undefined, type: "fathers" },

  Barn: { name: "Barnabas", alternateNames: [], bookNumber: undefined, type: "fathers" },
  Herm: { name: "Shepherd of Hermas", alternateNames: [], bookNumber: undefined, type: "fathers" },
  "Herm.Mand": {
    name: "Shepherd of Hermas, Mandates",
    alternateNames: [],
    bookNumber: undefined,
    type: "fathers",
  },
  "Herm.Sim": {
    name: "Shepherd of Hermas, Similitudes",
    alternateNames: [],
    bookNumber: undefined,
    type: "fathers",
  },
  "Herm.Vis": {
    name: "Shepherd of Hermas, Visions",
    alternateNames: [],
    bookNumber: undefined,
    type: "fathers",
  },
  Diogn: { name: "Diognetus", alternateNames: [], bookNumber: undefined, type: "fathers" },
  AposCreed: { name: "Apostles' Creed", alternateNames: [], bookNumber: undefined, type: "fathers" },
  PapFrag: { name: "Fragments of Papias", alternateNames: [], bookNumber: undefined, type: "fathers" },
  RelElders: {
    name: "Reliques of the Elders",
    alternateNames: [],
    bookNumber: undefined,
    type: "fathers",
  },
  QuadFrag: {
    name: "Fragment of Quadratus",
    alternateNames: [],
    bookNumber: undefined,
    type: "fathers",
  },
} as const satisfies Record<string, OsisBookMetadata>

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
