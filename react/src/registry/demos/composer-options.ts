import type {
  IComposerModel,
  IComposerOption,
} from "@/components/composed/chat/composer"

export const composerModels: IComposerModel[] = [
  { id: "auto", label: "Auto", description: "Balanced" },
  { id: "fast", label: "Fast", description: "Quick answers" },
  { id: "reasoning", label: "Reasoning", description: "Complex tasks" },
]
export const composerSources: IComposerOption[] = [
  {
    id: "passage",
    label: "Current passage",
    description: "a.1 · ¶1–¶2",
    insertText: "@passage ",
  },
  { id: "corpus", label: "Corpus", description: "Manuscripts and annotations" },
]
export const composerCommands: IComposerOption[] = [
  {
    id: "validate",
    label: "/validate",
    description: "Check this passage against the schema",
  },
  { id: "summarize", label: "/summarize", description: "Summarize the thread" },
  {
    id: "compare",
    label: "/compare",
    description: "Compare manuscript witnesses",
  },
]
export const composerDemoOptions = {
  models: composerModels,
  sources: composerSources,
  commands: composerCommands,
}
