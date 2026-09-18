import path from "path"
import { access, readFile } from "node:fs/promises"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

// Library build (`bun run build:lib`) — bundles src/index.ts for npm.
// The docs site keeps its own build via vite.config.ts.
export default defineConfig({
  plugins: [
    react(),
    dts({
      tsconfigPath: "./tsconfig.app.json",
      outDirs: "dist-lib",
      // The docs config lives outside src; keep it from shifting the declaration root.
      entryRoot: "src",
      include: [
        "src/assets/**",
        "src/index.ts",
        "src/components/**",
        "src/lib/**",
        "src/state/**",
      ],
      afterBuild: async () => {
        const manifest = JSON.parse(
          await readFile(path.resolve(__dirname, "package.json"), "utf8")
        )
        // Fail the build if the published type entry points at a missing file.
        for (const entry of new Set<string>([
          manifest.types,
          manifest.exports["."].types,
        ])) {
          await access(path.resolve(__dirname, entry))
        }
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  publicDir: false,
  build: {
    outDir: "dist-lib",
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
    },
    rollupOptions: {
      // Externalize every bare import (react, motion, cuelume, …); only
      // relative/absolute paths and the "@/" alias are bundled.
      external: (id) =>
        !id.startsWith(".") && !path.isAbsolute(id) && !id.startsWith("@/"),
    },
  },
})
