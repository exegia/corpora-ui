"use client"

import { defineStory } from "@/registry/story"
import { BookOpen } from "lucide-react"
import { Button, type TButtonProps } from "@/components/ui/button"

type TPreviewProps = Pick<
  TButtonProps,
  "variant" | "glassVariant" | "size" | "loading" | "disabled" | "sound"
> & { children: string }

function ButtonPreview({
  variant,
  glassVariant,
  size,
  children,
  ...props
}: TPreviewProps) {
  const isIconSize = size?.startsWith("icon")
  const content = isIconSize ? <BookOpen aria-hidden /> : children

  return (
    <div className="min-h-32 p-6 flex items-center justify-center">
      {variant === "glass" ? (
        <Button
          {...props}
          aria-label={isIconSize ? children : undefined}
          variant="glass"
          glassVariant={glassVariant}
          size={size}
        >
          {content}
        </Button>
      ) : (
        <Button
          {...props}
          aria-label={isIconSize ? children : undefined}
          variant={variant}
          size={size}
        >
          {content}
        </Button>
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
