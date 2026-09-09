
import type { ChartNodeProps } from "./types";
import { StepBody } from "./step-body";
import { useFlowchart } from "./hooks";
import { mix } from "./utils";

export function ChartNode({ node, steps, onRef, children }: ChartNodeProps) {
  const { selected, updateSelected, onPointerDown, onPointerMove, onPointerUp, handlePlace, wasDragged, drag } = useFlowchart({ steps })
  const { w, cx, top } = handlePlace(node);
  const active = selected === node.id;
  return (
    <div
      key={node.id}
      ref={onRef}
      onPointerDown={onPointerDown(node)}
      onPointerMove={onPointerMove(node)}
      onPointerUp={onPointerUp(node)}
      className="absolute flex -translate-x-1/2 touch-none flex-col items-start gap-1.5"
      style={{ left: cx, top, width: w, zIndex: drag.current?.id === node.id ? 2 : 1 }}
    >
      {node.kind && (
        <span
          className="inline-flex h-6 items-center rounded-[6px] px-2 text-[11.5px] font-medium"
          style={{
            background: mix(node.kind.hue, 14, "var(--page)"),
            color: mix(node.kind.hue, 80, "var(--ink)"),
          }}
        >
          {node.kind.label}
        </span>
      )}
      {node.condition ? (
        <div className="w-full rounded-[18px] bg-surface shadow-card transition-shadow duration-150 hover:shadow-raised">
          {children}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => {
            if (wasDragged()) return;
            updateSelected(active ? null : node.id);
          }}
          aria-pressed={active}
          className={`w-full cursor-pointer rounded-[18px] bg-surface text-left outline-none
            transition-shadow duration-150 focus-visible:shadow-[0_0_0_1.5px_var(--accent)]
            ${
              active
                ? "shadow-[0_0_0_1.5px_var(--accent),0_2px_10px_rgba(0,0,0,0.045)]"
                : "shadow-card hover:shadow-raised"
              }`}
          >
            <StepBody node={node} />
          </button>
        )}
      </div>
    );
}