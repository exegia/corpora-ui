import { expect, mock, test } from "bun:test"
import { activateProviderSounds } from "../sound-loading"

test("pending sound opt-in binds only after loading completes", async () => {
  const pending = Promise.withResolvers<{ bindSounds: () => void }>()
  const bindSounds = mock(() => {})
  activateProviderSounds(() => pending.promise)
  expect(bindSounds).not.toHaveBeenCalled()
  pending.resolve({ bindSounds })
  await pending.promise
  expect(bindSounds).toHaveBeenCalledTimes(1)
})

test("cancelled opt-in cannot bind after the module finishes loading", async () => {
  const pending = Promise.withResolvers<{ bindSounds: () => void }>()
  const bindSounds = mock(() => {})
  const cancel = activateProviderSounds(() => pending.promise)
  cancel()
  pending.resolve({ bindSounds })
  await pending.promise
  expect(bindSounds).not.toHaveBeenCalled()
})

test("a failed optional download is handled and a later opt-in can retry", async () => {
  const failed = Promise.reject(new Error("Sound chunk unavailable"))
  activateProviderSounds(() => failed)
  await failed.catch(() => {})
  const bindSounds = mock(() => {})
  const loaded = Promise.resolve({ bindSounds })
  activateProviderSounds(() => loaded)
  await loaded
  expect(bindSounds).toHaveBeenCalledTimes(1)
})
