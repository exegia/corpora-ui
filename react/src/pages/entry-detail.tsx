import { Link, useParams } from "react-router"

import { CodeBlock } from "@/components/docs/code-block"
import { ComponentPreview } from "@/components/docs/component-preview"
import { PropsTable } from "@/components/docs/props-table"
import type { CategoryDef } from "@/registry"
import { getEntry } from "@/registry"

/** Shared detail page for /atoms/:slug, /components/:slug and /blocks/:slug. */
export function EntryDetailPage({ category }: { category: CategoryDef }) {
  const { slug } = useParams()
  const entry = slug ? getEntry(category.category, slug) : undefined

  if (!entry) {
    return (
      <div className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Not found</h1>
        <p className="text-muted-foreground">
          No entry named “{slug}” in {category.title}.{" "}
          <Link to={`/${category.path}`} className="underline">
            Back to {category.title}
          </Link>
        </p>
      </div>
    )
  }

  return (
    <article className="flex flex-col gap-10">
      <header className="flex max-w-2xl flex-col gap-2">
        <p className="text-xs text-muted-foreground uppercase">
          {category.title}
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">{entry.name}</h1>
        <p className="text-muted-foreground">{entry.description}</p>
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Preview</h2>
        <ComponentPreview entry={entry} />
      </section>

      {entry.props && entry.props.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Props</h2>
          <PropsTable props={entry.props} />
        </section>
      )}

      {entry.usage ? (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium">Usage</h2>
          <CodeBlock code={entry.usage} />
        </section>
      ) : null}
    </article>
  )
}
