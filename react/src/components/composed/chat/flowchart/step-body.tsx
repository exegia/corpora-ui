import { useState } from "react";
import { SelectChip, SourceChip } from "@/components/atoms/chip";
import { FLAVORS, PROPERTIES, TOPPINGS } from "./constant";
import type { StepNode } from "./types";
import { mix } from "./utils";

/* ── icons ── */
function ConeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m7 11 4.08 10.35a1 1 0 0 0 1.84 0L17 11" />
      <path d="M17 7A5 5 0 0 0 7 7" />
      <path d="M17 7a2 2 0 0 1 0 4H7a2 2 0 0 1 0-4" />
    </svg>
  );
}

export function StepBody({ node }: { node: StepNode }) {
  const hue = node.hue ?? "var(--accent-default)";
  return (
    <div className="flex items-center gap-2.5 p-2.5">
      {node.image ? (
        <img
          alt={node.image.alt ?? ""}
          className="size-9 shrink-0 rounded-[8px] object-cover"
          src={node.image.src}
          style={{ boxShadow: `0 0 0 1px ${mix(hue, 20)}` }}
        />
      ) : (
        <span
          className="flex size-9 shrink-0 items-center justify-center rounded-[8px] [&>svg]:size-4"
          style={{
            background: mix(hue, 12),
            color: hue,
            boxShadow: `0 0 0 1px ${mix(hue, 20)}`,
          }}
        >
          {node.icon ?? <ConeIcon />}
        </span>
      )}
      <span className="min-w-0 text-left">
        <span className="block truncate text-[13px] font-semibold leading-tight text-ink">{node.title}</span>
        <span className="mt-0.5 block text-[12px] leading-snug text-ink-2">{node.caption}</span>
      </span>
    </div>
  );
}

/** Default If/Else card body: two chip rows. Picking a value is a TODO until SelectChip's menu lands. */
export function ConditionBody() {
  const [open, setOpen] = useState<string | null>(null);
  const values: Record<string, string> = {
    prop1: "flavor",
    val1: "Rocky Road",
    prop2: "topping",
    val2: "Brown butter bourbon brittle crunch",
  };
  const toggle = (id: string) => setOpen((current) => (current === id ? null : id));
  const pick = () => setOpen(null);
  const chip = (id: string, items: { name: string; tag?: string }[], width: string, extra?: object) => (
    <SelectChip id={id} value={values[id]} items={items} width={width} open={open === id} onToggle={toggle} onPick={pick} {...extra} />
  );

  return (
    <div className="flex flex-col gap-1.5 px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className="w-7 text-[12.5px] text-ink-2">If</span>
        <SourceChip />
        {chip("prop1", PROPERTIES.map((name) => ({ name })), "w-36")}
        <span className="text-[12.5px] text-ink-2">is</span>
        {chip("val1", FLAVORS, "w-44", { dot: true, align: "right" })}
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-1.5">
        <span className="w-7 text-[12.5px] text-ink-2">and</span>
        <SourceChip />
        {chip("prop2", PROPERTIES.map((name) => ({ name })), "w-36")}
        <span className="text-[12.5px] text-ink-2">is</span>
        {chip("val2", TOPPINGS, "w-64", { dot: true })}
      </div>
    </div>
  );
}
