/** Stable identity; labels and display paths never participate in equality. */
export interface CorpusAnchor {
  corpusId: string
  editionId: string
  nodeId: string
}
export interface CorpusLevel {
  id: string
  label: string
  kind: "hierarchy" | "number"
  optional?: boolean
}
export interface CorpusSchema {
  id: string
  label: string
  levels: readonly CorpusLevel[]
}
export interface CorpusNode {
  id: string
  level: string
  label: string
  /** Exact reference token, e.g. "32", "iv". Order is the supplied array order. */
  reference?: string
  aliases?: readonly string[]
  children?: readonly CorpusNode[]
  disabled?: boolean
}
export interface CorpusSearchResult {
  anchor: CorpusAnchor
  label: string
  excerpt?: string
  kind: "reference" | "text"
}
export interface CorpusData {
  corpusId: string
  editionId: string
  label: string
  schema: CorpusSchema
  nodes: readonly CorpusNode[]
  direction?: "ltr" | "rtl"
  resolve?: (anchor: CorpusAnchor, signal: AbortSignal) => Promise<CorpusAnchor>
  search?: (
    query: string,
    signal: AbortSignal
  ) => Promise<readonly Omit<CorpusSearchResult, "kind">[]>
}
export interface CorpusNavigationState {
  location: CorpusAnchor | null
  draft: CorpusAnchor | null
  pickerOpen: boolean
  commandOpen: boolean
  query: string
  results: readonly CorpusSearchResult[]
  searchStatus: "idle" | "loading" | "ready" | "error"
  searchError: string | null
  pending: boolean
  error: string | null
  history: readonly CorpusAnchor[]
}
export interface CorpusNavigationOptions {
  navigatorId?: string
  data: CorpusData
  /** undefined = uncontrolled, null = controlled with no current location. */
  location?: CorpusAnchor | null
  defaultLocation?: CorpusAnchor | null
  historyLimit?: number
  onNavigate?: (anchor: CorpusAnchor) => void
}
export interface CorpusNavigationActions {
  select: (anchor: CorpusAnchor) => void
  openPicker: () => void
  cancel: () => void
  setCommandOpen: (open: boolean) => void
  search: (query: string) => Promise<void>
  commit: (anchor?: CorpusAnchor) => Promise<void>
  returnToPrevious: () => Promise<void>
}
/** @internal */
export interface CorpusBinding {
  data: CorpusData
  controlled: boolean
  location: CorpusAnchor | null
  historyLimit: number
  onNavigate?: (anchor: CorpusAnchor) => void
}
