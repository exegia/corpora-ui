import type {
  ComponentProps,
  ComponentType,
  ReactElement,
  ReactNode,
} from "react"
import type { PopoverPopup } from "@/components/ui/popover"

/** Contextual content opened independently of a breadcrumb's navigation action. */
export interface BreadcrumbItemOverlay {
  /** Selects the overlay primitive and its default trigger icon. */
  type: "menu" | "popover" | "tooltip"
  /** Accessible name for the separate overlay trigger. */
  label: string
  /** MenuItem/MenuLinkItem children, popover content, or a short tooltip hint. */
  content: ReactNode
  /** Overrides the chevron (menu) or info icon (popover/tooltip). */
  icon?: ReactNode
  /** Prevents interaction with the overlay trigger. */
  disabled?: boolean
  /** Controlled visibility; omit to let the overlay manage its own state. */
  open?: boolean
  /** Called when the overlay requests a visibility change. */
  onOpenChange?: (open: boolean) => void
  /** Portal options forwarded to the selected overlay's popup. */
  portalProps?: ComponentProps<typeof PopoverPopup>["portalProps"]
}

/** Custom content for a default breadcrumb, rather than a navigation target. */
export type TBreadcrumbItemDefault = {
  /** Content supplied by the caller for the breadcrumb item. */
  children: ReactNode
}

/** Destination for a link breadcrumb. */
export type TBreadcrumbItemLink = {
  /** URL or fragment targeted by the link. */
  href: string
  /** Optional handler called in addition to normal link navigation. */
  onClick?: () => void
}

/** Target for a table-of-contents breadcrumb. */
export type TBreadcrumbItemToc = {
  /** DOM identifier for the table-of-contents trigger. */
  id: string
  /** Preconfigured TOC content; the breadcrumb supplies its popover and trigger. */
  Component: ComponentType
}

/** Target for a menu breadcrumb. */
export type TBreadcrumbItemMenu = {
  /** DOM identifier for the menu trigger. */
  id: string
  /** Optional handler called when the menu trigger is clicked. */
  onClick?: () => void
  /** Preconfigured menu that uses children as its trigger, e.g. MenuCommand. */
  Component: ComponentType<{ children: ReactElement }>
}

/** Built-in separator symbols; pass children to render another symbol. */
export type TBreadcrumbSeparatorSymbol = "chevron" | "slash"

/** Shared separator props; accessibility semantics are managed by the component. */
type TBreadcrumbSeparatorBase = Omit<
  ComponentProps<"li">,
  "aria-hidden" | "role"
> & {
  /** Built-in symbol, defaulting to chevron. Custom children take precedence. */
  symbol?: TBreadcrumbSeparatorSymbol
}

/**
 * A decorative separator by default, or an accessible menu-trigger button.
 * Menu components supply their own data and use children as their trigger.
 *
 * @example
 * <Breadcrumb.Separator symbol="slash" />
 * <Breadcrumb.Separator>·</Breadcrumb.Separator>
 * <Breadcrumb.Separator variant="menu" label="Choose a page" Component={PageMenu} />
 */
export type IBreadcrumbSeparatorProps = TBreadcrumbSeparatorBase &
  (
    | {
        /** Decorative separators are hidden from assistive technology. */
        variant?: "default"
        Component?: never
        label?: never
        disabled?: never
      }
    | {
        /** Renders the separator as a button that opens the supplied menu. */
        variant: "menu"
        /** Accessible name describing the menu opened by the symbol button. */
        label: string
        /** Preconfigured menu receiving the separator button as its trigger. */
        Component: ComponentType<{ children: ReactElement }>
        /** Prevents interaction with the separator's menu trigger. */
        disabled?: boolean
      }
  )

/** Single source of truth for each variant's required content or target. */
interface IBreadcrumbMap {
  default: TBreadcrumbItemDefault
  link: TBreadcrumbItemLink
  toc: TBreadcrumbItemToc
  menu: TBreadcrumbItemMenu
}

/** Supported breadcrumb variants, derived from their payload map. */
export type TBreadcrumbVariant = keyof IBreadcrumbMap

/**
 * Breadcrumb props whose required payload is determined by `variant`.
 *
 * Mapping each variant separately preserves the relationship between `variant`
 * and its payload, including when multiple variants are accepted. Narrow on
 * `variant` before accessing `children`, `href`, or `id`.
 *
 * @typeParam Variant - Accepted variants; defaults to the full discriminated union.
 * @typeParam Label - Optional string-literal constraint for the item's label.
 *
 * @example
 * const item: IBreadcrumbItemProps<"link"> = {
 *   variant: "link",
 *   label: "Library",
 *   href: "/library",
 * }
 */
export type IBreadcrumbItemProps<
  Variant extends TBreadcrumbVariant = TBreadcrumbVariant,
  Label extends string = string,
> = {
  [Key in Variant]: IBreadcrumbMap[Key] & {
    /** Selects the item kind and discriminates its required payload. */
    variant: Key
    /** Text identifying the breadcrumb item. */
    label: Label
    /** Optional tooltip content; strings are already included in ReactNode. */
    tooltip?: ReactNode
    /** Additional CSS classes for the item wrapper. */
    className?: string
  }
}[Variant]
