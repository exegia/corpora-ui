import ShellLayout, {
  AnimatedPanel,
  AnimatedPanelTrigger,
  useShellPanels,
  resetShellPanelWidthAtom,
  resizeShellPanelAtom,
  shellFitFitsAtom,
  shellFitMeasuredAtom,
  shellFitMetricsAtom,
  shellFitPanelBoundsAtom,
  shellFitPanelWidthAtom,
  shellFitRequestedWidthAtom,
  shellFitStateAtom,
} from "@/components/blocks/shell"

const Layout = {
  Main: ShellLayout,
  Panel: AnimatedPanel,
  Trigger: AnimatedPanelTrigger,
}

export {
  useShellPanels,
  resetShellPanelWidthAtom,
  resizeShellPanelAtom,
  shellFitFitsAtom,
  shellFitMeasuredAtom,
  shellFitMetricsAtom,
  shellFitPanelBoundsAtom,
  shellFitPanelWidthAtom,
  shellFitRequestedWidthAtom,
  shellFitStateAtom,
}

export default Layout
