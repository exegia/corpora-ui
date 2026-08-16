import type { Transition, Variants } from "motion/react"

/** `--ease-smooth-out` as a motion/react easing tuple. */
export const TREE_EASE = [0.22, 1, 0.36, 1] as const

/** Branch open — `--duration-fast` territory (accordion open). */
export const TREE_OPEN_DURATION = 0.25

/** Branch close — quicker than open, per open/close asymmetry. */
export const TREE_CLOSE_DURATION = 0.15

/** Chevron flip and label fades. */
export const TREE_MICRO_DURATION = 0.15

/** Sidebar rail label reveal/hide when `collapsed` flips. */
export const TREE_COLLAPSE_DURATION = 0.2

/** Rail label text fade — starts as the width growth is finishing, so the
 * label never reads as clipped mid-grow. */
export const TREE_LABEL_REVEAL_DELAY = 0.01

/** A branch's children group: grows open with a soft stagger, folds shut
 * faster. Height rides layout ("auto"), paint fades. */
export const TREE_BRANCH_VARIANTS: Variants = {
  closed: { height: 0, opacity: 0 },
  open: {
    height: "auto",
    opacity: 1,
    transition: {
      duration: TREE_OPEN_DURATION,
      ease: TREE_EASE,
      staggerChildren: 0.03,
    },
  },
}

/** Branch close — a plain target, NOT the "closed" variant label: a
 * labeled exit orchestrates every variant child and AnimatePresence then
 * waits on the whole subtree before unmounting. */
export const TREE_BRANCH_EXIT = {
  height: 0,
  opacity: 0,
  transition: { duration: TREE_CLOSE_DURATION, ease: TREE_EASE },
}

/** One row inside an opening branch — a short blurred rise. */
export const TREE_ROW_VARIANTS: Variants = {
  closed: { opacity: 0, x: -4 },
  open: { opacity: 1, x: 0 },
}

export const TREE_MICRO_TRANSITION: Transition = {
  duration: TREE_MICRO_DURATION,
  ease: TREE_EASE,
}
