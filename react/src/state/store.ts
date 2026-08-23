import { createStore } from "jotai"

/** A Jotai store as created by `createStore()`. */
export type ExegiaStore = ReturnType<typeof createStore>

/**
 * The library's default store — the one `ExegiaProvider` mounts unless it is
 * handed another. Exported so non-React code (a router guard, a command
 * palette, a test) can read and write library state imperatively:
 *
 * ```ts
 * exegiaStore.get(treeExpandedIdsAtom("app-nav"))
 * ```
 *
 * A single module-level store is wrong for SSR — state would leak between
 * requests — so render-per-request apps pass a fresh `createStore()` to
 * `ExegiaProvider` instead.
 */
export const exegiaStore: ExegiaStore = createStore()
