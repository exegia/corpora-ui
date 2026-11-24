//! Flowchart: `react/src/components/composed/chat/flowchart`.

use std::cell::RefCell;
use std::collections::HashMap;
use std::rc::Rc;
use std::sync::Arc;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::component::{ActiveTheme as _, Icon, Sizable as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    AnyElement, App, Bounds, ElementId, FontWeight, Hsla, ImageSource, InteractiveElement as _,
    IntoElement, MouseButton, ObjectFit, ParentElement as _, PathBuilder, Pixels, Point,
    RenderOnce, SharedString, Styled as _, StyledImage as _, Window, canvas, div, fill, img, point,
    px, relative, size,
};

use crate::atoms::Tone;

/// Space above the first row and below the last.
const PAD_Y: f32 = 24.;
/// Space between rows, which the connectors cross.
const ROW_GAP: f32 = 64.;
/// The kind pill and the gap under it, above a card.
const PILL_OFFSET: f32 = 30.;
/// A card's height before it has been measured.
const ESTIMATED_HEIGHT: f32 = 90.;
/// The spacing of the canvas's dots.
const GRID: f32 = 22.;
/// How far the pointer travels before a press becomes a drag.
const DRAG_SLOP: f32 = 3.;

/// A card on a [`Flowchart`].
pub struct FlowStep {
    id: SharedString,
    row: usize,
    x: f32,
    width: f32,
    kind: Option<SharedString>,
    tone: Tone,
    title: SharedString,
    caption: Option<SharedString>,
    icon: LucideIcon,
    image: Option<ImageSource>,
    body: Option<AnyElement>,
}

impl FlowStep {
    /// A card in `row`, counted from the top. `id` must be unique in the
    /// chart.
    pub fn new(id: impl Into<SharedString>, row: usize, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            row,
            x: 0.5,
            width: 300.,
            kind: None,
            tone: Tone::Accent,
            title: title.into(),
            caption: None,
            icon: LucideIcon::Cone,
            image: None,
            body: None,
        }
    }

    /// Where the card's center sits across the canvas, from 0 to 1. The
    /// middle by default.
    pub fn x(mut self, x: f32) -> Self {
        self.x = x;
        self
    }

    /// The card's width in pixels. 300 by default.
    pub fn width(mut self, width: f32) -> Self {
        self.width = width;
        self
    }

    /// A pill above the card naming what kind of step it is: "Trigger".
    pub fn kind(mut self, kind: impl Into<SharedString>) -> Self {
        self.kind = Some(kind.into());
        self
    }

    /// The color of the pill and the icon tile.
    pub fn tone(mut self, tone: Tone) -> Self {
        self.tone = tone;
        self
    }

    pub fn caption(mut self, caption: impl Into<SharedString>) -> Self {
        self.caption = Some(caption.into());
        self
    }

    pub fn icon(mut self, icon: LucideIcon) -> Self {
        self.icon = icon;
        self
    }

    /// A picture in place of the icon tile: a person, a manuscript.
    pub fn image(mut self, image: impl Into<ImageSource>) -> Self {
        self.image = Some(image.into());
        self
    }

    /// Replaces the title and caption with a body of your own.
    pub fn body(mut self, body: impl IntoElement) -> Self {
        self.body = Some(body.into_any_element());
        self
    }
}

/// A connector from the bottom of one card to the top of another.
#[derive(Clone, Debug, PartialEq)]
pub struct FlowEdge {
    pub source: SharedString,
    pub target: SharedString,
    /// 1.25px when unset.
    pub stroke_width: Option<f32>,
    /// The border color when unset.
    pub tone: Option<Tone>,
}

impl FlowEdge {
    pub fn new(source: impl Into<SharedString>, target: impl Into<SharedString>) -> Self {
        Self {
            source: source.into(),
            target: target.into(),
            stroke_width: None,
            tone: None,
        }
    }

    pub fn stroke_width(mut self, width: f32) -> Self {
        self.stroke_width = Some(width);
        self
    }

    pub fn tone(mut self, tone: Tone) -> Self {
        self.tone = Some(tone);
        self
    }
}

/// The top of each card and the height of the canvas, from the cards' rows
/// and heights. A row is as tall as its tallest card.
fn layout(rows: &[usize], heights: &[f32]) -> (Vec<f32>, f32) {
    let mut distinct: Vec<usize> = rows.to_vec();
    distinct.sort_unstable();
    distinct.dedup();
    let mut row_top = HashMap::new();
    let mut y = PAD_Y;
    for (index, row) in distinct.iter().enumerate() {
        if index > 0 {
            y += ROW_GAP;
        }
        row_top.insert(*row, y);
        y += rows
            .iter()
            .zip(heights)
            .filter(|(candidate, _)| *candidate == row)
            .map(|(_, height)| *height)
            .fold(0., f32::max);
    }
    let tops = rows.iter().map(|row| row_top[row]).collect();
    (tops, y + PAD_Y)
}

/// How far a connector's control points reach from its ends.
fn reach(from_y: f32, to_y: f32) -> f32 {
    ((to_y - from_y).abs() * 0.55).clamp(24., 84.)
}

/// A card as the connectors see it.
struct Placed {
    id: SharedString,
    x: f32,
    dx: f32,
    top: f32,
    height: f32,
    has_pill: bool,
}

struct Drag {
    id: SharedString,
    start: Point<Pixels>,
    origin: (f32, f32),
    moved: bool,
}

#[derive(Default)]
struct Memory {
    selected: Option<SharedString>,
    offsets: HashMap<SharedString, (f32, f32)>,
    heights: Rc<RefCell<Vec<f32>>>,
    drag: Option<Drag>,
}

type SelectHandler = Rc<dyn Fn(Option<&SharedString>, &mut Window, &mut App)>;
type DragHandler = Rc<dyn Fn(&SharedString, (f32, f32), &mut Window, &mut App)>;

/// A dot-grid canvas of step cards joined by curved connectors.
///
/// ```ignore
/// Flowchart::new("pipeline")
///     .steps([
///         FlowStep::new("load", 0, "Iliad corpus loaded").kind("Trigger"),
///         FlowStep::new("node", 1, "μῆνιν ἄειδε, θεά").kind("Text node").tone(Tone::Warning),
///     ])
/// ```
///
/// Clicking a card selects it and lights its connectors; dragging moves it.
/// Without [`Self::edges`] the steps are chained in order.
#[derive(IntoElement)]
pub struct Flowchart {
    id: ElementId,
    steps: Vec<FlowStep>,
    edges: Option<Vec<FlowEdge>>,
    read_only: bool,
    min_height: Option<Pixels>,
    on_select: Option<SelectHandler>,
    on_drag: Option<DragHandler>,
}

impl Flowchart {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            steps: Vec::new(),
            edges: None,
            read_only: false,
            min_height: None,
            on_select: None,
            on_drag: None,
        }
    }

    pub fn steps(mut self, steps: impl IntoIterator<Item = FlowStep>) -> Self {
        self.steps.extend(steps);
        self
    }

    /// The connectors. A chain through the steps in order when unset.
    pub fn edges(mut self, edges: impl IntoIterator<Item = FlowEdge>) -> Self {
        self.edges.get_or_insert_default().extend(edges);
        self
    }

    /// Cards stay where they are laid out. Selection still works.
    pub fn read_only(mut self) -> Self {
        self.read_only = true;
        self
    }

    /// The least the canvas is tall. It is as tall as its rows otherwise.
    pub fn min_height(mut self, height: Pixels) -> Self {
        self.min_height = Some(height);
        self
    }

    /// Called with the selected card's id, or `None` when it is let go.
    pub fn on_select(
        mut self,
        handler: impl Fn(Option<&SharedString>, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_select = Some(Rc::new(handler));
        self
    }

    /// Called when a drag ends, with the card's id and how far it now sits
    /// from where it was laid out.
    pub fn on_drag(
        mut self,
        handler: impl Fn(&SharedString, (f32, f32), &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_drag = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for Flowchart {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let id = Arc::new(self.id);
        let child_id = |name: String| ElementId::NamedChild(id.clone(), name.into());
        let memory =
            window.use_keyed_state(child_id("memory".into()), cx, |_, _| Memory::default());
        let (selected, offsets, measured) = {
            let memory = memory.read(cx);
            (
                memory.selected.clone(),
                memory.offsets.clone(),
                memory.heights.clone(),
            )
        };

        let theme = cx.theme();
        let muted = theme.muted_foreground;
        let border = theme.border;
        let accent = theme.primary;
        let surface = theme.background;
        let page = theme.muted.opacity(0.4);

        let rows: Vec<usize> = self.steps.iter().map(|step| step.row).collect();
        let heights: Vec<f32> = {
            let measured = measured.borrow();
            (0..rows.len())
                .map(|index| measured.get(index).copied().unwrap_or(ESTIMATED_HEIGHT))
                .collect()
        };
        let (tops, content_height) = layout(&rows, &heights);
        let height = self
            .min_height
            .map_or(px(content_height), |min| min.max(px(content_height)));

        let edges = self.edges.unwrap_or_else(|| {
            self.steps
                .windows(2)
                .map(|pair| FlowEdge::new(pair[0].id.clone(), pair[1].id.clone()))
                .collect()
        });
        let placed: Vec<Placed> = self
            .steps
            .iter()
            .enumerate()
            .map(|(index, step)| {
                let (dx, dy) = offsets.get(&step.id).copied().unwrap_or_default();
                Placed {
                    id: step.id.clone(),
                    x: step.x,
                    dx,
                    top: tops[index] + dy,
                    height: heights[index],
                    has_pill: step.kind.is_some(),
                }
            })
            .collect();
        let strokes: Vec<(FlowEdge, Hsla)> = edges
            .into_iter()
            .map(|edge| {
                let lit = selected
                    .as_ref()
                    .is_some_and(|picked| picked == &edge.source || picked == &edge.target);
                let color = if lit {
                    accent
                } else {
                    edge.tone.map_or(border, |tone| tone.color(cx))
                };
                (edge, color)
            })
            .collect();

        let backdrop = canvas(
            |_, _, _| (),
            move |bounds: Bounds<Pixels>, _, window, _| {
                let mut y = bounds.top() + px(GRID / 2.);
                while y < bounds.bottom() {
                    let mut x = bounds.left() + px(GRID / 2.);
                    while x < bounds.right() {
                        window.paint_quad(
                            fill(Bounds::new(point(x, y), size(px(2.), px(2.))), border)
                                .corner_radii(px(1.)),
                        );
                        x += px(GRID);
                    }
                    y += px(GRID);
                }
                let anchor = |id: &SharedString, bottom: bool| {
                    let card = placed.iter().find(|card| &card.id == id)?;
                    let y = if bottom {
                        card.top + card.height
                    } else if card.has_pill {
                        card.top + PILL_OFFSET
                    } else {
                        card.top
                    };
                    Some((
                        bounds.left() + bounds.size.width * card.x + px(card.dx),
                        bounds.top() + px(y),
                        y,
                    ))
                };
                for (edge, color) in &strokes {
                    let (Some(from), Some(to)) =
                        (anchor(&edge.source, true), anchor(&edge.target, false))
                    else {
                        continue;
                    };
                    let reach = px(reach(from.2, to.2));
                    let mut path = PathBuilder::stroke(px(edge.stroke_width.unwrap_or(1.25)));
                    path.move_to(point(from.0, from.1));
                    path.cubic_bezier_to(
                        point(to.0, to.1),
                        point(from.0, from.1 + reach),
                        point(to.0, to.1 - reach),
                    );
                    if let Ok(path) = path.build() {
                        window.paint_path(path, *color);
                    }
                }
            },
        )
        .absolute()
        .size_full();

        let read_only = self.read_only;
        let cards = self.steps.into_iter().enumerate().map(|(index, step)| {
            let (dx, dy) = offsets.get(&step.id).copied().unwrap_or_default();
            let active = selected.as_ref() == Some(&step.id);
            let hue = step.tone.color(cx);
            let pressed = memory.clone();
            let step_id = step.id.clone();
            let body = step.body.unwrap_or_else(|| {
                let tile = div()
                    .flex_none()
                    .size_9()
                    .rounded(px(8.))
                    .overflow_hidden()
                    .border_1()
                    .border_color(hue.opacity(0.2));
                h_flex()
                    .gap_2p5()
                    .p_2p5()
                    .child(match step.image {
                        Some(image) => {
                            tile.child(img(image).size_full().object_fit(ObjectFit::Cover))
                        }
                        None => tile
                            .flex()
                            .items_center()
                            .justify_center()
                            .bg(hue.opacity(0.12))
                            .text_color(hue)
                            .child(Icon::new(step.icon).small()),
                    })
                    .child(
                        v_flex()
                            .min_w_0()
                            .child(
                                div()
                                    .truncate()
                                    .text_sm()
                                    .font_weight(FontWeight::SEMIBOLD)
                                    .child(step.title),
                            )
                            .when_some(step.caption, |this, caption| {
                                this.child(div().text_xs().text_color(muted).child(caption))
                            }),
                    )
                    .into_any_element()
            });
            v_flex()
                .id(child_id(format!("step-{}", step.id)))
                .absolute()
                .left(relative(step.x))
                .ml(px(dx - step.width / 2.))
                .top(px(tops[index] + dy))
                .w(px(step.width))
                .items_start()
                .gap_1p5()
                .cursor_pointer()
                .on_mouse_down(MouseButton::Left, move |event, _, cx| {
                    pressed.update(cx, |memory, _| {
                        memory.drag = Some(Drag {
                            id: step_id.clone(),
                            start: event.position,
                            origin: (dx, dy),
                            moved: false,
                        });
                    });
                })
                .when_some(step.kind, |this, kind| {
                    this.child(
                        h_flex()
                            .h_6()
                            .px_2()
                            .rounded(px(6.))
                            .bg(hue.opacity(0.14))
                            .text_xs()
                            .font_weight(FontWeight::MEDIUM)
                            .text_color(hue)
                            .child(kind),
                    )
                })
                .child(
                    div()
                        .w_full()
                        .rounded(px(18.))
                        .bg(surface)
                        .border_1()
                        .map(|this| {
                            if active {
                                this.border_color(accent)
                            } else {
                                this.border_color(border).shadow_xs()
                            }
                        })
                        .child(body),
                )
        });

        let moving = memory.clone();
        let released = memory.clone();
        let on_select = self.on_select;
        let on_drag = self.on_drag;
        div()
            .id(child_id("canvas".into()))
            .relative()
            .w_full()
            .h(height)
            .overflow_hidden()
            .rounded(px(18.))
            .border_1()
            .border_color(border)
            .bg(page)
            .on_mouse_move(move |event, _, cx| {
                if read_only || event.pressed_button != Some(MouseButton::Left) {
                    return;
                }
                moving.update(cx, |memory, cx| {
                    let Some(drag) = &mut memory.drag else { return };
                    let dx = f32::from(event.position.x - drag.start.x);
                    let dy = f32::from(event.position.y - drag.start.y);
                    if !drag.moved && dx.hypot(dy) < DRAG_SLOP {
                        return;
                    }
                    drag.moved = true;
                    let offset = (drag.origin.0 + dx, drag.origin.1 + dy);
                    memory.offsets.insert(drag.id.clone(), offset);
                    cx.notify();
                });
            })
            .on_mouse_up(MouseButton::Left, move |_, window, cx| {
                let Some(drag) = released.update(cx, |memory, _| memory.drag.take()) else {
                    return;
                };
                if drag.moved {
                    let offset = released
                        .read(cx)
                        .offsets
                        .get(&drag.id)
                        .copied()
                        .unwrap_or_default();
                    if let Some(on_drag) = &on_drag {
                        on_drag(&drag.id, offset, window, cx);
                    }
                    return;
                }
                // A press that never moved is a click: select, or let go.
                let next = released.update(cx, |memory, cx| {
                    memory.selected =
                        (memory.selected.as_ref() != Some(&drag.id)).then_some(drag.id);
                    cx.notify();
                    memory.selected.clone()
                });
                if let Some(on_select) = &on_select {
                    on_select(next.as_ref(), window, cx);
                }
            })
            .child(backdrop)
            .child(
                div()
                    .absolute()
                    .inset_0()
                    .on_children_prepainted(move |bounds, window, _| {
                        let next: Vec<f32> = bounds
                            .iter()
                            .map(|card| f32::from(card.size.height))
                            .collect();
                        if *measured.borrow() != next {
                            *measured.borrow_mut() = next;
                            window.refresh();
                        }
                    })
                    .children(cards),
            )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rows_stack_by_their_tallest_card() {
        // Two cards share the second row; the taller sets its height.
        let (tops, height) = layout(&[0, 1, 1, 2], &[90., 60., 120., 80.]);
        assert_eq!(tops, [24., 178., 178., 362.]);
        assert_eq!(height, 362. + 80. + PAD_Y);
    }

    #[test]
    fn rows_need_not_be_numbered_in_order_or_without_gaps() {
        let (tops, _) = layout(&[5, 2], &[50., 40.]);
        assert_eq!(tops, [PAD_Y + 40. + ROW_GAP, PAD_Y]);
    }

    #[test]
    fn an_empty_chart_is_just_its_padding() {
        assert_eq!(layout(&[], &[]), (Vec::new(), PAD_Y * 2.));
    }

    #[test]
    fn a_connector_reaches_in_proportion_within_limits() {
        assert_eq!(reach(0., 10.), 24.);
        assert_eq!(reach(0., 100.), 55.);
        assert_eq!(reach(0., 400.), 84.);
    }
}
