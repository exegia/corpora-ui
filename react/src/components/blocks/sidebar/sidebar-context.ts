"use client";

import { createContext, useContext } from "react";

import type { IAISidebarContextValue } from "./type.ts";

export const AISidebarContext = createContext<IAISidebarContextValue | null>(
  null
);

export function useAISidebarContext(): IAISidebarContextValue {
  const context = useContext(AISidebarContext);
  if (!context) throw new Error("Sidebar rows must render inside <AISidebar>.");
  return context;
}
