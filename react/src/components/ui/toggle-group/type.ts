import { ToggleGroup as ArkToggleGroup } from "@ark-ui/react/toggle-group"
import { Toggle as ArkToggle } from "@ark-ui/react/toggle"
import { buttonVariants } from "@/components/ui/button"
import type { VariantProps } from "tailwind-variants"
import type { toggleVariants } from "./utils"

type TButtonVariant = NonNullable<VariantProps<typeof buttonVariants>>
type TToggleVariant = NonNullable<VariantProps<typeof toggleVariants>>
export interface ToggleProps<
  T extends TToggleVariant = TToggleVariant,
  Size extends T["size"] = T["size"],
>
  extends React.ComponentProps<typeof ArkToggle.Root>, TButtonVariant {
  /**
   * The variant of the toggle
   *
   * @default "outline"
   */
  variant?: Extract<TButtonVariant["variant"], "outline" | "ghost">

  size?: Extract<TButtonVariant["size"], Size>
  /**
   * The variant of the toggle
   */
}

export interface ToggleGroupItemProps
  extends
    React.ComponentProps<typeof ArkToggleGroup.Item>,
    ToggleGroupContextProps {}

export interface ToggleGroupProps
  extends
    React.ComponentProps<typeof ArkToggleGroup.Root>,
    ToggleGroupContextProps {
}

export type ToggleGroupContextProps = Pick<ToggleProps, "variant" | "size"> & {
  /**
   * Gap between items.
   *
   * @default 0
   */
  spacing?: number
}
