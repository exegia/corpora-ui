import { Link } from "react-router"

import type { CategoryDef } from "@/registry"
import { getEntries } from "@/registry"

/** Shared list page for /atoms, /components and /blocks. */
export function CategoryIndexPage({ category }: { category: CategoryDef }) {
  const entries = getEntries(category.category)

  return (
    <div className="flex flex-col gap-8">
      <header className="flex max-w-2xl flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          {category.title}
        </h1>
        <p className="text-muted-foreground">{category.description}</p>
      </header>

      {entries.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nothing here yet.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {entries.map((entry) => (
            <Link
              key={entry.slug}
              to={`/${category.path}/${entry.slug}`}
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
