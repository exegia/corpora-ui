"use client";

import { useRender } from "@base-ui/react/use-render";
import type React from "react";

export type TableVariant = "default" | "card";
export type TableProps = React.ComponentProps<"table"> & {
  variant?: TableVariant;
  render?: useRender.ComponentProps<"div">["render"];
};
