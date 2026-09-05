import type { ButtonProps } from "@/components/ui/button";
import type { PopoverPopupProps } from "@/components/ui/popover";
import type { ToolbarSeparatorProps } from "@base-ui/react";
import type { LucideIcon } from "lucide-react";
import type { FunctionComponent } from "react";


export interface ActionButtonProps<T extends string> extends Omit<ButtonProps, "variant" | "glassVariant" | "size"> {
  action: () => void;
  tooltip?: string;
  Icon: LucideIcon;
  id: T;
}

type ActionBarItemType = "action" | "separator";
export type ActionKey<T extends string = string, Type extends ActionBarItemType = "action"> = `${Type}-${T}`;

/**
 * Insertion order is the contract: the bar groups positionally, so the order
 * keys are written is the order they render. Safe because every `ActionKey`
 * is a non-numeric `${type}-${name}` string, which `Object.entries` preserves
 * — but a map built by spreading or `Object.fromEntries` must keep that order.
 */
export type ActionMap<T extends ActionKey> = Record<T, FunctionComponent<ActionButtonProps<T> | ToolbarSeparatorProps>>;

export type ActionEntry = readonly [
  key: string,
  Item: FunctionComponent<ActionButtonProps<string> | ToolbarSeparatorProps>,
];

/** Actions between two separators, rendered inside one `ToolbarGroup`. */
export type ActionItemsByGroup = Record<string, ActionEntry[]>;

/**
 * The bar as an ordered, render-ready list. A "group" is a run of consecutive
 * actions; a "separator" is whatever component the map supplied for that key.
 * Empty groups (leading, trailing or back-to-back separators) are dropped.
 */
export type ActionBarSegment =
  | { type: "group"; key: string; items: ActionEntry[] }
  | { type: "separator"; key: string; Separator: FunctionComponent<ToolbarSeparatorProps> };

export interface ActionBarProps extends Omit<PopoverPopupProps, "variant" | "children"> {
  id: string;
  variant: "default" | "ghost" | "glass";
  actions: ActionMap<ActionKey>;
}