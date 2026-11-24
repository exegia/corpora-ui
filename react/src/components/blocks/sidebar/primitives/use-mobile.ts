"use client";

import { useSyncExternalStore } from "react";

// Preserve the original sidebar's max-md boundary (the app uses md = 800).
const QUERY = "(max-width: 799px)";
function subscribe(listener: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}
function getSnapshot() { return window.matchMedia(QUERY).matches; }
function getServerSnapshot() { return false; }
export function useSidebarMobile() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
