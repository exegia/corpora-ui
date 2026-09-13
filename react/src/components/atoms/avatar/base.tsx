import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import type { AvatarProps, UserType } from "./types"
import { cn } from "@/lib/utils"
import { initialsFrom, loaderSizes, ringClasses, sizeClasses, statusClasses } from "./utils"
import { User } from "lucide-react"
import { VerifiedBadge } from "./verified"
import { Skeleton } from "@/components/ui/skeleton";
import { Loader } from "../loader";

export default function Base<T extends UserType>({
  user,
  size = "sm",
  className,
  loading,
  audio,
}: AvatarProps<T>) {
  return (
    <div
      className={cn(
        "relative",
        audio && "group/avatar flex items-center justify-center"
      )}
    >
      {
        /* Animated Story Ring — suppressed while loading; identity first */
        audio && !loading && (
          <div
            className={cn(
              "absolute -inset-1 rounded-full bg-linear-to-tr from-yellow-400 via-fuchsia-500 to-violet-600 blur-xs transition-all duration-500",
              ringClasses[audio]
            )}
          />
        )
      }
      <Avatar size={size} className={cn(sizeClasses[size], className)}>
        <AvatarImage src={user?.avatarUrl} alt={user?.firstName} />
        <AvatarFallback>
          {initialsFrom(user) ?? <User className="size-4" aria-hidden="true" />}
        </AvatarFallback>
        {loading && (
          <Skeleton className="absolute inset-0 rounded-full ring-1 ring-border/50 dark:[--skeleton-highlight:--alpha(var(--color-white)/14%)]" />
        )}
        {user && user.status && !loading && size !== "sm" && (
          <AvatarBadge className={statusClasses[user.status]} />
        )}
        {user && user.verified && !loading && size !== "sm" && (
          <span className="absolute -top-0.5 -right-0.5">
            <VerifiedBadge />
          </span>
        )}
      </Avatar>
      {loading && (
         
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader type="dots" size={loaderSizes[size]} />
        </div>
      )}
    </div>
  )
}
