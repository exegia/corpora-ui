export function railItemSize(
  height: number,
  count: number,
  spacing = 12
): number {
  return count > 0 ? Math.min(spacing, height / count) : spacing
}
