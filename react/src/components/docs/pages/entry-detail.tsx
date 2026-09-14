import * as React from "react"

import { CodeBlock } from "@/components/docs/code-block"
import { ComponentPreview } from "@/components/docs/component-preview"
import { PropsTable } from "@/components/docs/props-table"
import { getCategory, getEntry } from "@/registry"

/** Shared detail page for /atoms/:slug, /composed/:slug and /blocks/:slug. */
export function EntryDetailPage({
  category,
  slug,
}: {
  category: string
  slug: string
}) {
  const definition = getCategory(category)
  const entry =
    definition && definition.category
      ? getEntry(definition.category, slug)
      : undefined

  if (!definition || !entry) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Not found</h1>
        <p className="text-muted-foreground">
          No entry named “{slug}” in {definition?.title ?? category}.
        </p>
      </div>
    )
  }

  return (
    <article className="flex flex-col gap-10">
      <header className="flex max-w-2xl flex-col gap-2">
        <p className="text-xs text-muted-foreground uppercase">
          {definition.title}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">{entry.name}</h1>
        <p className="text-muted-foreground">{entry.description}</p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Preview</h2>
        <ComponentPreview entry={entry} />
      </section>

      {entry.usage ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Usage</h2>
          <CodeBlock code={entry.usage} />
        </section>
      ) : null}

      {entry.props && entry.props.length > 0 ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Props</h2>
          <PropsTable props={entry.props} />
        </section>
      ) : null}

      {entry.examples && entry.examples.length > 0 ? (
        <section id="examples" className="flex flex-col gap-6">
          <h2 className="text-lg font-medium">Examples</h2>
          {entry.examples.map((example) => (
            <div key={example.title} className="flex flex-col gap-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                {example.title}
              </h3>
              {example.description ? (
                <p className="text-sm text-muted-foreground">
                  {example.description}
                </p>
              ) : null}
              {example.preview ? (
                <React.Suspense
                  fallback={
                    <p className="text-sm text-muted-foreground">
                      Loading…
                    </p>
                  }
                >
                  <div className="relative w-full">
                    <example.preview />
                  </div>
                </React.Suspense>
              ) : null}
              {example.code ? <CodeBlock code={example.code} /> : null}
            </div>
          ))}
        </section>
      ) : null}
    </article>
  )
}
