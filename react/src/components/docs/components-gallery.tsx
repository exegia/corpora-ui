"use client"

import AI from "@/components/composed/ai"
import { PasswordInput } from "@/components/composed/password-input"
import { SocialProviders } from "@/components/composed/social-providers"
import {
  Chart,
  ContextCards,
  RecommendationCard,
} from "@/components/composed/chat"
import User from "@/components/composed/user"
import { Verse } from "@/components/composed/verse"

import { GalleryTile } from "./atoms-gallery"

const COVERAGE = [
  { label: "Iliad", value: 79 },
  { label: "Odyssey", value: 72 },
  { label: "Hesiod", value: 61 },
]

export function ComponentsGallery() {
  return (
    <div className="not-prose gap-4 md:auto-rows-[minmax(11rem,auto)] md:grid-cols-4 grid grid-cols-1">
      <GalleryTile
        index={0}
        href="/composed/research-answer"
        name="Research answer"
        blurb="Grounded answers with source metadata and actions"
        className="md:col-span-2 md:row-span-2"
      >
        <div className="flex justify-center">
          <AI.ResearchAnswer
            kickerSub="Answered from 3 passages · 0.8 s"
            content="Apollo’s plague forces an assembly—the first boundary of the poem."
            source="Iliad · Homer corpus"
            date="c. 750 BCE"
            authors="Homer · M. L. West"
          />
        </div>
      </GalleryTile>

      <GalleryTile
        index={1}
        href="/composed/password-input"
        name="Password Input"
        blurb="Visibility controls and live strength feedback"
        className="md:col-span-2"
      >
        <div className="max-w-sm mx-auto">
          <PasswordInput
            aria-label="Example password"
            defaultValue="Iliad2026"
            showStrength
            sound={false}
          />
        </div>
      </GalleryTile>

      <GalleryTile
        index={2}
        href="/composed/user"
        name="User"
        blurb="Identity rows, roles, presence and mentions"
      >
        <div className="flex justify-center">
          <User.Info
            description="Corpus editor"
            user={{
              firstName: "Jenny",
              lastName: "Hamilton",
              role: "Editor",
              status: "online",
            }}
            variant="info"
          />
        </div>
      </GalleryTile>

      <GalleryTile
        index={3}
        href="/composed/social-providers"
        name="Social Providers"
        blurb="Provider actions in compact or stacked layouts"
      >
        <SocialProviders
          layout="row"
          providers={["google", "apple", "github"]}
        />
      </GalleryTile>

      <GalleryTile
        index={4}
        href="/composed/verse"
        name="Verse"
        blurb="Corpus text with references and inline annotations"
        className="md:col-span-2"
      >
        <div className="max-w-lg mx-auto text-center">
          <Verse chapter="1:1" href="/composed/verse" size="large">
            Sing, goddess, the anger of Peleus&apos; son Achilles.
          </Verse>
        </div>
      </GalleryTile>

      <GalleryTile
        index={5}
        href="/composed/chart"
        name="Chart"
        blurb="Token-aware corpus data visualizations"
        className="md:col-span-2"
      >
        <div className="flex justify-center">
          <Chart
            className="w-full max-w-[360px]"
            type="bar"
            title="Lemma coverage"
            subtitle="Resolved tokens"
            data={COVERAGE}
            series={[
              {
                key: "value",
                label: "Coverage",
                format: (value) => `${value}%`,
              },
            ]}
            plotHeight={100}
          />
        </div>
      </GalleryTile>

      <GalleryTile
        index={6}
        href="/composed/recommendation-card"
        name="Recommendation card"
        blurb="Human-in-the-loop review with confidence signals"
        className="md:col-span-2 md:row-span-2"
        stageClassName="items-start"
      >
        <RecommendationCard
          acceptLabel="Apply fix"
          confidence="high"
          description="Change label from paragraph to p on"
          entity={{ name: "node p-17", initials: "P" }}
          leadTime="2 min"
          title="Fix the label mismatch?"
        />
      </GalleryTile>

      <GalleryTile
        index={7}
        href="/composed/context-cards"
        name="Context cards"
        blurb="Retrieved passages with compact source metadata"
        className="md:col-span-2 md:row-span-2"
        stageClassName="items-start"
      >
        <div className="flex justify-center">
          <ContextCards
            count={32}
            cards={[
              {
                title: "Iliad 1.1",
                meta: "290 characters",
                snippet: "Sing, goddess, the anger of Achilles.",
                file: { name: "iliad.txt", type: "TXT" },
              },
              {
                title: "Iliad 1.12",
                meta: "184 characters",
                snippet: "Apollo came down from Olympus in anger.",
                file: { name: "iliad.xml", type: "XML" },
              },
            ]}
          />
        </div>
      </GalleryTile>
    </div>
  )
}

export default ComponentsGallery
