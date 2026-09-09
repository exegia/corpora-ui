import { Reference } from "@/components/atoms/bubble/reference"
import { DemoStage } from "@/components/docs/demo-controls"

export default function ReferenceDemo() {
  return (
    <DemoStage>
      <div className="mx-auto flex size-full flex-1 items-center justify-center gap-3">
        <Reference href="#" preview="Call me Ishmael. Some years ago — never mind how long precisely — having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.">
          Moby-Dick 1:1
        </Reference>
        <Reference>Iliad 1.12 · no preview</Reference>
      </div>
    </DemoStage>
  )
}
