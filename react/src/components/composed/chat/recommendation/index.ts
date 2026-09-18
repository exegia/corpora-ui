import { Checkbox } from "./checkbox"
import { RecommendationCard } from "./default"
import { Group } from "./group"
import { Item } from "./item"

export type * from "./types"

export { RecommendationCard }

export const Recommendation = {
  Group,
  Item,
  Checkbox,
  Card: RecommendationCard,
}

export default Group
