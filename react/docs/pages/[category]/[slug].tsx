/* eslint-disable react-refresh/only-export-components -- Fumapress route files export page config beside the page component. */
import type { RouteConfig } from "fumapress"

import { EntryDetailPage } from "@/components/docs/pages/entry-detail"
import { categories, registry } from "@/registry"

const paths = categories.flatMap((category) =>
  registry[category.category].map((entry) => [category.path, entry.slug])
)

export async function getConfig() {
  return {
    render: "static",
    staticPaths: paths,
  } satisfies RouteConfig
}

export default function Page({
  category,
  slug,
}: {
  category: string
  slug: string
}) {
  return <EntryDetailPage category={category} slug={slug} />
}
