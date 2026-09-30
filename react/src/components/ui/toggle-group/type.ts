import  { ToggleGroup as ArkToggleGroup } from "@ark-ui/react/toggle-group";
import type { ToggleProps } from "./toggle";

export interface ToggleGroupItemProps
    extends React.ComponentProps<typeof ArkToggleGroup.Item>, ToggleGroupContextProps {}

    export interface ToggleGroupProps
      extends React.ComponentProps<typeof ArkToggleGroup.Root>,
        ToggleGroupContextProps {}
    
  export type ToggleGroupContextProps = Pick<ToggleProps, "variant" | "size"> & {
    /**
     * Gap between items.
     *
     * @default 0
     */
    spacing?: number;
  };