import { Bubble } from "@/components/atoms"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipCreateHandle,
  TooltipPopup,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type React from "react"
import type {
  IBubbleActionsProps,
  TBubbleActionKey,
  TBubbleActionPayload,
} from "./type"
import { useCallback, useMemo, type ComponentType } from "react"

const tooltipHandle = TooltipCreateHandle<ComponentType>()

export function Actions<K extends TBubbleActionKey = TBubbleActionKey>({
  actions,
  size,
  onClick,
}: IBubbleActionsProps<K>) {
  const handleClick = useCallback(
    (key: K, payload: TBubbleActionPayload) => {
      if (onClick) onClick(key, payload)
    },
    [onClick]
  )

  const renderActionButton = useCallback(
    (key?: K, action?: (typeof actions)[K]) => {
      if (!key || !action) return
      return (
        <Button
          aria-label={action?.tooltip}
          size={action?.size ?? size}
          variant="ghost"
          onClick={() => {
            const payload =
              (action?.onClick?.arguments[1] as TBubbleActionPayload) ??
              undefined
            handleClick(key, payload)
          }}
        />
      )
    },
    [handleClick, size]
  )

  const actionButtons = useMemo(() => {
    if (!actions || Object.values(actions).length === 0) return []
    return Object.entries<(typeof actions)[K]>(actions).map(([key, action]) => {
      if (!key || !action) return
      //return renderActionButton(key as K, action as typeof actions[K]);
      return { key: key, action }
    })
  }, [actions])

  return (
    <TooltipProvider>
      <Bubble.Actions>
        {actionButtons &&
          actionButtons.map((item, index) => (
            <TooltipTrigger
              key={index}
              render={renderActionButton(item?.key as K, item?.action)}
            >
              {item?.action.icon}
            </TooltipTrigger>
          ))}
      </Bubble.Actions>

      <Tooltip handle={tooltipHandle}>
        {({ payload: Payload }) => (
          <TooltipPopup>{Payload !== undefined && <Payload />}</TooltipPopup>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}
