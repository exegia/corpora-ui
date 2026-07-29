import { NavLink, Outlet } from "react-router"

import { categories, registry } from "@/registry"

/**
 * Docs shell: sidebar listing every registry entry grouped by category,
 * plus the routed category/entry page. Nested inside <SiteLayout>.
 */
export function DocsLayout() {
  return (
    <div className="grid gap-10 md:grid-cols-[13rem_1fr]">
      <aside className="hidden md:block">
        <nav className="sticky top-24 flex flex-col gap-6 text-sm">
          {categories.map((category) => (
            <div key={category.category} className="flex flex-col gap-2">
              <NavLink
                to={`/${category.path}`}
                end
                className="font-medium hover:underline"
              >
                {category.title}
              </NavLink>
              <ul className="flex flex-col gap-1 border-l pl-3">
                {registry[category.category].map((entry) => (
                  <li key={entry.slug}>
                    <NavLink
                      to={`/${category.path}/${entry.slug}`}
                      className={({ isActive }) =>
                        isActive
                          ? "text-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      }
                    >
                      {entry.name}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
      <div className="min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
