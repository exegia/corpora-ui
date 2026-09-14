/* eslint-disable react-refresh/only-export-components -- Fumapress route files export page config beside the page component. */
import type { RouteConfig } from "fumapress"

import { CategoryIndexPage } from "@/components/docs/pages/category-index"
import { categories } from "@/registry"

export async function getConfig() {
  return {
    render: "static",
    staticPaths: categories.map((category) => category.path),
  } satisfies RouteConfig
}

export default function Page({ category }: { category: string }) {
  return <CategoryIndexPage category={category} />
}
