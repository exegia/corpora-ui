import { expect, test } from "bun:test"
import { renderToStaticMarkup } from "react-dom/server"

import { tokenize } from "../code-block"

test("tokenize highlights keywords and escaped strings in linear time", () => {
  const source = `const value = "${'\\"'.repeat(10_000)}"`
  const html = renderToStaticMarkup(<>{tokenize(source, new Set(["const"]))}</>)

  expect(html).toContain('class="text-code-keyword">const</span>')
  expect(html).toContain('class="text-code-string">')
})
