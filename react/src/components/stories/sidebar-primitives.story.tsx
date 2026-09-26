"use client"

import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarInset, SidebarTrigger } from "@/ui/sidebar"

import { defineStory } from "@/registry/story"

function ComponentPreview({ defaultOpen }: { defaultOpen: boolean }) {

  return (
    <div className="relative isolate mx-auto h-80 w-full overflow-hidden border [transform:translateZ(0)]">
      <SidebarProvider defaultOpen={defaultOpen} className="min-h-72">
      <Sidebar collapsible="icon" className="absolute"><SidebarHeader>Library</SidebarHeader><SidebarContent><SidebarMenu><SidebarMenuItem><SidebarMenuButton isActive>Documents</SidebarMenuButton></SidebarMenuItem><SidebarMenuItem><SidebarMenuButton>Collections</SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarContent></Sidebar>
      <SidebarInset><div className="p-4"><SidebarTrigger /><p className="mt-4">Choose a collection from the navigation.</p></div></SidebarInset>
    </SidebarProvider>
    </div>
  )
}

export const story = defineStory({
  Component: ComponentPreview,
  args: { initial: { defaultOpen: true } },
})

export const Preview = story.WithControl
