import { EASE_OUT } from "@/lib/ease.ts"
import type { IFlatResource, ISidebarResource, TSidebarResourceDropPosition, ISidebarResourceMove } from "./type.ts"

export const ROW_REVEAL = {
  duration: 0.16,
  ease: EASE_OUT,
} as const

export function canContain(item: ISidebarResource) {
  return item.kind === "folder" || item.kind === "project"
}

export function flattenResources(
  items: ISidebarResource[],
  expanded: ReadonlySet<string>,
  depth = 0,
  parentId: string | null = null
): IFlatResource[] {
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
  items: ISidebarResource[],
  id: string
): ISidebarResource | undefined {
  for (const item of items) {
    if (item.id === id) return item
    const child = item.children ? findResource(item.children, id) : undefined
    if (child) return child
  }
}


/** Ids of every ancestor of `id` (nearest last); empty when absent. */
export function ancestorIdsOf(
  items: ISidebarResource[],
  id: string
): string[] {
  const walk = (nodes: ISidebarResource[], trail: string[]): string[] | null => {
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
export function expandableIdsOf(items: ISidebarResource[]): string[] {
  return items.flatMap((item) =>
    item.children?.length && canContain(item)
      ? [item.id, ...expandableIdsOf(item.children)]
      : []
  )
}

export function containsResource(item: ISidebarResource, id: string): boolean {
  return (
    item.id === id ||
    item.children?.some((child) => containsResource(child, id)) === true
  );
}

export function removeResource(
  items: ISidebarResource[],
  id: string,
): { items: ISidebarResource[]; removed?: ISidebarResource } {
  let removed: ISidebarResource | undefined;
  const next: ISidebarResource[] = [];

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
  items: ISidebarResource[],
  resource: ISidebarResource,
  targetId: string | null,
  position: TSidebarResourceDropPosition,
): ISidebarResource[] {
  if (targetId === null) return [...items, resource];

  const next: ISidebarResource[] = [];
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
  items: ISidebarResource[],
  move: ISidebarResourceMove,
): ISidebarResource[] | null {
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
  items: ISidebarResource[],
  id: string,
  label: string,
): ISidebarResource[] {
  return items.map((item) => ({
    ...item,
    label: item.id === id ? label : item.label,
    children: item.children
      ? renameResource(item.children, id, label)
      : undefined,
  }));
}
