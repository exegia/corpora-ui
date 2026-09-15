/**
 * String-keyed Jotai atom families for the chat components.
 *
 * `jotai/utils`' `atomFamily` is deprecated for Jotai v3, so the library keeps
 * a tiny in-house family: one cache per family, a `remove(id)` that lets the
 * store drop an instance, and a per-feature registry so `removeInstance(id)`
 * clears every family of that feature at once. `tree`, `scaffold` and the AI
 * sidebar carry their own copies of this shape; new chat state uses this one.
 */
import { atom } from "jotai"
import type { Getter, Setter } from "jotai"

export type Family<AtomType> = ((id: string) => AtomType) & { remove: (id: string) => void }

export function createKeyedFamilies(feature: string) {
  const families: { remove: (id: string) => void }[] = []

  function keyed<AtomType>(create: (id: string) => AtomType): Family<AtomType> {
    const cache = new Map<string, AtomType>()
    const family = ((id: string) => {
      let instance = cache.get(id)
      if (instance === undefined) {
        instance = create(id)
        cache.set(id, instance)
      }
      return instance
    }) as Family<AtomType>
    family.remove = (id) => {
      cache.delete(id)
    }
    families.push(family)
    return family
  }

  function stateFamily<Value>(name: string, initialValue: Value) {
    return keyed((id) => {
      const instance = atom(initialValue)
      instance.debugLabel = `${feature}/${id}/${name}`
      return instance
    })
  }

  function actionFamily<Args extends unknown[]>(
    name: string,
    write: (get: Getter, set: Setter, id: string, ...args: Args) => void
  ) {
    return keyed((id) => {
      const instance = atom(null, (get, set, ...args: Args) => write(get, set, id, ...args))
      instance.debugLabel = `${feature}/${id}/${name}`
      return instance
    })
  }

  /** Drop every atom of one instance so the store can release its state. */
  function removeInstance(id: string): void {
    for (const family of families) family.remove(id)
  }

  return { keyed, stateFamily, actionFamily, removeInstance }
}
