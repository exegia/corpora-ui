import type { ClassNameValue } from "tailwind-merge"
import type { TitleStyleType } from "./type"

export const titleBarStyle = (
  style: TitleStyleType,
  component: "title" | "frame"
): ClassNameValue => {
  const titleBarClassName: Record<TitleStyleType, ClassNameValue> = {
    titlebar: "relative",
    hidden: "top-0 left-0 absolute",
    expanded: "relative",
  }

  const bodyClassName: Record<TitleStyleType, ClassNameValue> = {
    titlebar: "relative",
    hidden: "",
    expanded: "relative",
  }

  return component == "title" ? titleBarClassName[style] : bodyClassName[style]
}
