import type { UserType, AvatarProps } from "@/components/atoms";


export type TUserInfo<T extends UserType> = T & {
  description?: string
  audio?: AvatarProps<T>['audio']
  size?: AvatarProps<T>['size']
}

export type TUserVariant = "pill" | "info"

export interface IUserBaseProps<T extends UserType, Variant extends TUserVariant = TUserVariant> {
  user: T
  variant: Variant
}

export type UserInfoProps<T extends UserType = UserType> = Exclude<IUserBaseProps<T, "info">, "variant"> & TUserInfo<T>
export type UserPillProps<T extends UserType = UserType> = Exclude<IUserBaseProps<T, "pill">, "variant" | "size">