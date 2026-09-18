import { Checkbox } from "./checkbox"
import { RecommendationCard } from "./default"
import { Group } from "./group"
import { Item } from "./item"

export type * from "./types"
export type { IRecommendationCheckboxProps } from "./checkbox"
export type { TRecommendationGroupProps } from "./group"

export { RecommendationCard }

export const Recommendation = {
  Group,
  Item,
  Checkbox,
  Card: RecommendationCard,
}

export default Group
