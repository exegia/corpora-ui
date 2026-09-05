import { type ComponentType, useMemo } from "react";
import { TooltipCreateHandle } from "@/components/ui/tooltip";
import type {
  ActionBarSegment,
  ActionEntry,
  ActionItemsByGroup,
  ActionKey,
  ActionMap,
} from "./types";

export const tooltipHandle = TooltipCreateHandle<ComponentType>();

const isSeparator = (key: string): boolean => key.startsWith("separator-");

/**
 * Splits `actions` into render-ready segments at every `separator-*` key.
 *
 * Order comes from the map's insertion order (see `ActionMap`) — the grouping
 * is positional, so actions written before a separator group ahead of it.
 * Empty groups are dropped, which is what keeps a leading, trailing or
 * doubled separator from rendering a `ToolbarGroup` with nothing in it.
 */
export const useActionBar = ({ actions }: { actions: ActionMap<ActionKey> }) => {
  return useMemo(() => {
    const entries = Object.entries(actions) as ActionEntry[];
    const segments: ActionBarSegment[] = [];
    let open: ActionEntry[] = [];

    const closeGroup = (): void => {
      if (open.length === 0) return;
      segments.push({ type: "group", key: `group-${open[0][0]}`, items: open });
      open = [];
    };

    for (const entry of entries) {
      const [key, Item] = entry;
      if (isSeparator(key)) {
        closeGroup();
        segments.push({ type: "separator", key, Separator: Item });
        continue;
      }
      open.push(entry);
    }
    closeGroup();

    const groups = segments.filter((s) => s.type === "group");

    // A bar with no separators renders flat — `ToolbarGroup` is only added
    // once the caller has actually asked for grouping.
    const hasGroups = segments.some((s) => s.type === "separator");

    const actionItemsByGroup: ActionItemsByGroup = Object.fromEntries(
      groups.map((group) => [group.key, group.items]),
    );

    return {
      segments,
      entries,
      hasGroups,
      groupsCount: groups.length,
      separatorCount: segments.length - groups.length,
      actionItemsByGroup,
    };
  }, [actions]);
};
