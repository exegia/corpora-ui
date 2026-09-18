import { Children, Fragment, isValidElement, type ReactNode } from "react"

/** Shared marker keeps the bubble atom independent of the composed attachment. */
export const ATTACHMENT_CONTENT = Symbol.for("corpora-ui.attachment")

function contentNodes(children: ReactNode): ReactNode[] {
  return Children.toArray(children).flatMap((child) =>
    isValidElement<{ children?: ReactNode }>(child) && child.type === Fragment
      ? contentNodes(child.props.children)
      : typeof child === "string" && !child.trim()
        ? []
        : [child]
  )
}

export function containsOnlyAttachments(children: ReactNode): boolean {
  const nodes = contentNodes(children)
  return (
    nodes.length > 0 &&
    nodes.every(
      (child) =>
        isValidElement(child) &&
        Boolean(
          (child.type as { [ATTACHMENT_CONTENT]?: boolean })[ATTACHMENT_CONTENT]
        )
    )
  )
}
