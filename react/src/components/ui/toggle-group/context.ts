"use client";

import * as React from "react";
import type { ToggleGroupContextProps } from "./type";


export const ToggleGroupContext = React.createContext<ToggleGroupContextProps>({
  size: "md",
  variant: "ghost",    
});


export const useToggleGroup = () => {
  const context = React.useContext(ToggleGroupContext);
  if (!context) {
    throw new Error("useToggleGroupContext must be used within a ToggleGroup");
  }
  return context;
};