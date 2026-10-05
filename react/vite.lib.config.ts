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
        await copyFile(
          path.resolve(
            import.meta.dirname,
            "src/components/composed/chat/chart/evilcharts/LICENSE"
          ),
          path.resolve(import.meta.dirname, "dist-lib/EVILCHARTS-LICENSE.txt")
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
        "ui/index": path.resolve(
          import.meta.dirname,
          "src/components/ui/index.ts"
        ),
        "ui/accordion": path.resolve(
          import.meta.dirname,
          "src/components/ui/accordion.tsx"
        ),
        "ui/alert": path.resolve(
          import.meta.dirname,
          "src/components/ui/alert.tsx"
        ),
        "ui/alert-dialog": path.resolve(
          import.meta.dirname,
          "src/components/ui/alert-dialog.tsx"
        ),
        "ui/autocomplete": path.resolve(
          import.meta.dirname,
          "src/components/ui/autocomplete.tsx"
        ),
        "ui/avatar": path.resolve(
          import.meta.dirname,
          "src/components/ui/avatar.tsx"
        ),
        "ui/badge": path.resolve(
          import.meta.dirname,
          "src/components/ui/badge.tsx"
        ),
        "ui/breadcrumb": path.resolve(
          import.meta.dirname,
          "src/components/composed/breadcrumb/index.ts"
        ),
        "ui/button": path.resolve(
          import.meta.dirname,
          "src/components/ui/button.tsx"
        ),
        "ui/calendar": path.resolve(
          import.meta.dirname,
          "src/components/ui/calendar/index.ts"
        ),
        "ui/card": path.resolve(
          import.meta.dirname,
          "src/components/ui/card.tsx"
        ),
        "ui/checkbox": path.resolve(
          import.meta.dirname,
          "src/components/ui/checkbox.tsx"
        ),
        "ui/checkbox-group": path.resolve(
          import.meta.dirname,
          "src/components/ui/checkbox-group/index.ts"
        ),
        "ui/collapsible": path.resolve(
          import.meta.dirname,
          "src/components/ui/collapsible.tsx"
        ),
        "ui/combobox": path.resolve(
          import.meta.dirname,
          "src/components/ui/combobox/index.ts"
        ),
        "ui/command": path.resolve(
          import.meta.dirname,
          "src/components/ui/command.tsx"
        ),
        "ui/context-menu": path.resolve(
          import.meta.dirname,
          "src/components/ui/context-menu.tsx"
        ),
        "ui/dialog": path.resolve(
          import.meta.dirname,
          "src/components/ui/dialog/index.ts"
        ),
        "ui/drawer": path.resolve(
          import.meta.dirname,
          "src/components/ui/drawer/index.ts"
        ),
        "ui/empty": path.resolve(
          import.meta.dirname,
          "src/components/ui/empty/index.ts"
        ),
        "ui/field": path.resolve(
          import.meta.dirname,
          "src/components/ui/field.tsx"
        ),
        "ui/fieldset": path.resolve(
          import.meta.dirname,
          "src/components/ui/fieldset/index.ts"
        ),
        "ui/form": path.resolve(
          import.meta.dirname,
          "src/components/ui/form/index.ts"
        ),
        "ui/frame": path.resolve(
          import.meta.dirname,
          "src/components/ui/frame.tsx"
        ),
        "ui/group": path.resolve(
          import.meta.dirname,
          "src/components/ui/group.tsx"
        ),
        "ui/input": path.resolve(
          import.meta.dirname,
          "src/components/ui/input.tsx"
        ),
        "ui/input-group": path.resolve(
          import.meta.dirname,
          "src/components/ui/input-group.tsx"
        ),
        "ui/kbd": path.resolve(
          import.meta.dirname,
          "src/components/ui/kbd.tsx"
        ),
        "ui/label": path.resolve(
          import.meta.dirname,
          "src/components/ui/label.tsx"
        ),
        "ui/menu": path.resolve(
          import.meta.dirname,
          "src/components/ui/menu.tsx"
        ),
        "ui/meter": path.resolve(
          import.meta.dirname,
          "src/components/ui/meter/index.ts"
        ),
        "ui/number-field": path.resolve(
          import.meta.dirname,
          "src/components/ui/number-field/index.ts"
        ),
        "ui/otp-field": path.resolve(
          import.meta.dirname,
          "src/components/ui/otp-field.tsx"
        ),
        "ui/pagination": path.resolve(
          import.meta.dirname,
          "src/components/ui/pagination/index.ts"
        ),
        "ui/popover": path.resolve(
          import.meta.dirname,
          "src/components/ui/popover.tsx"
        ),
        "ui/preview-card": path.resolve(
          import.meta.dirname,
          "src/components/ui/preview-card.tsx"
        ),
        "ui/progress": path.resolve(
          import.meta.dirname,
          "src/components/ui/progress/index.ts"
        ),
        "ui/radio-group": path.resolve(
          import.meta.dirname,
          "src/components/ui/radio-group/index.ts"
        ),
        "ui/scroll-area": path.resolve(
          import.meta.dirname,
          "src/components/ui/scroll-area.tsx"
        ),
        "ui/select": path.resolve(
          import.meta.dirname,
          "src/components/ui/select.tsx"
        ),
        "ui/separator": path.resolve(
          import.meta.dirname,
          "src/components/ui/separator.tsx"
        ),
        "ui/sheet": path.resolve(
          import.meta.dirname,
          "src/components/ui/sheet.tsx"
        ),
        "ui/sidebar": path.resolve(
          import.meta.dirname,
          "src/components/blocks/sidebar/index.ts"
        ),
        "ui/skeleton": path.resolve(
          import.meta.dirname,
          "src/components/ui/skeleton.tsx"
        ),
        "ui/slider": path.resolve(
          import.meta.dirname,
          "src/components/ui/slider/index.ts"
        ),
        "ui/spinner": path.resolve(
          import.meta.dirname,
          "src/components/ui/spinner.tsx"
        ),
        "ui/switch": path.resolve(
          import.meta.dirname,
          "src/components/ui/switch.tsx"
        ),
        "ui/table": path.resolve(
          import.meta.dirname,
          "src/components/ui/table/index.ts"
        ),
        "ui/tabs": path.resolve(
          import.meta.dirname,
          "src/components/ui/tabs.tsx"
        ),
        "ui/textarea": path.resolve(
          import.meta.dirname,
          "src/components/ui/textarea.tsx"
        ),
        "ui/toast": path.resolve(
          import.meta.dirname,
          "src/components/ui/toast.tsx"
        ),
        "ui/toggle": path.resolve(
          import.meta.dirname,
          "src/components/ui/toggle/index.ts"
        ),
        "ui/toggle-group": path.resolve(
          import.meta.dirname,
          "src/components/ui/toggle-group/index.ts"
        ),
        "ui/toolbar": path.resolve(
          import.meta.dirname,
          "src/components/ui/toolbar.tsx"
        ),
        "ui/tooltip": path.resolve(
          import.meta.dirname,
          "src/components/ui/tooltip.tsx"
        ),
        toc: path.resolve(
          import.meta.dirname,
          "src/components/composed/navigation/toc/index.ts"
        ),
        reader: path.resolve(
          import.meta.dirname,
          "src/components/blocks/reader/index.ts"
        ),
        shell: path.resolve(
          import.meta.dirname,
          "src/components/blocks/shell/index.ts"
        ),
        scaffold: path.resolve(
          import.meta.dirname,
          "src/components/blocks/scaffold/index.ts"
        ),
        index: path.resolve(import.meta.dirname, "src/library.ts"),
        button: path.resolve(
          import.meta.dirname,
          "src/components/ui/button.tsx"
        ),
        card: path.resolve(import.meta.dirname, "src/components/ui/card.tsx"),
        input: path.resolve(import.meta.dirname, "src/components/ui/input.tsx"),
        label: path.resolve(import.meta.dirname, "src/components/ui/label.tsx"),
        state: path.resolve(import.meta.dirname, "src/lib/state/index.ts"),
        overlays: path.resolve(
          import.meta.dirname,
          "src/components/ui/overlays.ts"
        ),
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
