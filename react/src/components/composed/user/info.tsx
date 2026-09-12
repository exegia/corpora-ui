import { Avatar } from "@/components/atoms"
import { Badge } from "@/components/ui/badge"
import type { UserInfoProps } from "./types"

/**
 * This component displays a user's information in a compact format.
 * that can be used to display a user's name and role,
 * in the chat bubble header or sidebar profile.
 * @param {UserInfoProps['user']} user - The user to display.
 * @param {UserInfoProps['description']} description - The description to display.
 * 
 * @description Displays a user's name and role in a compact format.
 *
 */
export function Info({ user, description }: UserInfoProps) {
  return (
    <div className="flex items-center gap-1.5">
      <Avatar size="small" user={user} />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold">
            {user.firstName} {user.lastName}
          </span>
          {user.role && (
            <Badge variant="default" size="xs">
              {user.role}
            </Badge>
          )}
        </div>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
    </div>
  )
}
