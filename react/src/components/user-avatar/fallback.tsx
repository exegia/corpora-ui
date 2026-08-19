import { AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"
import { initialsFrom } from "./utils"

export function Fallback({
  name,
  initials,
  loading,
}: {
  name?: string
  initials?: string
  loading?: boolean
}) {
  return (
    // Initials scale with the disc: 42% of the avatar's width (≈ text-xl on
    // size-12), resolved against the `@container` on the Avatar root.
    <AvatarFallback className="text-[42cqw]">
      {loading ? (
        <Skeleton
          className="size-full rounded-full"
          data-slot="avatar-skeleton"
        />
      ) : (
        (initials ?? initialsFrom(name ?? ""))
      )}
    </AvatarFallback>
  )
}
