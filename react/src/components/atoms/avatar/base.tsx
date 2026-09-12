import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import type { AvatarProps, UserType } from "./types"
import { cn } from "@/lib/utils"
import { initialsFrom, ringClasses, sizeClasses, statusClasses } from "./utils"
import { User } from "lucide-react"
import { VerifiedBadge } from "./verified"

export default function Base<T extends UserType>({
  user,
  size = "small",
  className,
  audio,
}: AvatarProps<T>) {
  return (
    <div className={cn("relative", audio && "group/avatar flex items-center justify-center")}>
      {
        /* Animated Story Ring */
        audio && <div className={cn("absolute -inset-1 rounded-full bg-linear-to-tr from-yellow-400 via-fuchsia-500 to-violet-600 blur-xs transition-all duration-500", ringClasses[audio])} />
      }      
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage src={user?.avatarUrl} alt={user?.firstName} />
        <AvatarFallback>
          {initialsFrom(user) ?? <User className="size-4" aria-hidden="true" />}
        </AvatarFallback>
        {user && user.status && (
          <AvatarBadge className={statusClasses[user.status]} />
        )}
        {user && user.verified && (
          <span className="absolute -top-0.5 -right-0.5">
            <VerifiedBadge />
          </span>
        )}
      </Avatar>
    </div>
  )
}
