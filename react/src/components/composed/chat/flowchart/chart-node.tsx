import type { ChartNodeProps, FlowchartSide } from "./types";
import { ConditionBody, StepBody } from "./step-body";
import { useFlowchartContext } from "./hooks";
import { mix } from "./utils";
import { AddButton, RemoveButton } from "@/components/ui/chat";
import { cn } from "@/lib/utils";

const SIDE_POS: Record<FlowchartSide, string> = {
  top: "left-1/2 -top-3 -translate-x-1/2",
  right: "top-1/2 -right-3 -translate-y-1/2",
  bottom: "left-1/2 -bottom-3 -translate-x-1/2",
  left: "top-1/2 -left-3 -translate-y-1/2",
};

export function ChartNode({ node, onRef, children }: ChartNodeProps) {
  const { selected, updateSelected, onPointerDown, onPointerMove, onPointerUp, handlePlace, wasDragged, drag, readOnly, onAdd, removeNode } =
    useFlowchartContext();
  const { w, cx, top } = handlePlace(node);
  const active = selected === node.id;
  const body = children ?? node.children ?? (node.condition ? <ConditionBody /> : <StepBody node={node} />);
  const custom = children !== undefined || node.children !== undefined || node.condition;
  const toggle = () => {
    if (wasDragged()) return;
    updateSelected(active ? null : node.id);
  };
  const cardClass = cn(
    "w-full rounded-[18px] bg-surface text-left outline-none transition-shadow duration-150",
    active ? "shadow-[0_0_0_1.5px_var(--accent-default),0_2px_10px_rgba(0,0,0,0.045)]" : "shadow-card hover:shadow-raised",
  );
  return (
    <div
      ref={onRef}
      data-node={node.id}
      onPointerDown={onPointerDown(node)}
      onPointerMove={onPointerMove(node)}
      onPointerUp={onPointerUp(node)}
      onKeyDown={(event) => {
        if (readOnly || !active || (event.key !== "Delete" && event.key !== "Backspace")) return;
        if ((event.target as Element).closest("[data-ui]")) return;
        event.preventDefault();
        removeNode(node.id);
      }}
      className="group absolute flex -translate-x-1/2 touch-none flex-col items-start gap-1.5"
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
      <div className="relative w-full">
        {custom ? (
          <div
            role="button"
            tabIndex={0}
            aria-pressed={active}
            onClick={(event) => {
              if ((event.target as Element).closest("[data-ui]")) return;
              toggle();
            }}
            className={cn(cardClass, "focus-visible:shadow-[0_0_0_1.5px_var(--accent-default)]")}
          >
            {body}
          </div>
        ) : (
          <button type="button" onClick={toggle} aria-pressed={active} className={cn(cardClass, "cursor-pointer focus-visible:shadow-[0_0_0_1.5px_var(--accent-default)]")}>
            {body}
          </button>
        )}
        {!readOnly && onAdd
          ? (Object.keys(SIDE_POS) as FlowchartSide[]).map((side) => (
              <AddButton
                key={side}
                data-ui
                data-side={side}
                aria-label={`Add node ${side}`}
                onClick={() => onAdd(node.id, side)}
                className={cn(
                  "absolute z-10 size-6 rounded-full bg-surface opacity-0 shadow-btn transition-opacity group-hover:opacity-100 focus-visible:opacity-100 sm:size-6 [&_svg]:size-3.5!",
                  SIDE_POS[side],
                )}
              />
            ))
          : null}
        {!readOnly ? (
          <RemoveButton
            data-ui
            aria-label="Remove node"
            onClick={() => removeNode(node.id)}
            className="absolute -top-2 -right-2 z-10 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
          />
        ) : null}
      </div>
    </div>
  );
}
