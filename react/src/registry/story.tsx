import { defineStoryFactory } from "@fumadocs/story/vite/client"
import type { Story, StoryOptions } from "@fumadocs/story/vite/client"
import { createElement, type FC, type ReactNode } from "react"

const { defineStory: createStory } = defineStoryFactory()

/** Editable text in docs should not expand ReactNode's recursive element tree. */
export type TStoryData<T> = ReactNode extends T
  ? string
  : T extends string | number | boolean | bigint | symbol | null | undefined
    ? T
    : T extends readonly (infer Item)[]
      ? TStoryData<Item>[]
      : T extends (...args: never[]) => unknown
        ? T
        : T extends object
          ? { [Key in keyof T]: TStoryData<T[Key]> }
          : T

/** Give every docs story the same centered canvas without constraining wide components. */
// Infer each preview independently. The namespace props catalog also contains
// unrelated components and does not cover every UI primitive or demo wrapper.
type TStoryComponent<T extends object> = FC<T>
type TStoryOptions<T extends object> = StoryOptions<TStoryComponent<T>> & {
  centered?: boolean
}
export function defineStory<T extends object>(
  options: TStoryOptions<T>
): Story<TStoryComponent<T>> {
  const { Component, centered, ...storyOptions } = options
  const CenteredComponent = (props: T) => (
    <div className="min-h-32 p-8 max-w-xs flex flex-1 mx-auto w-full items-center justify-center">
      {createElement(Component, props)}
    </div>
  )

  const WideComponent = (props: T) => (
    <div className="min-h-32 p-8 flex w-full items-center justify-center">
      {createElement(Component, props)}
    </div>
  )

  return createStory({
    // Preserve the metadata injected by the Vite story plugin, including _generated.
    ...storyOptions,
    Component: centered ? CenteredComponent : WideComponent,
  })
}
