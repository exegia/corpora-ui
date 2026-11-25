//! The app shell: `react/src/components/blocks/shell`.
//!
//! A navigation rail, the body and a secondary panel share one row. The body
//! keeps its floor: as the shell narrows the rail folds to icons and then
//! leaves, and the secondary panel stands down when it no longer fits.

use std::time::Duration;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::base::motion::{Transition, transition};
use gpui_kit::component::{ActiveTheme as _, Icon, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    AnyElement, App, Context, CursorStyle, ElementId, Entity, EventEmitter,
    InteractiveElement as _, IntoElement, MouseButton, ParentElement, Pixels, RenderOnce,
    StatefulInteractiveElement as _, Styled as _, Window, canvas, div, px,
};

use crate::atoms::Button;
use crate::foundations::Radius;
use crate::foundations::motion::{DURATION_MEDIUM, EASE_DRAWER};

/// Room a desktop window's title bar takes above the shell.
const TITLE_BAR_HEIGHT: f32 = 48.;
/// The shell's side padding, and the gap between its columns.
const GUTTER: f32 = 8.;

/// The shell's columns, in pixels.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct ShellWidths {
    /// The rail, expanded. A drag changes it.
    pub sidebar: f32,
    /// The narrowest the expanded rail goes.
    pub sidebar_min: f32,
    /// The rail folded to its icons.
    pub sidebar_icon: f32,
    /// The secondary panel's floor, and the width it opens at.
    pub panel: f32,
    /// The floor the body refuses to go below.
    pub inset_min: f32,
}

impl Default for ShellWidths {
    fn default() -> Self {
        Self {
            sidebar: 256.,
            sidebar_min: 180.,
            sidebar_icon: 56.,
            panel: 320.,
            inset_min: 360.,
        }
    }
}

/// How the rail stands after the body has taken its floor.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum RailMode {
    #[default]
    Expanded,
    /// Folded to its icons.
    Icon,
    /// No room even for icons, or the shell has no rail.
    Hidden,
}

/// The rail's share of the shell.
#[derive(Clone, Copy, Debug, PartialEq)]
struct SidebarFit {
    width: f32,
    max_width: f32,
    mode: RailMode,
}

/// Reserves the body first, then shrinks, folds or hides the rail. The
/// requested width and open state are kept, so widening restores them.
fn fit_sidebar(viewport: f32, widths: &ShellWidths, open: bool, present: bool) -> SidebarFit {
    let room = if viewport > 0. {
        (viewport - 2. * GUTTER - GUTTER - widths.inset_min).max(0.)
    } else {
        480.
    };
    let expanded = present && open && room >= widths.sidebar_min;
    let width = if !present {
        0.
    } else if expanded {
        widths.sidebar.min(room)
    } else if room < widths.sidebar_icon {
        0.
    } else {
        widths.sidebar_icon
    };
    SidebarFit {
        width,
        max_width: widths.sidebar_min.max(room.min(480.)),
        mode: if width == 0. {
            RailMode::Hidden
        } else if expanded {
            RailMode::Expanded
        } else {
            RailMode::Icon
        },
    }
}

/// What is left for the secondary panel once the rail stands as it does and
/// the body keeps its floor. Never under the panel's own floor.
fn panel_max(viewport: f32, rail: f32, widths: &ShellWidths) -> f32 {
    let columns = if rail > 0. { 3. } else { 2. };
    let chrome = 2. * GUTTER + (columns - 1.) * GUTTER;
    widths
        .panel
        .max(viewport - chrome - rail - widths.inset_min)
}

/// Whether the shell can hold a secondary panel beside the rail and the
/// body. An unmeasured shell fails open: a panel never vanishes over a
/// reading that has not happened yet.
fn fits_panel(viewport: f32, rail: f32, widths: &ShellWidths) -> bool {
    if viewport <= 0. {
        return true;
    }
    let columns = if rail > 0. { 3. } else { 2. };
    let chrome = 2. * GUTTER + (columns - 1.) * GUTTER;
    rail + widths.inset_min + widths.panel + chrome <= viewport
}

/// A side of the shell a panel docks to.
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum ShellSide {
    /// The navigation rail.
    Left,
    /// The secondary panel.
    Right,
}

/// Whether the shell leaves room for a window's title bar.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum ShellVariant {
    /// Under a desktop title bar.
    #[default]
    Desktop,
    /// In a page, with even padding.
    Web,
}

/// A side opened or closed.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub struct ShellEvent {
    pub side: ShellSide,
    pub open: bool,
}

struct Resize {
    side: ShellSide,
    from: Pixels,
    width: f32,
}

/// Which panels of a shell are open, and how wide.
///
/// ```ignore
/// let shell = cx.new(|_| Shell::new().right_open(true));
/// // in `render`:
/// let folded = shell.read(cx).collapsed();
/// ShellLayout::new("app", &shell)
///     .left(Navigation::new(folded))
///     .right(inspector)
///     .header(title)
///     .child(page)
/// ```
pub struct Shell {
    widths: ShellWidths,
    panel_width: f32,
    left_open: bool,
    right_open: bool,
    has_left: bool,
    viewport: f32,
    resize: Option<Resize>,
}

impl EventEmitter<ShellEvent> for Shell {}

impl Default for Shell {
    fn default() -> Self {
        Self::new()
    }
}

impl Shell {
    /// A shell with its rail open and its secondary panel shut.
    pub fn new() -> Self {
        let widths = ShellWidths::default();
        Self {
            widths,
            panel_width: widths.panel,
            left_open: true,
            right_open: false,
            has_left: true,
            viewport: 0.,
            resize: None,
        }
    }

    pub fn widths(mut self, widths: ShellWidths) -> Self {
        self.widths = widths;
        self.panel_width = widths.panel;
        self
    }

    pub fn left_open(mut self, open: bool) -> Self {
        self.left_open = open;
        self
    }

    pub fn right_open(mut self, open: bool) -> Self {
        self.right_open = open;
        self
    }

    fn fit(&self) -> SidebarFit {
        fit_sidebar(self.viewport, &self.widths, self.left_open, self.has_left)
    }

    /// How the rail stands now. It can be folded or hidden for want of room
    /// while [`Shell::is_open`] still says open.
    pub fn rail_mode(&self) -> RailMode {
        self.fit().mode
    }

    /// Whether the rail shows icons only. Fold the rail's own content on this.
    pub fn collapsed(&self) -> bool {
        self.rail_mode() != RailMode::Expanded
    }

    /// Whether there is room for the secondary panel at all.
    pub fn fits(&self) -> bool {
        fits_panel(self.viewport, self.fit().width, &self.widths)
    }

    /// What the host asked for. The rail may still be folded for want of room.
    pub fn is_open(&self, side: ShellSide) -> bool {
        match side {
            ShellSide::Left => self.left_open,
            ShellSide::Right => self.right_open && self.fits(),
        }
    }

    pub fn set_open(&mut self, side: ShellSide, open: bool, cx: &mut Context<Self>) {
        let slot = match side {
            ShellSide::Left => &mut self.left_open,
            ShellSide::Right => &mut self.right_open,
        };
        if *slot == open {
            return;
        }
        *slot = open;
        cx.emit(ShellEvent { side, open });
        cx.notify();
    }

    pub fn toggle(&mut self, side: ShellSide, cx: &mut Context<Self>) {
        let open = match side {
            ShellSide::Left => self.left_open,
            ShellSide::Right => self.right_open,
        };
        self.set_open(side, !open, cx);
    }

    /// The width a side takes now, in pixels: zero when hidden or shut.
    pub fn width(&self, side: ShellSide) -> f32 {
        match side {
            ShellSide::Left => self.fit().width,
            ShellSide::Right if !self.is_open(side) => 0.,
            ShellSide::Right => self.panel_width.clamp(
                self.widths.panel,
                panel_max(self.viewport, self.fit().width, &self.widths),
            ),
        }
    }

    /// Sets a side's width, kept inside what the body's floor allows.
    pub fn resize(&mut self, side: ShellSide, width: f32, cx: &mut Context<Self>) {
        match side {
            ShellSide::Left => {
                let max = self.fit().max_width;
                self.widths.sidebar = width.clamp(self.widths.sidebar_min, max);
            }
            ShellSide::Right => {
                let max = panel_max(self.viewport, self.fit().width, &self.widths);
                self.panel_width = width.clamp(self.widths.panel, max);
            }
        }
        cx.notify();
    }

    /// Puts both widths back to the shell's defaults.
    pub fn reset_widths(&mut self, cx: &mut Context<Self>) {
        self.widths.sidebar = ShellWidths::default().sidebar.max(self.widths.sidebar_min);
        self.panel_width = self.widths.panel;
        cx.notify();
    }

    fn measure(&mut self, viewport: f32, has_left: bool, cx: &mut Context<Self>) {
        if self.viewport == viewport && self.has_left == has_left {
            return;
        }
        self.viewport = viewport;
        self.has_left = has_left;
        // A panel with no room is shut, not parked: widening does not
        // spring it back open.
        if self.right_open && !self.fits() {
            self.right_open = false;
            cx.emit(ShellEvent {
                side: ShellSide::Right,
                open: false,
            });
        }
        cx.notify();
    }
}

/// The shell's frame: rail, header, body and secondary panel.
///
/// The children are the body. A side with no content has no column and no
/// trigger in the header.
#[derive(IntoElement)]
pub struct ShellLayout {
    id: ElementId,
    shell: Entity<Shell>,
    variant: ShellVariant,
    left: Option<AnyElement>,
    right: Option<AnyElement>,
    header: Option<AnyElement>,
    trailing: Option<AnyElement>,
    children: Vec<AnyElement>,
}

impl ShellLayout {
    pub fn new(id: impl Into<ElementId>, shell: &Entity<Shell>) -> Self {
        Self {
            id: id.into(),
            shell: shell.clone(),
            variant: ShellVariant::default(),
            left: None,
            right: None,
            header: None,
            trailing: None,
            children: Vec::new(),
        }
    }

    pub fn variant(mut self, variant: ShellVariant) -> Self {
        self.variant = variant;
        self
    }

    /// The navigation rail. Read [`Shell::collapsed`] to fold its content.
    pub fn left(mut self, content: impl IntoElement) -> Self {
        self.left = Some(content.into_any_element());
        self
    }

    /// The secondary panel.
    pub fn right(mut self, content: impl IntoElement) -> Self {
        self.right = Some(content.into_any_element());
        self
    }

    /// The header's middle, between the two triggers.
    pub fn header(mut self, header: impl IntoElement) -> Self {
        self.header = Some(header.into_any_element());
        self
    }

    /// Commands at the header's trailing edge, before the panel trigger.
    pub fn trailing(mut self, trailing: impl IntoElement) -> Self {
        self.trailing = Some(trailing.into_any_element());
        self
    }
}

impl ParentElement for ShellLayout {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

fn child_id(id: &ElementId, name: &'static str) -> ElementId {
    ElementId::NamedChild(std::sync::Arc::new(id.clone()), name.into())
}

/// The strip between two columns that drags a width.
fn grip(id: ElementId, shell: &Entity<Shell>, side: ShellSide, cx: &App) -> impl IntoElement {
    let shell = shell.clone();
    let hover = cx.theme().warning.opacity(0.2);
    div()
        .id(id)
        .absolute()
        .top_0()
        .bottom_0()
        .w(px(GUTTER))
        .map(|this| match side {
            ShellSide::Left => this.right(px(-GUTTER)),
            ShellSide::Right => this.left(px(-GUTTER)),
        })
        .cursor(CursorStyle::ResizeColumn)
        .hover(move |this| this.bg(hover))
        .on_mouse_down(MouseButton::Left, move |event, _, cx| {
            shell.update(cx, |shell, cx| {
                shell.resize = Some(Resize {
                    side,
                    from: event.position.x,
                    width: shell.width(side),
                });
                cx.notify();
            });
            cx.stop_propagation();
        })
}

impl RenderOnce for ShellLayout {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let state = self.shell.read(cx);
        let has_left = self.left.is_some();
        let fits = state.fits();
        let has_right = self.right.is_some() && fits;
        let rail = if has_left {
            state.width(ShellSide::Left)
        } else {
            0.
        };
        let panel = if has_right {
            state.width(ShellSide::Right)
        } else {
            0.
        };
        let panel_rest = state.panel_width.max(state.widths.panel);
        let (left_open, right_open) = (state.left_open, state.is_open(ShellSide::Right));
        let resizing = state.resize.is_some();

        let theme = cx.theme();
        let (page, surface, border, foreground) = (
            theme.sidebar,
            theme.background,
            theme.border,
            theme.foreground,
        );
        let radius = Radius::Lg.resolve(cx);
        // A drag lands on the frame it happened; only opening and folding ease.
        let timing = Transition::new(if resizing {
            Duration::ZERO
        } else {
            DURATION_MEDIUM
        })
        .easing(EASE_DRAWER.easing());
        let rail = transition((self.id.clone(), "rail"), rail, timing.clone(), window, cx);
        let panel = transition((self.id.clone(), "panel"), panel, timing, window, cx);

        let measured = self.shell.clone();
        let moving = self.shell.clone();
        let released = self.shell.clone();
        let toggle = |side: ShellSide| {
            let shell = self.shell.clone();
            move |_: &gpui_kit::ClickEvent, _: &mut Window, cx: &mut App| {
                shell.update(cx, |shell, cx| shell.toggle(side, cx));
            }
        };

        let header = h_flex()
            .flex_none()
            .h_12()
            .px_2()
            .gap_2()
            .border_b_1()
            .border_color(border)
            .when(has_left, |this| {
                this.child(
                    Button::new(child_id(&self.id, "toggle-left"))
                        .ghost()
                        .icon(Icon::new(LucideIcon::PanelLeft))
                        .tooltip(if left_open {
                            "Fold navigation"
                        } else {
                            "Unfold navigation"
                        })
                        .on_click(toggle(ShellSide::Left)),
                )
            })
            .child(
                h_flex()
                    .flex_1()
                    .min_w_0()
                    .when_some(self.header, |this, header| this.child(header)),
            )
            .child(
                h_flex()
                    .flex_none()
                    .gap_2()
                    .when_some(self.trailing, |this, trailing| this.child(trailing))
                    .when(has_right, |this| {
                        this.child(
                            Button::new(child_id(&self.id, "toggle-right"))
                                .ghost()
                                .icon(Icon::new(LucideIcon::PanelRight))
                                .tooltip(if right_open {
                                    "Close panel"
                                } else {
                                    "Open panel"
                                })
                                .on_click(toggle(ShellSide::Right)),
                        )
                    }),
            );

        h_flex()
            .id(self.id.clone())
            .relative()
            .size_full()
            .min_h_0()
            .items_stretch()
            .px(px(GUTTER))
            .pb(px(GUTTER))
            .pt(px(match self.variant {
                ShellVariant::Desktop => TITLE_BAR_HEIGHT,
                ShellVariant::Web => GUTTER,
            }))
            .bg(page)
            .text_color(foreground)
            .when(resizing, |this| this.cursor(CursorStyle::ResizeColumn))
            // Reads the width this frame was given, for the next one.
            .child(
                canvas(
                    move |bounds, window, cx| {
                        let width = f32::from(bounds.size.width);
                        let stale = {
                            let shell = measured.read(cx);
                            shell.viewport != width || shell.has_left != has_left
                        };
                        if stale {
                            measured.update(cx, |shell, cx| shell.measure(width, has_left, cx));
                            window.refresh();
                        }
                    },
                    |_, _, _, _| {},
                )
                .absolute()
                .size_full(),
            )
            .on_mouse_move(move |event, _, cx| {
                moving.update(cx, |shell, cx| {
                    let Some(resize) = &shell.resize else { return };
                    if event.pressed_button != Some(MouseButton::Left) {
                        shell.resize = None;
                        cx.notify();
                        return;
                    }
                    let travel = f32::from(event.position.x - resize.from);
                    let (side, width) = match resize.side {
                        ShellSide::Left => (ShellSide::Left, resize.width + travel),
                        ShellSide::Right => (ShellSide::Right, resize.width - travel),
                    };
                    shell.resize(side, width, cx);
                });
            })
            .on_mouse_up(MouseButton::Left, move |_, _, cx| {
                released.update(cx, |shell, cx| {
                    if shell.resize.take().is_some() {
                        cx.notify();
                    }
                });
            })
            .when_some(self.left, |this, left| {
                this.child(
                    div()
                        .relative()
                        .flex_none()
                        .w(px(rail))
                        // A hidden rail gives its gap back too.
                        .mr(px(GUTTER * (rail / 56.).min(1.)))
                        .pt(px(GUTTER))
                        .child(
                            div()
                                .size_full()
                                .overflow_hidden()
                                .opacity((rail / 56.).min(1.))
                                .child(left),
                        )
                        .when(left_open && rail > 0., |this| {
                            this.child(grip(
                                child_id(&self.id, "grip-left"),
                                &self.shell,
                                ShellSide::Left,
                                cx,
                            ))
                        }),
                )
            })
            .child(
                v_flex()
                    .flex_1()
                    .min_w_0()
                    .mt(px(GUTTER))
                    .overflow_hidden()
                    .rounded(radius)
                    .border_1()
                    .border_color(border)
                    .bg(surface)
                    .child(header)
                    .child(
                        div()
                            .id(child_id(&self.id, "body"))
                            .flex_1()
                            .min_h_0()
                            .overflow_y_scroll()
                            .children(self.children),
                    ),
            )
            .when_some(self.right.filter(|_| fits), |this, right| {
                this.child(
                    div()
                        .relative()
                        .flex_none()
                        .w(px(panel))
                        .ml(px(GUTTER * (panel / panel_rest).min(1.)))
                        .pt(px(GUTTER))
                        .child(
                            div().size_full().overflow_hidden().child(
                                // Keeps its own width while the column opens,
                                // so the content is uncovered, not squeezed.
                                div()
                                    .w(px(panel_rest.max(panel)))
                                    .h_full()
                                    .overflow_hidden()
                                    .rounded(radius)
                                    .border_1()
                                    .border_color(border)
                                    .bg(surface)
                                    .opacity((panel / panel_rest).min(1.))
                                    .child(right),
                            ),
                        )
                        .when(right_open, |this| {
                            this.child(grip(
                                child_id(&self.id, "grip-right"),
                                &self.shell,
                                ShellSide::Right,
                                cx,
                            ))
                        }),
                )
            })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn the_rail_folds_then_leaves_as_the_shell_narrows() {
        let widths = ShellWidths::default();
        let fit = |viewport| fit_sidebar(viewport, &widths, true, true);
        assert_eq!(fit(1200.).mode, RailMode::Expanded);
        assert_eq!(fit(1200.).width, 256.);
        // 600 - 24 of chrome - 360 for the body leaves 216: narrower, still open.
        assert_eq!(fit(600.).width, 216.);
        // Under the rail's own floor it folds to icons.
        assert_eq!(fit(500.).mode, RailMode::Icon);
        assert_eq!(fit(500.).width, 56.);
        assert_eq!(fit(420.).mode, RailMode::Hidden);
        // Shut by the host, it is icons however wide the shell.
        assert_eq!(
            fit_sidebar(1200., &widths, false, true).mode,
            RailMode::Icon
        );
        assert_eq!(
            fit_sidebar(1200., &widths, true, false).mode,
            RailMode::Hidden
        );
    }

    #[test]
    fn the_secondary_panel_needs_room_for_every_column() {
        let widths = ShellWidths::default();
        // 256 + 360 + 320 and 32 of chrome.
        assert!(fits_panel(968., 256., &widths));
        assert!(!fits_panel(967., 256., &widths));
        // With the rail folded there is more to give.
        assert!(fits_panel(800., 56., &widths));
        // An unmeasured shell fails open.
        assert!(fits_panel(0., 256., &widths));
        assert_eq!(panel_max(1200., 256., &widths), 552.);
        assert_eq!(panel_max(900., 256., &widths), 320.);
    }
}
