import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "react-router"

import "./index.css"
import { ThemeProvider } from "@/components/theme-provider.tsx"
import { bindSounds } from "@/lib/sound.ts"
import { router } from "@/routes.tsx"

// Docs site opts into interaction sound; delegated + idempotent.
bindSounds()

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ThemeProvider>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>
)
