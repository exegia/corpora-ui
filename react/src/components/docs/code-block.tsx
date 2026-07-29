/** Plain code snippet shell — syntax highlighting can be layered in later. */
export function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border bg-muted/50 p-4 font-mono text-xs leading-relaxed">
      <code>{code}</code>
    </pre>
  )
}
