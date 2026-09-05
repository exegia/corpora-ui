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
export type ActionMap<T extends ActionKey> = Record<T, FunctionComponent<ActionButtonProps<T> | ToolbarSeparatorProps>>;
export type ActionItemsByGroup = Record<string, FunctionComponent<ActionButtonProps<string>>[]>;

export interface ActionBarProps extends Omit<PopoverPopupProps, "variant" | "children"> {
  id: string;
  variant: "default" | "ghost" | "glass";
  actions: ActionMap<ActionKey>;
}