import { createContext } from "react";

/** Composition only: changing sidebar state does not change this context. */
export const SidebarInstanceContext = createContext<string | null>(null);
