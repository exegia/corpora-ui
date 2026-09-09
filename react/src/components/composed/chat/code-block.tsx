"use client"

import { Copy, FileCode } from "lucide-react"
import * as React from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { SegmentedToggle } from "@/components/ui/chat"

export interface CodeDiffLine {
  type?: "add" | "remove" | "context"
  text: string
}

export interface CodeBlockProps extends Omit<React.ComponentPropsWithoutRef<"div">, "onCopy"> {
  filename?: React.ReactNode
  code: string
  /** Optional diff view; when absent the toggle is hidden. */
  diff?: CodeDiffLine[]
  view?: "code" | "diff"
  defaultView?: "code" | "diff"
  onViewChange?: (view: "code" | "diff") => void
  onCopy?: (code: string) => void
  /** Extra keywords for the tokenizer. */
  keywords?: string[]
}

const KEYWORDS = new Set(["export", "import", "from", "async", "await", "function", "const", "let", "var", "return", "if", "else", "null", "true", "false", "new", "class", "type", "interface"])
const TOKEN = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b([A-Za-z_$][\w$]*)\b/g

/** Minimal highlighter: string literals and keywords only, as in the design. */
export function tokenize(line: string, keywords: ReadonlySet<string>): React.ReactNode[] {
  const out: React.ReactNode[] = []
  let last = 0
  for (const m of line.matchAll(TOKEN)) {
    const i = m.index ?? 0
    if (i > last) out.push(line.slice(last, i))
    if (m[1]) out.push(<span key={i} className="text-code-string">{m[1]}</span>)
    else if (keywords.has(m[2])) out.push(<span key={i} className="text-code-keyword">{m[2]}</span>)
    else out.push(m[0])
    last = i + m[0].length
  }
  if (last < line.length) out.push(line.slice(last))
  return out
}

const VIEWS = [{ value: "code", label: "Code" }, { value: "diff", label: "Diff" }] as const

/**
 * Code card: filename header, Code | Diff toggle, Copy; gutter line numbers
 * and keyword / string tinting from the `--code-*` tokens.
 *
 * @sketch "Component / Code Block"
 */
export function CodeBlock({ filename, code, diff, view, defaultView = "code", onViewChange, onCopy, keywords, className, ...props }: CodeBlockProps): React.ReactElement {
  const [internal, setInternal] = React.useState<"code" | "diff">(defaultView)
  const current = view ?? internal
  const kw = React.useMemo(() => (keywords ? new Set([...KEYWORDS, ...keywords]) : KEYWORDS), [keywords])
  const lines: CodeDiffLine[] = current === "diff" && diff ? diff : code.split("\n").map((text) => ({ text }))

  return (
    <div data-slot="code-block" data-view={current} className={cn("flex w-[420px] max-w-full flex-col overflow-hidden rounded-xl border border-border-default bg-surface-card", className)} {...props}>
      <div className="flex h-11 items-center gap-2 px-4">
        <FileCode className="size-[15px] text-icon" />
        <span className="flex-1 truncate font-mono text-[12px] font-semibold text-text-primary">{filename}</span>
        {diff ? (
          <SegmentedToggle
            label="Code view"
            options={VIEWS}
            value={current}
            onValueChange={(v) => {
              if (view === undefined) setInternal(v)
              onViewChange?.(v)
            }}
          />
        ) : null}
        <Button variant="ghost" size="xs" onClick={() => onCopy?.(code)} className="h-6 gap-1.5 rounded-md px-2 text-[11.5px] font-medium text-text-secondary hover:bg-surface-subtle hover:text-text-primary sm:h-6 [&_svg]:size-3.5! [&_svg]:opacity-100">
          <Copy />Copy
        </Button>
      </div>
      <div className="h-px bg-border-default" />
      <pre className="overflow-x-auto bg-surface-code py-3 font-mono text-[11.5px] leading-[21px] text-text-primary">
        {lines.map((line, i) => (
          <div
            key={i}
            className={cn("flex", line.type === "add" && "bg-semantic-success-subtle", line.type === "remove" && "bg-semantic-danger-subtle")}
          >
            <span className="w-10 shrink-0 select-none border-r border-border-default pr-2.5 text-right text-[11px] text-text-muted">{line.type === "add" ? "+" : line.type === "remove" ? "−" : i + 1}</span>
            <span className="whitespace-pre pl-3">{tokenize(line.text, kw)}</span>
          </div>
        ))}
      </pre>
    </div>
  )
}
