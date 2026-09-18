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

export function GalleryTile({
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
    <motion.div
      initial={{ opacity: 0, y: 32, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-10% 0px" }}
      transition={{ duration: 0.8, ease: EASE, delay: (index % 4) * 0.06 }}
      className={cn(
        "group not-prose bg-black/[0.035] p-1.5 ring-black/[0.06] hover:-translate-y-0.5 dark:bg-white/[0.04] dark:ring-white/[0.08] flex flex-col rounded-lg no-underline ring-1 transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.99]",
        className
      )}
    >
      <div
        className={cn(
          "p-6 relative flex flex-1 items-center justify-center overflow-hidden rounded-lg bg-background shadow-[inset_0_1px_1px_rgba(255,255,255,0.6),0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]",
          stageClassName
        )}
      >
        <div
          aria-hidden
          className="inset-0 pointer-events-none absolute bg-[radial-gradient(60%_60%_at_50%_0%,color-mix(in_oklch,var(--primary)_10%,transparent),transparent)] opacity-0 transition-opacity duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:opacity-100"
        />
        <div className="relative w-full">{children}</div>
      </div>
      <a
        href={href}
        className="gap-3 px-4 pt-3 pb-2.5 flex items-center rounded-lg no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium tracking-tight text-foreground">
            {name}
          </div>
          <div className="text-xs truncate text-muted-foreground">{blurb}</div>
        </div>
        <span className="size-7 bg-black/5 group-hover:translate-x-0.5 dark:bg-white/10 flex shrink-0 items-center justify-center rounded-full text-foreground transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:-translate-y-px group-hover:scale-105">
          <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
        </span>
      </a>
    </motion.div>
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
    <div className="not-prose gap-4 md:auto-rows-[minmax(11rem,auto)] md:grid-cols-4 grid grid-cols-1">
      <GalleryTile
        index={0}
        href="/atoms/bubble"
        name="Bubble"
        blurb="Message surface with header, reactions and actions"
        className="md:col-span-2 md:row-span-2"
        stageClassName="items-start"
      >
        <div className="max-w-xs gap-4 mx-auto flex w-full flex-col">
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
              The boundary is valid. Node p-17 has a label mismatch — accept the
              fix to align it with the schema.
            </Bubble.Message>
          </Bubble>
        </div>
      </GalleryTile>

      <GalleryTile
        index={1}
        href="/atoms/button"
        name="Button"
        blurb="Variants, sizes, loading, glass"
        className="md:col-span-2"
      >
        <div className="gap-3 flex flex-wrap items-center justify-center">
          <Button>Consult manuscript</Button>
          <Button variant="secondary">Annotate</Button>
          <Button variant="outline">Compare</Button>
          <Button variant="ghost">Dismiss</Button>
          <Button loading>Saving</Button>
        </div>
      </GalleryTile>

      <GalleryTile
        index={2}
        href="/atoms/avatar"
        name="Avatar"
        blurb="Initials, presence, audio ring"
        className="md:col-span-1"
      >
        <div className="-space-x-2 flex items-center justify-center">
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
      </GalleryTile>

      <GalleryTile
        index={3}
        href="/atoms/reference"
        name="Reference"
        blurb="Grounding chip with hover preview"
        className="md:col-span-1"
      >
        <div className="gap-2 flex flex-wrap items-center justify-center">
          <Reference preview="Call me Ishmael. Some years ago — never mind how long precisely — having little or no money in my purse…">
            Moby-Dick 1:1
          </Reference>
          <Reference>Iliad 1.12</Reference>
        </div>
      </GalleryTile>

      <GalleryTile
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
      </GalleryTile>

      <GalleryTile
        index={5}
        href="/atoms/file-icons"
        name="File icons"
        blurb="Light and dark artwork, pure CSS"
        className="md:col-span-2"
      >
        <div className="gap-3 flex items-center justify-center">
          <FileBadgeTei size={44} />
          <FileBadgeXml size={44} />
          <FileBadgePdf size={44} />
          <FileBadgeCorpus size={44} />
        </div>
      </GalleryTile>

      <GalleryTile
        index={6}
        href="/atoms/input-group"
        name="Input Group"
        blurb="Leading and trailing addons"
        className="md:col-span-2"
      >
        <div className="flex justify-center">
          <InputGroup className="max-w-64 w-full">
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
      </GalleryTile>

      <GalleryTile
        index={7}
        href="/atoms/checkbox"
        name="Checkbox"
        blurb="Sound-cued toggle with label"
        className="md:col-span-2"
      >
        <div className="gap-3 flex flex-col items-center">
          <Label className="gap-2 flex items-center">
            <Checkbox defaultChecked /> Apparatus
          </Label>
          <Label className="gap-2 flex items-center">
            <Checkbox /> Variants
          </Label>
        </div>
      </GalleryTile>

      <GalleryTile
        index={8}
        href="/atoms/text"
        name="Text"
        blurb="Corpus prose with semantic variants"
        className="md:col-span-2"
      >
        <div className="max-w-sm gap-2 mx-auto grid text-center">
          <Text.Heading size="large">Iliad 1.1</Text.Heading>
          <Text.Paragraph size="small">
            Sing, goddess, the anger of Peleus&apos; son Achilles.
          </Text.Paragraph>
        </div>
      </GalleryTile>
    </div>
  )
}

export default AtomsGallery
