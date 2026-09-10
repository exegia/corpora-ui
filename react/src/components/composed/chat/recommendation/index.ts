import { Checkbox } from "./checkbox"
import { RecommendationCard } from "./default"
import { Group } from "./group"
import { Item } from "./item"

export type * from "./types"
export type { RecommendationCheckboxProps } from "./checkbox"
export type { RecommendationGroupProps } from "./group"

export { RecommendationCard }

export const Recommendation = {
  Group,
  Item,
  Checkbox,
  Card: RecommendationCard,
}

export default Group
