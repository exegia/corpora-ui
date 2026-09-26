import path from "path"
import { access, copyFile, readFile } from "node:fs/promises"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import dts from "vite-plugin-dts"

// Library build (`bun run build:lib`) — root and focused npm entrypoints.
// The docs site keeps its own build via vite.config.ts.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      tsconfigPath: "./tsconfig.lib.json",
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
      exclude: [
        "src/components/docs/**",
        "src/components/stories/**",
        "src/components/atoms/_layout.tsx",
        "src/**/__tests__/**",
        "src/**/*.test.*",
      ],
      afterDiagnostic: (diagnostics) => {
        if (diagnostics.some(({ category }) => category === 1)) {
          throw new Error("Library declarations contain TypeScript errors")
        }
      },
      afterBuild: async () => {
        const manifest = JSON.parse(
          await readFile(
            path.resolve(import.meta.dirname, "package.json"),
            "utf8"
          )
        )
        // Every public declaration entry must survive the filtered type build.
        for (const entry of new Set<string>([
          manifest.types,
          ...Object.values(manifest.exports).flatMap((entry) =>
            typeof entry === "object" && entry !== null && "types" in entry
              ? [String(entry.types)]
              : []
          ),
        ])) {
          await access(path.resolve(import.meta.dirname, entry))
        }
        await copyFile(
          path.resolve(
            import.meta.dirname,
            "src/components/composed/chat/composer/BEAUTIFUL-UI-LICENSE.txt"
          ),
          path.resolve(import.meta.dirname, "dist-lib/BEAUTIFUL-UI-LICENSE.txt")
        )
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
  publicDir: false,
  build: {
    outDir: "dist-lib",
    emptyOutDir: true,
    sourcemap: false,
    cssMinify: "lightningcss",
    lib: {
      entry: {
        shell: path.resolve(import.meta.dirname, "src/components/blocks/shell/index.ts"),
        scaffold: path.resolve(import.meta.dirname, "src/components/blocks/scaffold/index.ts"),
        index: path.resolve(import.meta.dirname, "src/library.ts"),
        button: path.resolve(import.meta.dirname, "src/components/ui/button.tsx"),
        card: path.resolve(import.meta.dirname, "src/components/ui/card.tsx"),
        input: path.resolve(import.meta.dirname, "src/components/ui/input.tsx"),
        label: path.resolve(import.meta.dirname, "src/components/ui/label.tsx"),
        state: path.resolve(import.meta.dirname, "src/lib/state/index.ts"),
        overlays: path.resolve(import.meta.dirname, "src/components/ui/overlays.ts"),
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
      cssFileName: "index",
    },
    rolldownOptions: {
      // Externalize every bare import (react, motion, cuelume, …); only
      // relative/absolute paths and the "@/" alias are bundled.
      external: (id) =>
        !id.startsWith(".") && !path.isAbsolute(id) && !id.startsWith("@/"),
    },
  },
})
