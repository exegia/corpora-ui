import { Composer } from "./base"

export type * from "./type"

export { Composer }
export { SendButton } from "./send-button"
export { AddButton } from "./add-button"
export { CommandMenu } from "./command-menu"
export { SuggestedPrompts } from "./suggestions"
export {
  addComposerAttachmentAtom,
  clearComposerAttachmentsAtom,
  composerAttachmentsAtom,
  removeComposerAttachmentAtom,
  removeComposerInstance,
} from "./utils"
export { useComposerAttachmentActions, useComposerAttachments } from "./hooks"

export default Composer
