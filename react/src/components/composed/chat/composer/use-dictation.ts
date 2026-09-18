"use client"

import { useEffect, useRef, useState, useSyncExternalStore } from "react"

type RecognitionResult = { isFinal: boolean; 0: { transcript: string } }
interface Recognition {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult:
    | ((event: {
        resultIndex: number
        results: ArrayLike<RecognitionResult>
      }) => void)
    | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start(): void
  stop(): void
  abort(): void
}
function recognitionConstructor() {
  if (typeof window === "undefined") return undefined
  const browser = window as unknown as {
    SpeechRecognition?: new () => Recognition
    webkitSpeechRecognition?: new () => Recognition
  }
  return browser.SpeechRecognition ?? browser.webkitSpeechRecognition
}
const subscribe = () => () => {}
const getSupported = () => Boolean(recognitionConstructor())
const getServerSupported = () => false

/** Uses the browser's recognizer only after an explicit microphone click. */
export function useDictation(
  onTranscript: (text: string) => void,
  disabled: boolean
) {
  const supported = useSyncExternalStore(
    subscribe,
    getSupported,
    getServerSupported
  )
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognition = useRef<Recognition | null>(null)
  const receive = useRef(onTranscript)
  useEffect(() => {
    receive.current = onTranscript
  })
  useEffect(() => {
    return () => {
      const current = recognition.current
      if (current) {
        current.onresult = null
        current.onerror = null
        current.onend = null
        current.abort()
      }
    }
  }, [])
  useEffect(() => {
    const current = recognition.current
    if (disabled && current) {
      current.onresult = null
      current.abort()
    }
  }, [disabled])
  const cancel = () => {
    const current = recognition.current
    if (!current) return
    current.onresult = null
    current.onerror = null
    current.onend = null
    recognition.current = null
    current.abort()
    setListening(false)
  }
  const toggle = () => {
    if (disabled) return
    if (recognition.current) {
      recognition.current.stop()
      return
    }
    const Constructor = recognitionConstructor()
    if (!Constructor) return
    const current = new Constructor()
    current.continuous = true
    current.interimResults = false
    current.lang = document.documentElement.lang || navigator.language
    current.onresult = (event) => {
      const text = Array.from(event.results)
        .slice(event.resultIndex)
        .filter((result) => result.isFinal)
        .map((result) => result[0].transcript)
        .join(" ")
      if (text) receive.current(text)
    }
    current.onerror = (event) => {
      if (event.error !== "aborted")
        setError(
          event.error === "not-allowed"
            ? "Microphone access was denied."
            : "Dictation stopped. Please try again."
        )
    }
    current.onend = () => {
      recognition.current = null
      setListening(false)
    }
    recognition.current = current
    setError(null)
    try {
      current.start()
      setListening(true)
    } catch {
      recognition.current = null
      setListening(false)
      setError("Dictation is unavailable. Please try again.")
    }
  }
  return { supported, listening, error, toggle, cancel }
}
