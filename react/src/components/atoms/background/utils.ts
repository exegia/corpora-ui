import type { TextureVariant } from "./type";
import fabricBackground from "@/assets/fabric.png";
import paperBackground from "@/assets/paper.png";

export const textureMap: Record<Exclude<TextureVariant, "none">, string> = {
  fabric: fabricBackground,
  paper: paperBackground,
}

export const linearGradient = "bg-linear-to-t from-background from-10% to-transparent to-30%";

export const verticalFadeGradient = (color: string, spread: number = 50) =>
  `linear-gradient(to top, ${color} 0%, ${color} ${spread}%, transparent 100%)`
