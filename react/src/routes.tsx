import { createBrowserRouter } from "react-router"

import { DocsLayout } from "@/layouts/docs-layout"
import { SiteLayout } from "@/layouts/site-layout"
import { CategoryIndexPage } from "@/pages/category-index"
import { EntryDetailPage } from "@/pages/entry-detail"
import { HomePage } from "@/pages/home"
import { NotFoundPage } from "@/pages/not-found"
import { categories } from "@/registry"

/**
 * Route map (generated from the registry categories):
 *
 *   /                    → HomePage
 *   /atoms               → CategoryIndexPage
 *   /atoms/:slug         → EntryDetailPage
 *   /components          → CategoryIndexPage
 *   /components/:slug    → EntryDetailPage
 *   /blocks              → CategoryIndexPage
 *   /blocks/:slug        → EntryDetailPage
 *   *                    → NotFoundPage
 */
export const router = createBrowserRouter([
  {
    element: <SiteLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        element: <DocsLayout />,
        children: categories.flatMap((category) => [
          {
            path: category.path,
            element: <CategoryIndexPage category={category} />,
          },
          {
            path: `${category.path}/:slug`,
            element: <EntryDetailPage category={category} />,
          },
        ]),
      },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
])
