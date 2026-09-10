import { useState } from "react";
import { Copy, Link2, Plus, Sparkles, Trash2 } from "lucide-react";
import type { ChartNodeProps } from "./types";
import { ConditionBody, StepBody } from "./step-body";
import { nodeLabel, useFlowchartContext } from "./hooks";
import { mix } from "./utils";
import {
  ContextMenu,
  ContextMenuItem,
  ContextMenuPopup,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubPopup,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { cn } from "@/lib/utils";

export function ChartNode({ node, index = 0, onRef, children }: ChartNodeProps) {
  const {
    steps, selected, updateSelected, onPointerDown, onPointerMove, onPointerUp, handlePlace, wasDragged, drag, readOnly, onAdd, removeNode,
    snapTarget, previewNode, setPreviewNode, connectTo, renameNode, duplicateNode, canRename, canDuplicate, canConnect,
  } = useFlowchartContext();
  const { w, cx, top } = handlePlace(node);
  const active = selected === node.id;
  const label = nodeLabel(node, index);
  const [draft, setDraft] = useState<string | null>(null);
  const body = children ?? node.children ?? (node.condition ? <ConditionBody /> : <StepBody node={node} />);
  const custom = children !== undefined || node.children !== undefined || node.condition;
  // Previewed: a connector end snapped here, or the user is hovering it in "Connect to…".
  const previewed = snapTarget === node.id || previewNode === node.id;
  const dimmed = previewNode !== null && !previewed;
  const toggle = () => {
    if (wasDragged()) return;
    updateSelected(active ? null : node.id);
  };
  const commitRename = () => {
    const next = draft?.trim();
    setDraft(null);
    if (next && next !== label) renameNode(node.id, next);
  };
  const cardClass = cn(
    "w-full rounded-[18px] bg-surface text-left outline-none transition-[box-shadow,opacity] duration-150",
    active ? "shadow-[0_0_0_1.5px_var(--accent-default),0_2px_10px_rgba(0,0,0,0.045)]" : "shadow-card hover:shadow-raised",
    previewed && "shadow-[0_0_0_2px_var(--accent-default),0_2px_10px_rgba(0,0,0,0.045)]",
  );
  const card = custom ? (
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
  );
  const others = steps.filter((n) => n.id !== node.id);

  return (
    <div
      ref={onRef}
      data-node={node.id}
      data-preview={previewed || undefined}
      onPointerDown={onPointerDown(node)}
      onPointerMove={onPointerMove(node)}
      onPointerUp={onPointerUp(node)}
      onKeyDown={(event) => {
        if (readOnly || !active || (event.key !== "Delete" && event.key !== "Backspace")) return;
        if ((event.target as Element).closest("[data-ui]")) return;
        event.preventDefault();
        removeNode(node.id);
      }}
      className={cn(
        "group absolute flex -translate-x-1/2 touch-none flex-col items-start gap-1.5 transition-opacity duration-150",
        previewed && "opacity-70",
        dimmed && "opacity-40",
      )}
      style={{ left: cx, top, width: w, zIndex: drag.current?.id === node.id ? 2 : 1 }}
    >
      {node.kind || node.condition ? (
        draft !== null ? (
          <input
            data-ui
            aria-label="Node name"
            autoFocus
            className="h-6 w-32 rounded-[6px] border border-accent-default bg-surface px-2 text-[11.5px] font-medium text-ink outline-none"
            onBlur={commitRename}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") commitRename();
              if (event.key === "Escape") setDraft(null);
            }}
            value={draft}
          />
        ) : (
          <span
            data-ui
            data-slot="node-pill"
            title={canRename && !readOnly ? "Double-click to rename" : undefined}
            onDoubleClick={() => {
              if (canRename && !readOnly) setDraft(label);
            }}
            className={cn("inline-flex h-6 items-center rounded-[6px] px-2 text-[11.5px] font-medium", canRename && !readOnly && "cursor-text")}
            style={{
              background: mix(node.kind?.hue ?? "var(--accent-default)", 14, "var(--page)"),
              color: mix(node.kind?.hue ?? "var(--accent-default)", 80, "var(--ink)"),
            }}
          >
            {label}
          </span>
        )
      ) : null}
      {readOnly ? (
        <div className="relative w-full">{card}</div>
      ) : (
        <ContextMenu onOpenChange={(open) => { if (!open) setPreviewNode(null); }}>
          <ContextMenuTrigger className="relative w-full">{card}</ContextMenuTrigger>
          <ContextMenuPopup className="w-52">
            <ContextMenuSub>
              <ContextMenuSubTrigger disabled={!canConnect || others.length === 0}>
                <Link2 /> Connect to…
              </ContextMenuSubTrigger>
              <ContextMenuSubPopup className="w-48">
                {others.map((other, i) => (
                  <ContextMenuItem
                    key={other.id}
                    onClick={() => connectTo(node.id, other.id)}
                    onMouseEnter={() => setPreviewNode(other.id)}
                    onMouseLeave={() => setPreviewNode(null)}
                  >
                    {other.title ?? nodeLabel(other, steps.indexOf(other) >= 0 ? steps.indexOf(other) : i)}
                  </ContextMenuItem>
                ))}
              </ContextMenuSubPopup>
            </ContextMenuSub>
            <ContextMenuItem disabled={!onAdd} onClick={() => onAdd?.(node.id, "bottom")}>
              <Plus /> Add child
            </ContextMenuItem>
            <ContextMenuItem disabled>
              <Sparkles /> Ask Exegia…
            </ContextMenuItem>
            <ContextMenuSeparator />
            <ContextMenuItem disabled={!canDuplicate} onClick={() => duplicateNode(node.id)}>
              <Copy /> Duplicate
            </ContextMenuItem>
            <ContextMenuItem variant="destructive" onClick={() => removeNode(node.id)}>
              <Trash2 /> Delete
            </ContextMenuItem>
          </ContextMenuPopup>
        </ContextMenu>
      )}
    </div>
  );
}
