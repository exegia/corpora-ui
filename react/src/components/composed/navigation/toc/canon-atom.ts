import { atom } from "jotai"
import { atomWithReset, RESET } from "jotai/utils"
import type { CanonState, TCanonItem } from "./types"

// Cache definitions, never values: each Exegia store owns independent state.
// Like Tree, named instances persist until explicitly released by the app.
function createCanonAtoms(id: string) {
  const ownedLink = atomWithReset<CanonState["selectedLink"]>(undefined)
  const controlledLink = atom<CanonState["selectedLink"]>(undefined)
  const selectedLink = atom((get) => get(controlledLink) ?? get(ownedLink))
  const projectLink = atom(null, (_get, set, value: string | undefined) => {
    set(controlledLink, value)
  })
  const browseLink = atomWithReset<string | undefined>(undefined)
  const browse = atom(null, (_get, set, link: string | undefined) => set(browseLink, link))
  const expandedIds = atomWithReset<CanonState["expandedIds"]>(new Set())
  const activeSectionId =
    atomWithReset<CanonState["activeSectionId"]>(undefined)
  const select = atom(null, (get, set, item: TCanonItem) => {
    if (item.nodes?.length) set(browseLink, item.link)
    if (get(selectedLink) === item.link) return
    set(ownedLink, item.link)
    if (item.nodes?.length) {
      const next = new Set(get(expandedIds))
      if (next.has(item.id)) next.delete(item.id)
      else next.add(item.id)
      set(expandedIds, next)
    }
  })
  const setSection = atom(null, (_get, set, sectionId: string | undefined) => {
    set(activeSectionId, sectionId)
    set(browseLink, undefined)
  })
  const reset = atom(null, (_get, set) => {
    set(browseLink, RESET)
    set(ownedLink, RESET)
    set(expandedIds, RESET)
    set(activeSectionId, RESET)
  })
  const state = atom<CanonState>((get) => ({
    browseLink: get(browseLink),
    selectedLink: get(selectedLink),
    expandedIds: get(expandedIds),
    activeSectionId: get(activeSectionId),
  }))
  const atoms = {
    browseLink,
    browse,
    ownedLink,
    controlledLink,
    projectLink,
    selectedLink,
    expandedIds,
    activeSectionId,
    select,
    setSection,
    reset,
    state,
  }
  for (const [name, value] of Object.entries(atoms)) {
    value.debugLabel = `canon/${id}/${name}`
  }
  return atoms
}

const instances = new Map<string, ReturnType<typeof createCanonAtoms>>()
function canonAtoms(id: string) {
  let instance = instances.get(id)
  if (!instance) {
    instance = createCanonAtoms(id)
    instances.set(id, instance)
  }
  return instance
}

export const canonSelectedLinkAtom = (id: string) => canonAtoms(id).selectedLink
export const canonExpandedIdsAtom = (id: string) => canonAtoms(id).expandedIds
export const canonActiveSectionIdAtom = (id: string) =>
  canonAtoms(id).activeSectionId
export const canonStateAtom = (id: string) => canonAtoms(id).state
export const selectCanonItemAtom = (id: string) => canonAtoms(id).select
export const setCanonSectionAtom = (id: string) => canonAtoms(id).setSection
export const resetCanonAtom = (id: string) => canonAtoms(id).reset

/** Release atom definitions only after all consumers of this id have unmounted. */
export function removeCanonInstance(id: string): void {
  instances.delete(id)
}

/** @internal Publish the controlled prop without replacing owned selection. */
export const projectCanonLinkAtom = (id: string) => canonAtoms(id).projectLink

export const canonBrowseLinkAtom = (id: string) => canonAtoms(id).browseLink
export const browseCanonAtom = (id: string) => canonAtoms(id).browse
