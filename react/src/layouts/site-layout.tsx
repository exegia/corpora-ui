import { NavLink, Outlet } from "react-router"

import { categories } from "@/registry"

/** Site shell: top navigation + routed content. Wraps every page. */
export function SiteLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="flex h-14 w-full max-w-6xl items-center gap-6 px-6">
          <NavLink to="/" className="font-semibold">
            corpora/ui
          </NavLink>
          <nav className="flex items-center gap-4 text-sm">
            {categories.map((category) => (
              <NavLink
                key={category.category}
                to={`/${category.path}`}
                className={({ isActive }) =>
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                {category.title}
              </NavLink>
            ))}
          </nav>
          <div className="ml-auto font-mono text-xs text-muted-foreground">
            (Press <kbd>d</kbd> to toggle dark mode)
          </div>
        </div>
      </header>
      <main className="w-full flex-1 px-6 py-10">
        <Outlet />
      </main>
    </div>
  )
}
