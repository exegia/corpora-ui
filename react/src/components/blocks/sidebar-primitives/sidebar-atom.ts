import { atom } from "jotai";
import { createKeyedFamilies } from "@/lib/keyed-atom";
import type { SidebarConfig, SidebarState, SidebarValue } from "./types";
import { SIDEBAR_COOKIE_MAX_AGE, SIDEBAR_COOKIE_NAME } from "./utils";

const { keyed, stateFamily, actionFamily, removeInstance } = createKeyedFamilies("sidebar");
/** @internal */
export const sidebarOwnedOpenAtom = stateFamily("owned-open", true);
/** @internal */
export const sidebarMobileOpenValueAtom = stateFamily("mobile-open", false);
/** @internal */
export const sidebarMobileValueAtom = stateFamily("mobile", false);
/** @internal */
export const sidebarConfigAtom = stateFamily<SidebarConfig>("config", { controlled: false });

export const sidebarOpenAtom = keyed((id) => {
  const value = atom((get) => get(sidebarOwnedOpenAtom(id)));
  value.debugLabel = `sidebar/${id}/open`;
  return value;
});
export const sidebarOpenMobileAtom = keyed((id) => {
  const value = atom((get) => get(sidebarMobileOpenValueAtom(id)));
  value.debugLabel = `sidebar/${id}/open-mobile`;
  return value;
});
export const sidebarIsMobileAtom = keyed((id) => {
  const value = atom((get) => get(sidebarMobileValueAtom(id)));
  value.debugLabel = `sidebar/${id}/is-mobile`;
  return value;
});
export const sidebarStateAtom = keyed((id) => {
  const value = atom((get): SidebarState => {
    const open = get(sidebarOpenAtom(id));
    return { open, state: open ? "expanded" : "collapsed", openMobile: get(sidebarOpenMobileAtom(id)), isMobile: get(sidebarIsMobileAtom(id)) };
  });
  value.debugLabel = `sidebar/${id}/state`;
  return value;
});

export const setSidebarOpenAtom = actionFamily("set-open", (get, set, id, update: SidebarValue) => {
  const next = typeof update === "function" ? update(get(sidebarOpenAtom(id))) : update;
  const config = get(sidebarConfigAtom(id));
  // A controlled prop remains authoritative; actions request the next value.
  if (!config.controlled) set(sidebarOwnedOpenAtom(id), next);
  config.onOpenChange?.(next);
  if (typeof document !== "undefined") {
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${next}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
  }
});
export const setSidebarOpenMobileAtom = actionFamily("set-open-mobile", (get, set, id, update: SidebarValue) => {
  set(sidebarMobileOpenValueAtom(id), typeof update === "function" ? update(get(sidebarOpenMobileAtom(id))) : update);
});
export const toggleSidebarAtom = actionFamily("toggle", (get, set, id) => {
  if (get(sidebarIsMobileAtom(id))) set(setSidebarOpenMobileAtom(id), (open) => !open);
  else set(setSidebarOpenAtom(id), (open) => !open);
});

/** Release a named instance after its components and subscribers unmount. */
export const removeSidebarInstance = removeInstance;
