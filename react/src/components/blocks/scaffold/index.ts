import { PanelCloseButton } from "./panel-close-button"
import { PanelMenuButton } from "./panel-menu-button.tsx"
import { ScaffoldActions } from "./scaffold-actions"
import { ScaffoldCanvas } from "./scaffold-canvas"
import { ScaffoldInspector } from "./scaffold-inspector"
import { ScaffoldMain } from "./scaffold-main"
import { ScaffoldPanel } from "./scaffold-panel"
import { ScaffoldRoot } from "./scaffold-root"
import { ScaffoldSidebar } from "./scaffold-sidebar"
import { ScaffoldTab } from "./scaffold-tab"
import { ScaffoldSubPanel } from "@/components/blocks/scaffold/scaffold-sub-panel.tsx"

export { useScaffoldContext } from "./scaffold-context"
export { useScaffold } from "./use-scaffold"
export type * from "./type"
export * from "./constants"

export {
  PanelCloseButton,
  PanelMenuButton,
  ScaffoldActions,
  ScaffoldCanvas,
  ScaffoldInspector,
  ScaffoldMain,
  ScaffoldPanel,
  ScaffoldRoot,
  ScaffoldSidebar,
  ScaffoldTab,
}

export const Scaffold = {
  Root: ScaffoldRoot,
  Sidebar: ScaffoldSidebar,
  Main: ScaffoldMain,
  Actions: ScaffoldActions,
  Canvas: ScaffoldCanvas,
  Panel: ScaffoldPanel,
  Tab: ScaffoldTab,
  Inspector: ScaffoldInspector,
  SubPanel: ScaffoldSubPanel,
}
