"use client";

import { Toolbar } from "@/components/ui/toolbar";
import {
  Tooltip,
  TooltipPopup
} from "@/components/ui/tooltip";
import { tooltipHandle } from "./utils";
import type { ActionBarProps } from "./types";


export default function Popover({ id, actions }: ActionBarProps) {
  return (
    <Toolbar id={id}>
      {Object.entries(actions).map(([key, Action]) => (
        <Action key={key} />
      ))}
      <Tooltip handle={tooltipHandle}>
        {({ payload: Payload, ...props }) => (
          <TooltipPopup {...props}>{Payload !== undefined && <Payload />}</TooltipPopup>
        )}
      </Tooltip>
    </Toolbar>
  );
}
