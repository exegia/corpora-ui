"use client";

import { AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import type { AISidebarProps } from "@/components/agents/type.ts"
import { useAISidebar } from "@/components/agents/use-ai-sidebar.ts"
import { ResourceRow } from "@/components/agents/sidebar-row.tsx"

export function AISidebar({
  renderIcon,
  renderMenu,
  renderActionsTrigger,
  ariaLabel = "Resources",
  className,
  ...options
}: AISidebarProps) {
  const {
    flat,
    selectedId,
    expandedIds,
    focusedId,
    setFocusedId,
    draggingId,
    dropTarget,
    hoveredId,
    hoverLayoutId,
    handleRowHover,
    clearHover,
    menuOpenId,
    renamingId,
    setRenamingId,
    announcement,
    select,
    toggle,
    handleKeyDown,
    handleRootDragOver,
    handleDrop,
    handleRowDragStart,
    handleRowDragEnd,
    handleRowDragOver,
    commitRename,
    handleMenuOpenChange,
    setRowRef,
  } = useAISidebar(options);

  return (
    <>
      <div
        role="tree"
        aria-label={ariaLabel}
        aria-multiselectable="false"
        onDragOver={handleRootDragOver}
        onDrop={handleDrop}
        onMouseLeave={clearHover}
        className={cn(
          "relative flex min-w-0 flex-col gap-0.5 [overflow-anchor:none] group-data-[state=collapsed]/sidebar:hidden",
          draggingId && "select-none pb-9",
          className,
        )}
      >
        <AnimatePresence initial={false}>
          {flat.map((row) => (
            <ResourceRow
              key={row.item.id}
              row={row}
              active={selectedId === row.item.id}
              expanded={expandedIds.has(row.item.id)}
              focused={focusedId === row.item.id}
              draggingId={draggingId}
              dropTarget={dropTarget}
              menuOpen={menuOpenId === row.item.id}
              renaming={renamingId === row.item.id}
              hoverActive={hoveredId !== null && !draggingId}
              hoverPill={
                hoveredId === row.item.id &&
                !draggingId &&
                !row.item.disabled
              }
              hoverLayoutId={hoverLayoutId}
              onHoverChange={(hovered) =>
                handleRowHover(row.item.id, hovered)
              }
              onFocus={() => setFocusedId(row.item.id)}
              onSelect={() => select(row.item.id)}
              onToggle={() => toggle(row.item.id)}
              onKeyDown={(event) => handleKeyDown(event, row)}
              onRenameStart={() => setRenamingId(row.item.id)}
              onRenameCancel={() => setRenamingId(null)}
              onRenameCommit={(label) => commitRename(row, label)}
              onMenuOpenChange={(open) => handleMenuOpenChange(row, open)}
              onDragStart={handleRowDragStart}
              onDragEnd={handleRowDragEnd}
              onDragOver={handleRowDragOver}
              onDrop={handleDrop}
              renderIcon={renderIcon}
              renderMenu={renderMenu}
              renderActionsTrigger={renderActionsTrigger}
              setRef={(node) => setRowRef(row.item.id, node)}
            />
          ))}
        </AnimatePresence>

        {draggingId ? (
          <div
            aria-hidden="true"
            data-active={dropTarget?.id === null || undefined}
            className="absolute inset-x-1 bottom-0 flex h-8 items-center justify-center rounded-md border border-dashed border-border text-[10px] text-muted-foreground data-[active=true]:border-primary/50 data-[active=true]:bg-primary/10 data-[active=true]:text-foreground"
          >
            Move to top level
          </div>
        ) : null}
      </div>
      <span className="sr-only" aria-live="polite">
        {announcement}
      </span>
    </>
  );
}
