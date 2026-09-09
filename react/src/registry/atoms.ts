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
    titleStyle: "titlebar",
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
    titleStyle: "titlebar",
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
    titleStyle: "titlebar",
    name: "Label",
    description: "Accessible label paired with a form control.",
    category: "atoms",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/label-demo")),
    props: [
      {
        name: "sound",
        type: "boolean",
        default: "false",
        description:
          "Opt into the cuelume hover tick. Off by default — the labelled control owns the interaction cue. Silent until the app calls bindSounds().",
      },
    ],
    usage: `import { Label } from "@corpora/ui"

<Label htmlFor="email">Email</Label>`,
  },
  {
    slug: "field",
    name: "Field",
    titleStyle: "titlebar",
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
    titleStyle: "titlebar",
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
    titleStyle: "titlebar",
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
    titleStyle: "titlebar",
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
    titleStyle: "titlebar",
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
    titleStyle: "titlebar",
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
    titleStyle: "titlebar",
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
    titleStyle: "titlebar",
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
    slug: "reference",
    name: "Reference",
    titleStyle: "expanded",
    description: "Reference link with optional header and reactions.",
    category: "atoms",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/reference-demo")),
    registryDependencies: ["chip", "button"],
    usage: `import { Reference } from "@corpora/ui"

<Reference />`,
  },
  {
    slug: "text",
    name: "Text",
    titleStyle: "titlebar",
    description: "Typography primitive for body copy, labels and captions.",
    category: "atoms",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/text-demo")),
    registryDependencies: [],
    props: [
      {
        name: "type",
        type: '"default" | "heading" | "paragraph" | "link" | "subscript"',
        default: '"default"',
        description:
          "Selects the semantic element and its typography treatment.",
      },
      {
        name: "size",
        type: '"small" | "medium" | "large" | number',
        default: '"medium"',
        description:
          "Uses the type scale, or accepts a pixel font size when numeric.",
      },
      {
        name: "selection",
        type: "string | boolean",
        description:
          "Adds a reader-selection treatment; a string is exposed as data-selection.",
      },
    ],
    usage: `import { Text } from "@exegia/corpora-ui"
import { TextClickPopover } from "@exegia/corpora-ui"

<Text.Heading size="large">Corpus title</Text.Heading>
<Text.Paragraph>Readable corpus prose belongs here.</Text.Paragraph>
<Text.Root type="link" href="/activity">View activity</Text.Root>

// Click-triggered popover — works for default (span), link and subscript
<TextClickPopover type="subscript" popover={<p>Annotation</p>}>
  Subscript note
</TextClickPopover>`,
  },
  {
    slug: "bubble",
    name: "Bubble",
    titleStyle: "titlebar",
    description:
      "Chat bubble atom: an inner-shadowed message surface with sender, recipient and ai variants, an author header (avatar, name, time, role badge), a glass reaction pill hanging off the corner and hover-revealed message actions.",
    category: "atoms",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/bubble-demo")),
    registryDependencies: ["button", "badge", "user-avatar", "emoji-picker"],
    props: [
      {
        name: "variant",
        type: '"ai" | "sender" | "recipient"',
        default: '"recipient"',
        description:
          "Who the bubble belongs to. sender is right-aligned on a lit inverted surface with the bottom-right tail pinched, recipient is its dim mirror, ai renders chrome-less prose so generated output never masquerades as a person's message. Sub-components inherit the variant from context.",
      },
      {
        name: "Bubble.Header",
        type: "name / time / badge / avatar",
        description:
          "Author row: avatar (an identity object renders UserAvatar; a node is used as-is; the ai variant defaults to the spark mark), bold name, muted time and a role badge — a string picks the neutral chip for people and the accent chip for the agent. The sender variant mirrors the row.",
      },
      {
        name: "Bubble.Message",
        type: "children",
        description: "The message surface, styled by the inherited variant.",
      },
      {
        name: "Bubble.Reactions",
        type: "reactions / onToggle / onEmojiSelect",
        description:
          "Frosted reaction pill overlapping the bubble's bottom corner. Each chip carries aria-pressed, springs its emoji on toggle and rolls its count; onToggle(reaction, index) fires on click. The trailing add-reaction button opens a frimousse emoji picker in a frosted-glass popover — onEmojiSelect({ emoji, label }) fires on pick. Accepts children for custom chips.",
      },
      {
        name: "Bubble.Actions",
        type: "children",
        description:
          "role=toolbar row for per-message actions (copy, retry, …), hidden until the bubble is hovered or an action has focus. Compose with Button size=icon-xs.",
      },
    ],
    usage: `import { Bubble } from "@exegia/corpora-ui"

<Bubble variant="sender">
  <Bubble.Header name="Sender" time="10 min ago" badge="Admin" />
  <Bubble.Message>Can you check whether ¶12 keeps the boundary?</Bubble.Message>
  <Bubble.Reactions
    reactions={[{ id: "heart", emoji: "❤️", count: 4, reacted: true, label: "heart" }]}
    onToggle={toggleReaction}
  />
  <Bubble.Actions>
    <Button aria-label="Copy" size="icon-xs" variant="ghost">
      <CopyIcon />
    </Button>
  </Bubble.Actions>
</Bubble>`,
  },

  {
    slug: "file-icons",
    name: "File icons",
    titleStyle: "titlebar",
    description:
      "Fourteen file-format icons — seven formats in badge and wordmark families. Each embeds light and dark artwork and switches on Tailwind's dark variant: pure CSS, no props, no hydration flash.",
    category: "atoms",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/file-icons-demo")),
    props: [
      {
        name: "size",
        type: "number | string",
        default: "64",
        description: "Rendered width and height.",
      },
      {
        name: "title",
        type: "string | null",
        default: 'e.g. "TEI file"',
        description:
          "Accessible name (role=img + aria-label). Pass null to mark the icon decorative — it becomes aria-hidden with role=presentation.",
      },
      {
        name: "className / …props",
        type: "SVGProps<SVGSVGElement>",
        description:
          "Everything else is forwarded to the root <svg>. Theme switching needs no props: the light layer is `dark:hidden`, the dark layer `hidden dark:inline`, so the artwork follows whatever drives the app's `dark` variant — scope a `dark` class to force one theme.",
      },
    ],
    usage: `import { FileBadgeTei, FileWordmarkPdf } from "@corpora/ui"

<FileBadgeTei />                         // 64×64, follows the app's dark class
<FileBadgeTei size={96} />               // any size
<FileWordmarkPdf title={null} />         // decorative: aria-hidden
<div className="dark">
  <FileBadgeTei />                       {/* dark artwork, regardless of theme */}
</div>`,
  },
  {
    slug: "chat-atoms",
    name: "Chat atoms",
    titleStyle: "titlebar",
    description:
      "Attachment primitives from the exegia-ui Sketch library: IconTile, Thumbnail, AvatarHandle, Remove/Play/Send/Add buttons, FileTypeBadge, Favicon, Waveform, QuoteRail, DurationPill. Colours come from the chat tokens, so light and dark need no props.",
    category: "atoms",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/chat-atoms-demo")),
    registryDependencies: ["button"],
    props: [
      { name: "IconTile size", type: "28 | 32 | 36 | 40", default: "40", description: "Tile edge; `tone=\"accent\"` swaps the neutral fill for accent-subtle." },
      { name: "Thumbnail size", type: '"sm" | "lg"', default: '"sm"', description: "40px chip tile or 240×160 preview; gradient placeholder without `src`." },
      { name: "AvatarHandle initials", type: "string", description: "Fallback initials when `src` is absent." },
      { name: "Waveform bars / progress", type: "number[] / number", description: "Bar heights in 0…1; bars below `progress` render in accent." },
      { name: "SendButton …props", type: "ButtonProps", description: "Brand-yellow pill; accepts every Button prop except variant." },
    ],
    usage: `import { IconTile, RemoveButton, SendButton } from "@corpora/ui"

<IconTile><FileText /></IconTile>
<RemoveButton onClick={remove} />
<SendButton onClick={send} />`,
  },
]
