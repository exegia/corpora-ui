import { Text } from "@/components/atoms/text"
import type { DefaultSectionProps } from "./type"

export function DefaultSection({ item }: DefaultSectionProps) {
  return (
    <div className="gap-1 flex flex-col">
      <Text.Label className="font-serif">{item.label}</Text.Label>
      {item.description ? (
        <p className="text-xs text-neutral-300 dark:text-neutral-600">
          {item.description}
        </p>
      ) : null}
    </div>
  )
}
