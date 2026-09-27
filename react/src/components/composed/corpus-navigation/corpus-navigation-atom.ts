import { atom } from "jotai"
import type { Getter, Setter } from "jotai"
import { createKeyedFamilies } from "@/lib/keyed-atom"
import { removeTreeInstance } from "@/components/composed/tree/tree-atom"
import type {
  CorpusAnchor,
  CorpusBinding,
  CorpusNavigationState,
} from "./types"
import { referenceResults, sameAnchor, scopeKey, validAnchor } from "./utils"

const { keyed, stateFamily, actionFamily, removeInstance } =
  createKeyedFamilies("corpus-navigation")
const initial: CorpusNavigationState = {
  location: null,
  draft: null,
  pickerOpen: false,
  commandOpen: false,
  query: "",
  results: [],
  searchStatus: "idle",
  searchError: null,
  pending: false,
  error: null,
  history: [],
}
/** @internal Mutable state is written only by action atoms. */
const stateAtom = stateFamily<CorpusNavigationState>("state", initial)
/** @internal The binding is deliberately not part of the subscribed state. */
export const corpusBindingAtom = stateFamily<CorpusBinding | null>(
  "binding",
  null
)
const searchRequestAtom = stateFamily<AbortController | null>(
  "search-request",
  null
)
const commitRequestAtom = stateFamily<AbortController | null>(
  "commit-request",
  null
)
const proposalAtom = stateFamily<{
  anchor: CorpusAnchor
  history: readonly CorpusAnchor[]
} | null>("proposal", null)
const savedAtom = stateFamily<
  Readonly<Record<string, Pick<CorpusNavigationState, "location" | "history">>>
>("saved", {})
export const corpusNavigationStateAtom = keyed((id) => {
  const value = atom((get) => get(stateAtom(id)))
  value.debugLabel = `corpus-navigation/${id}/public-state`
  return value
})
export const corpusNavigationDataAtom = keyed((id) => {
  const value = atom((get) => get(corpusBindingAtom(id))?.data ?? null)
  value.debugLabel = `corpus-navigation/${id}/data`
  return value
})
function stop(get: Getter, set: Setter, id: string) {
  get(searchRequestAtom(id))?.abort()
  get(commitRequestAtom(id))?.abort()
  set(searchRequestAtom(id), null)
  set(commitRequestAtom(id), null)
}
/** @internal One-way projection; no read hook subscribes to its inline data input. */
export const bindCorpusNavigationAtom = actionFamily(
  "bind",
  (get, set, id, binding: CorpusBinding) => {
    const old = get(corpusBindingAtom(id))
    const state = get(stateAtom(id))
    set(corpusBindingAtom(id), binding)
    const changed = !old || scopeKey(old.data) !== scopeKey(binding.data)
    if (changed) {
      set(proposalAtom(id), null)
      stop(get, set, id)
      if (old)
        set(savedAtom(id), {
          ...get(savedAtom(id)),
          [scopeKey(old.data)]: {
            location: state.location,
            history: state.history,
          },
        })
      const saved = get(savedAtom(id))[scopeKey(binding.data)]
      const candidate = binding.controlled
        ? binding.location
        : (saved?.location ?? binding.location)
      const location = validAnchor(binding.data, candidate) ? candidate : null
      set(stateAtom(id), {
        ...initial,
        location,
        draft: location,
        history: binding.controlled
          ? []
          : (saved?.history ?? []).filter((anchor) =>
              validAnchor(binding.data, anchor)
            ),
      })
      return
    }
    const location = binding.controlled ? binding.location : state.location
    const next = validAnchor(binding.data, location) ? location : null
    const proposal = get(proposalAtom(id))
    const acceptedHistory =
      proposal && sameAnchor(next, proposal.anchor)
        ? proposal.history
        : state.history
    const invalidDraft =
      state.draft !== null && !validAnchor(binding.data, state.draft)
    if (!sameAnchor(next, state.location) || invalidDraft) {
      set(proposalAtom(id), null)
      stop(get, set, id)
      set(stateAtom(id), {
        ...state,
        location: next,
        draft: next,
        history: acceptedHistory,
        pending: false,
        error: null,
        results: [],
        searchStatus: "idle",
      })
    }
  }
)
export const selectCorpusLocationAtom = actionFamily(
  "select",
  (get, set, id, anchor: CorpusAnchor) => {
    const binding = get(corpusBindingAtom(id))
    if (!binding || !validAnchor(binding.data, anchor)) return
    get(commitRequestAtom(id))?.abort()
    set(commitRequestAtom(id), null)
    set(stateAtom(id), {
      ...get(stateAtom(id)),
      draft: anchor,
      pending: false,
      error: null,
    })
  }
)
export const openCorpusPickerAtom = actionFamily(
  "open-picker",
  (get, set, id) => {
    const state = get(stateAtom(id))
    set(stateAtom(id), {
      ...state,
      pickerOpen: true,
      draft: state.location,
      error: null,
    })
  }
)
export const cancelCorpusNavigationAtom = actionFamily(
  "cancel",
  (get, set, id) => {
    set(proposalAtom(id), null)
    stop(get, set, id)
    const state = get(stateAtom(id))
    set(stateAtom(id), {
      ...state,
      draft: state.location,
      pickerOpen: false,
      commandOpen: false,
      pending: false,
      error: null,
      searchStatus: "idle",
    })
  }
)
export const setCorpusCommandOpenAtom = actionFamily(
  "command-open",
  (get, set, id, open: boolean) => {
    if (!open) {
      get(searchRequestAtom(id))?.abort()
      set(searchRequestAtom(id), null)
    }
    set(stateAtom(id), {
      ...get(stateAtom(id)),
      commandOpen: open,
      searchStatus: open ? get(stateAtom(id)).searchStatus : "idle",
    })
  }
)
export const searchCorpusAtom = keyed((id) => {
  const value = atom(null, async (get, set, query: string) => {
    get(searchRequestAtom(id))?.abort()
    const binding = get(corpusBindingAtom(id))
    if (!binding) return
    const request = new AbortController()
    set(searchRequestAtom(id), request)
    const reference = referenceResults(binding.data, query)
    set(stateAtom(id), {
      ...get(stateAtom(id)),
      query,
      results: reference,
      searchError: null,
      searchStatus: query.trim() && binding.data.search ? "loading" : "ready",
    })
    if (!query.trim() || !binding.data.search) return
    try {
      const results = await binding.data.search(query, request.signal)
      if (request.signal.aborted || get(searchRequestAtom(id)) !== request)
        return
      const data = get(corpusBindingAtom(id))!.data
      const seen = new Set(reference.map((item) => item.anchor.nodeId))
      const text = results
        .filter((item) => {
          if (!validAnchor(data, item.anchor) || seen.has(item.anchor.nodeId))
            return false
          seen.add(item.anchor.nodeId)
          return true
        })
        .slice(0, 50)
        .map((item) => ({ ...item, kind: "text" as const }))
      set(stateAtom(id), {
        ...get(stateAtom(id)),
        results: [...reference, ...text],
        searchStatus: "ready",
      })
    } catch (error) {
      if (request.signal.aborted || get(searchRequestAtom(id)) !== request)
        return
      set(stateAtom(id), {
        ...get(stateAtom(id)),
        searchStatus: "error",
        searchError: error instanceof Error ? error.message : "Search failed",
      })
    }
  })
  value.debugLabel = `corpus-navigation/${id}/search`
  return value
})
async function commit(
  get: Getter,
  set: Setter,
  id: string,
  candidate?: CorpusAnchor,
  returning = false
) {
  const binding = get(corpusBindingAtom(id))
  const state = get(stateAtom(id))
  const anchor = candidate ?? state.draft
  if (
    !binding ||
    state.pending ||
    (binding.controlled &&
      sameAnchor(get(proposalAtom(id))?.anchor ?? null, anchor))
  )
    return
  if (!validAnchor(binding.data, anchor)) {
    set(stateAtom(id), {
      ...state,
      error: "Choose a valid location in this edition.",
    })
    return
  }
  const request = new AbortController()
  set(commitRequestAtom(id), request)
  set(stateAtom(id), { ...state, pending: true, error: null })
  try {
    const resolved = binding.data.resolve
      ? await binding.data.resolve(anchor, request.signal)
      : anchor
    if (request.signal.aborted || get(commitRequestAtom(id)) !== request) return
    const latest = get(corpusBindingAtom(id))!
    if (!validAnchor(latest.data, resolved))
      throw new Error("The resolved location is not in this edition.")
    const current = get(stateAtom(id))
    const changed = !sameAnchor(current.location, resolved)
    const history = returning
      ? current.history.slice(0, -1)
      : changed && current.location
        ? [...current.history, current.location].slice(-latest.historyLimit)
        : current.history
    if (latest.controlled && changed)
      set(proposalAtom(id), {
        anchor: resolved,
        history: latest.historyLimit === 0 ? [] : history,
      })
    if (changed) latest.onNavigate?.(resolved)
    set(stateAtom(id), {
      ...get(stateAtom(id)),
      location: latest.controlled ? get(stateAtom(id)).location : resolved,
      draft: resolved,
      history: latest.controlled
        ? current.history
        : latest.historyLimit === 0
          ? []
          : history,
      pending: false,
      pickerOpen: false,
      commandOpen: false,
    })
  } catch (error) {
    if (request.signal.aborted || get(commitRequestAtom(id)) !== request) return
    set(proposalAtom(id), null)
    set(stateAtom(id), {
      ...get(stateAtom(id)),
      pending: false,
      error: error instanceof Error ? error.message : "Navigation failed",
    })
  }
}
export const commitCorpusLocationAtom = keyed((id) => {
  const value = atom(null, (get, set, anchor?: CorpusAnchor) =>
    commit(get, set, id, anchor)
  )
  value.debugLabel = `corpus-navigation/${id}/commit`
  return value
})
export const returnCorpusLocationAtom = keyed((id) => {
  const value = atom(null, (get, set) => {
    const anchor = get(stateAtom(id)).history.at(-1)
    return anchor ? commit(get, set, id, anchor, true) : Promise.resolve()
  })
  value.debugLabel = `corpus-navigation/${id}/return`
  return value
})
/** Call after consumers unmount. Cancelling before teardown also aborts pending work. */
export function removeCorpusNavigationInstance(id: string): void {
  removeInstance(id)
  removeTreeInstance(`corpus-navigation/${id}/hierarchy`)
}
