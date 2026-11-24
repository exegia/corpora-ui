import { expect, test } from "bun:test"
import { realpathSync } from "node:fs"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)
const vitePath = realpathSync(require.resolve("vite"))

// RSC checks RunnableDevEnvironment with instanceof, so matching versions alone
// are insufficient: the CLI and plugins must load the same Vite module.
for (const dependency of ["fumapress", "waku", "@vitejs/plugin-rsc"]) {
  test(`${dependency} shares the workspace Vite runtime`, () => {
    const dependencyRequire = createRequire(require.resolve(dependency))
    expect(realpathSync(dependencyRequire.resolve("vite"))).toBe(vitePath)
  })
}
