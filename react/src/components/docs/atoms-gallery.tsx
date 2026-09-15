"use client"

import * as React from "react"
import { motion } from "motion/react"
import { ArrowUpRight, Search } from "lucide-react"

import { Avatar, Bubble, Reference, Text } from "@/components/atoms"
import AI from "@/components/composed/ai"
import User from "@/components/composed/user"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"
import { Label } from "@/components/ui/label"
import { OTPField, OTPFieldInput } from "@/components/ui/otp-field"
import {
  FileBadgeCorpus,
  FileBadgePdf,
  FileBadgeTei,
  FileBadgeXml,
} from "@/components/icons"
import { cn } from "@/lib/utils"

/** Docs landing gallery: one live tile per atom, bento-laid, linking to its page.
 *  Never part of the npm surface. */

const EASE = [0.32, 0.72, 0, 1] as const

function Tile({
  href,
  name,
  blurb,
  className,
  stageClassName,
  children,
  index,
}: {
  href: string
  name: string
  blurb: string
  className?: string
  stageClassName?: string
  children: React.ReactNode
  index: number
}) {
  return (
    <motion.a
      href={href}
      initial={{ opacity: 0, y: 32, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, ease: EASE, delay: (index % 4) * 0.06 }}
      className={cn(
        "group not-prose flex flex-col rounded-lg bg-black/[0.035] p-1.5 no-underline ring-1 ring-black/[0.06] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:-translate-y-0.5 active:scale-[0.99] dark:bg-white/[0.04] dark:ring-white/[0.08]",
        className
      )}
    >
      <div
        className={cn(
          "relative flex flex-1 items-center justify-center overflow-hidden rounded-lg bg-background p-6 shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]",
          stageClassName
        )}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent)] opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:opacity-100"
        />
        <div className="relative w-full">{children}</div>
      </div>
      <div className="flex items-center gap-3 px-4 pt-3 pb-2.5">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium tracking-tight text-foreground">
            {name}
          </div>
          <div className="truncate text-xs text-muted-foreground">{blurb}</div>
        </div>
        <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-black/5 text-foreground transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-px group-hover:translate-x-0.5 group-hover:scale-105 dark:bg-white/10">
          <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
        </span>
      </div>
    </motion.a>
  )
}

const REACTIONS = [
  { id: "heart", emoji: "❤️", count: 4, reacted: true, label: "heart" },
  { id: "eyes", emoji: "👀", count: 1, label: "eyes" },
]

export function AtomsGallery() {
  const [otp, setOtp] = React.useState("482")
  const [query, setQuery] = React.useState("")
  return (
    <div className="not-prose grid grid-cols-1 gap-4 md:auto-rows-[minmax(11rem,auto)] md:grid-cols-4">
      <Tile
        index={0}
        href="/atoms/bubble"
        name="Bubble"
        blurb="Message surface with header, reactions and actions"
        className="md:col-span-2 md:row-span-2"
        stageClassName="items-start"
      >
        <div className="mx-auto flex w-full max-w-xs flex-col gap-4">
          <Bubble variant="sender" continued>
            <Bubble.Header>
              <User.Info
                user={{ firstName: "Sen", lastName: "Der", role: "Admin" }}
                direction="sender"
                variant="info"
              />
            </Bubble.Header>
            <Bubble.Message>
              Does ¶12 keep the RC003 boundary? The walker looks like it split
              it.
            </Bubble.Message>
            <Bubble.Reactions reactions={REACTIONS} />
          </Bubble>
          <Bubble variant="ai" continued>
            <Bubble.Header>
              <AI.Avatar />
            </Bubble.Header>
            <Bubble.Message>
              The boundary is valid. Node p-17 has a label mismatch — accept
              the fix to align it with the schema.
            </Bubble.Message>
          </Bubble>
        </div>
      </Tile>

      <Tile
        index={1}
        href="/atoms/button"
        name="Button"
        blurb="Variants, sizes, loading, glass"
        className="md:col-span-2"
      >
        <div className="flex flex-wrap items-center justify-center gap-3">
          <Button>Consult manuscript</Button>
          <Button variant="secondary">Annotate</Button>
          <Button variant="outline">Compare</Button>
          <Button variant="ghost">Dismiss</Button>
          <Button loading>Saving</Button>
        </div>
      </Tile>

      <Tile
        index={2}
        href="/atoms/avatar"
        name="Avatar"
        blurb="Initials, presence, audio ring"
        className="md:col-span-1"
      >
        <div className="flex items-center justify-center -space-x-2">
          <Avatar
            size="lg"
            user={{ firstName: "Ada", lastName: "L", status: "online" }}
          />
          <Avatar
            size="lg"
            user={{ firstName: "Bo", lastName: "K", status: "idle" }}
            audio="speaking"
          />
          <Avatar size="lg" loading />
        </div>
      </Tile>

      <Tile
        index={3}
        href="/atoms/reference"
        name="Reference"
        blurb="Grounding chip with hover preview"
        className="md:col-span-1"
      >
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Reference
            preview="Call me Ishmael. Some years ago — never mind how long precisely — having little or no money in my purse…"
          >
            Moby-Dick 1:1
          </Reference>
          <Reference>Iliad 1.12</Reference>
        </div>
      </Tile>

      <Tile
        index={4}
        href="/atoms/otp-field"
        name="OTP Field"
        blurb="Per-character slots"
        className="md:col-span-2"
      >
        <div className="flex justify-center">
          <Label className="sr-only" htmlFor="homepage-otp">
            One-time passcode
          </Label>
          <OTPField
            id="homepage-otp"
            length={6}
            value={otp}
            onValueChange={setOtp}
          >
            {Array.from({ length: 6 }, (_, i) => (
              <OTPFieldInput key={i} aria-label={`Digit ${i + 1} of 6`} />
            ))}
          </OTPField>
        </div>
      </Tile>

      <Tile
        index={5}
        href="/atoms/file-icons"
        name="File icons"
        blurb="Light and dark artwork, pure CSS"
        className="md:col-span-2"
      >
        <div className="flex items-center justify-center gap-3">
          <FileBadgeTei size={44} />
          <FileBadgeXml size={44} />
          <FileBadgePdf size={44} />
          <FileBadgeCorpus size={44} />
        </div>
      </Tile>

      <Tile
        index={6}
        href="/atoms/input-group"
        name="Input Group"
        blurb="Leading and trailing addons"
        className="md:col-span-2"
      >
        <div className="flex justify-center">
          <InputGroup className="w-full max-w-64">
            <InputGroupAddon>
              <Search aria-hidden="true" strokeWidth={1.5} />
            </InputGroupAddon>
            <InputGroupInput
              placeholder="Search the corpus"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <InputGroupAddon align="inline-end">
              <Kbd>⌘K</Kbd>
            </InputGroupAddon>
          </InputGroup>
        </div>
      </Tile>

      <Tile
        index={7}
        href="/atoms/checkbox"
        name="Checkbox"
        blurb="Sound-cued toggle with label"
        className="md:col-span-2"
      >
        <div className="flex flex-col items-center gap-3">
          <Label className="flex items-center gap-2">
            <Checkbox defaultChecked /> Apparatus
          </Label>
          <Label className="flex items-center gap-2">
            <Checkbox /> Variants
          </Label>
        </div>
      </Tile>

      <Tile
        index={8}
        href="/atoms/text"
        name="Text"
        blurb="Corpus prose with semantic variants"
        className="md:col-span-2"
      >
        <div className="mx-auto grid max-w-sm gap-2 text-center">
          <Text.Heading size="large">Iliad 1.1</Text.Heading>
          <Text.Paragraph size="small">
            Sing, goddess, the anger of Peleus&apos; son Achilles.
          </Text.Paragraph>
        </div>
      </Tile>
    </div>
  )
}

export default AtomsGallery
