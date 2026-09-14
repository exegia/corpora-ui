import { defineConfig } from "fumapress"
import { fumadocsMdx } from "fumapress/adapters/mdx"
import { metaSchema, pageSchema } from "fumapress/adapters/mdx/schema"
import { defineDocs } from "fumadocs-mdx/macro"

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000"

const docs = defineDocs({
  dir: "docs/content",
  docs: {
    files: ["**/*.mdx"],
    async: true,
    schema: pageSchema,
    lastModified: true,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
})

export default defineConfig({
  content: docs.toFumadocsSource(),
  site: {
    name: "corpora/ui",
    baseUrl: SITE_URL,
    git: {
      user: "exegia",
      repo: "corpora-ui",
      branch: "dev",
    },
  },
  defaultLayoutProps: {
    nav: {
      title: "corpora/ui",
    },
    links: [
      {
        text: "GitHub",
        url: "https://github.com/exegia/corpora-ui",
      },
    ],
  },
  meta: {
    root() {
      return (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            href="https://fonts.googleapis.com/css2?family=Geist:ital,wght@0,100..900;1,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
            rel="stylesheet"
          />
        </>
      )
    },
  },
})
  .adapters(fumadocsMdx())
