import { Link } from "react-router"

import { CodeBlock } from "@/components/docs/code-block"
import { categories, registry } from "@/registry"

const INSTALL_SNIPPET = `# npm package
bun add @corpora/ui

# or pull individual components via the shadcn CLI
bunx shadcn@latest add @corpora/button`

export function HomePage() {
  return (
    <div className="flex flex-col gap-12">
      <section className="flex max-w-2xl flex-col gap-3">
        <h1 className="text-3xl font-semibold tracking-tight">corpora/ui</h1>
        <p className="text-muted-foreground">
          A shadcn-ready component library for building the corpora apps —
          interfaces for consulting, researching and discussing manuscripts and
          codices.
        </p>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-medium">Installation</h2>
        <CodeBlock code={INSTALL_SNIPPET} />
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-medium">Browse the library</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => {
            const entries = registry[category.category]
            return (
              <Link
                key={category.category}
                to={`/${category.path}`}
                className="flex flex-col gap-2 rounded-lg border p-5 transition-colors hover:bg-muted/50"
              >
                <div className="flex items-baseline justify-between">
                  <h3 className="font-medium">{category.title}</h3>
                  <span className="text-xs text-muted-foreground">
                    {entries.length}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
                <p className="mt-auto pt-2 text-xs text-muted-foreground">
                  {entries.map((entry) => entry.name).join(" · ")}
                </p>
              </Link>
            )
          })}
        </div>
      </section>
    </div>
  )
}
