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
        name: "sound",
        type: "boolean",
        default: "true",
        description:
          "Emit cuelume press/release sound attributes. Silent until the app calls bindSounds().",
      },
      {
        name: "size",
        type: '"default" | "sm" | "lg" | "xl" | "xs" | "icon" | "icon-sm" | "icon-lg" | "icon-xl" | "icon-xs"',
        default: '"default"',
        description: "Size of the button.",
      },
      {
        name: "loading",
        type: "boolean",
        default: "false",
        description:
          "Shows a spinner (inline for text sizes, overlaid for icon sizes) and disables the button.",
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
    status: "in-progress",
    preview: React.lazy(() => import("./demos/input-demo")),
    props: [
      {
        name: "size",
        type: '"sm" | "default" | "lg" | number',
        default: '"default"',
        description: "Size of the input.",
      },
      {
        name: "unstyled",
        type: "boolean",
        default: "false",
        description: "Removes the styled wrapper.",
      },
    ],
    usage: `import { Input } from "@corpora/ui"

<Input type="email" placeholder="you@example.com" />`,
  },
  {
    slug: "label",
    name: "Label",
    description: "Accessible label paired with a form control.",
    category: "atoms",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/label-demo")),
    props: [
      {
        name: "sound",
        type: "boolean",
        default: "true",
        description:
          "Emit the cuelume hover tick. Silent until the app calls bindSounds().",
      },
    ],
    usage: `import { Label } from "@corpora/ui"

<Label htmlFor="email">Email</Label>`,
  },
  {
    slug: "field",
    name: "Field",
    description:
      "Form field wrapper wiring label, control, description and error together.",
    category: "atoms",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/field-demo")),
    registryDependencies: ["input", "label"],
    usage: `import { Field, FieldDescription, FieldLabel } from "@corpora/ui"

<Field>
  <FieldLabel>Email</FieldLabel>
  <Input type="email" />
  <FieldDescription>We will never share your email.</FieldDescription>
</Field>`,
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    description: "Control for toggling a boolean, with indeterminate support.",
    category: "atoms",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/checkbox-demo")),
    props: [
      {
        name: "indeterminate",
        type: "boolean",
        default: "false",
        description: "Renders the mixed state.",
      },
      {
        name: "sound",
        type: "boolean",
        default: "true",
        description:
          "Emit the cuelume toggle cue. Silent until the app calls bindSounds().",
      },
    ],
    usage: `import { Checkbox } from "@corpora/ui"

<Checkbox defaultChecked />`,
  },
  {
    slug: "separator",
    name: "Separator",
    description: "Visually separates content horizontally or vertically.",
    category: "atoms",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/separator-demo")),
    props: [
      {
        name: "orientation",
        type: '"horizontal" | "vertical"',
        default: '"horizontal"',
        description: "Direction of the separator.",
      },
    ],
    usage: `import { Separator } from "@corpora/ui"

<Separator />`,
  },
  {
    slug: "card",
    name: "Card",
    description: "Surface with header, panel and footer sections.",
    category: "atoms",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/card-demo")),
    usage: `import { Card, CardHeader, CardPanel, CardTitle } from "@corpora/ui"

<Card>
  <CardHeader><CardTitle>Title</CardTitle></CardHeader>
  <CardPanel>Content</CardPanel>
</Card>`,
  },
  {
    slug: "frame",
    name: "Frame",
    description:
      "Muted wrapper that raises cards into framed panels, with header/footer strips.",
    category: "atoms",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/frame-demo")),
    registryDependencies: ["card"],
    usage: `import { Card, Frame, FrameFooter } from "@corpora/ui"

<Frame>
  <Card>…</Card>
  <FrameFooter>Fine print below the card.</FrameFooter>
</Frame>`,
  },
  {
    slug: "textarea",
    name: "Textarea",
    description: "Multi-line text input.",
    category: "atoms",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/textarea-demo")),
    usage: `import { Textarea } from "@corpora/ui"

<Textarea placeholder="Add an annotation…" />`,
  },
  {
    slug: "otp-field",
    name: "OTP Field",
    description: "One-time-passcode input with per-character slots.",
    category: "atoms",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/otp-field-demo")),
    props: [
      {
        name: "length",
        type: "number",
        description: "Number of characters.",
      },
      {
        name: "value / onValueChange",
        type: "string / (value: string) => void",
        description: "Controlled code value.",
      },
      {
        name: "sound",
        type: "boolean",
        default: "true",
        description:
          "Tick cue per entered character. Silent until the app calls bindSounds().",
      },
    ],
    usage: `import { OTPField, OTPFieldInput } from "@corpora/ui"

<OTPField length={6}>
  {Array.from({ length: 6 }, (_, i) => <OTPFieldInput key={i} />)}
</OTPField>`,
  },
  {
    slug: "input-group",
    name: "Input Group",
    description: "Input with leading/trailing addons (icons, text, buttons).",
    category: "atoms",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/input-group-demo")),
    registryDependencies: ["input", "button"],
    usage: `import { InputGroup, InputGroupAddon, InputGroupInput } from "@corpora/ui"

<InputGroup>
  <InputGroupAddon><SearchIcon /></InputGroupAddon>
  <InputGroupInput placeholder="Search…" />
</InputGroup>`,
  },
  {
    slug: "text",
    name: "Text",
    description: "Typography primitive for body copy, labels and captions.",
    category: "atoms",
    status: "planned",
  },
]
