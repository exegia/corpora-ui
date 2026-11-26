//! Tree: `react/src/components/composed/tree`.

use std::collections::HashSet;
use std::f32::consts::FRAC_PI_2;
use std::rc::Rc;
use std::sync::Arc;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::base::motion::{Transition, transition};
use gpui_kit::component::tooltip::Tooltip;
use gpui_kit::component::{ActiveTheme as _, Icon, Sizable as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    AnyElement, App, ElementId, Entity, FontWeight, Hsla, InteractiveElement as _, IntoElement,
    ParentElement as _, RenderOnce, SharedString, StatefulInteractiveElement as _, Styled as _,
    Window, div, radians,
};

use crate::atoms::Reveal;
use crate::foundations::Radius;
use crate::foundations::motion::{DURATION_FAST, EASE_SMOOTH_OUT};

/// One entry in a [`Tree`]. What its depth means depends on the variant.
#[derive(Clone, Debug, PartialEq)]
pub struct TreeNode {
    pub id: SharedString,
    pub label: SharedString,
    /// The leading icon. A rail row needs one: it is all that shows while
    /// the rail is folded.
    pub icon: Option<LucideIcon>,
    pub disabled: bool,
    /// Starts expanded. The ancestors of the active node expand regardless.
    pub default_open: bool,
    /// A trailing hint: a count, "New".
    pub badge: Option<SharedString>,
    pub children: Vec<TreeNode>,
}

impl TreeNode {
    /// `id` must be unique in the tree.
    pub fn new(id: impl Into<SharedString>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            icon: None,
            disabled: false,
            default_open: false,
            badge: None,
            children: Vec::new(),
        }
    }

    pub fn icon(mut self, icon: LucideIcon) -> Self {
        self.icon = Some(icon);
        self
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    pub fn default_open(mut self) -> Self {
        self.default_open = true;
        self
    }

    pub fn badge(mut self, badge: impl Into<SharedString>) -> Self {
        self.badge = Some(badge.into());
        self
    }

    pub fn children(mut self, children: impl IntoIterator<Item = TreeNode>) -> Self {
        self.children.extend(children);
        self
    }
}

/// The shape a [`Tree`] takes.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum TreeVariant {
    /// App navigation. Parents fold their children; with three levels the
    /// top one reads as section headings.
    #[default]
    Navigation,
    /// A table of contents. Every row selects; a parent folds from its own
    /// chevron.
    Toc,
    /// A single-level icon rail, which [`Tree::collapsed`] folds to icons.
    /// Children are ignored.
    Sidebar,
    /// A file explorer. Folders fold, files select, and rows are compact.
    Files,
}

/// The ids from a root down to `id`, `id` included.
fn path_to(nodes: &[TreeNode], id: &str) -> Option<Vec<SharedString>> {
    nodes.iter().find_map(|node| {
        if node.id.as_ref() == id {
            return Some(vec![node.id.clone()]);
        }
        let mut path = path_to(&node.children, id)?;
        path.insert(0, node.id.clone());
        Some(path)
    })
}

/// How many levels deep the tree goes.
fn levels(nodes: &[TreeNode]) -> usize {
    nodes
        .iter()
        .map(|node| 1 + levels(&node.children))
        .max()
        .unwrap_or(0)
}

fn default_open(nodes: &[TreeNode], into: &mut HashSet<SharedString>) {
    for node in nodes {
        if node.default_open {
            into.insert(node.id.clone());
        }
        default_open(&node.children, into);
    }
}

#[derive(Default)]
struct Memory {
    expanded: HashSet<SharedString>,
    seeded: bool,
    /// The active id last seen, to open its ancestors once when it changes.
    last_active: Option<SharedString>,
}

type NavigateHandler = Rc<dyn Fn(&SharedString, &mut Window, &mut App)>;

#[derive(Clone, Copy, PartialEq)]
enum RowKind {
    /// Selects.
    Link,
    /// Folds its children.
    Toggle,
    /// A heading that folds its group.
    Section,
}

/// What every row needs to draw itself.
struct Shared {
    id: Arc<ElementId>,
    variant: TreeVariant,
    sectioned: bool,
    collapsed: bool,
    force_open: bool,
    active: Option<SharedString>,
    expanded: HashSet<SharedString>,
    memory: Entity<Memory>,
    on_navigate: Option<NavigateHandler>,
    muted: Hsla,
    foreground: Hsla,
    border: Hsla,
    hover: Hsla,
    hover_text: Hsla,
}

impl Shared {
    fn child_id(&self, name: String) -> ElementId {
        ElementId::NamedChild(self.id.clone(), name.into())
    }
}

/// A nested list of entries in one of four shapes: app navigation, a table
/// of contents, an icon rail or a file explorer.
///
/// ```ignore
/// Tree::new("contents", TreeVariant::Toc)
///     .items([
///         TreeNode::new("john", "John").children([
///             TreeNode::new("john-1", "Chapter 1"),
///             TreeNode::new("john-2", "Chapter 2"),
///         ]),
///     ])
///     .active("john-1")
///     .on_navigate(cx.listener(|this, id: &SharedString, _, cx| this.open(id.clone(), cx)))
/// ```
///
/// The tree remembers which branches are open. The owner holds the active
/// id and moves it in `on_navigate`.
#[derive(IntoElement)]
pub struct Tree {
    id: ElementId,
    variant: TreeVariant,
    items: Vec<TreeNode>,
    active: Option<SharedString>,
    collapsed: bool,
    force_open: bool,
    on_navigate: Option<NavigateHandler>,
}

impl Tree {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>, variant: TreeVariant) -> Self {
        Self {
            id: id.into(),
            variant,
            items: Vec::new(),
            active: None,
            collapsed: false,
            force_open: false,
            on_navigate: None,
        }
    }

    pub fn items(mut self, items: impl IntoIterator<Item = TreeNode>) -> Self {
        self.items.extend(items);
        self
    }

    /// The id of the current entry, at any depth. Its ancestors open.
    pub fn active(mut self, id: impl Into<SharedString>) -> Self {
        self.active = Some(id.into());
        self
    }

    /// Folds a [`TreeVariant::Sidebar`] rail down to its icons. The rail
    /// fills its container, so narrow that to match.
    pub fn collapsed(mut self, collapsed: bool) -> Self {
        self.collapsed = collapsed;
        self
    }

    /// Shows every branch open, whatever was folded: for a filtered tree,
    /// where each match should be in view.
    pub fn force_open(mut self, force_open: bool) -> Self {
        self.force_open = force_open;
        self
    }

    /// Called with the id of the row that was selected.
    pub fn on_navigate(
        mut self,
        handler: impl Fn(&SharedString, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_navigate = Some(Rc::new(handler));
        self
    }
}

fn row(
    node: TreeNode,
    depth: usize,
    shared: &Shared,
    window: &mut Window,
    cx: &mut App,
) -> AnyElement {
    let variant = shared.variant;
    let files = variant == TreeVariant::Files;
    let rail = variant == TreeVariant::Sidebar;
    let folded = rail && shared.collapsed;
    let has_children = !rail && !node.children.is_empty();
    let kind = if shared.sectioned && depth == 0 {
        RowKind::Section
    } else if has_children && matches!(variant, TreeVariant::Navigation | TreeVariant::Files) {
        RowKind::Toggle
    } else {
        RowKind::Link
    };
    let open = has_children && (shared.force_open || shared.expanded.contains(&node.id));
    let active = shared.active.as_ref() == Some(&node.id);
    let row_id = shared.child_id(format!("row-{}", node.id));

    let turn = transition(
        (row_id.clone(), "chevron"),
        if open { 1.0_f32 } else { 0.0 },
        Transition::new(DURATION_FAST).easing(EASE_SMOOTH_OUT.easing()),
        window,
        cx,
    );
    let chevron = || {
        Icon::new(LucideIcon::ChevronRight)
            .xsmall()
            .flex_none()
            .rotate(radians(turn * FRAC_PI_2))
    };
    let toggle = {
        let memory = shared.memory.clone();
        let id = node.id.clone();
        move |cx: &mut App| {
            memory.update(cx, |memory, cx| {
                if !memory.expanded.remove(&id) {
                    memory.expanded.insert(id.clone());
                }
                cx.notify();
            });
        }
    };
    let press = {
        let toggle = toggle.clone();
        let on_navigate = shared.on_navigate.clone();
        let id = node.id.clone();
        move |window: &mut Window, cx: &mut App| {
            if kind == RowKind::Link {
                if let Some(on_navigate) = &on_navigate {
                    on_navigate(&id, window, cx);
                }
            } else {
                toggle(cx);
            }
        }
    };

    let hover = shared.hover;
    let hover_text = shared.hover_text;
    let foreground = shared.foreground;
    let line = if kind == RowKind::Section {
        h_flex()
            .id(row_id)
            .w_full()
            .gap_1()
            .px_2()
            .py_1()
            .mt_2()
            .text_xs()
            .font_weight(FontWeight::MEDIUM)
            .text_color(shared.muted)
            .cursor_pointer()
            .hover(move |this| this.text_color(foreground))
            .on_click(move |_, window, cx| press(window, cx))
            .child(div().flex_1().truncate().child(node.label.to_uppercase()))
            .child(chevron())
    } else {
        let icon = node.icon.or(files.then_some(if !has_children {
            LucideIcon::File
        } else if open {
            LucideIcon::FolderOpen
        } else {
            LucideIcon::Folder
        }));
        let label = node.label.clone();
        h_flex()
            .id(row_id)
            .w_full()
            .min_w_0()
            .gap_2()
            .px_2()
            .rounded(Radius::Md.resolve(cx))
            .text_sm()
            .text_color(shared.muted)
            .map(|this| {
                if folded {
                    this.h_10().justify_center().px_0().text_color(foreground)
                } else if files {
                    this.h_7()
                } else {
                    this.h_8()
                }
            })
            .when(active, |this| {
                this.bg(hover)
                    .text_color(hover_text)
                    .font_weight(FontWeight::MEDIUM)
            })
            .map(|this| {
                if node.disabled {
                    this.opacity(0.5)
                } else {
                    this.cursor_pointer()
                        .hover(move |this| this.bg(hover).text_color(hover_text))
                        .on_click(move |_, window, cx| press(window, cx))
                }
            })
            .when(folded, |this| {
                this.tooltip(move |window, cx| Tooltip::new(label.clone()).build(window, cx))
            })
            .when(files, |this| {
                // Files keep their names in a column whether or not they fold.
                this.child(if has_children {
                    chevron().into_any_element()
                } else {
                    div().flex_none().size_3().into_any_element()
                })
            })
            .when_some(icon, |this, icon| {
                this.child(if folded {
                    Icon::new(icon).flex_none()
                } else {
                    Icon::new(icon).small().flex_none()
                })
            })
            .when(!folded, |this| {
                this.child(div().flex_1().min_w_0().truncate().child(node.label))
                    .when_some(node.badge, |this, badge| {
                        this.child(div().flex_none().text_xs().child(badge))
                    })
                    .when(kind == RowKind::Toggle && !files, |this| {
                        this.child(chevron())
                    })
                    .when(variant == TreeVariant::Toc && has_children, |this| {
                        let toggle = toggle.clone();
                        this.child(
                            h_flex()
                                .id(shared.child_id(format!("toggle-{}", node.id)))
                                .flex_none()
                                .justify_center()
                                .size_6()
                                .mr(gpui_kit::px(-4.))
                                .rounded(Radius::Sm.resolve(cx))
                                .cursor_pointer()
                                .hover(move |this| this.bg(hover))
                                .on_click(move |_, _, cx| {
                                    cx.stop_propagation();
                                    toggle(cx);
                                })
                                .child(chevron()),
                        )
                    })
            })
    };

    if !has_children {
        return line.into_any_element();
    }
    let branch_id = shared.child_id(format!("branch-{}", node.id));
    let children: Vec<AnyElement> = node
        .children
        .into_iter()
        .map(|child| row(child, depth + 1, shared, window, cx))
        .collect();
    let indented = kind != RowKind::Section;
    let branch = div()
        .w_full()
        .min_w_0()
        .pt_0p5()
        // The indent is padding, so the branch stays within its parent's
        // width; a margin would push its rows past the trailing edge.
        .when(indented, |this| this.pl_3p5())
        .child(
            v_flex()
                .w_full()
                .min_w_0()
                .gap_0p5()
                // A rule down the branch ties the children to their parent.
                .when(indented, |this| {
                    this.pl_2().border_l_1().border_color(shared.border)
                })
                .children(children),
        );
    v_flex()
        .w_full()
        .min_w_0()
        .child(line)
        .child(Reveal::new(branch_id, open).child(branch))
        .into_any_element()
}

impl RenderOnce for Tree {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let id = Arc::new(self.id);
        let memory = window.use_keyed_state(
            ElementId::NamedChild(id.clone(), "memory".into()),
            cx,
            |_, _| Memory::default(),
        );
        let stale = {
            let memory = memory.read(cx);
            !memory.seeded || memory.last_active != self.active
        };
        if stale {
            let ancestors = self
                .active
                .as_ref()
                .and_then(|active| path_to(&self.items, active))
                .unwrap_or_default();
            memory.update(cx, |memory, _| {
                if !memory.seeded {
                    memory.seeded = true;
                    default_open(&self.items, &mut memory.expanded);
                    // Sections start open: they are headings, not drawers.
                    if self.variant == TreeVariant::Navigation && levels(&self.items) >= 3 {
                        memory
                            .expanded
                            .extend(self.items.iter().map(|node| node.id.clone()));
                    }
                }
                memory.last_active = self.active.clone();
                memory.expanded.extend(ancestors);
            });
        }

        let theme = cx.theme();
        let shared = Shared {
            id,
            variant: self.variant,
            sectioned: self.variant == TreeVariant::Navigation && levels(&self.items) >= 3,
            collapsed: self.collapsed,
            force_open: self.force_open,
            active: self.active,
            expanded: memory.read(cx).expanded.clone(),
            memory,
            on_navigate: self.on_navigate,
            muted: theme.muted_foreground,
            foreground: theme.foreground,
            border: theme.border,
            hover: theme.accent,
            hover_text: theme.accent_foreground,
        };
        let rows: Vec<AnyElement> = self
            .items
            .into_iter()
            .map(|node| row(node, 0, &shared, window, cx))
            .collect();
        v_flex()
            .w_full()
            .min_w_0()
            .map(|this| {
                if shared.variant == TreeVariant::Sidebar && shared.collapsed {
                    this.gap_2()
                } else {
                    this.gap_0p5()
                }
            })
            .children(rows)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn sample() -> Vec<TreeNode> {
        vec![
            TreeNode::new("gospels", "Gospels").children([
                TreeNode::new("john", "John")
                    .default_open()
                    .children([TreeNode::new("john-1", "Chapter 1")]),
                TreeNode::new("luke", "Luke"),
            ]),
            TreeNode::new("acts", "Acts"),
        ]
    }

    #[test]
    fn path_to_lists_the_ancestors_then_the_node() {
        let path = path_to(&sample(), "john-1").unwrap();
        assert_eq!(path, ["gospels", "john", "john-1"]);
        assert_eq!(path_to(&sample(), "acts").unwrap(), ["acts"]);
        assert_eq!(path_to(&sample(), "mark"), None);
    }

    #[test]
    fn levels_counts_the_deepest_branch() {
        assert_eq!(levels(&sample()), 3);
        assert_eq!(levels(&[TreeNode::new("a", "A")]), 1);
        assert_eq!(levels(&[]), 0);
    }

    #[test]
    fn default_open_collects_marked_nodes_at_any_depth() {
        let mut open = HashSet::new();
        default_open(&sample(), &mut open);
        assert_eq!(open, HashSet::from(["john".into()]));
    }
}
