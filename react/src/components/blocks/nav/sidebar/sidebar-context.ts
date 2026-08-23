"use client";

import { createContext, useContext } from "react";

import type { AISidebarContextValue } from "./type.ts";

export const AISidebarContext = createContext<AISidebarContextValue | null>(
  null
);

export function useAISidebarContext(): AISidebarContextValue {
  const context = useContext(AISidebarContext);
  if (!context) throw new Error("Sidebar rows must render inside <AISidebar>.");
  return context;
}
