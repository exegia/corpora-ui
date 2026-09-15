import { ChevronDown, ConeIcon } from "lucide-react";
import { AMBER } from "../composed/chat/flowchart/constant";

/* ── chips used inside the condition card ── */
export function SourceChip() {
  return (
    <span
      data-ui
      className="inline-flex h-6 shrink-0 items-center gap-1 rounded-[6px] bg-surface px-1.5 text-[12px] font-medium text-ink shadow-btn"
    >
      <span className="text-ink-2">
        <ConeIcon size={12} />
      </span>
      order
    </span>
  );
}

export function SelectChip({
  id,
  value,
  dot,
  open,
  onToggle
}: {
  id: string;
  value: string;
  dot?: boolean;
  items: { name: string; tag?: string }[];
  width: string;
  align?: "left" | "right";
  open: boolean;
  onToggle: (id: string) => void;
  onPick: (id: string, name: string) => void;
}) {
  return (
    <span data-ui className="relative inline-flex min-w-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => onToggle(id)}
        className={`inline-flex h-6 min-w-0 cursor-pointer items-center gap-1 rounded-[6px] px-1.5
          text-[12px] font-medium text-ink transition-colors duration-100
          ${open ? "bg-hover-2" : "bg-field hover:bg-hover-2"}`}
      >
        {dot && <span className="size-1.5 shrink-0 rounded-full" style={{ background: AMBER }} />}
        <span className="min-w-0 truncate">{value}</span>
        <ChevronDown />
      </button>
      {/*{open && (
        <Menu
          items={items}
          value={value}
          width={width}
          align={align}
          onPick={(name) => onPick(id, name)}
        />
      )}*/}
    </span>
  );
}
