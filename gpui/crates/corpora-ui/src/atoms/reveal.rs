//! Reveal: content that opens and closes by growing from nothing.

use gpui_kit::base::motion::{MotionReveal, Transition, transition};
use gpui_kit::{
    AnyElement, App, ElementId, IntoElement, ParentElement as _, RenderOnce, Styled as _, Window,
    div,
};

use crate::foundations::motion::{DURATION_FAST, EASE_SMOOTH_OUT};

/// Shows or hides content by animating its height and opacity.
///
/// ```ignore
/// Reveal::new("advanced-options", self.show_advanced).child(advanced_options)
/// ```
///
/// Closed content is not rendered at all, so nothing inside it can take
/// focus. Under reduced motion the change is immediate.
#[derive(IntoElement)]
pub struct Reveal {
    id: ElementId,
    open: bool,
    child: Option<AnyElement>,
}

impl Reveal {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>, open: bool) -> Self {
        Self {
            id: id.into(),
            open,
            child: None,
        }
    }

    pub fn child(mut self, child: impl IntoElement) -> Self {
        self.child = Some(child.into_any_element());
        self
    }
}

impl RenderOnce for Reveal {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let progress = transition(
            (self.id.clone(), "reveal"),
            if self.open { 1.0_f32 } else { 0.0 },
            Transition::new(DURATION_FAST).easing(EASE_SMOOTH_OUT.easing()),
            window,
            cx,
        );
        let visible = self.open || progress > 0.;
        let child = self.child.filter(|_| visible);
        div()
            .w_full()
            .opacity(progress)
            .children(child.map(|child| MotionReveal::new(self.id, progress, child)))
    }
}
