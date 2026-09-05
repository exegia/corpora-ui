
import type { ComponentType } from "react";
import { TooltipCreateHandle } from "@/components/ui/tooltip";
import type { ActionKey, ActionMap } from "./types";
import { ToolbarSeparator } from "@/components/ui/toolbar";

export const tooltipHandle = TooltipCreateHandle<ComponentType>();

export const useActionBar = ({ actions }: { actions: ActionMap<ActionKey> }) => {
  const hasGroups = Object.keys(actions).some(item => item.startsWith("separator-"));
  const groupsCount = Object.keys(actions).filter(item => item.startsWith("separator-")).length;
  const groups = Object.values(actions).  
  
  
  return { hasGroups, groupsCount, groups, actionItemsByGroup };
}