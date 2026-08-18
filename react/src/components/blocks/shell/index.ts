import { ShellLayout } from "./shell-layout"

export type * from "./type"
export * from "./shell-metrics"
export * from "./use-shell-panels"
export { useShellFit } from "./use-shell-fit"
export { useShellFitActions, useShellFitState } from "./use-shell-fit-state"
// The public atom surface. `@internal` atoms (measure, mount) stay unexported
// on purpose — `export *` would make every internal a breaking-change surface
// for consumer apps.
export {
  removeShellFitInstance,
  resetShellPanelWidthAtom,
  resizeShellPanelAtom,
  shellFitFitsAtom,
  shellFitMeasuredAtom,
  shellFitMetricsAtom,
  shellFitPanelBoundsAtom,
  shellFitPanelWidthAtom,
  shellFitRequestedWidthAtom,
  shellFitStateAtom,
} from "./shell-fit-atom"
export * from "./utils"

export * from "./animated-panel"
export * from "./animated-panel-inset"
export * from "./animated-panel-provider"
export * from "./animated-panel-trigger"

export * from "./animated-sidebar-header"
export * from "./animated-sidebar-content"
export * from "./animated-sidebar-footer"
export * from "./animated-sidebar-group"
export * from "./animated-sidebar-group-label"
export * from "./animated-sidebar-group-content"
export * from "./animated-sidebar-menu"
export * from "./animated-sidebar-menu-item"
export * from "./animated-sidebar-menu-sub"
export * from "./animated-sidebar-menu-sub-item"
export * from "./animated-sidebar-menu-sub-button"
export * from "./animated-sidebar-menu-button"

export { ShellLayout as default }
