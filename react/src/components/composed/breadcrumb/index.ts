import { Root } from "./root"
import { default as BreadcrumbList } from "./list"
import { default as BreadcrumbItem } from "./item"
import { default as BreadcrumbLink } from "./link"
import { default as BreadcrumbPage } from "./page"
import { default as BreadcrumbSeparator } from "./separator"
import { default as BreadcrumbEllipsis } from "./ellipsis"
export type {
  BreadcrumbItemOverlay,
  IBreadcrumbSeparatorProps,
  TBreadcrumbSeparatorSymbol,
} from "./types"

const Breadcrumb = {
  Root,
  List: BreadcrumbList,
  Item: BreadcrumbItem,
  Link: BreadcrumbLink,
  Page: BreadcrumbPage,
  Separator: BreadcrumbSeparator,
  Ellipsis: BreadcrumbEllipsis,
}

export default Breadcrumb
