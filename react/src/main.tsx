import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router"

import "./index.css"
import { ExegiaProvider } from "@/state"
import { router } from "@/routes.tsx"

// One provider for the whole library: the Jotai store every component's atoms
// resolve against, plus opt-in interaction sound and theme. Adding a stateful
// component never adds a provider here.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ExegiaProvider sound theme={{ defaultTheme: "system" }}>
      <RouterProvider router={router} />
    </ExegiaProvider>
  </StrictMode>
)
