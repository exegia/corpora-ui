import type * as React from "react"
import { cn } from "@/lib/utils"

const DEFAULT_BARS = [0.3, 0.6, 1, 0.75, 0.45, 0.9, 0.55, 0.35, 0.8, 1, 0.6, 0.4, 0.7, 0.5, 0.85, 0.3, 0.65, 0.95, 0.5, 0.35]

export interface WaveformProps extends React.ComponentPropsWithoutRef<"span"> {
  /** Bar heights in 0…1. Defaults to a 20-bar sample. */
  bars?: number[]
  /** Bars up to this index render in the accent colour (playback progress). */
  progress?: number
}

/**
 * Static 20px-tall bar waveform for audio attachments.
 *
 * @sketch "Atom / Waveform"
 */
export function Waveform({ bars = DEFAULT_BARS, progress = 0, className, ...props }: WaveformProps): React.ReactElement {
  return (
    <span aria-hidden="true" data-slot="waveform" className={cn("inline-flex h-5 items-center gap-[2.5px]", className)} {...props}>
      {bars.map((h, i) => (
        <span
          key={i}
          className={cn("w-0.5 rounded-full", i < progress ? "bg-accent-default" : "bg-text-primary")}
          style={{ height: `${Math.max(0.15, Math.min(1, h)) * 100}%` }}
        />
      ))}
    </span>
  )
}
