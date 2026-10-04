import { createContext } from "react"

import type { TThemeProviderState } from "./type"

export const ThemeContext = createContext<TThemeProviderState | undefined>(
  undefined
)
