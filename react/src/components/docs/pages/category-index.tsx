import { Link } from "fumapress/client"

import { getCategory, getEntries } from "@/registry"

/** Shared list page for /atoms, /composed and /blocks. */
export function CategoryIndexPage({ category }: { category: string }) {
  const definition = getCategory(category)
  const entries = definition ? getEntries(definition.category) : []

  if (!definition) {
    return <p className="text-sm text-muted-foreground">Unknown category.</p>
  }

  return (
    <div className="flex flex-col gap-8">
      <header className="flex max-w-2xl flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {definition.title}
        </h1>
        <p className="text-muted-foreground">{definition.description}</p>
      </header>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing here yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {entries.map((entry) => (
            <Link
              key={entry.slug}
              href={`/${definition.path}/${entry.slug}`}
              className="flex flex-col gap-1 rounded-lg border p-5 transition-colors hover:bg-muted/50"
            >
              <div className="flex items-baseline justify-between">
                <h2 className="font-medium">{entry.name}</h2>
                <span className="text-xs text-muted-foreground">
                  {entry.status}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {entry.description}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
