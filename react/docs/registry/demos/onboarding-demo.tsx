import * as React from "react"

import { DemoBrandMark, DemoSelect, DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import {
  OnboardingBlock,
  type OnboardingStepConfig,
} from "@/components/blocks/auth/onboarding-block"

const STEPS: OnboardingStepConfig[] = [
  {
    id: "profile",
    title: "Profile",
    description: "How you appear to collaborators on a manuscript.",
    fields: [
      { kind: "text", name: "display_name", label: "Display name", required: true },
      {
        kind: "textarea",
        name: "bio",
        label: "Short bio",
        placeholder: "Palaeographer, 12th-century Latin manuscripts",
      },
    ],
  },
  {
    id: "research",
    title: "Research",
    description: "Used to seed your default corpus filters.",
    fields: [
      {
        kind: "select",
        name: "field",
        label: "Primary field",
        required: true,
        options: [
          { value: "palaeography", label: "Palaeography" },
          { value: "codicology", label: "Codicology" },
          { value: "philology", label: "Philology" },
        ],
      },
      { kind: "url", name: "website", label: "Website", placeholder: "https://" },
      { kind: "checkbox", name: "digest", label: "Send me the weekly digest" },
    ],
  },
]

const OUTCOMES = ["success", "error"] as const

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export default function OnboardingDemo() {
  const [outcome, setOutcome] = React.useState<(typeof OUTCOMES)[number]>("success")
  const [logo, setLogo] = React.useState(false)
  const [resetKey, setResetKey] = React.useState(0)

  return (
    <DemoStage
      controls={
        <>
          <DemoSelect
            label="step outcome"
            value={outcome}
            options={OUTCOMES}
            onChange={setOutcome}
          />
          <DemoToggle label="logo" checked={logo} onChange={setLogo} />
          <button
            type="button"
            className="text-xs underline"
            onClick={() => setResetKey((k) => k + 1)}
          >
            reset
          </button>
        </>
      }
    >
      <OnboardingBlock
        key={resetKey}
        steps={STEPS}
        logo={logo ? <DemoBrandMark /> : undefined}
        onStepSubmit={async () => {
          await delay(900)
          if (outcome === "error") {
            throw new Error("Saving your profile was rejected. Try again.")
          }
        }}
      />
    </DemoStage>
  )
}
