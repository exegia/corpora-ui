"use client"

import { defineStory } from "@/registry/story"
import { Button, type ButtonProps } from "./button"

type PreviewProps = Pick<
  ButtonProps,
  "variant" | "glassVariant" | "size" | "loading" | "disabled" | "sound"
> & { children: string }

function ButtonPreview({ variant, glassVariant, ...props }: PreviewProps) {
  return (
    <div className="flex min-h-32 items-center justify-center p-6">
      {variant === "glass" ? (
        <Button {...props} variant="glass" glassVariant={glassVariant} />
      ) : (
        <Button {...props} variant={variant} />
      )}
    </div>
  )
}

export const story = defineStory({
  Component: ButtonPreview,
  args: {
    initial: {
      children: "Consult manuscript",
      variant: "outline",
      size: "default",
      loading: false,
      disabled: false,
      sound: true,
    },
  },
})

export const Preview = story.WithControl
