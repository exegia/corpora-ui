//! Scaled: paints an element larger or smaller without moving its layout.

use gpui_kit::{
    AnyElement, App, Bounds, Element, ElementId, GlobalElementId, InspectorElementId, IntoElement,
    LayoutId, Pixels, Window,
};

/// An element painted at a scale about its own center. Layout and hit
/// testing keep the unscaled bounds, so a pulse never pushes its neighbors.
pub(crate) struct Scaled {
    scale: f32,
    child: AnyElement,
}

impl Scaled {
    pub(crate) fn new(scale: f32, child: impl IntoElement) -> Self {
        Self {
            scale,
            child: child.into_any_element(),
        }
    }
}

impl Element for Scaled {
    type RequestLayoutState = ();
    type PrepaintState = ();

    fn id(&self) -> Option<ElementId> {
        None
    }

    fn source_location(&self) -> Option<&'static core::panic::Location<'static>> {
        None
    }

    fn request_layout(
        &mut self,
        _: Option<&GlobalElementId>,
        _: Option<&InspectorElementId>,
        window: &mut Window,
        cx: &mut App,
    ) -> (LayoutId, Self::RequestLayoutState) {
        (self.child.request_layout(window, cx), ())
    }

    fn prepaint(
        &mut self,
        _: Option<&GlobalElementId>,
        _: Option<&InspectorElementId>,
        _: Bounds<Pixels>,
        _: &mut Self::RequestLayoutState,
        window: &mut Window,
        cx: &mut App,
    ) -> Self::PrepaintState {
        self.child.prepaint(window, cx);
    }

    fn paint(
        &mut self,
        _: Option<&GlobalElementId>,
        _: Option<&InspectorElementId>,
        bounds: Bounds<Pixels>,
        _: &mut Self::RequestLayoutState,
        _: &mut Self::PrepaintState,
        window: &mut Window,
        cx: &mut App,
    ) {
        window.with_paint_scale(bounds.center(), self.scale, |window| {
            self.child.paint(window, cx);
        });
    }
}

impl IntoElement for Scaled {
    type Element = Self;

    fn into_element(self) -> Self::Element {
        self
    }
}
