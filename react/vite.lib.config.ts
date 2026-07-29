import path from "path"
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
      outDir: "dist-lib",
      include: ["src/index.ts", "src/components/**", "src/lib/**"],
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
