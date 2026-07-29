import { describe, expect, test } from "bun:test"

import { glassVariantStyles } from "./glass-variants"
import { cn } from "./utils"

describe("cn", () => {
  test("merges conflicting tailwind classes", () => {
    expect(cn("p-2", "p-4")).toBe("p-4")
  })

  test("drops falsy values", () => {
    expect(cn("a", undefined, null, "c")).toBe("a c")
  })
})

describe("glassVariantStyles", () => {
  test("has a style entry for every glass finish", () => {
    expect(Object.keys(glassVariantStyles).sort()).toEqual(
      ["clear", "frosted", "liquid", "liquid-refract", "subtle"].sort(),
    )
  })
})
