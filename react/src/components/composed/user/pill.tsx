import { Avatar } from "@/components/atoms"
import type { TUserPillProps } from "./type"
import { Button } from "@/components/ui/button"

/**
 * This component displays a user's information in a compact format.
 * that can be used to display a user's name and role,
 * in the chat bubble header or sidebar profile.
 * @param {TUserPillProps['user']} user - The user to display.
 * @description Displays a user's name and role in a compact format.
 *
 */
export function Pill({ user }: TUserPillProps) {
  return (
    <Button size="sm" className="gap-1 pl-0.5 rounded-full">
      <Avatar user={user} size="sm" />
      <span className="text-xs">@{user.firstName}</span>
    </Button>
  )
}
