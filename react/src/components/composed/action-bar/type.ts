import type { TButtonProps } from "@/components/ui/button";
import type { TPopoverGlassProps } from "@/components/ui/popover-glass";
import type { ToolbarSeparatorProps } from "@base-ui/react";
import type { Emoji } from "frimousse";
import type { LucideIcon } from "lucide-react";
import type { FunctionComponent } from "react";


export interface IActionButtonProps<T extends string> extends Omit<TButtonProps, "variant" | "glassVariant" | "size"> {
  action: () => void;
  tooltip?: string;
  Icon: LucideIcon | Emoji;
  id: T;
}

type TActionBarItemType = "action" | "separator";
export type TActionKey<T extends string = string, Type extends TActionBarItemType = "action"> = `${Type}-${T}`;

/**
 * Insertion order is the contract: the bar groups positionally, so the order
 * keys are written is the order they render. Safe because every `ActionKey`
 * is a non-numeric `${type}-${name}` string, which `Object.entries` preserves
 * — but a map built by spreading or `Object.fromEntries` must keep that order.
 */
export type TActionMap<T extends TActionKey> = Record<T, FunctionComponent<IActionButtonProps<T> | ToolbarSeparatorProps>>;

export type TActionEntry = readonly [
  key: string,
  Item: FunctionComponent<IActionButtonProps<string> | ToolbarSeparatorProps>,
];

/** Actions between two separators, rendered inside one `ToolbarGroup`. */
export type TActionItemsByGroup = Record<string, TActionEntry[]>;

/**
 * The bar as an ordered, render-ready list. A "group" is a run of consecutive
 * actions; a "separator" is whatever component the map supplied for that key.
 * Empty groups (leading, trailing or back-to-back separators) are dropped.
 */
export type TActionBarSegment =
  | { type: "group"; key: string; items: TActionEntry[] }
  | { type: "separator"; key: string; Separator: FunctionComponent<ToolbarSeparatorProps> };

export interface IActionBarProps extends Omit<TPopoverGlassProps, "variant" | "children"> {
  id: string;
  variant: "default" | "ghost" | "glass";
  actions: TActionMap<TActionKey>;
}


export interface IEmojiActionBarProps {
  /** Fires for both a quick reaction and a pick from the full picker. */
  onEmojiSelect?: (emoji: Emoji) => void
  /** Quick row contents. Defaults to {@link QUICK_REACTIONS}. */
  reactions?: readonly Emoji[]
  /** Hides the trailing "More" action, leaving the quick row only. */
  hideMore?: boolean
}