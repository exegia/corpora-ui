"use client"

import { useId, type ReactElement } from "react"
import Breadcrumb from "@/components/composed/breadcrumb"
import { Root as Toc } from "@/components/composed/navigation/toc/default"
import { MenuCommand } from "@/components/ui/menu-command"
import { defineStory } from "@/registry/story"

function ComponentPreview({ page }: { page: string }) {
  return (
    <div className="max-w-lg p-2 relative mx-auto w-full">
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item href="" label="Home" variant="link" />

          <Breadcrumb.Separator />
          <Breadcrumb.Item label={page} variant="default">
            <Breadcrumb.Page>{page}</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
    </div>
  )
}

function ComponentBiblePreview({
  book,
  chapter,
  verse,
}: {
  book: string
  chapter: string
  verse: string
}) {
  return (
    <div className="max-w-lg p-2 relative mx-auto w-full">
      <Breadcrumb.Root>
        <Breadcrumb.List>
          <Breadcrumb.Item href="/" label="Home" variant="link" />

          <Breadcrumb.Separator />
          <Breadcrumb.Item label={book} variant="default">
            <Breadcrumb.Page>{book}</Breadcrumb.Page>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item label={chapter} variant="default">
            <Breadcrumb.Page>{chapter}</Breadcrumb.Page>
          </Breadcrumb.Item>
          <Breadcrumb.Separator />
          <Breadcrumb.Item label={verse} variant="default">
            <Breadcrumb.Page>{verse}</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
    </div>
  )
}

function BreadcrumbTocPreview() {
  return (
    <div className="w-64 max-w-full">
      <Toc
        items={[
          {
            id: "breadcrumb-variants",
            label: "Item variants",
            link: "#breadcrumb-variants-section",
            level: 1,
            type: "section",
          },
          {
            id: "breadcrumb-configuration",
            label: "Preconfigured components",
            link: "#breadcrumb-configuration-section",
            level: 1,
            type: "section",
          },
        ]}
      />
    </div>
  )
}

function BreadcrumbMenuPreview({ children }: { children: ReactElement }) {
  return (
    <MenuCommand
      side="bottom"
      align="start"
      items={[
        { id: "usage", label: "Usage", href: "#usage" },
        { id: "examples", label: "Examples", href: "#examples" },
        { id: "api", label: "API notes", href: "#api-notes" },
      ]}
    >
      {children}
    </MenuCommand>
  )
}

function ComponentVariantsPreview({ page }: { page: string }) {
  const id = useId()

  return (
    <div className="max-w-lg p-2 relative mx-auto w-full">
      <Breadcrumb.Root aria-label="Breadcrumb item variants">
        <Breadcrumb.List>
          <Breadcrumb.Item
            variant="link"
            label="Usage"
            href="#usage"
            tooltip="Jump to the usage example"
          />
          <Breadcrumb.Separator />
          <Breadcrumb.Item
            variant="toc"
            id={`${id}-toc`}
            label="Contents"
            Component={BreadcrumbTocPreview}
            tooltip="Browse the item variants"
          />
          <Breadcrumb.Separator />
          <Breadcrumb.Item
            variant="menu"
            id={`${id}-menu`}
            label="Sections"
            Component={BreadcrumbMenuPreview}
            tooltip="Search the documentation sections"
          />
          <Breadcrumb.Separator />
          <Breadcrumb.Item variant="default" label={page}>
            <Breadcrumb.Page>{page}</Breadcrumb.Page>
          </Breadcrumb.Item>
        </Breadcrumb.List>
      </Breadcrumb.Root>
    </div>
  )
}

function ComponentSeparatorsPreview({ page }: { page: string }) {
  const examples = [
    { label: "Chevron", separator: <Breadcrumb.Separator /> },
    { label: "Slash", separator: <Breadcrumb.Separator symbol="slash" /> },
    {
      label: "Custom symbol",
      separator: <Breadcrumb.Separator>·</Breadcrumb.Separator>,
    },
    {
      label: "Menu button",
      separator: (
        <Breadcrumb.Separator
          variant="menu"
          label="Choose a documentation section"
          Component={BreadcrumbMenuPreview}
        />
      ),
    },
  ]

  return (
    <div className="min-w-0 gap-4 p-2 lg:grid-cols-2 relative mx-auto grid w-full">
      {examples.map(({ label, separator }) => (
        <div key={label} className="gap-2 flex flex-col">
          <p className="text-sm font-medium">{label}</p>
          <Breadcrumb.Root aria-label={`${label} breadcrumb`}>
            <Breadcrumb.List>
              <Breadcrumb.Item variant="link" label="Usage" href="#usage" />
              {separator}
              <Breadcrumb.Item variant="default" label={page}>
                <Breadcrumb.Page>{page}</Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
        </div>
      ))}
    </div>
  )
}

export const withSeparatorsStory = defineStory({
  Component: ComponentSeparatorsPreview,
  args: { initial: { page: "Breadcrumb" } },
})

export const BreadcrumbSeparatorsPreview = withSeparatorsStory.WithControl

export const withVariantsStory = defineStory({
  Component: ComponentVariantsPreview,
  args: { initial: { page: "Breadcrumb" } },
})

export const BreadcrumbVariantsPreview = withVariantsStory.WithControl

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { page: "Breadcrumb" } },
})

export const withBibleStory = defineStory({
  Component: ComponentBiblePreview,
  args: { initial: { book: "Genesis", chapter: "1", verse: "1" } },
})

export const BibleBreadcrumbPreview = withBibleStory.WithControl

export const Preview = story.WithControl
