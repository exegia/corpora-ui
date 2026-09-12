import type { UserType } from "@/components/atoms"
import { Avatar } from "@/components/atoms/avatar"
import { Button } from "@/components/ui/button"

export default function Base({ user }: { user: UserType }) {
  return (
    <Button size="sm" className="gap-1 rounded-full pl-0.5">
      <Avatar className="size-6 border border-primary" />
      <span className="text-xs">@{user.firstName}</span>
    </Button>
  )
}
