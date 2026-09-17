import { defineStoryFactory } from "@fumadocs/story/vite/client"
import type { Story, StoryOptions } from "@fumadocs/story/vite/client"
import { createElement, type ComponentPropsWithoutRef, type FC } from "react"

const { defineStory: createStory } = defineStoryFactory()

/** Give every docs story the same centered canvas without constraining wide components. */
// The upstream StoryOptions generic is constrained to FC<any>.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function defineStory<C extends FC<any>>(
  options: StoryOptions<C>
): Story<C> {
  const Component = options.Component
  const CenteredComponent = (props: ComponentPropsWithoutRef<C>) => (
    <div className="min-h-32 flex w-full items-center justify-center">
      {createElement(Component, props)}
    </div>
  )

  return createStory({
    ...options,
    Component: CenteredComponent as C,
  }) as Story<C>
}
