"use client";

import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar";
import type React from "react";
import { cn } from "@/lib/utils";

export function Avatar({
  className,
  ...props
}: AvatarPrimitive.Root.Props): React.ReactElement {
  return (
    <AvatarPrimitive.Root
      className={cn(
        "inline-flex size-8 shrink-0 select-none items-center justify-center overflow-hidden rounded-full bg-background align-middle font-medium text-xs",
        className,
      )}
      data-slot="avatar"
      {...props}
    />
  );
}

export function AvatarImage({
  className,
  ...props
}: AvatarPrimitive.Image.Props): React.ReactElement {
  return (
    <AvatarPrimitive.Image
      className={cn("size-full object-cover", className)}
      data-slot="avatar-image"
      {...props}
    />
  );
}

export function AvatarFallback({
  className,
  ...props
}: AvatarPrimitive.Fallback.Props): React.ReactElement {
  return (
    // Deliberately unpainted. Being `size-full`, the fallback covers the root
    // edge to edge, so a background here hides whatever the root paints
    // beneath it — including the emboss an avatar may carry (see
    // `twAvatarEmbossClasses`). Callers wanting a tint put it on the Avatar
    // root, not here; note `UserAvatar`'s initials are white, so a pale tint
    // needs a text colour to go with it.
    <AvatarPrimitive.Fallback
      className={cn(
        "flex size-full items-center justify-center rounded-full",
        className,
      )}
      data-slot="avatar-fallback"
      {...props}
    />
  );
}

export { AvatarPrimitive };
