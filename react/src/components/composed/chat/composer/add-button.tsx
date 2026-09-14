import { Button, type ButtonProps } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { PopoverTriggerState } from "@base-ui/react";
import { cn } from "@/lib/utils";

export function AddButton({ state, ...props}: ButtonProps & { state: PopoverTriggerState }) {
  // One attach button for both shapes: it is absolutely positioned in each,
  // so the class swap moves it and `layout` glides it between the two spots
  // rather than mounting a second control.
  return (
    <Button
      {...props}
      aria-label={"Add attachment"}
      className={cn("bg-background/50 [&_svg]:transition-transform [&_svg]:duration-200 [&_svg]:ease-smooth-out hover:[&_svg]:rotate-90 data-popup-open:[&_svg]:rotate-45 motion-reduce:hover:[&_svg]:rotate-0", state.open && "data-popup-open")}
      size="icon-lg"
      glassVariant="liquid-refract"
      variant="glass"
    >
      <Plus className="size-4 stroke-3" />
    </Button>
  )
}