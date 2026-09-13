
import { Bubble } from "@/components/atoms";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipCreateHandle,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type React from "react";
import type { IBubbleActionsProps } from "./type";
import type { ComponentType } from "react";

const tooltipHandle = TooltipCreateHandle<ComponentType>();


export function Actions({ actions, size, onClick }: IBubbleActionsProps) {
  return (
     <TooltipProvider>
    <Bubble.Actions>
        {Object.entries(actions ?? {}).map(([key, action]) => (
        <TooltipTrigger key={key} render={<Button aria-label={action?.tooltip} size={action?.size ?? size} variant="ghost" onClick={action.onClick} />}>
          {action.icon}
        </TooltipTrigger>
      ))}
      </Bubble.Actions>

      <Tooltip handle={tooltipHandle}>
             {({ payload: Payload }) => (
               <TooltipPopup>{Payload !== undefined && <Payload />}</TooltipPopup>
             )}
           </Tooltip>
     </TooltipProvider>
  );
}