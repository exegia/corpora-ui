import type { ConnectorProps } from "./types"

export function Connector({ edge, isLit, selected, onPick, strokeWidth, ...props }: ConnectorProps) {
  const width = strokeWidth ?? edge.strokeWidth ?? 1.25
  const stroke = isLit ? "var(--accent-default)" : (edge.color ?? "var(--line-strong)")
  return (
    <g data-selected={selected || undefined}>
      <path
        data-edge={edge.id}
        fill="none"
        stroke={stroke}
        strokeWidth={selected ? width + 0.75 : width}
        className="transition-[stroke,stroke-width] duration-150"
        {...props}
      />
      {onPick ? (
        // Wide invisible twin so a 1px line is clickable.
        <path
          d={props.d}
          fill="none"
          stroke="transparent"
          strokeWidth={14}
          className="pointer-events-auto cursor-pointer"
          onClick={(event) => {
            event.stopPropagation()
            onPick(edge.id)
          }}
        />
      ) : null}
    </g>
  )
}
