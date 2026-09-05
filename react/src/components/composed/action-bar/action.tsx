import {
  ToolbarButton
} from "@/components/ui/toolbar"
import type { ActionButtonProps } from "./types";
import { TooltipTrigger } from "@/components/ui/tooltip";
import { Text } from "@/components/atoms";
import type { SpanProps } from "@/components/atoms/text";
import { tooltipHandle } from "./utils";

function Payload({ children }: SpanProps) {
  return (
    <Text.Span>
      {children}
    </Text.Span>
  );
}

export function Action({ tooltip, action, Icon }: Omit<ActionButtonProps, "children">) {
  return (
    <TooltipTrigger
      className="after:absolute after:left-full after:h-full after:w-1"
      handle={tooltipHandle}
      payload={Payload}
      render={<ToolbarButton data-tooltip={tooltip} onClick={action}/>}
    >
      <Icon aria-hidden="true" />
    </TooltipTrigger>
  );
}
