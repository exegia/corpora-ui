import type { TUserType, IAvatarProps } from "@/components/atoms/types";
import type { TBubbleVariant } from "@/components/atoms/bubble";
import type React from "react";


export type TUserInfo<T extends TUserType> = T & {
  description?: string
  audio?: IAvatarProps<T>['audio']
  size?: IAvatarProps<T>['size']
  direction?: Exclude<TBubbleVariant, "ai">
}

export type TUserVariant = "pill" | "info"

export interface IUserBaseProps<T extends TUserType, Variant extends TUserVariant = TUserVariant> {
  user: T
  variant: Variant
}

export interface IUserMessageProps<T extends TUserType = TUserType> extends Omit<IUserBaseProps<T>, "user"> {
  children: React.ReactNode
  size?: IAvatarProps<T>['size']
  user?: TUserInfo<T>
}

export type TUserInfoProps<T extends TUserType = TUserType> = Exclude<IUserBaseProps<T, "info">, "variant"> & TUserInfo<T>
export type TUserPillProps<T extends TUserType = TUserType> = Exclude<IUserBaseProps<T, "pill">, "variant" | "size">
