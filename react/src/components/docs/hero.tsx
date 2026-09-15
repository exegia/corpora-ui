"use client"

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { Search } from "lucide-react"

import { Bubble } from "@/components/atoms"
import AI from "@/components/composed/ai"
import {
  Flowchart,
  RecommendationCard,
  type StepNode,
} from "@/components/composed/chat"
import { Verse, VerseNote, VerseSpan } from "@/components/composed/verse"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Kbd } from "@/components/ui/kbd"
import { cn } from "@/lib/utils"

/** Docs landing hero: centered copy with live atoms floating behind it.
 *  Never part of the npm surface. */

const EASE = [0.32, 0.72, 0, 1] as const

const FLOW_NODES: StepNode[] = [
  {
    id: "corpus",
    row: 0,
    x: 0.5,
    w: 220,
    kind: { label: "Corpus", hue: "var(--tag-purple-text)" },
    hue: "var(--tag-purple-text)",
    title: "Iliad",
    caption: "Homer · Greek epic corpus",
  },
  {
    id: "passage",
    row: 1,
    x: 0.5,
    w: 240,
    kind: { label: "Passage", hue: "var(--tag-amber-text)" },
    hue: "var(--tag-amber-text)",
    title: "Book 1 · line 1",
    caption: "Opening invocation",
  },
  {
    id: "text-node",
    row: 2,
    x: 0.5,
    w: 260,
    kind: { label: "Text node", hue: "var(--tag-green-text)" },
    hue: "var(--tag-green-text)",
    title: "μῆνιν ἄειδε, θεά",
    caption: "node l-1 · 18 characters",
  },
]
const FLOW_EDGES = [
  { id: "a", source: "corpus", target: "passage" },
  { id: "b", source: "passage", target: "text-node" },
]

function Note({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1">
      <p className="text-[8px] font-medium tracking-[0.14em] text-muted-foreground uppercase">
        {label}
      </p>
      <p className="text-sm text-foreground">{children}</p>
    </div>
  )
}

function Float({
  className,
  delay = 0,
  children,
}: {
  className: string
  delay?: number
  children: React.ReactNode
}) {
  const reduced = useReducedMotion()
  return (
    <motion.div
      aria-hidden
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={{
        opacity: 1,
        filter: "blur(0px)",
        y: reduced ? 0 : [0, -10, 0],
      }}
      transition={{
        opacity: { duration: 1, delay, ease: EASE },
        filter: { duration: 1, delay, ease: EASE },
        y: reduced
          ? { duration: 1, delay, ease: EASE }
          : { duration: 7 + delay * 4, delay, repeat: Infinity, ease: "easeInOut" },
      }}
      className={cn(
        "pointer-events-none absolute hidden select-none rounded-lg bg-background/80 p-3 shadow-md ring-1 ring-black/[0.06] backdrop-blur-sm md:block dark:bg-card/80 dark:ring-white/[0.08]",
        className
      )}
    >
      {children}
    </motion.div>
  )
}

export function Hero({ children }: { children: React.ReactNode }) {
  return (
    <section className="not-prose relative -mx-4 overflow-hidden px-4 py-24 md:py-36">
      {/* Floating atoms — decorative, fades to the page edges. */}
      <div
        aria-hidden
        className="absolute inset-0 [mask-image:radial-gradient(70%_70%_at_50%_50%,black_30%,transparent_100%)]"
      >
        <Float className="top-6 left-[3%] w-72 opacity-80" delay={0.1}>
          <Verse chapter="1:1" href="#" size="small">
            In the beginning{" "}
            <VerseSpan
              popover={
                <Note label="Term">
                  Hebrew <em>bereshit</em> — the opening word of the corpus.
                </Note>
              }
            >
              God created
            </VerseSpan>{" "}
            the heavens and the <VerseSpan>earth</VerseSpan>
            <VerseNote popover={<Note label="Note a">Some manuscripts differ.</Note>}>
              a
            </VerseNote>
            .
          </Verse>
        </Float>
        <Float className="top-4 right-[3%] w-80 opacity-80" delay={0.3}>
          <AI.ResearchAnswer
            kickerSub="Answered from 3 passages · 0.8 s"
            content="The quarrel opens when Agamemnon refuses Chryses’ ransom. Apollo’s plague follows — the first boundary of the poem (¶12, RC003)."
            source="Iliad · Homer corpus"
            date="c. 750 BCE"
            authors="Homer · M. L. West"
          />
        </Float>
        <Float className="top-[35%] left-[1%] w-[28rem] opacity-70 [&_*]:pointer-events-none" delay={0.5}>
          <div className="origin-top-left scale-[0.82]">
            <Flowchart.Root steps={FLOW_NODES} edges={FLOW_EDGES} readOnly />
          </div>
        </Float>
        <Float className="top-[46%] right-[4%] w-60 opacity-60" delay={0.7}>
          <InputGroup>
            <InputGroupAddon>
              <Search strokeWidth={1.5} />
            </InputGroupAddon>
            <InputGroupInput placeholder="Search the corpus" readOnly />
            <InputGroupAddon align="inline-end">
              <Kbd>⌘K</Kbd>
            </InputGroupAddon>
          </InputGroup>
        </Float>
        <Float className="bottom-2 left-[24%] w-64 opacity-70" delay={0.9}>
          <Bubble variant="ai" continued>
            <Bubble.Header>
              <AI.Avatar />
            </Bubble.Header>
            <Bubble.Message>
              The boundary is valid. Node p-17 has a label mismatch.
            </Bubble.Message>
          </Bubble>
        </Float>
        <Float className="bottom-4 right-[4%] w-[26rem] opacity-70" delay={1.1}>
          <RecommendationCard
            title="Validate the Iliad corpus before the walker runs?"
            description="Check otype, oslots and section features in"
            entity={{ name: "Iliad · Homer corpus", initials: "I" }}
            descriptionSuffix="which takes about"
            leadTime="2 min"
            confidence="high"
          />
        </Float>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE }}
        className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 text-center"
      >
        {children}
      </motion.div>
    </section>
  )
}

export default Hero
