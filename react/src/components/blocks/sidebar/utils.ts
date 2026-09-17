import { EASE_OUT } from "@/lib/ease.ts"
import type { FlatResource, SidebarResource, SidebarResourceDropPosition, SidebarResourceMove } from "./type.ts"

export const ROW_REVEAL = {
  duration: 0.16,
  ease: EASE_OUT,
} as const

export function canContain(item: SidebarResource) {
  return item.kind === "folder" || item.kind === "project"
}

export function flattenResources(
  items: SidebarResource[],
  expanded: ReadonlySet<string>,
  depth = 0,
  parentId: string | null = null
): FlatResource[] {
  return items.flatMap((item) => {
    const row = { item, depth, parentId }
    if (!item.children?.length || !expanded.has(item.id)) return [row]
    return [
      row,
      ...flattenResources(item.children, expanded, depth + 1, item.id),
    ]
  })
}

export function findResource(
  items: SidebarResource[],
  id: string
): SidebarResource | undefined {
  for (const item of items) {
    if (item.id === id) return item
    const child = item.children ? findResource(item.children, id) : undefined
    if (child) return child
  }
}


/** Ids of every ancestor of `id` (nearest last); empty when absent. */
export function ancestorIdsOf(
  items: SidebarResource[],
  id: string
): string[] {
  const walk = (nodes: SidebarResource[], trail: string[]): string[] | null => {
    for (const node of nodes) {
      if (node.id === id) return trail
      if (node.children) {
        const found = walk(node.children, [...trail, node.id])
        if (found) return found
      }
    }
    return null
  }
  return walk(items, []) ?? []
}

/** Ids of every row that can hold children and has some — the set
 * `expandAll` opens. */
export function expandableIdsOf(items: SidebarResource[]): string[] {
  return items.flatMap((item) =>
    item.children?.length && canContain(item)
      ? [item.id, ...expandableIdsOf(item.children)]
      : []
  )
}

export function containsResource(item: SidebarResource, id: string): boolean {
  return (
    item.id === id ||
    item.children?.some((child) => containsResource(child, id)) === true
  );
}

export function removeResource(
  items: SidebarResource[],
  id: string,
): { items: SidebarResource[]; removed?: SidebarResource } {
  let removed: SidebarResource | undefined;
  const next: SidebarResource[] = [];

  for (const item of items) {
    if (item.id === id) {
      removed = item;
      continue;
    }

    if (item.children?.length) {
      const childResult = removeResource(item.children, id);
      if (childResult.removed) {
        removed = childResult.removed;
        next.push({ ...item, children: childResult.items });
        continue;
      }
    }

    next.push(item);
  }

  return { items: next, removed };
}

export function insertResource(
  items: SidebarResource[],
  resource: SidebarResource,
  targetId: string | null,
  position: SidebarResourceDropPosition,
): SidebarResource[] {
  if (targetId === null) return [...items, resource];

  const next: SidebarResource[] = [];
  for (const item of items) {
    if (item.id === targetId) {
      if (position === "before") next.push(resource, item);
      else if (position === "after") next.push(item, resource);
      else next.push({ ...item, children: [...(item.children ?? []), resource] });
      continue;
    }

    if (item.children?.length) {
      next.push({
        ...item,
        children: insertResource(item.children, resource, targetId, position),
      });
    } else {
      next.push(item);
    }
  }
  return next;
}

export function moveResource(
  items: SidebarResource[],
  move: SidebarResourceMove,
): SidebarResource[] | null {
  const source = findResource(items, move.itemId);
  if (!source || source.disabled) return null;
  if (move.targetId && containsResource(source, move.targetId)) return null;

  const target = move.targetId ? findResource(items, move.targetId) : undefined;
  if (
    move.position === "inside" &&
    (!target || target.disabled || !canContain(target))
  )
    return null;

  const removed = removeResource(items, move.itemId);
  if (!removed.removed) return null;
  return insertResource(
    removed.items,
    removed.removed,
    move.targetId,
    move.position,
  );
}

export function renameResource(
  items: SidebarResource[],
  id: string,
  label: string,
): SidebarResource[] {
  return items.map((item) => ({
    ...item,
    label: item.id === id ? label : item.label,
    children: item.children
      ? renameResource(item.children, id, label)
      : undefined,
  }));
}
