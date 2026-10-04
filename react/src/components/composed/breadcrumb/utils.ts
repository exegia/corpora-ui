import { TooltipCreateHandle } from "@/components/ui/tooltip"
import type { IBreadcrumbItemProps, TBreadcrumbVariant } from "./type"

export const tooltipHandle: ReturnType<
  typeof TooltipCreateHandle<IBreadcrumbItemProps<TBreadcrumbVariant>>
> = TooltipCreateHandle<IBreadcrumbItemProps<TBreadcrumbVariant>>()
