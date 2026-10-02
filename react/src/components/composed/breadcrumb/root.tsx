"use client"

import { Tooltip, TooltipPopup } from "@/components/ui/tooltip"
import type * as React from "react"
import { tooltipHandle } from "./utils"

export function Root({
  ...props
}: React.ComponentProps<"nav">): React.ReactElement {
  return (
    <>
      <nav aria-label="breadcrumb" data-slot="breadcrumb" {...props} />
      <Tooltip handle={tooltipHandle}>
        {({ payload }) => (
          <TooltipPopup>{payload?.tooltip ?? payload?.label}</TooltipPopup>
        )}
      </Tooltip>
    </>
  )
}
