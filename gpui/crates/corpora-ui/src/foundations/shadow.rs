//! Shadow tokens: `react/src/assets/css/shadows.css`.
//!
//! Shadow offsets and blurs are physical light geometry, so they are in
//! pixels and do not scale with interface zoom. The inks are the theme's
//! `highlight` and `shadow` roles; only their opacity is set here.

use gpui_kit::component::ActiveTheme as _;
use gpui_kit::{App, BoxShadow, Hsla, point, px};

use super::ActiveCorporaTheme as _;

fn layer(inset: bool, x: f32, y: f32, blur: f32, color: Hsla) -> BoxShadow {
    BoxShadow {
        color,
        offset: point(px(x), px(y)),
        blur_radius: px(blur),
        spread_radius: px(0.),
        inset,
    }
}

/// The theme's light and shade inks, in that order.
fn inks(cx: &App) -> (Hsla, Hsla) {
    let palette = cx.palette();
    (palette.highlight, palette.shadow)
}

/// `shadow-xs/5`: the resting elevation of cards and outlined controls.
///
/// Empty when the theme turns shadows off.
pub fn shadow_xs(cx: &App) -> Vec<BoxShadow> {
    if !cx.theme().shadow {
        return Vec::new();
    }
    let (_, shade) = inks(cx);
    vec![layer(false, 0., 1., 2., shade.opacity(0.05))]
}

/// `shadow-bezel`: a raised surface lit from the top left.
pub fn shadow_bezel(cx: &App) -> Vec<BoxShadow> {
    let (light, shade) = inks(cx);
    if cx.theme().is_dark() {
        vec![
            layer(true, 1., 1., 2., light.opacity(0.15)),
            layer(true, -2., -2., 4., shade.opacity(0.6)),
        ]
    } else {
        vec![
            layer(true, 1., 1., 4., light.opacity(0.7)),
            layer(true, -2., -2., 3., shade.opacity(0.05)),
        ]
    }
}

/// `shadow-debossed`: a surface pressed into the page.
pub fn shadow_debossed(cx: &App) -> Vec<BoxShadow> {
    let (light, shade) = inks(cx);
    if cx.theme().is_dark() {
        vec![
            layer(true, 2., 2., 4., shade.opacity(0.6)),
            layer(true, -1., -1., 2., light.opacity(0.15)),
        ]
    } else {
        vec![
            layer(true, 2., 2., 4., shade.opacity(0.25)),
            layer(true, -1., -1., 2., light.opacity(0.7)),
        ]
    }
}

/// `shadow-pill`: the drop under a floating pill.
pub fn shadow_pill(cx: &App) -> Vec<BoxShadow> {
    let (_, shade) = inks(cx);
    vec![layer(false, 0., 1.5, 2., shade.opacity(0.05))]
}

/// How lit an embossed surface is.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum Emboss {
    /// At rest.
    #[default]
    Rest,
    /// Under the pointer: the lit edge brightens, as if the surface rose.
    Hover,
}

impl Emboss {
    /// Multiplier on the lit edge.
    const fn lit(self) -> f32 {
        match self {
            Self::Rest => 1.0,
            Self::Hover => 1.6,
        }
    }
}

/// The emboss of a filled control: a lit top edge and a shaded bottom edge,
/// both inside the fill. There is no drop; the surface is shaped, not floated.
///
/// Stronger than React's `inset-shadow-[0_1px_white/16%]`, most of all on a
/// light surface, where that reads flat.
///
/// Empty when the theme turns shadows off.
pub fn shadow_raised(state: Emboss, cx: &App) -> Vec<BoxShadow> {
    if !cx.theme().shadow {
        return Vec::new();
    }
    let (light, shade) = inks(cx);
    let lit = state.lit();
    if cx.theme().is_dark() {
        vec![
            layer(true, 0., 1., 0., light.opacity(0.22 * lit)),
            layer(true, 0., -1., 0., shade.opacity(0.18)),
        ]
    } else {
        vec![
            layer(true, 0., 1., 0., light.opacity(0.40 * lit)),
            layer(true, 0., 2., 3., light.opacity(0.16 * lit)),
            layer(true, 0., -1., 0., shade.opacity(0.28)),
            layer(true, 0., -2.7, 2., shade.opacity(0.24)),
        ]
    }
}

/// Card reflected inset shadow effect.
/// To give the card a raised, inset look.
///
pub fn shadow_inset(cx: &App) -> Vec<BoxShadow> {
    if !cx.theme().shadow {
        return Vec::new();
    }
    let (light, shade) = inks(cx);
    if cx.theme().is_dark() {
        vec![layer(true, 0., 1.5, 0., light.opacity(0.2))]
    } else {
        vec![layer(
            true,
            0.,
            1.5,
            1.,
            cx.theme().foreground.opacity(0.15),
        )]
    }
}

/// The emboss of a neutral control, outlined or secondary: as
/// [`shadow_raised`], in the inks a pale surface needs.
///
/// Empty when the theme turns shadows off.
pub fn shadow_raised_neutral(state: Emboss, cx: &App) -> Vec<BoxShadow> {
    if !cx.theme().shadow {
        return Vec::new();
    }
    let (light, shade) = inks(cx);
    let lit = state.lit();
    if cx.theme().is_dark() {
        vec![
            layer(true, 0., 1., 0., light.opacity(0.10 * lit)),
            layer(true, 0., -1., 0., shade.opacity(0.25)),
        ]
    } else {
        vec![
            layer(true, 0., 1., 0., light.opacity(0.9)),
            layer(true, 0., -1., 0., shade.opacity(0.16 * lit)),
            layer(true, 0., -3., 4., shade.opacity(0.07 * lit)),
        ]
    }
}

/// The inset bezel of a chat bubble: light catching the top, shade under the
/// base. `lit` is the bright treatment, which the sender's bubble takes on a
/// light page and the recipient's on a dark one.
pub fn shadow_bubble(lit: bool, cx: &App) -> Vec<BoxShadow> {
    if !cx.theme().shadow {
        return Vec::new();
    }
    let (light, shade) = inks(cx);
    // A saturated or pale surface: faint sheen, heavy base shade. A neutral
    // one: strong sheen, faint shade.
    let heavy = lit != cx.theme().is_dark();
    if heavy {
        vec![
            layer(true, 1., 1.5, 1.5, light.opacity(0.4)),
            layer(true, 1., -2., 1.5, shade.opacity(0.4)),
        ]
    } else {
        vec![
            layer(true, 0., 2., 1.5, light.opacity(0.57)),
            layer(true, 0., -2., 1.5, shade.opacity(0.11)),
        ]
    }
}
