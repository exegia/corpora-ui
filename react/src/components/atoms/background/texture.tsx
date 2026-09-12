import { cn } from "@/lib/utils"
import type { TextureProps } from "./type";
import { linearGradient, textureMap } from "./utils";


export function Texture({
  variant = "fabric",
  opacity = 1,
  className,
  children,
}: TextureProps) {
  const textureUrl = variant !== "none" ? textureMap[variant] : null
  return (
    <div className="relative h-full w-full flex flex-col flex-1">
      {textureUrl && (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `url(${textureUrl})`,
            backgroundRepeat: "repeat",
            opacity,
          }}
        />
      )}
      {children && <div className={cn("h-full w-full flex flex-col flex-1", linearGradient, className)}>{children}</div>}
    </div>
  )
}