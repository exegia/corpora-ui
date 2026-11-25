//! SegmentedToggle: `react/src/components/ui/chat/segmented-toggle.tsx`.

use std::cell::RefCell;
use std::rc::Rc;

use gpui_kit::base::motion::{Transition, transition};
use gpui_kit::component::{ActiveTheme as _, h_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    App, ElementId, FontWeight, InteractiveElement as _, IntoElement, ParentElement as _,
    RenderOnce, SharedString, StatefulInteractiveElement as _, Styled as _, Window, div, px,
};

use super::mark::subtle;
use crate::foundations::motion::{DURATION_FAST, EASE_SMOOTH_OUT};
use crate::foundations::shadow::shadow_xs;

/// Inset of the segments inside the track.
const TRACK_INSET: f32 = 2.;

type ChangeHandler = Rc<dyn Fn(&SharedString, &mut Window, &mut App)>;

/// What the toggle remembers between frames.
#[derive(Default)]
struct Segments {
    /// The value picked here, when the owner does not hold it.
    picked: Option<SharedString>,
    /// Each segment's offset from the first one and its width, in pixels.
    spans: Rc<RefCell<Vec<(f32, f32)>>>,
}

/// A switch between two or more views of the same thing, with a pill that
/// slides to the active one.
///
/// ```ignore
/// SegmentedToggle::new("code-view")
///     .option("code", "Code")
///     .option("diff", "Diff")
///     .on_change(cx.listener(|this, value: &SharedString, _, cx| { /* … */ }))
/// ```
///
/// Without [`Self::value`] the toggle keeps its own selection, starting at
/// the first option.
#[derive(IntoElement)]
pub struct SegmentedToggle {
    id: ElementId,
    options: Vec<(SharedString, SharedString)>,
    value: Option<SharedString>,
    on_change: Option<ChangeHandler>,
}

impl SegmentedToggle {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            options: Vec::new(),
            value: None,
            on_change: None,
        }
    }

    /// Adds a segment. `value` identifies it; `label` is what it shows.
    pub fn option(
        mut self,
        value: impl Into<SharedString>,
        label: impl Into<SharedString>,
    ) -> Self {
        self.options.push((value.into(), label.into()));
        self
    }

    /// Sets the active segment from outside.
    pub fn value(mut self, value: impl Into<SharedString>) -> Self {
        self.value = Some(value.into());
        self
    }

    /// Called with the segment's value when another one is picked.
    pub fn on_change(
        mut self,
        handler: impl Fn(&SharedString, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_change = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for SegmentedToggle {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let child_id =
            |name: SharedString| ElementId::NamedChild(std::sync::Arc::new(self.id.clone()), name);
        let state =
            window.use_keyed_state(child_id("segments".into()), cx, |_, _| Segments::default());
        let (picked, spans) = {
            let state = state.read(cx);
            (state.picked.clone(), state.spans.clone())
        };
        let current = self
            .value
            .or(picked)
            .or_else(|| self.options.first().map(|(value, _)| value.clone()));
        let active = self
            .options
            .iter()
            .position(|(value, _)| Some(value) == current.as_ref());

        let theme = cx.theme();
        let foreground = theme.foreground;
        let muted = theme.muted_foreground;
        let surface = theme.background;
        let shadow = shadow_xs(cx);

        // The pill glides between segments once they have been measured.
        let span = active.and_then(|active| spans.borrow().get(active).copied());
        let pill = span.map(|(left, width)| {
            let glide = Transition::new(DURATION_FAST).easing(EASE_SMOOTH_OUT.easing());
            let left = transition(
                (child_id("left".into()), "left"),
                left,
                glide.clone(),
                window,
                cx,
            );
            let width = transition(
                (child_id("width".into()), "width"),
                width,
                glide,
                window,
                cx,
            );
            div()
                .absolute()
                .top(px(TRACK_INSET))
                .bottom(px(TRACK_INSET))
                .left(px(TRACK_INSET + left))
                .w(px(width))
                .rounded(px(5.))
                .bg(surface)
                .shadow(shadow)
        });

        let measured = spans.clone();
        let segments = h_flex()
            .on_children_prepainted(move |bounds, window, _| {
                let Some(first) = bounds.first() else { return };
                let next: Vec<(f32, f32)> = bounds
                    .iter()
                    .map(|segment| {
                        (
                            f32::from(segment.left() - first.left()),
                            f32::from(segment.size.width),
                        )
                    })
                    .collect();
                if *measured.borrow() != next {
                    *measured.borrow_mut() = next;
                    window.refresh();
                }
            })
            .children(
                self.options
                    .into_iter()
                    .enumerate()
                    .map(|(index, (value, label))| {
                        let is_active = Some(index) == active;
                        let state = state.clone();
                        let on_change = self.on_change.clone();
                        div()
                            .id(child_id(value.clone()))
                            .relative()
                            .h_5()
                            .px_2()
                            .flex()
                            .items_center()
                            .text_xs()
                            .font_weight(FontWeight::MEDIUM)
                            .text_color(if is_active { foreground } else { muted })
                            .when(!is_active, |this| {
                                this.cursor_pointer()
                                    .hover(move |this| this.text_color(foreground))
                            })
                            .child(label)
                            .on_click(move |_, window, cx| {
                                if is_active {
                                    return;
                                }
                                state.update(cx, |state, cx| {
                                    state.picked = Some(value.clone());
                                    cx.notify();
                                });
                                if let Some(on_change) = &on_change {
                                    on_change(&value, window, cx);
                                }
                            })
                    }),
            );

        div()
            .relative()
            .flex_none()
            .p(px(TRACK_INSET))
            .rounded(px(7.))
            .bg(subtle(cx))
            .children(pill)
            .child(segments)
    }
}
