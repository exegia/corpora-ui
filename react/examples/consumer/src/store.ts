import { atom, createStore } from "jotai"

export const readingStore = createStore()
export const savedNotesAtom = atom<string[]>([])
export const notebookDetailsOpenAtom = atom(false)
