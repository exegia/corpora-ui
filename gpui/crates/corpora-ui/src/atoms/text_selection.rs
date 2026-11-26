//! Text selection: `react/src/components/atoms/text-selection`.
//!
//! Two ways to hang a popover on text: [`TextSelection`] shows one over the
//! text a person selects, and [`TextPopover`] shows one when a piece of
//! text is clicked.

use std::rc::Rc;

use gpui_kit::component::ActiveTheme as _;
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    Anchor, AnyElement, App, DispatchPhase, ElementId, Entity, InteractiveElement as _,
    IntoElement, KeyDownEvent, MouseButton, MouseUpEvent, ParentElement, Pixels, Point, RenderOnce,
    SharedString, StatefulInteractiveElement as _, StyleRefinement, Styled, Window, anchored,
    canvas, deferred, div, point, px, rems,
};

use super::{GlassSpec, GlassSurfaceExt as _};
use crate::foundations::Radius;

/// Gap between the pointer and the popover that opens at it.
const POPOVER_GAP: f32 = 10.;

type CloseHandler = Rc<dyn Fn(&mut Window, &mut App)>;

/// A frosted card that floats above a point of the window, over everything
/// else. It takes the focus, and closes on a press outside it and on Escape.
pub(crate) fn floating(
    id: impl Into<ElementId>,
    position: Point<Pixels>,
    content: AnyElement,
    on_close: impl Fn(&mut Window, &mut App) + 'static,
    window: &mut Window,
    cx: &mut App,
) -> AnyElement {
    let id = id.into();
    let on_close: CloseHandler = Rc::new(on_close);
    let on_escape = on_close.clone();
    // The popover takes the focus while it is open, so Escape reaches it.
    let focus = window
        .use_keyed_state(
            ElementId::NamedChild(std::sync::Arc::new(id.clone()), "focus".into()),
            cx,
            |_, cx| cx.focus_handle(),
        )
        .read(cx)
        .clone();
    if !focus.contains_focused(window, cx) {
        focus.focus(window, cx);
    }
    let card = div()
        .max_w(rems(16.))
        .p_3()
        .rounded(Radius::Md.resolve(cx))
        .border_1()
        .border_color(cx.theme().border)
        .text_sm()
        .font_family(cx.theme().font_family.clone())
        .text_color(cx.theme().popover_foreground)
        .child(content)
        .glass_with(GlassSpec::frosted(cx));

    deferred(
        anchored()
            .position(position)
            .anchor(Anchor::BottomCenter)
            .offset(point(px(0.), px(-POPOVER_GAP)))
            .snap_to_window_with_margin(px(8.))
            .child(
                div()
                    .id(id)
                    .track_focus(&focus)
                    .occlude()
                    .on_mouse_down_out(move |_, window, cx| on_close(window, cx))
                    .on_key_down(move |event: &KeyDownEvent, window, cx| {
                        if event.keystroke.key == "escape" {
                            on_escape(window, cx);
                            cx.stop_propagation();
                        }
                    })
                    .child(card),
            ),
    )
    .with_priority(1)
    .into_any_element()
}

/// Where a floating popover is open, and over what.
#[derive(Default)]
struct Floating {
    at: Option<Point<Pixels>>,
    selection: SharedString,
}

fn close(state: &Entity<Floating>) -> impl Fn(&mut Window, &mut App) + 'static {
    let state = state.clone();
    move |_, cx| {
        state.update(cx, |state, cx| {
            if state.at.take().is_some() {
                cx.notify();
            }
        });
    }
}

type SelectionPopover = Rc<dyn Fn(&SharedString, &mut Window, &mut App) -> AnyElement>;
type SelectionHandler = Rc<dyn Fn(&SharedString, &mut Window, &mut App)>;

/// A region whose selected text gets a popover: a place for "Copy",
/// "Highlight" or "Ask about this".
///
/// The children must hold selectable text, such as GPUI Component's
/// `TextView::markdown(…).selectable(true)`. When a selection ends inside
/// the region, the popover opens above the pointer with the selected text.
///
/// ```ignore
/// TextSelection::new("reader-selection")
///     .child(TextView::markdown("reader-text", source).selectable(true))
///     .popover(|selection, _, _| {
///         Button::new("copy-selection").label("Copy").into_any_element()
///     })
///     .on_selection_end(cx.listener(|this, selection: &SharedString, _, cx| { /* … */ }))
/// ```
#[derive(IntoElement)]
pub struct TextSelection {
    id: ElementId,
    children: Vec<AnyElement>,
    popover: Option<SelectionPopover>,
    on_selection_end: Option<SelectionHandler>,
}

impl TextSelection {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            children: Vec::new(),
            popover: None,
            on_selection_end: None,
        }
    }

    /// Builds the popover for the selected text.
    pub fn popover(
        mut self,
        popover: impl Fn(&SharedString, &mut Window, &mut App) -> AnyElement + 'static,
    ) -> Self {
        self.popover = Some(Rc::new(popover));
        self
    }

    /// Called with the selected text each time a selection ends.
    pub fn on_selection_end(
        mut self,
        handler: impl Fn(&SharedString, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_selection_end = Some(Rc::new(handler));
        self
    }
}

impl ParentElement for TextSelection {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for TextSelection {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let state = window.use_keyed_state(
            ElementId::NamedChild(std::sync::Arc::new(self.id.clone()), "selection".into()),
            cx,
            |_, _| Floating::default(),
        );
        let (at, selection) = {
            let state = state.read(cx);
            (state.at, state.selection.clone())
        };
        let popover_id =
            ElementId::NamedChild(std::sync::Arc::new(self.id.clone()), "popover".into());

        let watched = state.clone();
        let on_selection_end = self.on_selection_end;
        // Reads the window's selection when a press ends inside the region.
        let watcher = canvas(
            |_, _, _| (),
            move |bounds, _, window, _| {
                let state = watched.clone();
                let on_selection_end = on_selection_end.clone();
                window.on_mouse_event(move |event: &MouseUpEvent, phase, window, cx| {
                    if phase != DispatchPhase::Bubble
                        || event.button != MouseButton::Left
                        || !bounds.contains(&event.position)
                    {
                        return;
                    }
                    let position = event.position;
                    let state = state.clone();
                    let on_selection_end = on_selection_end.clone();
                    // The selection settles once every handler has seen the
                    // release.
                    window.defer(cx, move |window, cx| {
                        let text = gpui_kit::base::TextSelection::selected_text(window, cx);
                        let text = SharedString::from(text.trim().to_string());
                        if text.is_empty() {
                            return;
                        }
                        state.update(cx, |state, cx| {
                            state.selection = text.clone();
                            state.at = Some(position);
                            cx.notify();
                        });
                        if let Some(on_selection_end) = &on_selection_end {
                            on_selection_end(&text, window, cx);
                        }
                    });
                });
            },
        )
        .absolute()
        .inset_0();

        let popover = self.popover.zip(at).map(|(popover, at)| {
            let content = popover(&selection, window, cx);
            floating(popover_id, at, content, close(&state), window, cx)
        });

        div()
            .relative()
            .children(self.children)
            .child(watcher)
            .children(popover)
    }
}

type PopoverContent = Rc<dyn Fn(&mut Window, &mut App) -> AnyElement>;

/// A piece of text that opens a popover when clicked: a glossed word, a
/// cross reference, a footnote mark.
///
/// ```ignore
/// TextPopover::new("gloss-logos", "the Word")
///     .content(|_, _| Text::new("λόγος: word, reason, account").small().into_any_element())
/// ```
///
/// Style it with the `Styled` builders. It closes on a press outside it and
/// on Escape.
#[derive(IntoElement)]
pub struct TextPopover {
    id: ElementId,
    style: StyleRefinement,
    text: SharedString,
    content: Option<PopoverContent>,
}

impl TextPopover {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>, text: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            style: StyleRefinement::default(),
            text: text.into(),
            content: None,
        }
    }

    /// Builds the popover. Without it the text is plain.
    pub fn content(
        mut self,
        content: impl Fn(&mut Window, &mut App) -> AnyElement + 'static,
    ) -> Self {
        self.content = Some(Rc::new(content));
        self
    }
}

impl Styled for TextPopover {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for TextPopover {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        use gpui_kit::component::StyledExt as _;

        let Some(content) = self.content else {
            return div()
                .refine_style(&self.style)
                .child(self.text)
                .into_any_element();
        };
        let state = window.use_keyed_state(
            ElementId::NamedChild(std::sync::Arc::new(self.id.clone()), "popover-state".into()),
            cx,
            |_, _| Floating::default(),
        );
        let at = state.read(cx).at;
        let popover_id =
            ElementId::NamedChild(std::sync::Arc::new(self.id.clone()), "popover".into());
        let popover = at.map(|at| {
            let content = content(window, cx);
            floating(popover_id, at, content, close(&state), window, cx)
        });

        let opened = state.clone();
        div()
            .id(self.id)
            .cursor_pointer()
            .when(at.is_some(), |this| this.opacity(0.8))
            .refine_style(&self.style)
            .child(self.text)
            .on_click(move |_, window, cx| {
                let position = window.mouse_position();
                opened.update(cx, |state, cx| {
                    state.at = Some(position);
                    cx.notify();
                });
            })
            .children(popover)
            .into_any_element()
    }
}
