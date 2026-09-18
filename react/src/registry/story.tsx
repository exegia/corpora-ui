
import type { TStoryComponentProps } from "@/components/types"
import { defineStoryFactory } from "@fumadocs/story/vite/client"
import type { Story, ArgsOptions } from "@fumadocs/story/vite/client"
import {
  createElement,
  type FC,
} from "react"

const { defineStory: createStory } = defineStoryFactory()

/** Give every docs story the same centered canvas without constraining wide components. */
// Match the upstream constraint while retaining C for per-component args inference.
// The props catalog is not a call signature: Pick previews and UI components
// need not accept (or extend) the complete namespace-exported props union.
type TStoryComponent<T extends TStoryComponentProps> = FC<T>
type TStoryOptions<T extends TStoryComponentProps> = {
  displayName?: string
  Component: TStoryComponent<T>,
  centered?: boolean,
  args?: ArgsOptions<TStoryComponent<T>>
}
export function defineStory<T extends TStoryComponentProps>(
  options: TStoryOptions<T>,
): Story {
  const { Component, centered, args, displayName } = options
  const CenteredComponent = (props: T) => (
    <div className="min-h-32 flex w-full items-center justify-center">
      {createElement(Component, props)}
    </div>
  )

  return createStory({
    displayName,
    args,
    Component: centered ? CenteredComponent : Component,
  })
}
