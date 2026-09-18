"use client"

import { useId } from "react"
import type * as React from "react"
import { Group } from "./group"
import { Item } from "./item"
import type { IRecommendationCardProps } from "./types"

/**
 * One-card convenience: a Group with a single Item, so existing
 * `<RecommendationCard />` call sites keep working.
 */
export function RecommendationCard({
  value,
  defaultOpen = true,
  ...props
}: IRecommendationCardProps): React.ReactElement {
  const autoId = useId()
  const itemValue = value ?? autoId
  return (
    <Group defaultValue={defaultOpen ? [itemValue] : []}>
      <Item value={itemValue} {...props} />
    </Group>
  )
}
