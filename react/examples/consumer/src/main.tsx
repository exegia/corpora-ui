import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { ExegiaProvider } from "@exegia/corpora-ui/state"
import "@exegia/corpora-ui/index.css"
import "./style.css"
import { App } from "./App"
import { readingStore } from "./store"

const root = document.getElementById("root")
if (!root) throw new Error("Missing application root")

createRoot(root).render(
  <StrictMode>
    <ExegiaProvider store={readingStore}>
      <App />
    </ExegiaProvider>
  </StrictMode>
)
