import { expect, mock, test } from "bun:test"
import { fireEvent, render, screen } from "@testing-library/react"

import { Button } from "@/components/ui/button"
import { playCue } from "@/lib/sound"
import { ExegiaProvider } from "../exegia-provider"

test("sound opt-in connects delegated and imperative cues to Web Audio", () => {
  const original = Object.getOwnPropertyDescriptor(window, "AudioContext")
  const requestedAudio = mock(() => {})
  // Stop at the browser audio boundary: no real speakers are needed by tests.
  class UnavailableAudioContext {
    constructor() {
      requestedAudio()
      throw new Error("Audio device unavailable in test")
    }
  }
  Object.defineProperty(window, "AudioContext", {
    configurable: true,
    value: UnavailableAudioContext,
  })

  try {
    const view = render(
      <ExegiaProvider>
        <Button>Audible</Button>
      </ExegiaProvider>
    )
    fireEvent.pointerDown(screen.getByRole("button", { name: "Audible" }))
    playCue("tick")
    expect(requestedAudio).not.toHaveBeenCalled()

    view.rerender(
      <ExegiaProvider sound>
        <Button>Audible</Button>
        <Button sound={false}>Silent</Button>
      </ExegiaProvider>
    )
    fireEvent.pointerDown(screen.getByRole("button", { name: "Audible" }))
    expect(requestedAudio).toHaveBeenCalledTimes(1)
    fireEvent.pointerUp(screen.getByRole("button", { name: "Audible" }))
    expect(requestedAudio).toHaveBeenCalledTimes(2)
    playCue("tick")
    expect(requestedAudio).toHaveBeenCalledTimes(3)

    fireEvent.pointerDown(screen.getByRole("button", { name: "Silent" }))
    fireEvent.pointerUp(screen.getByRole("button", { name: "Silent" }))
    expect(requestedAudio).toHaveBeenCalledTimes(3)
  } finally {
    if (original) Object.defineProperty(window, "AudioContext", original)
    else Reflect.deleteProperty(window, "AudioContext")
  }
})
