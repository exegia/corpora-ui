import type { ClassNameValue } from "tailwind-merge"
import type { TTitleStyleType } from "./type"

export const titleBarStyle = (
  style: TTitleStyleType,
  component: "title" | "frame"
): ClassNameValue => {
  const titleBarClassName: Record<TTitleStyleType, ClassNameValue> = {
    titlebar: "relative",
    hidden: "top-0 left-0 absolute",
    expanded: "relative",
  }

  const bodyClassName: Record<TTitleStyleType, ClassNameValue> = {
    titlebar: "relative",
    hidden: "",
    expanded: "relative",
  }

  return component == "title" ? titleBarClassName[style] : bodyClassName[style]
}
