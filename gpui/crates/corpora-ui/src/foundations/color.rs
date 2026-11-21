//! Color tokens.
//!
//! The source of truth is `react/src/assets/css/theme.css`: every value below
//! is the CSS custom property of the same name, kept in OKLCH so the two
//! libraries can be diffed line by line. This module and [`super::theme`] are
//! the only places that may name a raw color; components read roles through
//! `cx.theme()` and [`super::ActiveCorporaTheme::palette`].

use gpui_kit::Hsla;
use gpui_kit::component::{
    amber, blue, emerald, fuchsia, indigo, neutral, oklch, red, violet, white, yellow, zinc,
};

/// OKLCH color with an alpha channel, `oklch(l c h / alpha)` in CSS.
fn oklcha(lightness: f32, chroma: f32, hue: f32, alpha: f32) -> Hsla {
    oklch(lightness, chroma, hue).alpha(alpha)
}

/// One appearance of the Corpora palette: the `:root` or `.dark` block of
/// `theme.css`.
///
/// Fields carry the CSS property name with dashes turned into underscores.
/// Most roles are also installed into GPUI Component's theme by
/// [`super::theme::init`], so stock components pick them up; the roles that
/// theme has no slot for (`card`, `invert`, the `*_foreground` text shades)
/// are read from here.
#[derive(Clone, Copy, Debug, PartialEq)]
#[non_exhaustive]
pub struct Palette {
    pub background: Hsla,
    pub foreground: Hsla,
    pub card: Hsla,
    pub card_foreground: Hsla,
    pub popover: Hsla,
    pub popover_foreground: Hsla,
    pub primary: Hsla,
    pub primary_foreground: Hsla,
    pub secondary: Hsla,
    pub secondary_foreground: Hsla,
    pub muted: Hsla,
    pub muted_foreground: Hsla,
    pub accent: Hsla,
    pub accent_foreground: Hsla,
    pub destructive: Hsla,
    /// Text shade of the destructive role, for tinted and outlined surfaces.
    /// Text on a solid destructive fill is [`Self::on_status`].
    pub destructive_foreground: Hsla,
    pub border: Hsla,
    pub input: Hsla,
    pub ring: Hsla,
    pub chart: [Hsla; 5],
    pub sidebar: Hsla,
    pub sidebar_foreground: Hsla,
    pub sidebar_primary: Hsla,
    pub sidebar_primary_foreground: Hsla,
    pub sidebar_accent: Hsla,
    pub sidebar_accent_foreground: Hsla,
    pub sidebar_border: Hsla,
    pub sidebar_ring: Hsla,
    pub info: Hsla,
    /// Text shade of the info role, as [`Self::destructive_foreground`].
    pub info_foreground: Hsla,
    pub success: Hsla,
    /// Text shade of the success role, as [`Self::destructive_foreground`].
    pub success_foreground: Hsla,
    pub warning: Hsla,
    /// Text shade of the warning role, as [`Self::destructive_foreground`].
    pub warning_foreground: Hsla,
    pub invert: Hsla,
    pub invert_foreground: Hsla,
    /// Text on a solid status fill (`text-white` in the React variants).
    pub on_status: Hsla,
    /// Surface of the current user's chat bubble.
    pub bubble_sender: Hsla,
    pub bubble_sender_foreground: Hsla,
    /// Surface of another person's chat bubble.
    pub bubble_recipient: Hsla,
    pub bubble_recipient_foreground: Hsla,
    /// The two ends of the ring around an avatar with live audio.
    pub audio_ring: [Hsla; 2],
}

impl Palette {
    /// The `:root` block.
    pub fn light() -> Self {
        Self {
            background: oklch(1., 0., 0.),
            foreground: oklch(0.145, 0., 0.),
            card: oklch(1., 0., 0.),
            card_foreground: oklch(0.145, 0., 0.),
            popover: oklch(1., 0., 0.),
            popover_foreground: oklch(0.145, 0., 0.),
            primary: oklch(0.457, 0.24, 277.023),
            primary_foreground: oklch(0.962, 0.018, 272.314),
            secondary: oklch(0.967, 0.001, 286.375),
            secondary_foreground: oklch(0.21, 0.006, 285.885),
            muted: oklch(0.97, 0., 0.),
            muted_foreground: oklch(0.556, 0., 0.),
            accent: oklch(0.97, 0., 0.),
            accent_foreground: oklch(0.205, 0., 0.),
            destructive: oklch(0.577, 0.245, 27.325),
            destructive_foreground: red(700),
            border: oklch(0.922, 0., 0.),
            input: oklch(0.922, 0., 0.),
            ring: oklch(0.708, 0., 0.),
            chart: chart(),
            sidebar: oklch(0.985, 0., 0.),
            sidebar_foreground: oklch(0.145, 0., 0.),
            sidebar_primary: oklch(0.511, 0.262, 276.966),
            sidebar_primary_foreground: oklch(0.962, 0.018, 272.314),
            sidebar_accent: oklch(0.97, 0., 0.),
            sidebar_accent_foreground: oklch(0.205, 0., 0.),
            sidebar_border: oklch(0.922, 0., 0.),
            sidebar_ring: oklch(0.708, 0., 0.),
            info: blue(500),
            info_foreground: blue(700),
            success: emerald(500),
            success_foreground: emerald(700),
            warning: amber(500),
            warning_foreground: amber(700),
            invert: zinc(900),
            invert_foreground: zinc(50),
            on_status: white(),
            bubble_sender: indigo(700),
            bubble_sender_foreground: oklch(1., 0., 0.),
            bubble_recipient: neutral(100),
            bubble_recipient_foreground: oklch(0.145, 0., 0.),
            audio_ring: audio_ring(),
        }
    }

    /// The `.dark` block.
    pub fn dark() -> Self {
        Self {
            background: oklch(0.145, 0., 0.),
            foreground: oklch(0.985, 0., 0.),
            card: oklch(0.205, 0., 0.),
            card_foreground: oklch(0.985, 0., 0.),
            popover: oklch(0.205, 0., 0.),
            popover_foreground: oklch(0.985, 0., 0.),
            primary: oklch(0.398, 0.195, 277.366),
            primary_foreground: oklch(0.962, 0.018, 272.314),
            secondary: oklch(0.274, 0.006, 286.033),
            secondary_foreground: oklch(0.985, 0., 0.),
            muted: oklch(0.269, 0., 0.),
            muted_foreground: oklch(0.708, 0., 0.),
            accent: oklch(0.269, 0., 0.),
            accent_foreground: oklch(0.985, 0., 0.),
            destructive: oklch(0.704, 0.191, 22.216),
            destructive_foreground: red(400),
            border: oklcha(1., 0., 0., 0.10),
            input: oklcha(1., 0., 0., 0.15),
            ring: oklch(0.556, 0., 0.),
            chart: chart(),
            sidebar: oklch(0.205, 0., 0.),
            sidebar_foreground: oklch(0.985, 0., 0.),
            sidebar_primary: oklch(0.585, 0.233, 277.117),
            sidebar_primary_foreground: oklch(0.962, 0.018, 272.314),
            sidebar_accent: oklch(0.269, 0., 0.),
            sidebar_accent_foreground: oklch(0.985, 0., 0.),
            sidebar_border: oklcha(1., 0., 0., 0.10),
            sidebar_ring: oklch(0.556, 0., 0.),
            info: blue(500),
            info_foreground: blue(400),
            success: emerald(500),
            success_foreground: emerald(400),
            warning: amber(500),
            warning_foreground: amber(400),
            invert: zinc(700),
            invert_foreground: zinc(50),
            on_status: white(),
            bubble_sender: neutral(100),
            bubble_sender_foreground: oklch(0.145, 0., 0.),
            bubble_recipient: neutral(800),
            bubble_recipient_foreground: oklch(0.985, 0., 0.),
            audio_ring: audio_ring(),
        }
    }
}

/// `--chart-1` … `--chart-5`, shared by both appearances.
fn chart() -> [Hsla; 5] {
    [
        oklch(0.811, 0.111, 293.571),
        oklch(0.606, 0.25, 292.717),
        oklch(0.541, 0.281, 293.009),
        oklch(0.491, 0.27, 292.581),
        oklch(0.432, 0.232, 292.759),
    ]
}

/// `from-yellow-400 … to-violet-600`, shared by both appearances. The React
/// ring passes through fuchsia; a GPUI gradient has two stops, so the ends
/// are the yellow and the midpoint of fuchsia and violet.
fn audio_ring() -> [Hsla; 2] {
    use gpui_kit::component::Colorize as _;
    [yellow(400), fuchsia(500).mix(violet(600), 0.5)]
}
