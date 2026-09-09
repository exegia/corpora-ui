import type { ConnectorProps } from "./types"

export function Connector({ edge, isLit, strokeWidth = 1.25, ...props }: ConnectorProps) {
  return (
    <path
      data-edge={edge.id}
      fill="none"
      stroke={isLit ? "var(--accent-default)" : "var(--line-strong)"}
      strokeWidth={strokeWidth}
      className="transition-[stroke] duration-150"
      {...props}
    />
  )
}
