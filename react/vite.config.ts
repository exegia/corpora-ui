import path from "path"
import story from "@fumadocs/story/vite"
import tailwindcss from "@tailwindcss/vite"
import { fumadocsMdx } from "fumadocs-mdx/vite"
import press from "fumapress/vite"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    press({ basePath: "/" }),
    fumadocsMdx(),
    tailwindcss(),
    story({
      tsconfigPath: path.resolve(import.meta.dirname, "tsconfig.app.json"),
    }),
  ],
  optimizeDeps: {
    // Lucide exposes client boundaries used by both MDX/RSC and browser code.
    // Keep those module identities consistent across the three environments.
    exclude: ["lucide-react"],
  },
  environments: {
    client: {
      optimizeDeps: {
        // The home header reaches these through Fumapress's RSC proxies.
        // Prebundle them with Dialog so they share Base UI's composite context.
        include: [
          "@base-ui/react/navigation-menu",
          "@base-ui/react/collapsible",
        ],
        // Waku's default scan targets src/pages and client/server entries.
        // This site's MDX loads stories and demos instead, so discover their
        // dependencies before navigation can trigger optimizer reloads.
        entries: [
          "src/components/stories/*.story.tsx",
          "src/components/docs/*.tsx",
          "src/registry/story.tsx",
          "src/registry/demos/*.tsx",
          "src/lib/state/exegia-provider.tsx",
        ],
      },
    },
  },
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
