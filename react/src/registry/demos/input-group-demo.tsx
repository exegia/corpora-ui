import { SearchIcon, XIcon } from "lucide-react"
import * as React from "react"

import { DemoStage, DemoToggle } from "@/components/docs/demo-controls"
import { Button } from "@/components/ui/button"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group"

export default function InputGroupDemo() {
  const [startIcon, setStartIcon] = React.useState(true)
  const [clearButton, setClearButton] = React.useState(true)
  const [disabled, setDisabled] = React.useState(false)
  const [value, setValue] = React.useState("")

  return (
    <DemoStage
      controls={
        <>
          <DemoToggle label="start icon" checked={startIcon} onChange={setStartIcon} />
          <DemoToggle
            label="clear button"
            checked={clearButton}
            onChange={setClearButton}
          />
          <DemoToggle label="disabled" checked={disabled} onChange={setDisabled} />
        </>
      }
    >
      <InputGroup className="max-w-64">
        {startIcon && (
          <InputGroupAddon>
            <SearchIcon aria-hidden="true" />
          </InputGroupAddon>
        )}
        <InputGroupInput
          placeholder="Search manuscripts…"
          disabled={disabled}
          value={value}
          onChange={(event) => setValue(event.target.value)}
        />
        {clearButton && value.length > 0 && (
          <InputGroupAddon align="inline-end">
            <Button
              aria-label="Clear search"
              size="icon-xs"
              variant="ghost"
              sound={false}
              onClick={() => setValue("")}
            >
              <XIcon />
            </Button>
          </InputGroupAddon>
        )}
      </InputGroup>
    </DemoStage>
  )
}
