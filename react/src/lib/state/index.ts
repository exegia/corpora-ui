export { ExegiaProvider, useExegiaStore } from "./exegia-provider"
export type { IExegiaProviderProps, IExegiaThemeOptions } from "./exegia-provider"
export { exegiaStore } from "./store"
export type { TExegiaStore } from "./store"
export type { TExegiaPortalContainer } from "./portal-context"
export { preloadSounds } from "./sound-loading"

export { useCanon } from "../../components/composed/navigation/toc/use-canon"
export {
  canonSelectedLinkAtom,
  canonExpandedIdsAtom,
  canonActiveSectionIdAtom,
  canonStateAtom,
  selectCanonItemAtom,
  setCanonSectionAtom,
  resetCanonAtom,
  removeCanonInstance,
} from "../../components/composed/navigation/toc/canon-atom"
export type { CanonState, CanonProps, TCanonItem, CanonContextMenuItem, CanonContextMenuItems } from "../../components/composed/navigation/toc/types"
