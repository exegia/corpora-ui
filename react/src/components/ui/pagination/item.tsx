"use client";

import type * as React from "react";

export default function PaginationItem({
  ...props
}: React.ComponentProps<"li">): React.ReactElement {
  return <li data-slot="pagination-item" {...props} />;
}
