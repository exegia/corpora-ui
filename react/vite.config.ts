import path from "path"
import story from "@fumadocs/story/vite"
import tailwindcss from "@tailwindcss/vite"
import { fumadocsMdx } from "fumadocs-mdx/vite"
import press from "fumapress/vite"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [press(), fumadocsMdx(), tailwindcss(), story()],
  server: {
    port: 3000,
    open: true,
    host: "0.0.0.0",
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
})
