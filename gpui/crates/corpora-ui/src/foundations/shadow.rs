//! Shadow tokens: `react/src/assets/css/shadows.css`.
//!
//! Shadow offsets and blurs are physical light geometry, so they are in
//! pixels and do not scale with interface zoom. Shadow inks are black and
//! white by definition; this is the token layer that may name them.

use gpui_kit::component::ActiveTheme as _;
use gpui_kit::{App, BoxShadow, Hsla, black, point, px, white};

fn layer(inset: bool, x: f32, y: f32, blur: f32, color: Hsla) -> BoxShadow {
    BoxShadow {
        color,
        offset: point(px(x), px(y)),
        blur_radius: px(blur),
        spread_radius: px(0.),
        inset,
    }
}

/// `shadow-xs/5`: the resting elevation of cards and outlined controls.
///
/// Empty when the theme turns shadows off.
pub fn shadow_xs(cx: &App) -> Vec<BoxShadow> {
    if !cx.theme().shadow {
        return Vec::new();
    }
    vec![layer(false, 0., 1., 2., black().opacity(0.05))]
}

/// `shadow-bezel`: a raised surface lit from the top left.
pub fn shadow_bezel(cx: &App) -> Vec<BoxShadow> {
    if cx.theme().is_dark() {
        vec![
            layer(true, 1., 1., 2., white().opacity(0.15)),
            layer(true, -2., -2., 4., black().opacity(0.6)),
        ]
    } else {
        vec![
            layer(true, 1., 1., 4., white().opacity(0.7)),
            layer(true, -2., -2., 3., black().opacity(0.05)),
        ]
    }
}

/// `shadow-debossed`: a surface pressed into the page.
pub fn shadow_debossed(cx: &App) -> Vec<BoxShadow> {
    if cx.theme().is_dark() {
        vec![
            layer(true, 2., 2., 4., black().opacity(0.6)),
            layer(true, -1., -1., 2., white().opacity(0.15)),
        ]
    } else {
        vec![
            layer(true, 2., 2., 4., black().opacity(0.25)),
            layer(true, -1., -1., 2., white().opacity(0.7)),
        ]
    }
}

/// `shadow-pill`: the drop under a floating pill.
pub fn shadow_pill() -> Vec<BoxShadow> {
    vec![layer(false, 0., 4., 8., black().opacity(0.25))]
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
    let lit = state.lit();
    if cx.theme().is_dark() {
        vec![
            layer(true, 0., 1., 0., white().opacity(0.22 * lit)),
            layer(true, 0., -1., 0., black().opacity(0.18)),
        ]
    } else {
        vec![
            layer(true, 0., 1., 0., white().opacity(0.40 * lit)),
            layer(true, 0., 2., 3., white().opacity(0.16 * lit)),
            layer(true, 0., -1., 0., black().opacity(0.28)),
            layer(true, 0., -3., 4., black().opacity(0.14)),
        ]
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
    let lit = state.lit();
    if cx.theme().is_dark() {
        vec![
            layer(true, 0., 1., 0., white().opacity(0.10 * lit)),
            layer(true, 0., -1., 0., black().opacity(0.25)),
        ]
    } else {
        vec![
            layer(true, 0., 1., 0., white().opacity(0.9)),
            layer(true, 0., -1., 0., black().opacity(0.16 * lit)),
            layer(true, 0., -3., 4., black().opacity(0.07 * lit)),
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
    // A saturated or pale surface: faint sheen, heavy base shade. A neutral
    // one: strong sheen, faint shade.
    let heavy = lit != cx.theme().is_dark();
    if heavy {
        vec![
            layer(true, 0., 2., 3., white().opacity(0.14)),
            layer(true, 0., -2., 3., black().opacity(0.78)),
        ]
    } else {
        vec![
            layer(true, 0., 2., 2., white().opacity(0.57)),
            layer(true, 0., -2., 3., black().opacity(0.11)),
        ]
    }
}
