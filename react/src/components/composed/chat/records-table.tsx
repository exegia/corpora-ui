"use client"

import { ChevronsUpDown } from "lucide-react"
import { useAtom } from "jotai"
import * as React from "react"
import { cn } from "@/lib/utils"
import { createKeyedFamilies } from "@/lib/keyed-atom"
import { Checkbox } from "@/components/ui/checkbox"
import { Tag, type TagTone } from "@/components/ui/chat"

const { stateFamily, removeInstance } = createKeyedFamilies("recordsTable")

/** Selected row ids, keyed by `tableId`. */
export const recordsTableSelectionAtom = stateFamily<ReadonlySet<string>>("selection", new Set<string>())
export const removeRecordsTableInstance = removeInstance

export interface RecordsRow {
  id: string
  name: React.ReactNode
  initial?: string
  avatarSrc?: string
  tags?: { label: React.ReactNode; tone?: TagTone }[]
  /** Max tags shown inline; the rest collapse to "+N". */
  lastInteraction?: React.ReactNode
  strength?: React.ReactNode
}

export type RecordsColumnKey = "name" | "tags" | "lastInteraction" | "strength"

export interface RecordsTableProps extends React.ComponentPropsWithoutRef<"div"> {
  tableId?: string
  rows: RecordsRow[]
  headers?: Partial<Record<RecordsColumnKey, React.ReactNode>>
  maxTags?: number
  selected?: ReadonlySet<string>
  onSelectionChange?: (selected: ReadonlySet<string>) => void
  /** Sort is the caller's: the design shows the control only. */
  onSortChange?: (column: RecordsColumnKey) => void
}

const HEADERS: Record<RecordsColumnKey, string> = { name: "Company", tags: "Categories", lastInteraction: "Last interaction", strength: "Connection" }

/**
 * Selectable records table: index, initial avatar, name, tag row with
 * overflow, relative date, connection strength; sortable headers.
 *
 * @sketch "Component / Records Table"
 */
export function RecordsTable({ tableId, rows, headers, maxTags = 2, selected, onSelectionChange, onSortChange, className, ...props }: RecordsTableProps): React.ReactElement {
  const generatedId = React.useId()
  const id = tableId ?? generatedId
  const [stored, setStored] = useAtom(recordsTableSelectionAtom(id))
  const current = selected ?? stored
  const update = (next: ReadonlySet<string>) => {
    if (selected === undefined) setStored(next)
    onSelectionChange?.(next)
  }
  React.useEffect(() => {
    if (tableId) return
    return () => removeRecordsTableInstance(id)
  }, [tableId, id])

  const all = rows.length > 0 && rows.every((r) => current.has(r.id))
  const some = !all && rows.some((r) => current.has(r.id))
  const toggleAll = () => update(all ? new Set() : new Set(rows.map((r) => r.id)))
  const toggle = (rowId: string) => {
    const next = new Set(current)
    if (next.has(rowId)) next.delete(rowId)
    else next.add(rowId)
    update(next)
  }
  const h = { ...HEADERS, ...headers }
  const sortable = (key: RecordsColumnKey, label: React.ReactNode) => (
    <button type="button" onClick={() => onSortChange?.(key)} className="inline-flex items-center gap-1.5 text-left outline-none hover:text-text-primary focus-visible:ring-2 focus-visible:ring-ring [&_svg]:size-3 [&_svg]:text-text-muted">
      {label}<ChevronsUpDown />
    </button>
  )

  return (
    <div data-slot="records-table" className={cn("w-[540px] max-w-full overflow-x-auto rounded-xl border border-border-default bg-surface-card", className)} {...props}>
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-border-default text-[11px] font-medium leading-3 text-text-secondary">
            <th className="w-7 py-2.5 pl-3"><Checkbox aria-label="Select all" checked={all} indeterminate={some} onCheckedChange={toggleAll} className="size-4" /></th>
            <th className="px-2 py-2.5">{h.name}</th>
            <th className="px-2 py-2.5">{sortable("tags", h.tags)}</th>
            <th className="px-2 py-2.5">{sortable("lastInteraction", h.lastInteraction)}</th>
            <th className="px-2 py-2.5 pr-3">{sortable("strength", h.strength)}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const tags = row.tags ?? []
            const extra = tags.length - maxTags
            const checked = current.has(row.id)
            return (
              <tr key={row.id} data-selected={checked || undefined} className="border-b border-border-default last:border-b-0 data-selected:bg-accent-subtle/40">
                <td className="py-2 pl-3">
                  <span className="flex items-center gap-2">
                    <span className="w-2 text-[11px] text-text-muted group-hover:hidden">{i + 1}</span>
                    <Checkbox aria-label={`Select row ${i + 1}`} checked={checked} onCheckedChange={() => toggle(row.id)} className="size-4" />
                  </span>
                </td>
                <td className="px-2 py-2">
                  <span className="flex items-center gap-2">
                    <span className="inline-flex size-5 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-subtle text-[9px] font-semibold text-text-secondary">
                      {row.avatarSrc ? <img alt="" className="size-full object-cover" src={row.avatarSrc} /> : row.initial}
                    </span>
                    <span className="truncate text-[13px] font-medium leading-4 text-text-primary">{row.name}</span>
                  </span>
                </td>
                <td className="px-2 py-2">
                  <span className="flex items-center gap-1">
                    {tags.slice(0, maxTags).map((t, ti) => <Tag key={ti} tone={t.tone}>{t.label}</Tag>)}
                    {extra > 0 ? <span className="text-[12px] text-text-secondary">+{extra}</span> : null}
                  </span>
                </td>
                <td className="px-2 py-2 text-[12.5px] text-text-secondary">{row.lastInteraction}</td>
                <td className="px-2 py-2 pr-3 text-[12.5px] text-text-secondary">{row.strength}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
