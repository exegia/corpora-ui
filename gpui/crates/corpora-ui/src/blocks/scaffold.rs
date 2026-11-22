//! The workspace scaffold: `react/src/components/blocks/scaffold`.
//!
//! An icon rail, a row of up to three panels with a tab each, and an
//! inspector drawer. The canvas hides panels it cannot give their floor,
//! oldest activation first, and brings them back when room returns.

use std::collections::HashMap;
use std::rc::Rc;
use std::time::Duration;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::base::motion::{Transition, transition};
use gpui_kit::component::{ActiveTheme as _, Icon, Sizable as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    AnyElement, App, ClickEvent, Context, CursorStyle, ElementId, Entity, EventEmitter,
    InteractiveElement as _, IntoElement, MouseButton, ParentElement as _, Pixels, RenderOnce,
    SharedString, StatefulInteractiveElement as _, Styled as _, Window, canvas, div, px,
};

use crate::atoms::{Button, GlassSpec, GlassSurfaceExt as _};
use crate::foundations::Radius;
use crate::foundations::motion::{DURATION_FAST, EASE_SMOOTH_OUT};

type ClickHandler = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App)>;

/// Width of the icon rail.
const SIDEBAR_WIDTH: f32 = 64.;
/// The inspector drawer's width before a drag changes it.
const INSPECTOR_WIDTH: f32 = 272.;
const INSPECTOR_MIN_WIDTH: f32 = 180.;
/// The most panels the canvas holds at once.
pub const SCAFFOLD_PANEL_CAPACITY: usize = 3;
/// The narrowest a panel is drawn.
const PANEL_MIN_WIDTH: f32 = 320.;
const CANVAS_GAP: f32 = 8.;
const EDGE_GUTTER: f32 = 10.;
/// Room above the canvas for the tabs.
const HEADER_HEIGHT: f32 = 52.;
/// Height of a panel's secondary strip while it is not the expanded one.
const SECONDARY_HEIGHT: f32 = 52.;
const PANEL_GAP: f32 = 10.;

/// How many panels fit side by side on a canvas of `width`. An unmeasured
/// canvas fits the cap.
fn panel_capacity(width: Option<f32>) -> usize {
    let Some(width) = width else {
        return SCAFFOLD_PANEL_CAPACITY;
    };
    let fits = ((width + CANVAS_GAP) / (PANEL_MIN_WIDTH + CANVAS_GAP)).floor() as usize;
    fits.clamp(1, SCAFFOLD_PANEL_CAPACITY)
}

/// Which panels show. `visible` runs from the least recently activated, the
/// next to give way, to the newest. `auto_hidden` return on their own when
/// room comes back; `user_hidden` wait for their tab.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
struct Visibility {
    visible: Vec<SharedString>,
    auto_hidden: Vec<SharedString>,
    user_hidden: Vec<SharedString>,
}

impl Visibility {
    fn hides(&self, id: &SharedString) -> bool {
        self.auto_hidden.contains(id) || self.user_hidden.contains(id)
    }

    /// Drops panels that left, admits new ones, hides the oldest past
    /// capacity and restores hidden ones when there is room.
    fn settle(mut self, ids: &[SharedString], capacity: usize) -> Self {
        for list in [
            &mut self.visible,
            &mut self.auto_hidden,
            &mut self.user_hidden,
        ] {
            list.retain(|id| ids.contains(id));
        }
        for id in ids {
            if !self.visible.contains(id) && !self.hides(id) {
                self.visible.push(id.clone());
            }
        }
        while self.visible.len() > capacity && self.visible.len() > 1 {
            self.auto_hidden.push(self.visible.remove(0));
        }
        while self.visible.len() < capacity
            && let Some(id) = self.auto_hidden.pop()
        {
            self.visible.push(id);
        }
        self
    }

    /// Shows or hides a panel from its tab. The last visible panel stays.
    fn toggle(mut self, id: &SharedString, ids: &[SharedString], capacity: usize) -> Self {
        if !ids.contains(id) {
            return self;
        }
        if self.hides(id) {
            self.auto_hidden.retain(|other| other != id);
            self.user_hidden.retain(|other| other != id);
            self.visible.push(id.clone());
        } else if self.visible.len() > 1 {
            self.visible.retain(|other| other != id);
            self.user_hidden.push(id.clone());
        }
        self.settle(ids, capacity)
    }
}

#[derive(Clone, Copy, Debug, Default, PartialEq)]
struct PanelLayout {
    width: Option<f32>,
    secondary_expanded: bool,
    swapped: bool,
}

/// What the scaffold reports.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ScaffoldEvent {
    /// The inspector opened or closed.
    Inspector(bool),
    /// A tab showed or hid its panel.
    Panel { id: SharedString, hidden: bool },
}

#[derive(Clone, PartialEq)]
enum Grip {
    Inspector,
    /// A panel's edge; `true` when the grip sits on its trailing side.
    Panel(SharedString, bool),
}

struct Resize {
    grip: Grip,
    from: Pixels,
    width: f32,
}

/// One scaffold's state: which panels show and how they are laid out, and
/// whether the inspector is open.
pub struct Scaffold {
    ids: Vec<SharedString>,
    visibility: Visibility,
    canvas: Option<f32>,
    layouts: HashMap<SharedString, PanelLayout>,
    inspector_open: bool,
    inspector_width: f32,
    hovered: Option<SharedString>,
    resize: Option<Resize>,
}

impl EventEmitter<ScaffoldEvent> for Scaffold {}

impl Default for Scaffold {
    fn default() -> Self {
        Self::new()
    }
}

impl Scaffold {
    pub fn new() -> Self {
        Self {
            ids: Vec::new(),
            visibility: Visibility::default(),
            canvas: None,
            layouts: HashMap::new(),
            inspector_open: false,
            inspector_width: INSPECTOR_WIDTH,
            hovered: None,
            resize: None,
        }
    }

    pub fn inspector_open(mut self, open: bool) -> Self {
        self.inspector_open = open;
        self
    }

    pub fn is_inspector_open(&self) -> bool {
        self.inspector_open
    }

    pub fn set_inspector_open(&mut self, open: bool, cx: &mut Context<Self>) {
        if self.inspector_open != open {
            self.inspector_open = open;
            cx.emit(ScaffoldEvent::Inspector(open));
            cx.notify();
        }
    }

    pub fn toggle_inspector(&mut self, cx: &mut Context<Self>) {
        self.set_inspector_open(!self.inspector_open, cx);
    }

    pub fn inspector_width(&self) -> f32 {
        self.inspector_width
    }

    pub fn resize_inspector(&mut self, width: f32, cx: &mut Context<Self>) {
        let max = self
            .canvas
            .map_or(f32::MAX, |canvas| (canvas * 0.9).max(INSPECTOR_MIN_WIDTH));
        self.inspector_width = width.clamp(INSPECTOR_MIN_WIDTH, max);
        cx.notify();
    }

    /// How many panels fit side by side right now.
    pub fn capacity(&self) -> usize {
        panel_capacity(self.canvas)
    }

    /// Whether a panel is hidden, by its tab or for want of room.
    pub fn is_hidden(&self, id: &str) -> bool {
        let id = SharedString::from(id.to_string());
        self.visibility.hides(&id)
    }

    /// The hidden panels, in the order the layout lists them.
    pub fn hidden_ids(&self) -> Vec<SharedString> {
        self.ids
            .iter()
            .filter(|id| self.visibility.hides(id))
            .cloned()
            .collect()
    }

    /// Shows or hides a panel. Showing one past capacity hides the least
    /// recently activated panel in its place; the last visible one stays.
    pub fn toggle_panel(&mut self, id: impl Into<SharedString>, cx: &mut Context<Self>) {
        let id = id.into();
        let next = self
            .visibility
            .clone()
            .toggle(&id, &self.ids, self.capacity());
        if next != self.visibility {
            self.visibility = next;
            let hidden = self.visibility.hides(&id);
            cx.emit(ScaffoldEvent::Panel { id, hidden });
            cx.notify();
        }
    }

    pub fn resize_panel(
        &mut self,
        id: impl Into<SharedString>,
        width: f32,
        cx: &mut Context<Self>,
    ) {
        self.layouts.entry(id.into()).or_default().width = Some(width.max(PANEL_MIN_WIDTH));
        cx.notify();
    }

    /// Whether a panel's two cards have traded places.
    pub fn is_swapped(&self, id: &str) -> bool {
        self.layout(id).swapped
    }

    pub fn set_swapped(
        &mut self,
        id: impl Into<SharedString>,
        swapped: bool,
        cx: &mut Context<Self>,
    ) {
        self.layouts.entry(id.into()).or_default().swapped = swapped;
        cx.notify();
    }

    /// Whether a panel's secondary card holds the tall slot.
    pub fn is_secondary_expanded(&self, id: &str) -> bool {
        self.layout(id).secondary_expanded
    }

    pub fn set_secondary_expanded(
        &mut self,
        id: impl Into<SharedString>,
        expanded: bool,
        cx: &mut Context<Self>,
    ) {
        self.layouts
            .entry(id.into())
            .or_default()
            .secondary_expanded = expanded;
        cx.notify();
    }

    /// Forgets every width, swap and hidden panel, and shuts the inspector.
    pub fn reset(&mut self, cx: &mut Context<Self>) {
        self.layouts.clear();
        self.inspector_width = INSPECTOR_WIDTH;
        self.visibility = Visibility::default().settle(&self.ids, self.capacity());
        self.set_inspector_open(false, cx);
        cx.notify();
    }

    fn layout(&self, id: &str) -> PanelLayout {
        self.layouts
            .get(&SharedString::from(id.to_string()))
            .copied()
            .unwrap_or_default()
    }

    /// Takes the canvas width and the panels the layout drew this frame.
    fn measure(&mut self, canvas: f32, ids: &[SharedString], cx: &mut Context<Self>) {
        if self.canvas == Some(canvas) && self.ids == ids {
            return;
        }
        self.canvas = Some(canvas);
        self.ids = ids.to_vec();
        self.visibility = self.visibility.clone().settle(ids, self.capacity());
        cx.notify();
    }
}

/// A panel of the canvas: a card, and optionally a second card under it.
pub struct ScaffoldPanel {
    id: SharedString,
    content: AnyElement,
    secondary: Option<AnyElement>,
    on_swap: Option<ClickHandler>,
    on_close_secondary: Option<ClickHandler>,
}

impl ScaffoldPanel {
    pub fn new(id: impl Into<SharedString>, content: impl IntoElement) -> Self {
        Self {
            id: id.into(),
            content: content.into_any_element(),
            secondary: None,
            on_swap: None,
            on_close_secondary: None,
        }
    }

    /// A second card under the first. It starts as a short strip.
    pub fn secondary(mut self, content: impl IntoElement) -> Self {
        self.secondary = Some(content.into_any_element());
        self
    }

    /// Called after the two cards trade places. The scaffold records the swap.
    pub fn on_swap(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_swap = Some(Rc::new(handler));
        self
    }

    /// Shows a Close command between the cards. Drop the secondary card here.
    pub fn on_close_secondary(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_close_secondary = Some(Rc::new(handler));
        self
    }
}

/// A panel's tab above the canvas. Its label shows or hides the panel.
pub struct ScaffoldTab {
    panel_id: SharedString,
    label: SharedString,
    on_close: Option<ClickHandler>,
}

impl ScaffoldTab {
    pub fn new(panel_id: impl Into<SharedString>, label: impl Into<SharedString>) -> Self {
        Self {
            panel_id: panel_id.into(),
            label: label.into(),
            on_close: None,
        }
    }

    /// Shows the tab's close button. Leave it off the last panel's tab.
    pub fn on_close(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_close = Some(Rc::new(handler));
        self
    }
}

/// The scaffold's frame.
///
/// ```ignore
/// ScaffoldLayout::new("workspace", &scaffold)
///     .sidebar(rail)
///     .tab(ScaffoldTab::new("text", "Text"))
///     .panel(ScaffoldPanel::new("text", reader).secondary(notes))
///     .on_add(cx.listener(Self::add_panel))
///     .inspector("Inspector", details)
/// ```
#[derive(IntoElement)]
pub struct ScaffoldLayout {
    id: ElementId,
    scaffold: Entity<Scaffold>,
    sidebar: Option<AnyElement>,
    tabs: Vec<ScaffoldTab>,
    panels: Vec<ScaffoldPanel>,
    on_add: Option<ClickHandler>,
    add_label: SharedString,
    inspector: Option<(SharedString, AnyElement)>,
}

impl ScaffoldLayout {
    pub fn new(id: impl Into<ElementId>, scaffold: &Entity<Scaffold>) -> Self {
        Self {
            id: id.into(),
            scaffold: scaffold.clone(),
            sidebar: None,
            tabs: Vec::new(),
            panels: Vec::new(),
            on_add: None,
            add_label: "Panel".into(),
            inspector: None,
        }
    }

    /// The icon rail at the leading edge.
    pub fn sidebar(mut self, sidebar: impl IntoElement) -> Self {
        self.sidebar = Some(sidebar.into_any_element());
        self
    }

    pub fn tab(mut self, tab: ScaffoldTab) -> Self {
        self.tabs.push(tab);
        self
    }

    pub fn panel(mut self, panel: ScaffoldPanel) -> Self {
        self.panels.push(panel);
        self
    }

    /// Shows the Add button after the tabs. Leave it off once the canvas
    /// holds [`SCAFFOLD_PANEL_CAPACITY`] panels.
    pub fn on_add(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_add = Some(Rc::new(handler));
        self
    }

    pub fn add_label(mut self, label: impl Into<SharedString>) -> Self {
        self.add_label = label.into();
        self
    }

    /// The drawer that slides over the trailing edge, under a title.
    pub fn inspector(mut self, name: impl Into<SharedString>, content: impl IntoElement) -> Self {
        self.inspector = Some((name.into(), content.into_any_element()));
        self
    }
}

fn named(id: &ElementId, name: impl Into<SharedString>) -> ElementId {
    ElementId::NamedChild(std::sync::Arc::new(id.clone()), name.into())
}

/// The width each visible panel takes. The middle of three, or else the
/// last, fills what the others leave; the rest keep a dragged width inside
/// what every panel's floor allows. Returns the widths and the fill's index.
fn panel_widths(
    canvas: f32,
    requested: &[Option<f32>],
    resizing: Option<usize>,
) -> (Vec<f32>, usize) {
    let count = requested.len();
    let fill = if count > 2 {
        count / 2
    } else {
        (0..count)
            .rev()
            .find(|index| Some(*index) != resizing)
            .unwrap_or(0)
    };
    let free = canvas - CANVAS_GAP * count.saturating_sub(1) as f32;
    let equal = (free / count.max(1) as f32).max(PANEL_MIN_WIDTH);
    let mut spare = (free - PANEL_MIN_WIDTH * count as f32).max(0.);
    let mut widths = vec![PANEL_MIN_WIDTH; count];
    for (index, request) in requested.iter().enumerate() {
        if index == fill {
            continue;
        }
        let extra = (request.unwrap_or(equal) - PANEL_MIN_WIDTH).clamp(0., spare);
        widths[index] += extra;
        spare -= extra;
    }
    if count > 0 {
        widths[fill] += spare;
    }
    (widths, fill)
}

impl RenderOnce for ScaffoldLayout {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let state = self.scaffold.read(cx);
        let theme = cx.theme();
        let (page, surface, border, muted, foreground, strip) = (
            theme.sidebar,
            theme.background,
            theme.border,
            theme.muted_foreground,
            theme.foreground,
            theme.warning.opacity(0.2),
        );
        let radius = Radius::Md.resolve(cx);
        let ids: Vec<SharedString> = self.panels.iter().map(|panel| panel.id.clone()).collect();
        let hides = |id: &SharedString| state.visibility.hides(id);
        let hovered = state.hovered.clone().filter(|id| ids.contains(id));
        let inspector_open = state.inspector_open && self.inspector.is_some();
        let inspector_width = state.inspector_width;
        let resizing = state.resize.as_ref().map(|resize| resize.grip.clone());

        let shown: Vec<&ScaffoldPanel> = self
            .panels
            .iter()
            .filter(|panel| !hides(&panel.id))
            .collect();
        let requested: Vec<Option<f32>> = shown
            .iter()
            .map(|panel| state.layouts.get(&panel.id).and_then(|layout| layout.width))
            .collect();
        let resizing_panel = shown
            .iter()
            .position(|panel| matches!(&resizing, Some(Grip::Panel(id, _)) if *id == panel.id));
        let canvas_width = state
            .canvas
            .unwrap_or(PANEL_MIN_WIDTH * shown.len().max(1) as f32);
        let (widths, fill) = panel_widths(canvas_width, &requested, resizing_panel);
        let layouts: Vec<PanelLayout> = shown
            .iter()
            .map(|panel| state.layouts.get(&panel.id).copied().unwrap_or_default())
            .collect();
        let hidden_tabs: Vec<bool> = self.tabs.iter().map(|tab| hides(&tab.panel_id)).collect();

        let timing = |duration| Transition::new(duration).easing(EASE_SMOOTH_OUT.easing());
        let slide = transition(
            (self.id.clone(), "inspector"),
            if inspector_open { 1. } else { 0. },
            timing(DURATION_FAST),
            window,
            cx,
        );
        let drawer = transition(
            (self.id.clone(), "inspector-width"),
            inspector_width,
            timing(if resizing.is_some() {
                Duration::ZERO
            } else {
                DURATION_FAST
            }),
            window,
            cx,
        );

        // Tabs: one per panel, then Add.
        let mut tabs = h_flex().gap_1p5();
        for (tab, hidden) in self.tabs.into_iter().zip(hidden_tabs) {
            let toggled = self.scaffold.clone();
            let entered = self.scaffold.clone();
            let panel_id = tab.panel_id.clone();
            let hover_id = tab.panel_id.clone();
            tabs = tabs.child(
                h_flex()
                    .id(named(&self.id, format!("tab-{}", tab.panel_id)))
                    .rounded(radius)
                    .border_1()
                    .border_color(border)
                    .bg(surface)
                    .on_hover(move |hovering, _, cx| {
                        entered.update(cx, |scaffold, cx| {
                            // Leaving clears only this tab's own spotlight.
                            if *hovering {
                                scaffold.hovered = Some(hover_id.clone());
                            } else if scaffold.hovered.as_ref() == Some(&hover_id) {
                                scaffold.hovered = None;
                            }
                            cx.notify();
                        });
                    })
                    .child(
                        Button::new(named(&self.id, format!("tab-label-{}", tab.panel_id)))
                            .ghost()
                            .small()
                            .icon(Icon::new(if hidden {
                                LucideIcon::EyeOff
                            } else {
                                LucideIcon::AppWindow
                            }))
                            .label(tab.label.clone())
                            .tooltip(if hidden { "Show panel" } else { "Hide panel" })
                            .on_click(move |_, _, cx| {
                                toggled.update(cx, |scaffold, cx| {
                                    scaffold.toggle_panel(panel_id.clone(), cx)
                                });
                            }),
                    )
                    .when(hidden, |this| this.opacity(0.7))
                    .when_some(tab.on_close, |this, on_close| {
                        this.child(
                            Button::new(named(&self.id, format!("tab-close-{}", tab.panel_id)))
                                .ghost()
                                .small()
                                .icon(Icon::new(LucideIcon::Close))
                                .tooltip(format!("Close “{}”", tab.label))
                                .on_click(move |event, window, cx| on_close(event, window, cx)),
                        )
                    }),
            );
        }
        if let Some(on_add) = self.on_add {
            tabs = tabs.child(
                Button::new(named(&self.id, "add"))
                    .ghost()
                    .small()
                    .icon(Icon::new(LucideIcon::Plus))
                    .label(self.add_label)
                    .on_click(move |event, window, cx| on_add(event, window, cx)),
            );
        }

        // Panels.
        let count = shown.len();
        let shown_ids: Vec<SharedString> = shown.iter().map(|panel| panel.id.clone()).collect();
        let mut row = h_flex().size_full().items_stretch().gap(px(CANVAS_GAP));
        let mut index = 0;
        for panel in self.panels {
            if !shown_ids.contains(&panel.id) {
                continue;
            }
            let layout = layouts[index];
            let is_fill = index == fill;
            let trailing_grip = index < fill;
            let dim = transition(
                (named(&self.id, format!("dim-{}", panel.id)), "dim"),
                if hovered.as_ref().is_some_and(|id| *id != panel.id) {
                    0.35
                } else {
                    1.
                },
                timing(DURATION_FAST),
                window,
                cx,
            );
            let card = |content: AnyElement, tall: bool| {
                div()
                    .min_h_0()
                    .overflow_hidden()
                    .rounded(radius)
                    .border_1()
                    .border_color(border)
                    .bg(surface)
                    .map(|this| {
                        if tall {
                            this.flex_1()
                        } else {
                            this.flex_none().h(px(SECONDARY_HEIGHT))
                        }
                    })
                    .child(content)
            };
            let group: SharedString = format!("scaffold-panel-{}", panel.id).into();
            let mut column = v_flex()
                .id(named(&self.id, format!("panel-{}", panel.id)))
                .group(group.clone())
                .relative()
                .min_w_0()
                .h_full()
                .opacity(dim)
                .map(|this| {
                    if is_fill {
                        this.flex_1()
                    } else {
                        this.flex_none().w(px(widths[index]))
                    }
                });

            let primary = card(
                panel.content,
                !layout.secondary_expanded || panel.secondary.is_none(),
            );
            match panel.secondary {
                None => column = column.child(primary),
                Some(secondary) => {
                    let secondary = card(secondary, layout.secondary_expanded);
                    let swap = self.scaffold.clone();
                    let expand = self.scaffold.clone();
                    let (swap_id, expand_id) = (panel.id.clone(), panel.id.clone());
                    let on_swap = panel.on_swap;
                    // Points at the card that grows next.
                    let grows_down = layout.secondary_expanded == layout.swapped;
                    let seam = h_flex()
                        .flex_none()
                        .relative()
                        .h(px(PANEL_GAP))
                        .justify_center()
                        .child(
                            h_flex()
                                .id(named(&self.id, format!("seam-{}", panel.id)))
                                .absolute()
                                .gap_0p5()
                                .p_0p5()
                                .rounded_full()
                                .border_1()
                                .border_color(border)
                                .bg(surface)
                                .invisible()
                                .group_hover(group, |this| this.visible())
                                .when(on_swap.is_some(), |this| {
                                    this.child(
                                        Button::new(named(&self.id, format!("swap-{}", panel.id)))
                                            .ghost()
                                            .pill(true)
                                            .xsmall()
                                            .icon(Icon::new(LucideIcon::ArrowUpDown))
                                            .tooltip("Swap the two cards")
                                            .on_click(move |event, window, cx| {
                                                swap.update(cx, |scaffold, cx| {
                                                    let swapped = !scaffold.is_swapped(&swap_id);
                                                    scaffold.set_swapped(
                                                        swap_id.clone(),
                                                        swapped,
                                                        cx,
                                                    );
                                                });
                                                if let Some(on_swap) = &on_swap {
                                                    on_swap(event, window, cx);
                                                }
                                            }),
                                    )
                                })
                                .child(
                                    Button::new(named(&self.id, format!("expand-{}", panel.id)))
                                        .ghost()
                                        .pill(true)
                                        .xsmall()
                                        .icon(Icon::new(if grows_down {
                                            LucideIcon::ChevronUp
                                        } else {
                                            LucideIcon::ChevronDown
                                        }))
                                        .tooltip("Give the other card the room")
                                        .on_click(move |_, _, cx| {
                                            expand.update(cx, |scaffold, cx| {
                                                let expanded =
                                                    !scaffold.is_secondary_expanded(&expand_id);
                                                scaffold.set_secondary_expanded(
                                                    expand_id.clone(),
                                                    expanded,
                                                    cx,
                                                );
                                            });
                                        }),
                                )
                                .when_some(panel.on_close_secondary, |this, on_close| {
                                    this.child(
                                        Button::new(named(
                                            &self.id,
                                            format!("close-secondary-{}", panel.id),
                                        ))
                                        .ghost()
                                        .pill(true)
                                        .xsmall()
                                        .icon(Icon::new(LucideIcon::Close))
                                        .tooltip("Close the second card")
                                        .on_click(
                                            move |event, window, cx| on_close(event, window, cx),
                                        ),
                                    )
                                }),
                        );
                    column = if layout.swapped {
                        column.child(secondary).child(seam).child(primary)
                    } else {
                        column.child(primary).child(seam).child(secondary)
                    };
                }
            }

            if !is_fill && count > 1 {
                let grabbed = self.scaffold.clone();
                let grip = Grip::Panel(panel.id.clone(), trailing_grip);
                let width = widths[index];
                column = column.child(
                    div()
                        .id(named(&self.id, format!("grip-{}", panel.id)))
                        .absolute()
                        .top_0()
                        .bottom_0()
                        .w(px(CANVAS_GAP))
                        .map(|this| {
                            if trailing_grip {
                                this.right(px(-CANVAS_GAP))
                            } else {
                                this.left(px(-CANVAS_GAP))
                            }
                        })
                        .cursor(CursorStyle::ResizeColumn)
                        .hover(move |this| this.bg(strip))
                        .on_mouse_down(MouseButton::Left, move |event, _, cx| {
                            grabbed.update(cx, |scaffold, cx| {
                                scaffold.resize = Some(Resize {
                                    grip: grip.clone(),
                                    from: event.position.x,
                                    width,
                                });
                                cx.notify();
                            });
                            cx.stop_propagation();
                        }),
                );
            }
            row = row.child(column);
            index += 1;
        }

        let measured = self.scaffold.clone();
        let canvas_ids = ids.clone();
        let moving = self.scaffold.clone();
        let released = self.scaffold.clone();
        let grabbed = self.scaffold.clone();
        let closing = self.scaffold.clone();

        // With no rail the canvas keeps its own leading gutter.
        let bare = self.sidebar.is_none();

        h_flex()
            .id(self.id.clone())
            .relative()
            .size_full()
            .min_h_0()
            .overflow_hidden()
            .items_stretch()
            .pr_2()
            .pb_2()
            .bg(page)
            .text_color(foreground)
            .when(resizing.is_some(), |this| {
                this.cursor(CursorStyle::ResizeColumn)
            })
            .on_mouse_move(move |event, _, cx| {
                moving.update(cx, |scaffold, cx| {
                    let Some(resize) = &scaffold.resize else {
                        return;
                    };
                    if event.pressed_button != Some(MouseButton::Left) {
                        scaffold.resize = None;
                        cx.notify();
                        return;
                    }
                    let travel = f32::from(event.position.x - resize.from);
                    match resize.grip.clone() {
                        Grip::Inspector => {
                            let width = resize.width - travel;
                            scaffold.resize_inspector(width, cx);
                        }
                        Grip::Panel(id, trailing) => {
                            let width = resize.width + if trailing { travel } else { -travel };
                            scaffold.resize_panel(id, width, cx);
                        }
                    }
                });
            })
            .on_mouse_up(MouseButton::Left, move |_, _, cx| {
                released.update(cx, |scaffold, cx| {
                    if scaffold.resize.take().is_some() {
                        cx.notify();
                    }
                });
            })
            .when_some(self.sidebar, |this, sidebar| {
                this.child(
                    div()
                        .flex_none()
                        .w(px(SIDEBAR_WIDTH))
                        .h_full()
                        .child(sidebar),
                )
            })
            .child(
                v_flex()
                    .flex_1()
                    .min_w_0()
                    .when(bare, |this| this.pl_2())
                    .child(
                        h_flex()
                            .flex_none()
                            .h(px(HEADER_HEIGHT))
                            .justify_end()
                            // Steps out of the drawer's way as it opens.
                            .pr(px(slide * (drawer + EDGE_GUTTER)))
                            .child(tabs),
                    )
                    .child(
                        div()
                            .relative()
                            .flex_1()
                            .min_h_0()
                            // Reads the width this frame was given, for the next one.
                            .child(
                                canvas(
                                    move |bounds, window, cx| {
                                        let width = f32::from(bounds.size.width);
                                        let stale = {
                                            let scaffold = measured.read(cx);
                                            scaffold.canvas != Some(width)
                                                || scaffold.ids != canvas_ids
                                        };
                                        if stale {
                                            measured.update(cx, |scaffold, cx| {
                                                scaffold.measure(width, &canvas_ids, cx)
                                            });
                                            window.refresh();
                                        }
                                    },
                                    |_, _, _, _| {},
                                )
                                .absolute()
                                .size_full(),
                            )
                            .child(row),
                    ),
            )
            .when_some(self.inspector, |this, (name, content)| {
                this.when(slide > 0., |this| {
                    this.child(
                        div()
                            .absolute()
                            .top_2()
                            .bottom_2()
                            .right(px(EDGE_GUTTER - (1. - slide) * (drawer + EDGE_GUTTER + 12.)))
                            .w(px(drawer))
                            .opacity(slide)
                            .child(
                                v_flex()
                                    .size_full()
                                    .overflow_hidden()
                                    .rounded(radius)
                                    .border_1()
                                    .border_color(border)
                                    .child(
                                        h_flex()
                                            .flex_none()
                                            .h_12()
                                            .pl_4()
                                            .pr_2()
                                            .justify_between()
                                            .border_b_1()
                                            .border_color(border)
                                            .text_color(muted)
                                            .child(name.clone())
                                            .child(
                                                Button::new(named(&self.id, "inspector-close"))
                                                    .ghost()
                                                    .small()
                                                    .icon(Icon::new(LucideIcon::Close))
                                                    .tooltip(format!("Close {name}"))
                                                    .on_click(move |_, _, cx| {
                                                        closing.update(cx, |scaffold, cx| {
                                                            scaffold.set_inspector_open(false, cx)
                                                        });
                                                    }),
                                            ),
                                    )
                                    .child(
                                        div()
                                            .id(named(&self.id, "inspector-body"))
                                            .flex_1()
                                            .min_h_0()
                                            .overflow_y_scroll()
                                            .child(content),
                                    )
                                    .glass_with(GlassSpec::frosted(cx)),
                            )
                            .child(
                                div()
                                    .id(named(&self.id, "inspector-grip"))
                                    .absolute()
                                    .top_0()
                                    .bottom_0()
                                    .left(px(-CANVAS_GAP))
                                    .w(px(CANVAS_GAP))
                                    .cursor(CursorStyle::ResizeColumn)
                                    .hover(move |this| this.bg(strip))
                                    .on_mouse_down(MouseButton::Left, move |event, _, cx| {
                                        grabbed.update(cx, |scaffold, cx| {
                                            scaffold.resize = Some(Resize {
                                                grip: Grip::Inspector,
                                                from: event.position.x,
                                                width: scaffold.inspector_width,
                                            });
                                            cx.notify();
                                        });
                                        cx.stop_propagation();
                                    }),
                            ),
                    )
                })
            })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ids(names: &[&'static str]) -> Vec<SharedString> {
        names.iter().map(|name| SharedString::from(*name)).collect()
    }

    #[test]
    fn capacity_grants_each_panel_its_floor() {
        assert_eq!(panel_capacity(None), 3);
        assert_eq!(panel_capacity(Some(300.)), 1);
        assert_eq!(panel_capacity(Some(647.)), 1);
        assert_eq!(panel_capacity(Some(648.)), 2);
        assert_eq!(panel_capacity(Some(976.)), 3);
        assert_eq!(panel_capacity(Some(4000.)), 3);
    }

    #[test]
    fn the_oldest_panel_gives_way_and_returns_with_the_room() {
        let all = ids(&["a", "b", "c"]);
        let narrow = Visibility::default().settle(&all, 2);
        assert_eq!(narrow.visible, ids(&["b", "c"]));
        assert_eq!(narrow.auto_hidden, ids(&["a"]));
        let wide = narrow.settle(&all, 3);
        assert_eq!(wide.visible, ids(&["b", "c", "a"]));
        assert!(wide.auto_hidden.is_empty());
    }

    #[test]
    fn a_tab_hides_its_panel_until_it_is_pressed_again() {
        let all = ids(&["a", "b", "c"]);
        let hidden = Visibility::default()
            .settle(&all, 3)
            .toggle(&all[1], &all, 3);
        assert_eq!(hidden.user_hidden, ids(&["b"]));
        // Room does not bring a panel its tab hid back.
        assert_eq!(hidden.clone().settle(&all, 3).visible, ids(&["a", "c"]));
        // Showing one past capacity evicts the oldest in its place.
        let shown = hidden.toggle(&all[1], &all, 2);
        assert_eq!(shown.visible, ids(&["c", "b"]));
        assert_eq!(shown.auto_hidden, ids(&["a"]));
        // The last visible panel stays.
        let one = Visibility::default().settle(&all[..1], 3);
        assert_eq!(one.clone().toggle(&all[0], &all[..1], 3), one);
    }

    #[test]
    fn the_fill_panel_takes_what_the_others_leave() {
        // Two panels on 1000px: 992 to share after the gap.
        let (widths, fill) = panel_widths(1000., &[Some(400.), None], None);
        assert_eq!((widths, fill), (vec![400., 592.], 1));
        // A request cannot push the fill under its floor.
        let (widths, _) = panel_widths(1000., &[Some(900.), None], None);
        assert_eq!(widths, vec![672., 320.]);
        // Of three, the middle fills.
        let (widths, fill) = panel_widths(1200., &[Some(320.), None, Some(360.)], None);
        assert_eq!((widths, fill), (vec![320., 504., 360.], 1));
    }
}
