# React consumer example

A small reading notebook built with the **published API** of
`@exegia/corpora-ui`: Button, Card, Input, Label, and ExegiaProvider.
It imports the library's compiled JavaScript, declarations, and CSS. It has
no source aliases, Fumapress dependency, or Tailwind compilation step.

Components use focused public entrypoints:

```tsx
import { Button } from "@exegia/corpora-ui/button"
import { Card, CardPanel } from "@exegia/corpora-ui/card"
import { Input } from "@exegia/corpora-ui/input"
import { Label } from "@exegia/corpora-ui/label"
import { ExegiaProvider } from "@exegia/corpora-ui/state"
import "@exegia/corpora-ui/index.css"
```

The existing root imports remain supported. Both paths share the same
component implementations and Jotai store; mixing them is safe.

Ordinary buttons do not download the optional glass renderer. A
`variant="glass"` button loads it on first render, showing a lightweight
decorative fallback while loading (or if the download fails). The button's
label and interaction stay available. Reloading the page retries a failed
download. Other glass components still load their renderer directly.

## Run

From `react/`:

```sh
bun install
bun run dev:example
```

Open http://127.0.0.1:3001. Save an observation and toggle dark mode.
The footer confirms that the app and library use the same Jotai provider.
Notes are intentionally in memory and disappear on reload.

Saving a note displays a toast. The theme button has a tooltip, “Notebook
details” opens a modal controlled by a consumer-defined Jotai atom, and
“About this example” opens a popover. All use the single `ExegiaProvider`;
the modal reads the same notes atom through its portal.

“Open reading workspace” loads a Shell/Scaffold example on demand. Its reference
panel, Passage/Notes tabs, and notebook inspector use the same supplied Jotai
store as the notebook. Save a note above to see it in the workspace and inspector.
Escape closes the inspector first, then the reference panel; closing returns
focus to the corresponding toolbar button. These are non-modal layout panels.
On narrow screens, the reference panel is disabled and Scaffold fits one panel
at a time; use Passage/Notes to switch. Dark mode also applies to their Specular
bezel surfaces through the existing CSS import.

The workspace imports `/shell` and `/scaffold`. Its animation dependencies load
when opened, while the basic notebook keeps its focused entrypoints.

`dev:example` builds the library and checks the workspace install before starting
Vite. After changing library code, run `bun run sync:example` and reload the
page; app edits use Vite's normal fast refresh.

## Workspace dependencies

`react/` remains both the workspace root and the publishable library. Its
`catalog` centralizes React, Jotai, TypeScript, Vite, and their shared types
and React plugin. Each package still declares what it uses; catalog references
share versions without hiding dependencies in a parent manifest.

The library keeps its consumer peer ranges separate from the catalog's tested
development versions. The example is private and is excluded from the npm
package. All installs stay under `react/`, with one Bun lockfile.

The example uses `file:../..` because Bun does not expose the workspace root
itself through `workspace:*`. With this workspace's hoisted linker, Bun links
the dependency to the local library. `sync:example` rebuilds its compiled
output and runs a frozen install before the example starts.

## Verify the actual package

```sh
bun run build:example
bun run check:consumer
```

The first command builds the workspace example. The second packs the library
with Bun, checks its contents and exports, then installs that tarball into a
temporary copy of this app **outside the workspace** and runs TypeScript and
a production build. It also checks root/subpath export identity and compares
both import styles, rejecting unrelated emoji code in the focused bundle
and layout motion, glass, and sound code in its initial chunks. Startup size and total emitted
JavaScript are reported separately so deferred downloads are not counted as
removed code. No workspace dependencies or source aliases are available
to that isolated app. Catalog references are resolved to normal versions.

To keep a successful fixture for browser testing:

```sh
KEEP_CONSUMER_FIXTURE=1 bun run check:consumer
```

Failures retain the fixture and print its location. This check does not
publish anything. Production publishing must use the Bun-packed tarball so
`catalog:` references never reach npm consumers.

## Styles

`src/main.tsx` imports `@exegia/corpora-ui/index.css` once. The app's small CSS
file sets semantic theme variables and page layout; component styling comes
from the library. The compiled library stylesheet currently includes Tailwind
Preflight and the library's global base rules. Custom fonts are optional and
remain part of the documentation site's setup.

## Optional sound

The example leaves sound disabled, so the sound engine is excluded from
startup downloads. `ExegiaProvider sound` loads it on demand; interactions
remain silent until it is ready. Applications that need it before first
input can await `preloadSounds()` from `/state` and call the returned
`bindSounds()` before mounting. Existing synchronous sound exports still work.
