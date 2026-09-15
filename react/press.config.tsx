import { defineConfig } from "fumapress"
import { fumadocsMdx } from "fumapress/adapters/mdx"
import { metaSchema, pageSchema } from "fumapress/adapters/mdx/schema"
import { defineDocs } from "fumadocs-mdx/macro"
import { createDocsLayoutPage } from "fumapress/layouts/docs"
import { createHomeLayoutPage } from "fumapress/layouts/home"
import { lucideIconsPlugin } from "fumadocs-core/source/plugins/lucide-icons"
import { Link } from "fumapress/client"

const SITE_URL = process.env.SITE_URL ?? "http://localhost:3000"

const DocsLayout = createDocsLayoutPage<typeof config.$context>({
  async render(page) {
    return {
      ...page,
      pageProps: {
        tableOfContent: {
          style: "clerk",
        },
      },
    }
  },
})

const HomeLayout = createHomeLayoutPage<typeof config.$context>({
  async render() {
    return {
      layoutProps: {
        nav: { transparentMode: "top" },
        links: [
          { text: "Atoms", url: "/atoms/button", active: "nested-url" },
          { text: "Composed", url: "/composed", active: "nested-url" },
          { text: "Blocks", url: "/blocks", active: "nested-url" },
          { text: "Getting started", url: "/getting-started" },
        ],
      },
    }
  },
})

const docs = defineDocs({
  dir: "content",
  docs: {
    files: ["**/*.md", "**/*.mdx"],
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

const config = defineConfig({
  content: docs.toFumadocsSource(),
  loaderOptions: {
    plugins: [lucideIconsPlugin()],
  },
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
      title: (
        <span className="inline-flex items-center gap-2">
          <img src="/logo.svg" alt="" className="size-6" />
          <span className="font-serif text-xl font-medium tracking-tight">
            Corpora
          </span>
        </span>
      ),
    },
    githubUrl: "https://github.com/exegia/corpora-ui",
  },
  renderNotFound: () => (
    <main>
      <h1>Page not found</h1>
      <Link href="/">Back to home</Link>
    </main>
  ),
  renderPage: (props) =>
    props.page.url === "/" ? (
      <HomeLayout {...props} />
    ) : (
      <DocsLayout {...props} />
    ),
  meta: {
    root() {
      return (
        <>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link
            rel="preconnect"
            href="https://fonts.gstatic.com"
            crossOrigin=""
          />
          <link
            href="https://fonts.googleapis.com/css2?family=Geist:ital,wght@0,100..900;1,100..900&family=JetBrains+Mono:ital,wght@0,100..800;1,100..800&display=swap"
            rel="stylesheet"
          />
        </>
      )
    },
  },
}).adapters(fumadocsMdx())

export default config
