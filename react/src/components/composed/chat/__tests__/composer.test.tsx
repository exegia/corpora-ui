import { describe, expect, mock, test } from "bun:test"
import { act, fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Provider } from "jotai"

import {
  CommandMenu,
  Composer,
  SuggestedPrompts,
  type IComposerSuggestionsProps,
} from "../composer"
import { SuggestedPrompt } from "@/components/composed/ai/suggested-prompt"

describe("Composer", () => {
  test("shows the prompt bar controls at rest and preserves keyboard sending", async () => {
    const user = userEvent.setup()
    const onSubmit = mock(() => {})
    render(
      <Provider>
        <Composer
          ComposerMenu={() => <CommandMenu items={[]} />}
          onSubmit={onSubmit}
          safetyNote={null}
        />
      </Provider>
    )

    expect(screen.queryByText("to send message")).toBeNull()
    expect(
      screen
        .getByRole("button", { name: "Send message" })
        .hasAttribute("disabled")
    ).toBe(true)
    expect(screen.getByRole("combobox", { name: "Choose model" })).toBeDefined()

    const field = screen.getByRole("textbox", { name: "Message" })
    await user.click(field)
    expect(
      await screen.findByRole("button", { name: "Send message" })
    ).toBeDefined()
    expect(screen.getByRole("button", { name: "Add attachment" })).toBeDefined()

    await user.type(field, "Validate ¶12")
    await user.keyboard("{Meta>}{Enter}{/Meta}")
    expect(onSubmit).toHaveBeenCalledWith("Validate ¶12", "answer", [])
  })

  test("folds the suggested prompts behind the disclosure and routes a pick", async () => {
    const user = userEvent.setup()
    const onSelect = mock(() => {})
    const Suggestions = (props: IComposerSuggestionsProps) => (
      <SuggestedPrompts onOpenChange={props.onOpenChange} open={props.open}>
        <SuggestedPrompt onSelect={onSelect}>Check ¶12</SuggestedPrompt>
      </SuggestedPrompts>
    )
    render(
      <Provider>
        <Composer safetyNote={null} Suggestions={Suggestions} />
      </Provider>
    )

    const trigger = screen.getByRole("button", { name: /Suggestions \(1\)/ })
    expect(trigger.getAttribute("aria-expanded")).toBe("true")

    await user.click(await screen.findByRole("button", { name: /Check ¶12/ }))
    expect(onSelect).toHaveBeenCalledTimes(1)

    // Only the disclosure state is asserted: the panel leaves through an
    // AnimatePresence exit, and happy-dom's stubbed `Element.animate` never
    // finishes it, so the row stays mounted here but not in a browser.
    await user.click(trigger)
    expect(trigger.getAttribute("aria-expanded")).toBe("false")
  })

  test("shows Stop while streaming and routes it to onStop", async () => {
    const user = userEvent.setup()
    const onStop = mock(() => {})
    render(
      <Provider>
        <Composer expanded isStreaming onStop={onStop} safetyNote={null} />
      </Provider>
    )
    await user.click(screen.getByRole("button", { name: "Stop" }))
    expect(onStop).toHaveBeenCalledTimes(1)
  })

  test("filters commands and sources and inserts a keyboard selection without sending", async () => {
    const user = userEvent.setup()
    const onSubmit = mock(() => {})
    const onCommand = mock(() => {})
    const onSourceSelect = mock(() => {})
    const command = {
      id: "validate",
      label: "/validate",
      insertText: "/validate ",
    }
    const source = { id: "corpus", label: "Corpus", insertText: "@corpus " }
    render(
      <Provider>
        <Composer
          commands={[command, { id: "compare", label: "/compare" }]}
          sources={[source]}
          onSubmit={onSubmit}
          onCommand={onCommand}
          onSourceSelect={onSourceSelect}
        />
      </Provider>
    )
    const field = screen.getByRole("textbox", {
      name: "Message",
    }) as HTMLTextAreaElement
    await user.type(field, "/val")
    expect(
      await screen.findByRole("option", { name: "/validate" })
    ).toBeDefined()
    expect(screen.queryByRole("option", { name: "/compare" })).toBeNull()
    await user.keyboard("{Tab}")
    expect(field.value).toBe("/validate ")
    expect(onCommand).toHaveBeenCalledWith(command)
    await user.type(field, "@cor")
    await user.keyboard("{Enter}")
    expect(field.value).toBe("/validate @corpus ")
    expect(onSourceSelect).toHaveBeenCalledWith(source)
    expect(onSubmit).not.toHaveBeenCalled()
  })

  test("changes the selected model through the picker", async () => {
    const user = userEvent.setup()
    const onModelChange = mock(() => {})
    render(
      <Provider>
        <Composer
          models={[
            { id: "auto", label: "Auto" },
            { id: "reasoning", label: "Reasoning" },
          ]}
          onModelChange={onModelChange}
        />
      </Provider>
    )
    await user.click(screen.getByRole("combobox", { name: "Choose model" }))
    await user.click(await screen.findByRole("option", { name: "Reasoning" }))
    expect(onModelChange).toHaveBeenCalledWith("reasoning")
    expect(
      screen.getByRole("combobox", { name: "Choose model" }).textContent
    ).toContain("Reasoning")
  })

  test("keeps Shift+Enter and IME input from submitting and leaves controlled text to the parent", () => {
    const onSubmit = mock(() => {})
    const onValueChange = mock(() => {})
    render(
      <Provider>
        <Composer
          value="Controlled draft"
          onSubmit={onSubmit}
          onValueChange={onValueChange}
        />
      </Provider>
    )
    const field = screen.getByRole("textbox", {
      name: "Message",
    }) as HTMLTextAreaElement
    fireEvent.keyDown(field, { key: "Enter", shiftKey: true })
    fireEvent.keyDown(field, { key: "Enter", isComposing: true })
    expect(onSubmit).not.toHaveBeenCalled()
    fireEvent.keyDown(field, { key: "Enter" })
    expect(onSubmit).toHaveBeenCalledWith("Controlled draft", "answer", [])
    expect(field.value).toBe("Controlled draft")
  })

  test("dictation appends final results and is cancelled on send", async () => {
    const original = Object.getOwnPropertyDescriptor(
      window,
      "SpeechRecognition"
    )
    const recognizers: MockRecognition[] = []
    class MockRecognition {
      continuous = false
      interimResults = false
      lang = ""
      onresult:
        | ((event: {
            resultIndex: number
            results: { isFinal: boolean; 0: { transcript: string } }[]
          }) => void)
        | null = null
      onerror: ((event: { error: string }) => void) | null = null
      onend: (() => void) | null = null
      start = mock(() => {})
      stop = mock(() => {})
      abort = mock(() => {})
      constructor() {
        recognizers.push(this)
      }
    }
    Object.defineProperty(window, "SpeechRecognition", {
      configurable: true,
      value: MockRecognition,
    })
    const onSubmit = mock(() => {})
    const view = render(
      <Provider>
        <Composer defaultValue="Please" onSubmit={onSubmit} />
      </Provider>
    )
    try {
      fireEvent.click(screen.getByRole("button", { name: "Start dictation" }))
      const recognizer = recognizers[0]
      expect(recognizer!.start).toHaveBeenCalledTimes(1)
      await act(async () => {
        recognizer!.onresult?.({
          resultIndex: 0,
          results: [
            { isFinal: false, 0: { transcript: "ignore" } },
            { isFinal: true, 0: { transcript: "validate this" } },
          ],
        })
      })
      expect(
        (
          screen.getByRole("textbox", {
            name: "Message",
          }) as HTMLTextAreaElement
        ).value
      ).toBe("Please validate this")
      fireEvent.click(screen.getByRole("button", { name: "Send message" }))
      expect(onSubmit).toHaveBeenCalledWith(
        "Please validate this",
        "answer",
        []
      )
      expect(recognizer!.abort).toHaveBeenCalledTimes(1)
      expect(recognizer!.onresult).toBeNull()
      expect(
        (
          screen.getByRole("textbox", {
            name: "Message",
          }) as HTMLTextAreaElement
        ).value
      ).toBe("")
    } finally {
      view.unmount()
      if (original) Object.defineProperty(window, "SpeechRecognition", original)
      else Reflect.deleteProperty(window, "SpeechRecognition")
    }
  })
})
