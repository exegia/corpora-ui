
export function isActive(id: string, activeId?: string): boolean {
    return activeId !== undefined && id === activeId
}