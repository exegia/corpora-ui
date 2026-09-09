import type { ConnectorProps } from "./types"

export function Connector({ edge, isLit, ...props }: ConnectorProps) {
  return (
    <path
      key={edge.id}
      fill="none"
      stroke={isLit ? "var(--accent)" : "var(--line-strong)"}
      strokeWidth={props.strokeWidth ?? "1.25"}
      className="transition-[stroke] duration-150"
    />
  )
}
