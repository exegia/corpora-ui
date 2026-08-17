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
    <AvatarFallback>
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
