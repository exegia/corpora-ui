import { Avatar } from "@/components/atoms"
import { Badge } from "@/components/ui/badge"
import type { UserInfoProps } from "./types"
import { cn } from "@/lib/utils"

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
export function Info({
  user,
  description,
  direction = "sender",
  audio,
  size,
}: UserInfoProps) {
  return (
    <div
      slot="info"
      className={cn("gap-1.5 flex flex-row items-center", {
        "flex-row-reverse": direction === "sender",
      })}
    >
      <Avatar size={size ?? "default"} user={user} audio={audio} />
      <div
        className={cn("flex flex-col", {
          "items-end text-right": direction === "sender",
        })}
      >
        <div
          className={cn("gap-1.5 flex flex-row items-center", {
            "flex-row-reverse": direction === "sender",
          })}
        >
          <span className="text-sm font-semibold">
            {user.firstName} {user.lastName}
          </span>
          {user.role && (
            <Badge variant="invert" size="xs">
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
