"use client"
import { defineStory } from "@/registry/story"
import CorpusNavigationDemo from "@/registry/demos/corpus-navigation-demo"
export const story = defineStory({
  Component: CorpusNavigationDemo,
  centered: false,
})
export const Preview = story.WithControl
