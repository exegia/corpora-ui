//! The resource tree of the app rail: `react/src/components/blocks/sidebar`.

use std::collections::HashSet;
use std::f32::consts::FRAC_PI_2;
use std::rc::Rc;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::base::motion::{Transition, transition};
use gpui_kit::component::button::{Button as StockButton, ButtonVariants as _};
use gpui_kit::component::input::{Input, InputEvent, InputState};
use gpui_kit::component::menu::{DropdownMenu as _, PopupMenu, PopupMenuItem};
use gpui_kit::component::{ActiveTheme as _, Icon, Sizable as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    AnyElement, App, AppContext as _, ClickEvent, Context, DragMoveEvent, ElementId, Entity,
    EventEmitter, FocusHandle, Focusable, InteractiveElement as _, IntoElement, KeyDownEvent,
    ParentElement as _, Pixels, Point, Render, SharedString, StatefulInteractiveElement as _,
    Styled as _, Subscription, WeakEntity, Window, div, px, radians,
};

use crate::foundations::Radius;
use crate::foundations::motion::{DURATION_QUICK, EASE_SMOOTH_OUT};

type MenuBuilder =
    Rc<dyn Fn(&SidebarResource, PopupMenu, &mut Window, &mut Context<PopupMenu>) -> PopupMenu>;

/// Height of a row, and of the "Move to top level" target under the rows.
const ROW_HEIGHT: f32 = 36.;
/// How far each level steps in.
const INDENT: f32 = 16.;

/// What a row of the sidebar stands for.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum ResourceKind {
    Folder,
    Project,
    #[default]
    File,
    Bookmark,
}

/// One row of the sidebar, and the rows under it.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct SidebarResource {
    pub id: SharedString,
    pub label: SharedString,
    pub kind: ResourceKind,
    pub children: Vec<SidebarResource>,
    pub disabled: bool,
}

impl SidebarResource {
    pub fn new(
        id: impl Into<SharedString>,
        label: impl Into<SharedString>,
        kind: ResourceKind,
    ) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            kind,
            children: Vec::new(),
            disabled: false,
        }
    }

    pub fn children(mut self, children: impl IntoIterator<Item = SidebarResource>) -> Self {
        self.children = children.into_iter().collect();
        self
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    /// Folders and projects hold other rows; files and bookmarks do not.
    pub fn can_contain(&self) -> bool {
        matches!(self.kind, ResourceKind::Folder | ResourceKind::Project)
    }

    fn contains(&self, id: &str) -> bool {
        self.id.as_ref() == id || self.children.iter().any(|child| child.contains(id))
    }
}

/// Where a moved row lands, relative to its target.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum DropPosition {
    Before,
    Inside,
    After,
}

/// One reorder. A target of `None` is the end of the top level.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct ResourceMove {
    pub item_id: SharedString,
    pub target_id: Option<SharedString>,
    pub position: DropPosition,
}

/// A visible row, with its place in the tree.
#[derive(Clone, Debug, PartialEq, Eq)]
struct FlatRow {
    item: SidebarResource,
    depth: usize,
    parent: Option<SharedString>,
}

fn flatten(
    items: &[SidebarResource],
    expanded: &HashSet<SharedString>,
    depth: usize,
    parent: Option<&SharedString>,
    rows: &mut Vec<FlatRow>,
) {
    for item in items {
        rows.push(FlatRow {
            item: item.clone(),
            depth,
            parent: parent.cloned(),
        });
        if !item.children.is_empty() && expanded.contains(&item.id) {
            flatten(&item.children, expanded, depth + 1, Some(&item.id), rows);
        }
    }
}

/// The first row after `rows[index]` that is not inside it: where a move
/// down takes a row. An open folder's own rows follow it, and a row cannot
/// land in itself.
fn row_below(rows: &[FlatRow], index: usize) -> Option<&FlatRow> {
    let source = &rows[index].item;
    rows[index + 1..]
        .iter()
        .find(|row| !source.contains(&row.item.id))
}

fn find<'a>(items: &'a [SidebarResource], id: &str) -> Option<&'a SidebarResource> {
    items.iter().find_map(|item| {
        if item.id.as_ref() == id {
            Some(item)
        } else {
            find(&item.children, id)
        }
    })
}

/// Ids of every ancestor of `id`, nearest last. Empty when it is absent.
fn ancestors(items: &[SidebarResource], id: &str) -> Vec<SharedString> {
    fn walk(items: &[SidebarResource], id: &str, trail: &mut Vec<SharedString>) -> bool {
        for item in items {
            if item.id.as_ref() == id {
                return true;
            }
            trail.push(item.id.clone());
            if walk(&item.children, id, trail) {
                return true;
            }
            trail.pop();
        }
        false
    }
    let mut trail = Vec::new();
    if walk(items, id, &mut trail) {
        trail
    } else {
        Vec::new()
    }
}

/// Every row that holds children: the set `expand_all` opens.
fn expandable(items: &[SidebarResource], ids: &mut HashSet<SharedString>) {
    for item in items {
        if item.can_contain() && !item.children.is_empty() {
            ids.insert(item.id.clone());
            expandable(&item.children, ids);
        }
    }
}

fn remove(items: &mut Vec<SidebarResource>, id: &str) -> Option<SidebarResource> {
    if let Some(index) = items.iter().position(|item| item.id.as_ref() == id) {
        return Some(items.remove(index));
    }
    items
        .iter_mut()
        .find_map(|item| remove(&mut item.children, id))
}

fn insert(
    items: &mut Vec<SidebarResource>,
    resource: SidebarResource,
    target: &str,
    position: DropPosition,
) -> Result<(), SidebarResource> {
    if let Some(index) = items.iter().position(|item| item.id.as_ref() == target) {
        match position {
            DropPosition::Before => items.insert(index, resource),
            DropPosition::After => items.insert(index + 1, resource),
            DropPosition::Inside => items[index].children.push(resource),
        }
        return Ok(());
    }
    let mut resource = resource;
    for item in items {
        match insert(&mut item.children, resource, target, position) {
            Ok(()) => return Ok(()),
            Err(back) => resource = back,
        }
    }
    Err(resource)
}

/// The tree after a move, or `None` when the data forbids it: a row cannot
/// go into itself, into a disabled row, or into a file.
fn moved(items: &[SidebarResource], change: &ResourceMove) -> Option<Vec<SidebarResource>> {
    let source = find(items, &change.item_id)?;
    if source.disabled {
        return None;
    }
    if let Some(target) = &change.target_id {
        if source.contains(target) {
            return None;
        }
        let target = find(items, target)?;
        if change.position == DropPosition::Inside && (target.disabled || !target.can_contain()) {
            return None;
        }
    } else if change.position == DropPosition::Inside {
        return None;
    }

    let mut next = items.to_vec();
    let resource = remove(&mut next, &change.item_id)?;
    match &change.target_id {
        None => next.push(resource),
        Some(target) => insert(&mut next, resource, target, change.position).ok()?,
    }
    Some(next)
}

fn relabel(items: &mut [SidebarResource], id: &str, label: &SharedString) -> bool {
    items.iter_mut().any(|item| {
        if item.id.as_ref() == id {
            item.label = label.clone();
            true
        } else {
            relabel(&mut item.children, id, label)
        }
    })
}

/// What the sidebar reports. Each change is already applied when it is
/// emitted; call [`ResourceSidebar::set_items`] to put the old tree back.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ResourceSidebarEvent {
    Select(SharedString),
    Move(ResourceMove),
    Rename {
        id: SharedString,
        label: SharedString,
    },
}

/// The row a drag carries.
#[derive(Clone)]
struct DraggedResource {
    id: SharedString,
    label: SharedString,
}

/// The chip that follows the pointer during a drag.
struct DragChip {
    label: SharedString,
    at: Point<Pixels>,
}

impl Render for DragChip {
    fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        div().pl(self.at.x + px(12.)).pt(self.at.y).child(
            div()
                .px_2p5()
                .py_1()
                .rounded(Radius::Md.resolve(cx))
                .border_1()
                .border_color(cx.theme().border)
                .bg(cx.theme().popover)
                .text_sm()
                .text_color(cx.theme().popover_foreground)
                .child(self.label.clone()),
        )
    }
}

struct Renaming {
    id: SharedString,
    input: Entity<InputState>,
    _subscription: Subscription,
}

/// A resource tree for the app rail: nested rows that reorder by drag,
/// rename in place, carry a menu each and answer the keyboard.
///
/// ```ignore
/// let sidebar = cx.new(|cx| ResourceSidebar::new(items, cx).expanded(["notes"]));
/// cx.subscribe(&sidebar, |this, _, event, cx| match event {
///     ResourceSidebarEvent::Select(id) => this.open(id, cx),
///     _ => {}
/// })
/// .detach();
/// // in `render`: .child(sidebar.clone())
/// ```
pub struct ResourceSidebar {
    items: Vec<SidebarResource>,
    expanded: HashSet<SharedString>,
    selected: Option<SharedString>,
    focused: Option<SharedString>,
    renaming: Option<Renaming>,
    dragging: Option<SharedString>,
    drop_target: Option<(Option<SharedString>, DropPosition)>,
    menu: Option<MenuBuilder>,
    focus: FocusHandle,
}

impl EventEmitter<ResourceSidebarEvent> for ResourceSidebar {}

impl Focusable for ResourceSidebar {
    fn focus_handle(&self, _: &App) -> FocusHandle {
        self.focus.clone()
    }
}

impl ResourceSidebar {
    pub fn new(items: impl IntoIterator<Item = SidebarResource>, cx: &mut Context<Self>) -> Self {
        let items: Vec<SidebarResource> = items.into_iter().collect();
        Self {
            focused: items.first().map(|item| item.id.clone()),
            items,
            expanded: HashSet::new(),
            selected: None,
            renaming: None,
            dragging: None,
            drop_target: None,
            menu: None,
            focus: cx.focus_handle(),
        }
    }

    /// The row that starts selected.
    pub fn selected(mut self, id: impl Into<SharedString>) -> Self {
        let id = id.into();
        self.focused = Some(id.clone());
        self.selected = Some(id);
        self
    }

    /// The rows that start open.
    pub fn expanded<I: Into<SharedString>>(mut self, ids: impl IntoIterator<Item = I>) -> Self {
        self.expanded = ids.into_iter().map(Into::into).collect();
        self
    }

    /// Adds rows to each row's menu, under Rename.
    pub fn menu(
        mut self,
        builder: impl Fn(&SidebarResource, PopupMenu, &mut Window, &mut Context<PopupMenu>) -> PopupMenu
        + 'static,
    ) -> Self {
        self.menu = Some(Rc::new(builder));
        self
    }

    pub fn items(&self) -> &[SidebarResource] {
        &self.items
    }

    /// Replaces the tree, for new data or to undo a refused change.
    pub fn set_items(
        &mut self,
        items: impl IntoIterator<Item = SidebarResource>,
        cx: &mut Context<Self>,
    ) {
        self.items = items.into_iter().collect();
        cx.notify();
    }

    pub fn item(&self, id: &str) -> Option<&SidebarResource> {
        find(&self.items, id)
    }

    pub fn selected_id(&self) -> Option<&SharedString> {
        self.selected.as_ref()
    }

    pub fn focused_id(&self) -> Option<&SharedString> {
        self.focused.as_ref()
    }

    pub fn renaming_id(&self) -> Option<&SharedString> {
        self.renaming.as_ref().map(|renaming| &renaming.id)
    }

    pub fn is_expanded(&self, id: &str) -> bool {
        self.expanded.contains(id)
    }

    fn rows(&self) -> Vec<FlatRow> {
        let mut rows = Vec::new();
        flatten(&self.items, &self.expanded, 0, None, &mut rows);
        rows
    }

    pub fn select(&mut self, id: impl Into<SharedString>, cx: &mut Context<Self>) {
        let id = id.into();
        if self.item(&id).is_none_or(|item| item.disabled) {
            return;
        }
        self.focused = Some(id.clone());
        if self.selected.as_ref() != Some(&id) {
            self.selected = Some(id.clone());
            cx.emit(ResourceSidebarEvent::Select(id));
        }
        cx.notify();
    }

    pub fn expand(&mut self, id: impl Into<SharedString>, cx: &mut Context<Self>) {
        if self.expanded.insert(id.into()) {
            cx.notify();
        }
    }

    pub fn collapse(&mut self, id: &str, cx: &mut Context<Self>) {
        if self.expanded.remove(id) {
            cx.notify();
        }
    }

    pub fn toggle_expanded(&mut self, id: impl Into<SharedString>, cx: &mut Context<Self>) {
        let id = id.into();
        if !self.expanded.remove(&id) {
            self.expanded.insert(id);
        }
        cx.notify();
    }

    pub fn expand_all(&mut self, cx: &mut Context<Self>) {
        expandable(&self.items, &mut self.expanded);
        cx.notify();
    }

    pub fn collapse_all(&mut self, cx: &mut Context<Self>) {
        self.expanded.clear();
        cx.notify();
    }

    /// Opens every ancestor of `id` and leaves the rest of the tree alone.
    pub fn reveal(&mut self, id: &str, cx: &mut Context<Self>) {
        self.expanded.extend(ancestors(&self.items, id));
        cx.notify();
    }

    /// Moves the keyboard's place to a row.
    pub fn focus_row(&mut self, id: impl Into<SharedString>, cx: &mut Context<Self>) {
        self.focused = Some(id.into());
        cx.notify();
    }

    /// Turns a row's label into a field. Enter or leaving the field commits
    /// it; Escape drops it.
    pub fn start_rename(
        &mut self,
        id: impl Into<SharedString>,
        window: &mut Window,
        cx: &mut Context<Self>,
    ) {
        let id = id.into();
        let Some(item) = self.item(&id).filter(|item| !item.disabled) else {
            return;
        };
        let label = item.label.clone();
        let input = cx.new(|cx| InputState::new(window, cx).default_value(label));
        input.update(cx, |input, cx| {
            input.focus(window, cx);
            input.select_all(window, cx);
        });
        let subscription = cx.subscribe_in(
            &input,
            window,
            |this, input, event: &InputEvent, window, cx| {
                if matches!(event, InputEvent::PressEnter { .. } | InputEvent::Blur) {
                    let Some(renaming) = this.renaming.take() else {
                        return;
                    };
                    let label = input.read(cx).value();
                    this.rename(renaming.id, label, cx);
                    if matches!(event, InputEvent::PressEnter { .. }) {
                        this.focus.focus(window, cx);
                    }
                }
            },
        );
        self.focused = Some(id.clone());
        self.renaming = Some(Renaming {
            id,
            input,
            _subscription: subscription,
        });
        cx.notify();
    }

    pub fn cancel_rename(&mut self, window: &mut Window, cx: &mut Context<Self>) {
        if self.renaming.take().is_some() {
            self.focus.focus(window, cx);
            cx.notify();
        }
    }

    /// Relabels a row. A blank or unchanged label is dropped.
    pub fn rename(
        &mut self,
        id: impl Into<SharedString>,
        label: impl Into<SharedString>,
        cx: &mut Context<Self>,
    ) {
        let id = id.into();
        let label: SharedString = label.into().trim().to_string().into();
        if self
            .renaming
            .as_ref()
            .is_some_and(|renaming| renaming.id == id)
        {
            self.renaming = None;
        }
        cx.notify();
        let unchanged = self.item(&id).is_none_or(|item| item.label == label);
        if label.is_empty() || unchanged {
            return;
        }
        relabel(&mut self.items, &id, &label);
        cx.emit(ResourceSidebarEvent::Rename { id, label });
    }

    /// Reorders the tree. Returns `false`, changing nothing, when the data
    /// forbids the move.
    pub fn move_resource(&mut self, change: ResourceMove, cx: &mut Context<Self>) -> bool {
        let Some(next) = moved(&self.items, &change) else {
            return false;
        };
        if next == self.items {
            return false;
        }
        self.items = next;
        if change.position == DropPosition::Inside
            && let Some(target) = &change.target_id
        {
            self.expanded.insert(target.clone());
        }
        self.focused = Some(change.item_id.clone());
        cx.emit(ResourceSidebarEvent::Move(change));
        cx.notify();
        true
    }

    fn finish_drag(&mut self, dragged: &DraggedResource, cx: &mut Context<Self>) {
        self.dragging = None;
        if let Some((target_id, position)) = self.drop_target.take() {
            self.move_resource(
                ResourceMove {
                    item_id: dragged.id.clone(),
                    target_id,
                    position,
                },
                cx,
            );
        }
        cx.notify();
    }

    fn hover_drop(
        &mut self,
        row: &FlatRow,
        event: &DragMoveEvent<DraggedResource>,
        cx: &mut Context<Self>,
    ) {
        let at = event.event.position;
        if !event.bounds.contains(&at) {
            return;
        }
        let dragged = event.drag(cx).id.clone();
        let own = self
            .item(&dragged)
            .is_some_and(|source| source.contains(&row.item.id));
        let target = if own {
            None
        } else {
            let ratio = (at.y - event.bounds.top()) / event.bounds.size.height;
            let inside =
                !row.item.disabled && row.item.can_contain() && (0.25..=0.75).contains(&ratio);
            let position = if inside {
                DropPosition::Inside
            } else if ratio < 0.5 {
                DropPosition::Before
            } else {
                DropPosition::After
            };
            Some((Some(row.item.id.clone()), position))
        };
        if self.drop_target != target {
            self.drop_target = target;
            cx.notify();
        }
    }

    fn key_down(&mut self, event: &KeyDownEvent, window: &mut Window, cx: &mut Context<Self>) {
        if self.renaming.is_some() {
            return;
        }
        let rows = self.rows();
        let Some(index) = self
            .focused
            .as_ref()
            .and_then(|id| rows.iter().position(|row| &row.item.id == id))
            .or((!rows.is_empty()).then_some(0))
        else {
            return;
        };
        let row = &rows[index];
        let previous = index.checked_sub(1).map(|index| &rows[index]);
        let next = rows.get(index + 1);
        let keys = &event.keystroke;
        let moving = keys.modifiers.alt && keys.modifiers.shift;
        let id = row.item.id.clone();
        let reorder = |target: &SharedString, position| ResourceMove {
            item_id: id.clone(),
            target_id: Some(target.clone()),
            position,
        };

        let handled = match keys.key.as_str() {
            "home" => {
                self.focus_row(rows[0].item.id.clone(), cx);
                true
            }
            "end" => {
                self.focus_row(rows[rows.len() - 1].item.id.clone(), cx);
                true
            }
            "down" if !moving => {
                if let Some(next) = next {
                    self.focus_row(next.item.id.clone(), cx);
                }
                true
            }
            "up" if !moving => {
                if let Some(previous) = previous {
                    self.focus_row(previous.item.id.clone(), cx);
                }
                true
            }
            "left" if row.item.disabled || !moving && !self.is_expanded(&id) => {
                if let Some(parent) = &row.parent {
                    self.focus_row(parent.clone(), cx);
                }
                true
            }
            _ if row.item.disabled => false,
            "up" => {
                if let Some(previous) = previous {
                    self.move_resource(reorder(&previous.item.id, DropPosition::Before), cx);
                }
                true
            }
            "down" => {
                if let Some(below) = row_below(&rows, index) {
                    self.move_resource(reorder(&below.item.id, DropPosition::After), cx);
                }
                true
            }
            "right" if moving => {
                if let Some(previous) = previous.filter(|row| row.item.can_contain()) {
                    self.move_resource(reorder(&previous.item.id, DropPosition::Inside), cx);
                }
                true
            }
            "left" if moving => {
                if let Some(parent) = &row.parent {
                    self.move_resource(reorder(parent, DropPosition::After), cx);
                }
                true
            }
            "left" => {
                self.collapse(&id, cx);
                true
            }
            "right" if row.item.can_contain() => {
                if !self.is_expanded(&id) {
                    self.expand(id.clone(), cx);
                } else if let Some(next) = next.filter(|next| next.parent.as_ref() == Some(&id)) {
                    self.focus_row(next.item.id.clone(), cx);
                }
                true
            }
            "enter" | "space" => {
                if row.item.can_contain() {
                    self.toggle_expanded(id.clone(), cx);
                } else {
                    self.select(id.clone(), cx);
                }
                true
            }
            "f2" => {
                self.start_rename(id.clone(), window, cx);
                true
            }
            _ => false,
        };
        if handled {
            cx.stop_propagation();
        }
    }

    fn render_row(
        &self,
        row: FlatRow,
        dragging: Option<&SharedString>,
        window: &mut Window,
        cx: &mut Context<Self>,
    ) -> AnyElement {
        let theme = cx.theme();
        let (primary, muted, foreground, hover, ring) = (
            theme.primary,
            theme.muted_foreground,
            theme.foreground,
            theme.accent,
            theme.ring,
        );
        let (dark, primary_foreground) = (theme.is_dark(), theme.primary_foreground);
        let radius = Radius::Md.resolve(cx);
        let id = row.item.id.clone();
        let item = &row.item;
        let container = item.can_contain();
        let expanded = self.is_expanded(&id);
        let active = !container && self.selected.as_ref() == Some(&id);
        let focused = self.focused.as_ref() == Some(&id) && self.focus.is_focused(window);
        let renaming = self
            .renaming
            .as_ref()
            .filter(|renaming| renaming.id == id)
            .map(|renaming| renaming.input.clone());
        let drop = self
            .drop_target
            .as_ref()
            .filter(|(target, _)| target.as_ref() == Some(&id) && dragging.is_some())
            .map(|(_, position)| *position);
        let group: SharedString = format!("resource-{id}").into();

        let icon = match item.kind {
            ResourceKind::Folder | ResourceKind::Project if expanded => LucideIcon::FolderOpen,
            ResourceKind::Folder | ResourceKind::Project => LucideIcon::Folder,
            ResourceKind::Bookmark => LucideIcon::Bookmark,
            ResourceKind::File => LucideIcon::FileText,
        };
        let turn = transition(
            (ElementId::from(id.clone()), "turn"),
            if expanded { 1. } else { 0. },
            Transition::new(DURATION_QUICK).easing(EASE_SMOOTH_OUT.easing()),
            window,
            cx,
        );
        let bar = |top: bool| {
            div()
                .absolute()
                .left_2()
                .right_2()
                .h(px(2.))
                .rounded_full()
                .bg(primary)
                .map(|this| {
                    if top {
                        this.top(px(-1.))
                    } else {
                        this.bottom(px(-1.))
                    }
                })
        };

        let mut line = h_flex()
            .id(ElementId::from(id.clone()))
            .group(group.clone())
            .relative()
            .h(px(ROW_HEIGHT))
            .min_w_0()
            .gap_2p5()
            .pl(px(12. + row.depth as f32 * INDENT))
            .pr_3()
            .rounded(radius)
            .border_1()
            .border_color(gpui_kit::transparent_black())
            .text_sm()
            .text_color(muted)
            .when(focused, |this| this.border_color(ring))
            .when(active, |this| {
                if dark {
                    this.bg(primary.opacity(0.25))
                        .text_color(primary_foreground)
                } else {
                    this.bg(primary.opacity(0.1)).text_color(primary)
                }
            })
            .when(dragging == Some(&id), |this| this.opacity(0.4))
            .when(drop == Some(DropPosition::Inside), |this| {
                this.bg(primary.opacity(0.1))
                    .border_color(primary.opacity(0.45))
            })
            .when(drop == Some(DropPosition::Before), |this| {
                this.child(bar(true))
            })
            .when(drop == Some(DropPosition::After), |this| {
                this.child(bar(false))
            })
            .child(Icon::new(icon).small().flex_none());

        if item.disabled {
            line = line.opacity(0.45).cursor_not_allowed();
        } else if renaming.is_none() {
            let clicked = id.clone();
            let dragged = DraggedResource {
                id: id.clone(),
                label: item.label.clone(),
            };
            let weak = cx.weak_entity();
            line = line
                .cursor_pointer()
                .when(!active, |this| {
                    this.hover(move |this| this.bg(hover).text_color(foreground))
                })
                .on_click(cx.listener(move |this, event: &ClickEvent, window, cx| {
                    this.focus.focus(window, cx);
                    let Some(item) = this.item(&clicked) else {
                        return;
                    };
                    if item.can_contain() {
                        this.focused = Some(clicked.clone());
                        this.toggle_expanded(clicked.clone(), cx);
                    } else if event.click_count() == 2 {
                        this.start_rename(clicked.clone(), window, cx);
                    } else {
                        this.select(clicked.clone(), cx);
                    }
                }))
                .on_drag(dragged, move |dragged, at, _, cx| {
                    started(&weak, &dragged.id, cx);
                    cx.new(|_| DragChip {
                        label: dragged.label.clone(),
                        at,
                    })
                });
        }

        let hovered = row.clone();
        line = line
            .on_drag_move(cx.listener(
                move |this, event: &DragMoveEvent<DraggedResource>, _, cx| {
                    this.hover_drop(&hovered, event, cx);
                },
            ))
            .on_drop(cx.listener(|this, dragged: &DraggedResource, _, cx| {
                this.finish_drag(dragged, cx);
            }));

        line = match renaming {
            Some(input) => line.child(
                div()
                    .flex_1()
                    .min_w_0()
                    .text_color(foreground)
                    .capture_key_down(cx.listener(|this, event: &KeyDownEvent, window, cx| {
                        if event.keystroke.key == "escape" {
                            this.cancel_rename(window, cx);
                            cx.stop_propagation();
                        }
                    }))
                    .child(Input::new(&input).appearance(false).small()),
            ),
            None => line.child(
                div()
                    .flex_1()
                    .min_w_0()
                    .truncate()
                    .child(item.label.clone()),
            ),
        };

        if renaming_free(self, &id) && !item.disabled {
            let weak = cx.weak_entity();
            let menu = self.menu.clone();
            let resource = item.clone();
            let actions = StockButton::new(ElementId::Name(format!("actions-{id}").into()))
                .ghost()
                .xsmall()
                .icon(Icon::new(LucideIcon::Ellipsis))
                .tooltip(format!("Actions for {}", item.label))
                .dropdown_menu(move |mut popup, window, cx| {
                    let weak = weak.clone();
                    let target = resource.id.clone();
                    popup = popup.item(
                        PopupMenuItem::new("Rename")
                            .icon(Icon::new(LucideIcon::Pencil))
                            .on_click(move |_, window, cx| {
                                weak.update(cx, |this, cx| {
                                    this.start_rename(target.clone(), window, cx);
                                })
                                .ok();
                            }),
                    );
                    match &menu {
                        Some(menu) => menu(&resource, popup, window, cx),
                        None => popup,
                    }
                });
            line = line.child(
                div()
                    .id(ElementId::Name(format!("actions-slot-{id}").into()))
                    .flex_none()
                    .invisible()
                    .group_hover(group, |this| this.visible())
                    // A press on the button is not a press on the row.
                    .on_click(|_, _, cx| cx.stop_propagation())
                    .child(actions),
            );
        }

        if row.depth == 0 && container && !item.children.is_empty() {
            line = line.child(
                Icon::new(LucideIcon::ChevronRight)
                    .xsmall()
                    .flex_none()
                    .text_color(muted)
                    .rotate(radians(turn * FRAC_PI_2)),
            );
        }
        line.into_any_element()
    }
}

/// Whether the row shows its label, not a rename field.
fn renaming_free(sidebar: &ResourceSidebar, id: &SharedString) -> bool {
    sidebar.renaming_id() != Some(id)
}

fn started(sidebar: &WeakEntity<ResourceSidebar>, id: &SharedString, cx: &mut App) {
    sidebar
        .update(cx, |this, cx| {
            if this.dragging.as_ref() != Some(id) {
                this.dragging = Some(id.clone());
                this.drop_target = None;
                cx.notify();
            }
        })
        .ok();
}

impl Render for ResourceSidebar {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        // A drag let go outside the tree ends without a drop.
        if !cx.has_active_drag() {
            self.dragging = None;
            self.drop_target = None;
        }
        let dragging = self.dragging.clone();
        let top_level = dragging.is_some() && matches!(self.drop_target, Some((None, _)));
        let (border, primary, muted, foreground) = (
            cx.theme().border,
            cx.theme().primary,
            cx.theme().muted_foreground,
            cx.theme().foreground,
        );
        let radius = Radius::Md.resolve(cx);
        let rows: Vec<AnyElement> = self
            .rows()
            .into_iter()
            .map(|row| self.render_row(row, dragging.as_ref(), window, cx))
            .collect();

        v_flex()
            .id("resource-sidebar")
            .track_focus(&self.focus)
            .on_key_down(cx.listener(Self::key_down))
            .min_w_0()
            .gap_0p5()
            .children(rows)
            .when(dragging.is_some(), |this| {
                this.child(
                    h_flex()
                        .id("resource-top-level")
                        .h(px(ROW_HEIGHT - 4.))
                        .mx_1()
                        .justify_center()
                        .rounded(radius)
                        .border_1()
                        .border_dashed()
                        .border_color(border)
                        .text_xs()
                        .text_color(muted)
                        .when(top_level, |this| {
                            this.border_color(primary.opacity(0.5))
                                .bg(primary.opacity(0.1))
                                .text_color(foreground)
                        })
                        .on_drag_move(cx.listener(
                            |this, event: &DragMoveEvent<DraggedResource>, _, cx| {
                                let target = Some((None, DropPosition::After));
                                if event.bounds.contains(&event.event.position)
                                    && this.drop_target != target
                                {
                                    this.drop_target = target;
                                    cx.notify();
                                }
                            },
                        ))
                        .on_drop(cx.listener(|this, dragged: &DraggedResource, _, cx| {
                            this.finish_drag(dragged, cx);
                        }))
                        .child("Move to top level"),
                )
            })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn tree() -> Vec<SidebarResource> {
        vec![
            SidebarResource::new("notes", "Notes", ResourceKind::Folder).children([
                SidebarResource::new("draft", "Draft", ResourceKind::File),
                SidebarResource::new("old", "Old", ResourceKind::Folder)
                    .children([SidebarResource::new("memo", "Memo", ResourceKind::File)]),
            ]),
            SidebarResource::new("john", "John 3:16", ResourceKind::Bookmark),
            SidebarResource::new("locked", "Locked", ResourceKind::Folder).disabled(true),
        ]
    }

    fn ids(items: &[SidebarResource], expanded: &[&'static str]) -> Vec<String> {
        let expanded = expanded.iter().map(|id| SharedString::from(*id)).collect();
        let mut rows = Vec::new();
        flatten(items, &expanded, 0, None, &mut rows);
        rows.iter()
            .map(|row| format!("{}{}", "·".repeat(row.depth), row.item.id))
            .collect()
    }

    fn change(
        item: &'static str,
        target: Option<&'static str>,
        position: DropPosition,
    ) -> ResourceMove {
        ResourceMove {
            item_id: item.into(),
            target_id: target.map(Into::into),
            position,
        }
    }

    #[test]
    fn only_open_rows_show_their_children() {
        assert_eq!(ids(&tree(), &[]), ["notes", "john", "locked"]);
        assert_eq!(
            ids(&tree(), &["notes", "old"]),
            ["notes", "·draft", "·old", "··memo", "john", "locked"]
        );
        assert_eq!(ancestors(&tree(), "memo"), ["notes", "old"]);
    }

    #[test]
    fn a_move_lands_before_inside_after_or_at_the_end() {
        let all = ["notes", "old"];
        let next = moved(
            &tree(),
            &change("john", Some("draft"), DropPosition::Before),
        )
        .unwrap();
        assert_eq!(ids(&next, &all)[..3], ["notes", "·john", "·draft"]);
        let next = moved(&tree(), &change("john", Some("old"), DropPosition::Inside)).unwrap();
        assert_eq!(ids(&next, &all)[2..5], ["·old", "··memo", "··john"]);
        let next = moved(&tree(), &change("memo", None, DropPosition::After)).unwrap();
        assert_eq!(ids(&next, &all).last().unwrap(), "memo");
    }

    #[test]
    fn a_move_down_skips_the_rows_inside_the_one_moved() {
        let expanded = ["notes", "old"].map(SharedString::from).into();
        let mut rows = Vec::new();
        flatten(&tree(), &expanded, 0, None, &mut rows);
        let below = |index: usize| row_below(&rows, index).map(|row| row.item.id.as_ref());
        // notes, ·draft, ·old, ··memo, john, locked
        assert_eq!(below(0), Some("john"), "past all of the open folder");
        assert_eq!(below(1), Some("old"), "a file takes the very next row");
        assert_eq!(below(2), Some("john"), "past the nested folder's file");
        assert_eq!(below(rows.len() - 1), None);
    }

    #[test]
    fn forbidden_moves_change_nothing() {
        // Into itself, into a file, into a disabled folder, and a disabled row.
        assert!(moved(&tree(), &change("notes", Some("old"), DropPosition::Inside)).is_none());
        assert!(
            moved(
                &tree(),
                &change("draft", Some("john"), DropPosition::Inside)
            )
            .is_none()
        );
        assert!(
            moved(
                &tree(),
                &change("john", Some("locked"), DropPosition::Inside)
            )
            .is_none()
        );
        assert!(
            moved(
                &tree(),
                &change("locked", Some("john"), DropPosition::Before)
            )
            .is_none()
        );
    }
}
