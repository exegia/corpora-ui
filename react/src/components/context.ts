import { createContext } from "react"

import type { TThemeProviderState } from "./types"

export const ThemeContext = createContext<TThemeProviderState | undefined>(
  undefined
)
