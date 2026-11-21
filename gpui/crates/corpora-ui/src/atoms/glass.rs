//! Glass: the lens-and-frost material behind floating surfaces.
//!
//! Ported from `gpui-corpora`'s `ui::glass` and `ui::material`, themselves
//! adapted from Bezel's MIT-licensed `ui::surface` module.
//!
//! The material needs a backdrop pass in the renderer that published GPUI
//! does not have. This workspace patches it in (`gpui/vendor`), on Metal
//! only. Without the `glass` feature, or off macOS, a glass surface paints
//! its tint as a plain translucent fill.

use gpui_kit::component::ActiveTheme as _;
use gpui_kit::{
    AbsoluteLength, AnyElement, App, Bounds, Corners, Element, ElementId, GlobalElementId, Hsla,
    InspectorElementId, IntoElement, LayoutId, Pixels, Styled, Window, canvas, px,
    transparent_black, white,
};

/// The lit rim along one side of a glass surface.
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct GlassEdge {
    /// How far in from the side the light falls off to nothing.
    pub width: Pixels,
    /// How much white the rim adds, from 0 (none) to 1.
    pub brightness: f32,
}

impl GlassEdge {
    pub fn new(width: Pixels, brightness: f32) -> Self {
        Self { width, brightness }
    }
}

/// The lit rim of a glass surface, side by side. A corner blends the two
/// sides it joins.
///
/// ```ignore
/// // A bright top, as if lit from above, and no rim underneath.
/// GlassEdges::all(GlassEdge::new(px(1.4), 0.2))
///     .top(GlassEdge::new(px(2.), 0.5))
///     .bottom(GlassEdge::default())
/// ```
#[derive(Clone, Copy, Debug, Default, PartialEq)]
pub struct GlassEdges {
    pub top: GlassEdge,
    pub right: GlassEdge,
    pub bottom: GlassEdge,
    pub left: GlassEdge,
}

impl GlassEdges {
    /// The same rim on every side.
    pub fn all(edge: GlassEdge) -> Self {
        Self {
            top: edge,
            right: edge,
            bottom: edge,
            left: edge,
        }
    }

    /// Sets the left and right sides, as `px` does for padding.
    pub fn x(mut self, edge: GlassEdge) -> Self {
        self.left = edge;
        self.right = edge;
        self
    }

    /// Sets the top and bottom sides, as `py` does for padding.
    pub fn y(mut self, edge: GlassEdge) -> Self {
        self.top = edge;
        self.bottom = edge;
        self
    }

    pub fn top(mut self, edge: GlassEdge) -> Self {
        self.top = edge;
        self
    }

    pub fn right(mut self, edge: GlassEdge) -> Self {
        self.right = edge;
        self
    }

    pub fn bottom(mut self, edge: GlassEdge) -> Self {
        self.bottom = edge;
        self
    }

    pub fn left(mut self, edge: GlassEdge) -> Self {
        self.left = edge;
        self
    }
}

/// The parameters of a glass surface: how far it frosts, bends and tints
/// what lies behind it.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct GlassSpec {
    /// Gaussian blur of the backdrop. Zero leaves it sharp.
    pub blur_radius: Pixels,
    /// How deep the lens profile reaches in from the rim. Zero paints flat.
    pub lens: Pixels,
    /// The furthest the rim may drag the backdrop.
    pub reach: Pixels,
    /// Displacement amplitude. Its sign picks the direction.
    pub magnify: f32,
    /// Per-channel spread of the displacement: the chromatic fringe.
    pub dispersion: f32,
    /// Brightness of the backdrop in the light appearance.
    pub gain_light: f32,
    /// Brightness of the backdrop in the dark appearance.
    pub gain_dark: f32,
    /// How far the backdrop's color is pushed from its own grey.
    pub saturation: f32,
    /// The color laid over the backdrop. `None` is the neutral lift of
    /// [`neutral_tint`].
    pub tint: Option<Hsla>,
    /// The lit rim, side by side.
    pub edges: GlassEdges,
    /// Width of the antialiasing ramp at the surface's boundary.
    pub edge_aa: Pixels,
}

impl Default for GlassSpec {
    /// Clear glass: a sharp backdrop, bent at the rim.
    fn default() -> Self {
        Self {
            blur_radius: px(1.2),
            lens: px(28.),
            reach: px(64.),
            magnify: 1.2,
            dispersion: 0.014,
            gain_light: 1.041,
            gain_dark: 1.029,
            saturation: 1.,
            tint: None,
            edges: GlassEdges::all(GlassEdge::new(px(1.4), 0.26)),
            edge_aa: px(0.5),
        }
    }
}

impl GlassSpec {
    /// Clear glass with stronger refraction and a deeper lit rim.
    pub fn deep() -> Self {
        Self {
            magnify: 1.38,
            dispersion: 0.02,
            edges: GlassEdges::all(GlassEdge::new(px(2.), 0.34)),
            ..Self::default()
        }
    }

    /// A plain blur with no lens and no rim.
    pub fn blur() -> Self {
        Self {
            lens: px(0.),
            reach: px(0.),
            magnify: 0.,
            dispersion: 0.,
            edges: GlassEdges::all(GlassEdge::new(px(0.), 0.)),
            ..Self::default()
        }
    }

    /// Frosted glass for a surface that carries content, such as a popover
    /// or a picker: the backdrop is blurred until text over it stays
    /// readable, and tinted with the popover color.
    pub fn frosted(cx: &App) -> Self {
        let theme = cx.theme();
        Self {
            blur_radius: px(18.),
            lens: px(14.),
            reach: px(24.),
            magnify: 1.08,
            dispersion: 0.006,
            saturation: 1.35,
            tint: Some(
                theme
                    .popover
                    .opacity(if theme.is_dark() { 0.62 } else { 0.68 }),
            ),
            edges: GlassEdges::all(GlassEdge::new(px(1.2), 0.22)),
            ..Self::default()
        }
    }

    /// A flat frost for a bar that floats over scrolling content, such as a
    /// sticky header: no lens and no rim, so the bar reads as part of the
    /// surface it sits on.
    pub fn scrim(cx: &App) -> Self {
        let theme = cx.theme();
        Self {
            blur_radius: px(14.),
            saturation: 1.3,
            tint: Some(
                theme
                    .popover
                    .opacity(if theme.is_dark() { 0.55 } else { 0.6 }),
            ),
            ..Self::blur()
        }
    }

    /// Glass for the default action, tinted with the primary color.
    pub fn accent(cx: &App) -> Self {
        Self {
            blur_radius: px(0.8),
            lens: px(10.),
            reach: px(10.),
            magnify: 10.,
            dispersion: 0.,
            gain_light: 0.549,
            gain_dark: 0.549,
            saturation: 1.,
            tint: Some(cx.theme().primary.opacity(0.8)),
            edges: GlassEdges::all(GlassEdge::new(px(2.7), 0.2)),
            edge_aa: px(0.8),
        }
    }

    /// Glass for a destructive action, tinted with the danger color.
    pub fn destructive(cx: &App) -> Self {
        Self {
            blur_radius: px(0.5),
            lens: px(2.),
            magnify: -5.72,
            dispersion: 0.001,
            gain_light: 0.,
            gain_dark: 0.,
            saturation: 1.6,
            tint: Some(cx.theme().danger.opacity(0.58)),
            edges: GlassEdges::all(GlassEdge::new(px(6.3), 0.16)),
            ..Self::default()
        }
    }

    /// Replaces the lit rim. Pass [`GlassEdges::all`] for an even rim, or
    /// set sides apart with its `x`, `y`, `top`, `right`, `bottom` and
    /// `left`.
    pub fn edges(mut self, edges: GlassEdges) -> Self {
        self.edges = edges;
        self
    }

    /// Replaces the tint.
    pub fn tint(mut self, tint: Hsla) -> Self {
        self.tint = Some(tint);
        self
    }
}

/// The tint a glass surface paints when its spec supplies none: a faint
/// white lift.
pub fn neutral_tint(cx: &App) -> Hsla {
    white().opacity(if cx.theme().is_dark() {
        16. / 255.
    } else {
        18.8 / 255.
    })
}

/// A clear glass panel that fills its parent. Position it absolutely under
/// the content it backs, or use [`GlassSurfaceExt`] to wrap an element.
pub fn glass(radius: Pixels, spec: GlassSpec) -> impl IntoElement {
    canvas(
        |_, _, _| (),
        move |bounds, _, window, cx| {
            window.paint_layer(bounds, |window| {
                paint(bounds, Corners::all(radius), spec, window, cx);
            });
        },
    )
    .size_full()
}

fn paint(
    bounds: Bounds<Pixels>,
    corners: Corners<Pixels>,
    spec: GlassSpec,
    window: &mut Window,
    cx: &mut App,
) {
    let tint = spec.tint.unwrap_or_else(|| neutral_tint(cx));

    #[cfg(all(target_os = "macos", feature = "glass"))]
    {
        let half_extent = bounds.size.width.min(bounds.size.height) / 2.;
        window.paint_backdrop_blur(
            bounds,
            corners,
            gpui_kit::GlassEffect {
                blur_radius: spec.blur_radius,
                lens: spec.lens.min(half_extent),
                reach: spec.reach.min(half_extent),
                magnify: spec.magnify,
                dispersion: spec.dispersion,
                gain: if cx.theme().is_dark() {
                    spec.gain_dark
                } else {
                    spec.gain_light
                },
                saturation: spec.saturation,
                tint,
                edge: gpui_kit::Edges {
                    top: spec.edges.top.brightness,
                    right: spec.edges.right.brightness,
                    bottom: spec.edges.bottom.brightness,
                    left: spec.edges.left.brightness,
                },
                edge_width: gpui_kit::Edges {
                    top: spec.edges.top.width,
                    right: spec.edges.right.width,
                    bottom: spec.edges.bottom.width,
                    left: spec.edges.left.width,
                },
                edge_aa: spec.edge_aa,
            },
        );
    }

    #[cfg(not(all(target_os = "macos", feature = "glass")))]
    window.paint_quad(gpui_kit::fill(bounds, tint).corner_radii(corners));
}

/// Puts the glass material behind a styled element and its subtree.
///
/// ```ignore
/// div().rounded_xl().p_2().child("Reactions").glass()
/// div().rounded_xl().glass_with(GlassSpec::frosted(cx))
/// ```
///
/// The element's own background is dropped and its corner radii shape the
/// glass. Call it last: the result is no longer `Styled`.
pub trait GlassSurfaceExt: Styled + IntoElement + Sized {
    /// Clear glass with the neutral tint.
    fn glass(self) -> GlassSurface {
        self.glass_with(GlassSpec::default())
    }

    /// Clear glass with a tint of the caller's choosing.
    fn tinted_glass(self, tint: Hsla) -> GlassSurface {
        self.glass_with(GlassSpec::default().tint(tint))
    }

    /// Glass with the caller's parameters.
    fn glass_with(mut self, spec: GlassSpec) -> GlassSurface {
        let square = AbsoluteLength::from(px(0.));
        let radii = &self.style().corner_radii;
        let corners = Corners {
            top_left: radii.top_left.unwrap_or(square),
            top_right: radii.top_right.unwrap_or(square),
            bottom_right: radii.bottom_right.unwrap_or(square),
            bottom_left: radii.bottom_left.unwrap_or(square),
        };
        self.style().background = Some(transparent_black().into());
        GlassSurface {
            corners,
            spec,
            scale: 1.,
            child: self.into_any_element(),
        }
    }
}

impl<E: Styled + IntoElement> GlassSurfaceExt for E {}

/// An element with glass painted beneath it. Built by [`GlassSurfaceExt`].
pub struct GlassSurface {
    corners: Corners<AbsoluteLength>,
    spec: GlassSpec,
    scale: f32,
    child: AnyElement,
}

impl GlassSurface {
    /// Scales the painted subtree about its center. Layout and hit testing
    /// keep the unscaled bounds.
    pub fn scale(mut self, scale: f32) -> Self {
        self.scale = scale;
        self
    }
}

impl Element for GlassSurface {
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
        let rem = window.rem_size();
        let corners = Corners {
            top_left: self.corners.top_left.to_pixels(rem),
            top_right: self.corners.top_right.to_pixels(rem),
            bottom_right: self.corners.bottom_right.to_pixels(rem),
            bottom_left: self.corners.bottom_left.to_pixels(rem),
        }
        .clamp_radii_for_quad_size(bounds.size);
        let spec = self.spec;
        window.with_paint_scale(bounds.center(), self.scale, |window| {
            window.paint_layer(bounds, |window| {
                paint(bounds, corners, spec, window, cx);
                self.child.paint(window, cx);
            });
        });
    }
}

impl IntoElement for GlassSurface {
    type Element = Self;

    fn into_element(self) -> Self::Element {
        self
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn presets_differ_from_clear_glass_only_where_they_say() {
        let clear = GlassSpec::default();
        let deep = GlassSpec::deep();
        assert!(deep.magnify > clear.magnify);
        assert!(deep.edges.top.brightness > clear.edges.top.brightness);
        assert_eq!(deep.blur_radius, clear.blur_radius);

        let blur = GlassSpec::blur();
        assert_eq!(blur.lens, px(0.));
        assert_eq!(blur.edges, GlassEdges::default());
        assert_eq!(blur.blur_radius, clear.blur_radius);
    }

    #[test]
    fn an_axis_sets_both_of_its_sides_and_a_side_only_itself() {
        let thin = GlassEdge::new(px(1.), 0.1);
        let lit = GlassEdge::new(px(3.), 0.6);
        let edges = GlassEdges::all(thin).y(lit).bottom(GlassEdge::default());
        assert_eq!(edges.top, lit);
        assert_eq!(edges.bottom, GlassEdge::default());
        assert_eq!((edges.left, edges.right), (thin, thin));
        assert_eq!(GlassEdges::all(thin).x(lit).left, lit);
        assert_eq!(GlassEdges::all(thin).x(lit).top, thin);
    }

    #[test]
    fn tint_replaces_the_neutral_lift() {
        assert_eq!(GlassSpec::default().tint, None);
        let tinted = GlassSpec::default().tint(white());
        assert_eq!(tinted.tint, Some(white()));
    }
}
