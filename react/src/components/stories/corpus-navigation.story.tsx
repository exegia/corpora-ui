"use client"
import { defineStory } from "@/registry/story"
import CorpusNavigationDemo from "@/registry/demos/corpus-navigation-demo"
export const story = defineStory({
  Component: CorpusNavigationDemo,
  args: { initial: { initialWidth: 390 } },
})
export const Preview = story.WithControl
