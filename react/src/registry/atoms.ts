import * as React from "react"

import type { RegistryEntry } from "./schema"

/**
 * Atoms — lowest-level UI primitives, mapping 1:1 to files in
 * `src/components/ui` (what `shadcn add` would install into a consumer app).
 */
export const atoms: RegistryEntry[] = [
  {
    slug: "button",
    name: "Button",
    description: "Displays a button or a component that looks like a button.",
    category: "atoms",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/button-demo")),
    props: [
      {
        name: "variant",
        type: '"default" | "destructive" | "destructive-outline" | "outline" | "secondary" | "ghost" | "link" | "glass"',
        default: '"default"',
        description: "Visual style of the button.",
      },
      {
        name: "glassVariant",
        type: '"clear" | "frosted" | "subtle" | "liquid" | "liquid-refract"',
        default: '"liquid-refract"',
        description: 'Glass finish. Only accepted when variant is "glass".',
      },
      {
        name: "size",
        type: '"default" | "sm" | "lg" | "icon"',
        default: '"default"',
        description: "Size of the button.",
      },
    ],
    usage: `import { Button } from "@corpora/ui"

<Button variant="outline">Consult manuscript</Button>`,
  },
  {
    slug: "input",
    name: "Input",
    description: "Displays a form input field.",
    category: "atoms",
    status: "planned",
  },
  {
    slug: "text",
    name: "Text",
    description: "Typography primitive for body copy, labels and captions.",
    category: "atoms",
    status: "planned",
  },
]
