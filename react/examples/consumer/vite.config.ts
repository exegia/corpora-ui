import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [react()],
  resolve: {
    // The local file dependency and app must use the same React/Jotai instances.
    dedupe: ["react", "react-dom", "jotai"],
  },
})
