//! Installs the Corpora palette into GPUI Component's theme and keeps the
//! roles that theme has no slot for.

use std::rc::Rc;

use gpui_kit::component::{Colorize as _, Theme, ThemeConfig, ThemeConfigColors, ThemeMode};
use gpui_kit::{App, Global, Hsla, SharedString, black, white};

use super::color::Palette;
use super::radius::RADIUS_BASE_PX;
use super::typography::FontFamilies;

/// Name of the light theme registered by [`init`].
pub const LIGHT_THEME_NAME: &str = "Corpora Light";
/// Name of the dark theme registered by [`init`].
pub const DARK_THEME_NAME: &str = "Corpora Dark";

/// Share of [`RADIUS_BASE_PX`] that controls round to: `--radius-md`.
const CONTROL_RADIUS_FACTOR: f32 = 0.8;
/// How far a button fill moves under the pointer and when pressed.
///
/// React fades the fill toward the page (`hover:bg-primary/90`), which washes
/// an embossed surface out. Here the fill keeps its body: it deepens on a
/// light page and lifts on a dark one, and a press always sinks it.
#[derive(Clone, Copy)]
struct Travel {
    hover: f32,
    active: f32,
}

/// Travel of a solid accent fill.
const FILLED_TRAVEL: Travel = Travel {
    hover: 0.10,
    active: 0.20,
};
/// Travel of a pale neutral surface, which shows a small change sooner.
const NEUTRAL_TRAVEL: Travel = Travel {
    hover: 0.045,
    active: 0.09,
};

/// The Corpora design tokens GPUI Component's [`Theme`] cannot hold.
///
/// Owned by the application as a GPUI global, installed by [`init`]. Read it
/// through [`ActiveCorporaTheme`].
#[derive(Clone, Debug)]
pub struct CorporaTheme {
    light: Palette,
    dark: Palette,
    fonts: FontFamilies,
}

impl Global for CorporaTheme {}

impl CorporaTheme {
    /// The palette of one appearance, whichever is active.
    pub fn palette_for(&self, mode: ThemeMode) -> &Palette {
        if mode.is_dark() {
            &self.dark
        } else {
            &self.light
        }
    }

    /// The font families resolved against the fonts installed on this machine.
    pub fn fonts(&self) -> &FontFamilies {
        &self.fonts
    }
}

/// Reads the Corpora tokens for the active appearance.
pub trait ActiveCorporaTheme {
    /// The Corpora token global.
    ///
    /// # Panics
    ///
    /// Panics when [`crate::init`] has not run.
    fn corpora_theme(&self) -> &CorporaTheme;

    /// The palette of the active appearance.
    fn palette(&self) -> &Palette;
}

impl ActiveCorporaTheme for App {
    fn corpora_theme(&self) -> &CorporaTheme {
        self.global::<CorporaTheme>()
    }

    fn palette(&self) -> &Palette {
        self.corpora_theme().palette_for(Theme::global(self).mode)
    }
}

/// Registers the Corpora light and dark themes and applies the one matching
/// the current mode.
///
/// GPUI Component must already be initialized. Call [`crate::init`] rather
/// than this directly.
pub fn init(cx: &mut App) {
    let light = Palette::light();
    let dark = Palette::dark();
    let fonts = FontFamilies::resolve(cx);

    let light_config = Rc::new(theme_config(
        LIGHT_THEME_NAME,
        ThemeMode::Light,
        &light,
        &fonts,
    ));
    let dark_config = Rc::new(theme_config(
        DARK_THEME_NAME,
        ThemeMode::Dark,
        &dark,
        &fonts,
    ));

    cx.set_global(CorporaTheme { light, dark, fonts });

    let theme = Theme::global_mut(cx);
    theme.light_theme = light_config;
    theme.dark_theme = dark_config;
    let mode = theme.mode;
    // Reloads the mode's registered theme, which is now ours, and pushes it
    // down to the Base layer.
    Theme::change(mode, None, cx);
}

/// Switches between the Corpora light and dark themes.
pub fn set_mode(mode: ThemeMode, cx: &mut App) {
    Theme::change(mode, None, cx);
}

fn hex(color: Hsla) -> Option<SharedString> {
    Some(color.to_hex().into())
}

/// Projects a [`Palette`] onto GPUI Component's theme file schema.
///
/// The roles `theme.css` defines are set, plus the button hover and pressed
/// fills (see [`Travel`]). Everything else — list, table and tab surfaces —
/// is left to the schema's own fallbacks.
fn theme_config(
    name: &'static str,
    mode: ThemeMode,
    palette: &Palette,
    fonts: &FontFamilies,
) -> ThemeConfig {
    let mut colors = ThemeConfigColors::default();
    colors.background = hex(palette.background);
    colors.foreground = hex(palette.foreground);
    colors.border = hex(palette.border);
    colors.input = hex(palette.input);
    colors.ring = hex(palette.ring);
    colors.muted = hex(palette.muted);
    colors.muted_foreground = hex(palette.muted_foreground);
    colors.accent = hex(palette.accent);
    colors.accent_foreground = hex(palette.accent_foreground);
    colors.popover = hex(palette.popover);
    colors.popover_foreground = hex(palette.popover_foreground);
    colors.primary = hex(palette.primary);
    colors.primary_foreground = hex(palette.primary_foreground);
    colors.secondary = hex(palette.secondary);
    colors.secondary_foreground = hex(palette.secondary_foreground);
    colors.primary_hover = hex(hovered(palette.primary, FILLED_TRAVEL, mode));
    colors.primary_active = hex(pressed(palette.primary, FILLED_TRAVEL));
    colors.secondary_hover = hex(hovered(palette.secondary, NEUTRAL_TRAVEL, mode));
    colors.secondary_active = hex(pressed(palette.secondary, NEUTRAL_TRAVEL));
    // The outlined button rests on the page color.
    colors.button_hover = hex(hovered(palette.background, NEUTRAL_TRAVEL, mode));
    colors.button_active = hex(pressed(palette.background, NEUTRAL_TRAVEL));
    colors.link = hex(palette.primary);
    colors.skeleton = hex(palette.muted);

    // The nearest stock surface to a card. `Card` itself reads the palette.
    colors.group_box = hex(palette.card);
    colors.group_box_foreground = hex(palette.card_foreground);

    colors.danger = hex(palette.destructive);
    colors.danger_foreground = hex(palette.on_status);
    colors.info = hex(palette.info);
    colors.info_foreground = hex(palette.on_status);
    colors.success = hex(palette.success);
    colors.success_foreground = hex(palette.on_status);
    colors.warning = hex(palette.warning);
    colors.warning_foreground = hex(palette.on_status);

    // The stock danger button is a tint; the Corpora destructive button is a
    // solid fill with white text.
    colors.button_danger = hex(palette.destructive);
    colors.button_danger_foreground = hex(palette.on_status);
    colors.button_danger_hover = hex(hovered(palette.destructive, FILLED_TRAVEL, mode));
    colors.button_danger_active = hex(pressed(palette.destructive, FILLED_TRAVEL));

    let [chart_1, chart_2, chart_3, chart_4, chart_5] = palette.chart;
    colors.chart_1 = hex(chart_1);
    colors.chart_2 = hex(chart_2);
    colors.chart_3 = hex(chart_3);
    colors.chart_4 = hex(chart_4);
    colors.chart_5 = hex(chart_5);

    colors.sidebar = hex(palette.sidebar);
    colors.sidebar_foreground = hex(palette.sidebar_foreground);
    colors.sidebar_primary = hex(palette.sidebar_primary);
    colors.sidebar_primary_foreground = hex(palette.sidebar_primary_foreground);
    colors.sidebar_accent = hex(palette.sidebar_accent);
    colors.sidebar_accent_foreground = hex(palette.sidebar_accent_foreground);
    colors.sidebar_border = hex(palette.sidebar_border);

    let mut config = ThemeConfig::default();
    config.name = name.into();
    config.mode = mode;
    config.colors = colors;
    // The schema stores whole pixels; `--radius-md` is 11.2px.
    config.radius = Some((RADIUS_BASE_PX * CONTROL_RADIUS_FACTOR).round() as usize);
    config.radius_lg = Some(RADIUS_BASE_PX.round() as usize);
    config.shadow = Some(true);
    config.font_family = fonts.sans_override();
    config
}

/// A fill under the pointer: deeper on a light page, lifted on a dark one.
fn hovered(fill: Hsla, travel: Travel, mode: ThemeMode) -> Hsla {
    let ink = if mode.is_dark() { white() } else { black() };
    fill.blend(ink.opacity(travel.hover))
}

/// A pressed fill: sunk, in either appearance.
fn pressed(fill: Hsla, travel: Travel) -> Hsla {
    fill.blend(black().opacity(travel.active))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn config_carries_the_palette_as_parseable_colors() {
        let fonts = FontFamilies::default();
        for (mode, palette) in [
            (ThemeMode::Light, Palette::light()),
            (ThemeMode::Dark, Palette::dark()),
        ] {
            let config = theme_config("test", mode, &palette, &fonts);
            let primary = config.colors.primary.expect("primary is set");
            let parsed = gpui_kit::component::try_parse_color(&primary).expect("hex parses");
            assert!((parsed.l - palette.primary.l).abs() < 0.01);

            // Dark borders are translucent white; the alpha must survive.
            let border = config.colors.border.expect("border is set");
            let parsed = gpui_kit::component::try_parse_color(&border).expect("hex parses");
            assert!((parsed.a - palette.border.a).abs() < 0.01);
        }
    }

    #[test]
    fn control_radius_is_radius_md() {
        let config = theme_config(
            "test",
            ThemeMode::Light,
            &Palette::light(),
            &FontFamilies::default(),
        );
        assert_eq!(config.radius, Some(11));
        assert_eq!(config.radius_lg, Some(14));
    }
}
