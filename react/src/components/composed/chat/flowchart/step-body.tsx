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
  return (
    <div className="flex items-center gap-2.5 p-2.5">
      <span
        className="flex size-9 shrink-0 items-center justify-center rounded-[8px]"
        style={{
          background: mix(node.hue!, 12),
          color: node.hue,
          boxShadow: `0 0 0 1px ${mix(node.hue!, 20)}`,
        }}
      >
        <ConeIcon />
      </span>
      <span className="min-w-0 text-left">
        <span className="block truncate text-[13px] font-semibold leading-tight text-ink">{node.title}</span>
        <span className="mt-0.5 block text-[12px] leading-snug text-ink-2">{node.caption}</span>
      </span>
    </div>
  );
}
