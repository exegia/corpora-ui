import { tv } from "tailwind-variants";

export const toggleVariants = tv({
  base: [
    "relative",
    "data-[state=on]:bg-input/64 dark:data-[state=on]:bg-input/64",
    "pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11",
  ],
  variants: {
    size: {
      sm: "h-7 min-w-7 px-1.5",
      default: "h-8 min-w-8 px-2",
      lg: "h-9 min-w-9 px-2.5",
    },
  },
  defaultVariants: {
    size: "default",
  },
});