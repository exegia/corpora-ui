import type { UserType, AvatarProps } from "@/components/atoms";
import type { BubbleVariant } from "@/components/atoms/bubble";
import type React from "react";


export type TUserInfo<T extends UserType> = T & {
  description?: string
  audio?: AvatarProps<T>['audio']
  size?: AvatarProps<T>['size']
  direction?: Exclude<BubbleVariant, "ai">
}

export type TUserVariant = "pill" | "info"

export interface IUserBaseProps<T extends UserType, Variant extends TUserVariant = TUserVariant> {
  user: T
  variant: Variant
}

export interface IUserMessageProps<T extends UserType> extends IUserBaseProps<T> {
  children: React.ReactNode
  size?: AvatarProps<T>['size']
  
}

export type UserInfoProps<T extends UserType = UserType> = Exclude<IUserBaseProps<T, "info">, "variant"> & TUserInfo<T>
export type UserPillProps<T extends UserType = UserType> = Exclude<IUserBaseProps<T, "pill">, "variant" | "size">