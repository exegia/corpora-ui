import { Avatar } from "@/components/atoms"
import type { UserPillProps } from "./types"
import { Button } from "@/components/ui/button";

/**
 * This component displays a user's information in a compact format.
 * that can be used to display a user's name and role,
 * in the chat bubble header or sidebar profile.
 * @param {UserPillProps['user']} user - The user to display.
 * @description Displays a user's name and role in a compact format.
 *
 */
export function Pill({ user }: UserPillProps) {
  return (
    <Button
      size="sm"
      className="rounded-full gap-1 pl-0.5"
    >
      <Avatar user={user} size="small" />
      <span className="text-xs">@shadcn</span>
    </Button>
  )
}
