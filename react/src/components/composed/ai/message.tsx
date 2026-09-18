import type { TAIContentProps, IAIMessageProps, TAIMessageType } from "./types"
import { Bubble } from "@/components/atoms"
import { cn } from "@/lib/utils"
import { Avatar } from "./avatar"

/**
 * An agent turn: author row, prose body and — when the model proposed
 * changes — a "Suggestions" disclosure that fans the cards out below with a
 * staggered spring.
 */
export function Message<T extends TAIMessageType>({
  children,
  isStreaming = false,
  className,
  AttachedContent,
  type,
  contentProps,
  ...props
}: IAIMessageProps<T>): React.ReactElement {
  // TS can't relate `AIContentProps<T>` to JSX's IntrinsicAttributes while `T`
  // is unresolved; widen to the full union for the render site only.
  const Content = AttachedContent as
    React.ComponentType<TAIContentProps> | undefined

  return (
    <Bubble
      className={cn(className)}
      data-slot="ai-message"
      data-streaming={isStreaming ? "" : undefined}
      variant="ai"
      {...props}
    >
      <Bubble.Header>
        <Avatar />
      </Bubble.Header>

      <Bubble.Message
        aria-atomic="false"
        aria-live="polite"
        data-slot="ai-message-body"
      >
        {children}
        {Content && (
          <Content {...({ kind: type, ...contentProps } as TAIContentProps)} />
        )}
      </Bubble.Message>
    </Bubble>
  )
}
