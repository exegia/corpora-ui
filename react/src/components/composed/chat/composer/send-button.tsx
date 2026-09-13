
import { Button } from "@/components/ui/button";
import type { ButtonProps } from "@/components/ui/button";
import type { IComposerSubmitButtonProps } from "./type";
import { ArrowUp, Squircle } from "lucide";
import { cn } from "@/lib/utils";
import { MorphIcon } from "morphicons/react";


export function SendButton({ isStreaming, isExpanded, disabled, ...props }: IComposerSubmitButtonProps & ButtonProps): React.ReactElement {
  return (
    <Button
      {...props}
      aria-hidden={!isExpanded}
      aria-label={isStreaming ? "Stop" : "Send message"}
      className={cn(
        "shrink-0 justify-self-center",
        !isExpanded && "pointer-events-none"
      )}
      // Empty-draft must NOT disable: the disabled:opacity-50! rule would
      // pin Motion's inline opacity at 0.5 and break the fade. send() guards
      // empty drafts, and the collapsed button is pointer-events-none.
      disabled={disabled && !isStreaming}
      size="icon-lg"
      tabIndex={isExpanded ? 0 : -1}
      type={isStreaming ? "button" : "submit"}
    >
      <MorphIcon
        className={cn(
          "size-4 rounded-full",
          isStreaming ? "animate-pulse fill-current" : "stroke-2"
        )}
        icon={isStreaming ? Squircle : ArrowUp}
      />
    </Button>
  );
}