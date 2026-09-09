"use client"

import { useAtom } from "jotai"
import * as React from "react"
import { cn } from "@/lib/utils"
import { createKeyedFamilies } from "@/lib/keyed-atom"
import { Dot, type DotTone } from "@/components/ui/chat"

const { stateFamily, removeInstance } = createKeyedFamilies("filterTable")

/** Active filter id, keyed by `tableId`; `null` means "All". */
export const filterTableFilterAtom = stateFamily<string | null>("filter", null)
export const removeFilterTableInstance = removeInstance

export interface FilterTableStatus {
  id: string
  label: React.ReactNode
  tone: DotTone
}

export interface FilterTableColumn<Row> {
  key: keyof Row & string
  header: React.ReactNode
  className?: string
}

export interface FilterTableProps<Row extends { id: string; status: string }> extends React.ComponentPropsWithoutRef<"div"> {
  tableId?: string
  statuses: FilterTableStatus[]
  columns: FilterTableColumn<Row>[]
  /** Column key rendered with the status dot (defaults to "status"). */
  statusKey?: keyof Row & string
  rows: Row[]
  allLabel?: React.ReactNode
  filter?: string | null
  onFilterChange?: (filter: string | null) => void
}

/**
 * Status filter pills over a compact task table.
 *
 * @sketch "Component / Filter Table"
 */
export function FilterTable<Row extends { id: string; status: string }>({
  tableId, statuses, columns, statusKey = "status" as keyof Row & string, rows, allLabel = "All", filter, onFilterChange, className, ...props
}: FilterTableProps<Row>): React.ReactElement {
  const generatedId = React.useId()
  const id = tableId ?? generatedId
  const [stored, setStored] = useAtom(filterTableFilterAtom(id))
  const current = filter === undefined ? stored : filter
  const select = (next: string | null) => {
    if (filter === undefined) setStored(next)
    onFilterChange?.(next)
  }
  React.useEffect(() => {
    if (tableId) return
    return () => removeFilterTableInstance(id)
  }, [tableId, id])

  const visible = current ? rows.filter((r) => r.status === current) : rows
  const byStatus = (s: string) => rows.filter((r) => r.status === s).length
  const statusOf = (s: string) => statuses.find((x) => x.id === s)

  const pill = (active: boolean) =>
    cn(
      "flex h-[26px] items-center gap-1.5 rounded-full px-2.5 text-[12.5px] leading-none outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
      active ? "bg-surface-subtle font-medium text-text-primary" : "text-text-secondary hover:text-text-primary"
    )

  return (
    <div data-slot="filter-table" className={cn("flex w-[450px] max-w-full flex-col gap-2.5", className)} {...props}>
      <div role="tablist" className="flex flex-wrap items-center gap-1">
        <button type="button" role="tab" aria-selected={current === null} onClick={() => select(null)} className={pill(current === null)}>
          {allLabel}
          <span className="rounded-full bg-black/8 px-1.5 py-0.5 text-[10.5px] text-text-secondary dark:bg-white/10">{rows.length}</span>
        </button>
        {statuses.map((s) => (
          <button key={s.id} type="button" role="tab" aria-selected={current === s.id} onClick={() => select(s.id)} className={pill(current === s.id)}>
            <Dot tone={s.tone} size={6} />
            {s.label}
            <span className="text-[10.5px] text-text-muted">{byStatus(s.id)}</span>
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-border-default bg-surface-card">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-border-default">
              {columns.map((c) => (
                <th key={c.key} className={cn("px-3 py-2.5 text-[11px] font-medium leading-3 text-text-secondary", c.className)}>{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((row) => (
              <tr key={row.id} className="border-b border-border-default last:border-b-0">
                {columns.map((c) => {
                  const value = row[c.key] as React.ReactNode
                  const status = c.key === statusKey ? statusOf(String(value)) : undefined
                  return (
                    <td key={c.key} className={cn("whitespace-nowrap px-3 py-2.5 text-[13px] leading-4 text-text-primary", c.className)}>
                      {status ? (
                        <span className="flex items-center gap-1.5 text-[12.5px] text-text-secondary"><Dot tone={status.tone} size={6} />{status.label}</span>
                      ) : value}
                    </td>
                  )
                })}
              </tr>
            ))}
            {visible.length === 0 ? (
              <tr><td colSpan={columns.length} className="px-3 py-4 text-center text-[12px] text-text-muted">No rows</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  )
}
