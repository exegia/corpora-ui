"use client";

import { useRender } from "@base-ui/react/use-render";
import type * as React from "react";
import { type Button } from "@/components/ui/button";

export type PaginationLinkProps = {
  isActive?: boolean;
  size?: React.ComponentProps<typeof Button>["size"];
} & useRender.ComponentProps<"a">;
