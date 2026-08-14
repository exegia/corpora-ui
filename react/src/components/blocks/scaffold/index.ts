import { PanelCloseButton } from "./panel-close-button"
import { PanelSwapButton } from "./panel-swap-button"
import { ScaffoldActions } from "./scaffold-actions"
import { ScaffoldCanvas } from "./scaffold-canvas"
import { ScaffoldInspector } from "./scaffold-inspector"
import { ScaffoldMain } from "./scaffold-main"
import { ScaffoldPanel } from "./scaffold-panel"
import { ScaffoldRoot } from "./scaffold-root"
import { ScaffoldSidebar } from "./scaffold-sidebar"
import { ScaffoldSubPanel } from "@/components/blocks/scaffold/scaffold-sub-panel.tsx"

export { useScaffoldContext } from "./scaffold-context"
export { useScaffold } from "./use-scaffold"
export type * from "./type"
export * from "./constants"

export {
  PanelCloseButton,
  PanelSwapButton,
  ScaffoldActions,
  ScaffoldCanvas,
  ScaffoldInspector,
  ScaffoldMain,
  ScaffoldPanel,
  ScaffoldRoot,
  ScaffoldSidebar,
}

export const Scaffold = {
  Root: ScaffoldRoot,
  Sidebar: ScaffoldSidebar,
  Main: ScaffoldMain,
  Actions: ScaffoldActions,
  Canvas: ScaffoldCanvas,
  Panel: ScaffoldPanel,
  Inspector: ScaffoldInspector,
  SubPanel: ScaffoldSubPanel
}
