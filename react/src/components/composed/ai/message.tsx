import type { AIContentProps, AIMessageProps, AIMessageType } from "./types"
import { Bubble } from "@/components/atoms"
import { Avatar } from "@/components/atoms/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import OWLImage from "@/assets/owl-avatar.png"

/**
 * An agent turn: author row, prose body and — when the model proposed
 * changes — a "Suggestions" disclosure that fans the cards out below with a
 * staggered spring.
 */
export function Message<T extends AIMessageType>({
  children,
  isStreaming = false,
  className,
  AttachedContent,
  type,
  contentProps,
  ...props
}: AIMessageProps<T>): React.ReactElement {
  // TS can't relate `AIContentProps<T>` to JSX's IntrinsicAttributes while `T`
  // is unresolved; widen to the full union for the render site only.
  const Content = AttachedContent as
    React.ComponentType<AIContentProps> | undefined
  const renderAIAvatar = () => {
    return (
      <div className="flex items-center gap-2">
        <Avatar
          size="md"
          className="scale-110 bg-indigo-950 p-0.5 dark:bg-indigo-300"
          user={{ avatarUrl: OWLImage }}
        />
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-semibold">Exegia</span>
            <Badge variant="default" size="xs">
              Agent
            </Badge>
          </div>
          <span className="text-xs text-muted-foreground">AI Scholar</span>
        </div>
      </div>
    )
  }

  return (
    <Bubble
      className={cn(className)}
      data-slot="ai-message"
      data-streaming={isStreaming ? "" : undefined}
      variant="ai"
      {...props}
    >
      <Bubble.Header>{renderAIAvatar()}</Bubble.Header>

      <Bubble.Message
        aria-atomic="false"
        aria-live="polite"
        data-slot="ai-message-body"
      >
        {children}
        {Content && (
          <Content {...({ kind: type, ...contentProps } as AIContentProps)} />
        )}
      </Bubble.Message>
    </Bubble>
  )
}
