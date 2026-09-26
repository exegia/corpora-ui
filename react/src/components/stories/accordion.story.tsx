"use client"

import { Accordion, AccordionItem, AccordionTrigger, AccordionPanel } from "@/ui/accordion"

import { defineStory } from "@/registry/story"

function ComponentPreview({ multiple }: { multiple: boolean }) {

  return (
    <div className="relative mx-auto w-full max-w-lg p-6">
      <Accordion multiple={multiple}>
      <AccordionItem value="sources"><AccordionTrigger>Which sources are included?</AccordionTrigger><AccordionPanel>Published editions and their annotations.</AccordionPanel></AccordionItem>
      <AccordionItem value="export"><AccordionTrigger>Can I export a passage?</AccordionTrigger><AccordionPanel>Choose an export format from the passage menu.</AccordionPanel></AccordionItem>
    </Accordion>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { multiple: false } },
})

export const Preview = story.WithControl
