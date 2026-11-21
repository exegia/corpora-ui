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
    /// Brightness of the lit rim.
    pub edge: f32,
    pub edge_width: Pixels,
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
            edge: 0.26,
            edge_width: px(1.4),
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
            edge: 0.34,
            edge_width: px(2.),
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
            edge: 0.,
            edge_width: px(0.),
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
            edge: 0.22,
            edge_width: px(1.2),
            ..Self::default()
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
            edge: 0.2,
            edge_width: px(2.7),
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
            edge: 0.16,
            edge_width: px(6.3),
            ..Self::default()
        }
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
                edge: spec.edge,
                edge_width: spec.edge_width,
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
        assert!(deep.magnify > clear.magnify && deep.edge > clear.edge);
        assert_eq!(deep.blur_radius, clear.blur_radius);

        let blur = GlassSpec::blur();
        assert_eq!(blur.lens, px(0.));
        assert_eq!(blur.edge, 0.);
        assert_eq!(blur.blur_radius, clear.blur_radius);
    }

    #[test]
    fn tint_replaces_the_neutral_lift() {
        assert_eq!(GlassSpec::default().tint, None);
        let tinted = GlassSpec::default().tint(white());
        assert_eq!(tinted.tint, Some(white()));
    }
}
