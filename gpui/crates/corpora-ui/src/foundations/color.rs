//! Color tokens.
//!
//! Colors are data, not code. `palette.toml` holds the raw scales: the
//! Tailwind palette that `var(--color-*)` resolves against in React.
//! `theme.toml` gives every role one `scale.step` per appearance, mirroring
//! the `:root` and `.dark` blocks of `react/src/assets/css/theme.css`. Both
//! files are embedded and resolved once, on first use.
//!
//! Those two files are the only places that name a color. Components read
//! roles through `cx.theme()` and [`super::ActiveCorporaTheme::palette`], both
//! installed by [`super::theme`], and never construct a color themselves.
//! The one thing a component may write is `transparent_black()`, which is the
//! absence of paint and not a color.

use std::collections::HashMap;
use std::fmt;
use std::sync::OnceLock;

use gpui_kit::component::{Colorize as _, ThemeMode, oklch};
use gpui_kit::{Hsla, Rgba};
use serde::Deserialize;

pub(super) const PALETTE_TOML: &str = include_str!("palette.toml");
pub(super) const THEME_TOML: &str = include_str!("theme.toml");

/// One appearance of the Corpora palette: the `light` or `dark` column of
/// `theme.toml`.
///
/// Fields carry the role name with dashes turned into underscores. Most
/// roles are also installed into GPUI Component's theme by
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
    /// The agent's own voice: its spark and the suggestions disclosure.
    pub agent: Hsla,
    /// Fill of the password strength meter at one to four requirements met.
    pub strength: [Hsla; 4],
    /// Light catching a surface. With [`Self::shadow`], the ink of every
    /// shadow, emboss and glass lift, used at some opacity.
    pub highlight: Hsla,
    /// Shade: see [`Self::highlight`].
    pub shadow: Hsla,
    /// Backdrop behind a dialog or sheet.
    pub overlay: Hsla,
    /// The six base hues stock components derive from.
    pub base_red: Hsla,
    pub base_green: Hsla,
    pub base_blue: Hsla,
    pub base_yellow: Hsla,
    pub base_magenta: Hsla,
    pub base_cyan: Hsla,
    /// Corpora yellow, a brand accent. The same in both appearances.
    pub brand_corpora: Hsla,
    pub brand_corpora_foreground: Hsla,
    /// The two stops of Exegia violet, a brand accent. The same in both
    /// appearances.
    pub brand_exegia: [Hsla; 2],
    pub brand_exegia_foreground: Hsla,
}

impl Palette {
    /// The `light` column of `theme.toml`.
    pub fn light() -> Self {
        embedded(ThemeMode::Light)
    }

    /// The `dark` column of `theme.toml`.
    pub fn dark() -> Self {
        embedded(ThemeMode::Dark)
    }
}

/// One appearance of the embedded theme, resolved on first use.
///
/// Both files are compiled in, so a failure here is a defect in the crate and
/// not in its input: the tests below resolve both appearances.
fn embedded(mode: ThemeMode) -> Palette {
    static PALETTES: OnceLock<(Palette, Palette)> = OnceLock::new();
    let (light, dark) = PALETTES.get_or_init(|| {
        resolve(PALETTE_TOML, THEME_TOML)
            .unwrap_or_else(|error| panic!("the embedded Corpora theme is invalid: {error}"))
    });
    if mode.is_dark() { *dark } else { *light }
}

/// The light and dark palettes of a `palette.toml` and `theme.toml` pair.
pub(super) fn resolve(
    palette_toml: &str,
    theme_toml: &str,
) -> Result<(Palette, Palette), ColorError> {
    let scales = Scales::parse(palette_toml)?;
    let theme = ThemeDocument::parse(theme_toml)?;
    Ok((
        theme.palette(&scales, ThemeMode::Light)?,
        theme.palette(&scales, ThemeMode::Dark)?,
    ))
}

/// Why `palette.toml` or `theme.toml` cannot be turned into a [`Palette`].
#[derive(Debug)]
pub(super) enum ColorError {
    /// The file is not valid TOML, or not the shape this module reads.
    Syntax {
        file: &'static str,
        source: toml::de::Error,
    },
    /// A `palette.toml` value is neither `oklch(L% C H)` nor a hex color.
    InvalidColor { name: String, value: String },
    /// `theme.toml` references a color `palette.toml` does not define, or
    /// writes a hex color that does not parse.
    UnknownReference(String),
    /// `theme.toml` does not define a role [`Palette`] needs.
    MissingRole(&'static str),
}

impl fmt::Display for ColorError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Syntax { file, source } => write!(f, "{file}: {source}"),
            Self::InvalidColor { name, value } => {
                write!(f, "palette.toml: `{name}` is not a color: `{value}`")
            }
            Self::UnknownReference(reference) => write!(
                f,
                "theme.toml: `{reference}` is neither a palette.toml color nor a hex color"
            ),
            Self::MissingRole(role) => write!(f, "theme.toml: no role `{role}`"),
        }
    }
}

impl std::error::Error for ColorError {
    fn source(&self) -> Option<&(dyn std::error::Error + 'static)> {
        match self {
            Self::Syntax { source, .. } => Some(source),
            _ => None,
        }
    }
}

/// The colors of `palette.toml`, keyed the way `theme.toml` references them:
/// `white`, `amber.500`.
struct Scales(HashMap<String, Hsla>);

#[derive(Deserialize)]
struct ScalesDocument {
    colors: HashMap<String, ScaleEntry>,
}

#[derive(Deserialize)]
#[serde(untagged)]
enum ScaleEntry {
    /// A single named color: `black`, `white`.
    Color(String),
    /// A scale, keyed by step: `50` to `950`.
    Steps(HashMap<String, String>),
}

impl Scales {
    fn parse(source: &str) -> Result<Self, ColorError> {
        let document: ScalesDocument =
            toml::from_str(source).map_err(|source| ColorError::Syntax {
                file: "palette.toml",
                source,
            })?;

        let mut colors = HashMap::new();
        let mut insert = |name: String, value: String| match parse_color(&value) {
            Some(color) => {
                colors.insert(name, color);
                Ok(())
            }
            None => Err(ColorError::InvalidColor { name, value }),
        };
        for (name, entry) in document.colors {
            match entry {
                ScaleEntry::Color(value) => insert(name, value)?,
                ScaleEntry::Steps(steps) => {
                    for (step, value) in steps {
                        insert(format!("{name}.{step}"), value)?;
                    }
                }
            }
        }
        Ok(Self(colors))
    }

    /// Resolves a `theme.toml` value: a key of `palette.toml`, or a raw hex
    /// color for the few colors no scale holds.
    fn resolve(&self, reference: &str) -> Result<Hsla, ColorError> {
        let color = if reference.starts_with('#') {
            parse_color(reference)
        } else {
            self.0.get(reference).copied()
        };
        color.ok_or_else(|| ColorError::UnknownReference(reference.to_owned()))
    }

    /// Resolves one appearance of a fixed-length row, such as `[chart]`.
    fn row<const N: usize>(
        &self,
        references: &Modes<[String; N]>,
        mode: ThemeMode,
    ) -> Result<[Hsla; N], ColorError> {
        let mut colors = [Hsla::default(); N];
        for (color, reference) in colors.iter_mut().zip(references.get(mode)) {
            *color = self.resolve(reference)?;
        }
        Ok(colors)
    }
}

/// Parses a `palette.toml` value: `oklch(L% C H)`, with the lightness as a
/// percentage or a fraction, or a hex color.
fn parse_color(value: &str) -> Option<Hsla> {
    let value = value.trim();
    if value.starts_with('#') {
        return Rgba::try_from(value).ok().map(Hsla::from);
    }

    let mut components = value
        .strip_prefix("oklch(")?
        .strip_suffix(')')?
        .split_whitespace();
    let lightness = components.next()?;
    let lightness = match lightness.strip_suffix('%') {
        Some(percent) => percent.parse::<f32>().ok()? / 100.,
        None => lightness.parse().ok()?,
    };
    let chroma = components.next()?.parse().ok()?;
    let hue = components.next()?.parse().ok()?;
    components
        .next()
        .is_none()
        .then(|| oklch(lightness, chroma, hue))
}

/// `theme.toml`: one palette reference per role and appearance.
#[derive(Deserialize)]
#[serde(rename_all = "kebab-case")]
struct ThemeDocument {
    colors: HashMap<String, Role>,
    chart: Modes<[String; 5]>,
    strength: Modes<[String; 4]>,
    audio_ring: Modes<[String; 3]>,
    brand_exegia: Modes<[String; 2]>,
}

#[derive(Deserialize)]
#[serde(rename_all = "kebab-case")]
struct Role {
    light: String,
    dark: String,
    #[serde(default = "opaque")]
    light_alpha: f32,
    #[serde(default = "opaque")]
    dark_alpha: f32,
}

fn opaque() -> f32 {
    1.
}

/// A value given once per appearance.
#[derive(Deserialize)]
struct Modes<T> {
    light: T,
    dark: T,
}

impl<T> Modes<T> {
    fn get(&self, mode: ThemeMode) -> &T {
        if mode.is_dark() {
            &self.dark
        } else {
            &self.light
        }
    }
}

impl ThemeDocument {
    fn parse(source: &str) -> Result<Self, ColorError> {
        toml::from_str(source).map_err(|source| ColorError::Syntax {
            file: "theme.toml",
            source,
        })
    }

    /// Resolves one appearance against `scales`.
    fn palette(&self, scales: &Scales, mode: ThemeMode) -> Result<Palette, ColorError> {
        let role = |name: &'static str| -> Result<Hsla, ColorError> {
            let role = self.colors.get(name).ok_or(ColorError::MissingRole(name))?;
            let (reference, alpha) = if mode.is_dark() {
                (&role.dark, role.dark_alpha)
            } else {
                (&role.light, role.light_alpha)
            };
            Ok(scales.resolve(reference)?.alpha(alpha))
        };

        // The React ring passes through its middle stop; a GPUI gradient has
        // two stops, so the far end is the midpoint of the last two.
        let [from, via, to] = scales.row(&self.audio_ring, mode)?;

        Ok(Palette {
            background: role("background")?,
            foreground: role("foreground")?,
            card: role("card")?,
            card_foreground: role("card-foreground")?,
            popover: role("popover")?,
            popover_foreground: role("popover-foreground")?,
            primary: role("primary")?,
            primary_foreground: role("primary-foreground")?,
            secondary: role("secondary")?,
            secondary_foreground: role("secondary-foreground")?,
            muted: role("muted")?,
            muted_foreground: role("muted-foreground")?,
            accent: role("accent")?,
            accent_foreground: role("accent-foreground")?,
            destructive: role("destructive")?,
            destructive_foreground: role("destructive-foreground")?,
            border: role("border")?,
            input: role("input")?,
            ring: role("ring")?,
            chart: scales.row(&self.chart, mode)?,
            sidebar: role("sidebar")?,
            sidebar_foreground: role("sidebar-foreground")?,
            sidebar_primary: role("sidebar-primary")?,
            sidebar_primary_foreground: role("sidebar-primary-foreground")?,
            sidebar_accent: role("sidebar-accent")?,
            sidebar_accent_foreground: role("sidebar-accent-foreground")?,
            sidebar_border: role("sidebar-border")?,
            sidebar_ring: role("sidebar-ring")?,
            info: role("info")?,
            info_foreground: role("info-foreground")?,
            success: role("success")?,
            success_foreground: role("success-foreground")?,
            warning: role("warning")?,
            warning_foreground: role("warning-foreground")?,
            invert: role("invert")?,
            invert_foreground: role("invert-foreground")?,
            on_status: role("on-status")?,
            bubble_sender: role("bubble-sender")?,
            bubble_sender_foreground: role("bubble-sender-foreground")?,
            bubble_recipient: role("bubble-recipient")?,
            bubble_recipient_foreground: role("bubble-recipient-foreground")?,
            audio_ring: [from, via.mix(to, 0.5)],
            agent: role("agent")?,
            strength: scales.row(&self.strength, mode)?,
            highlight: role("highlight")?,
            shadow: role("shadow")?,
            overlay: role("overlay")?,
            base_red: role("base-red")?,
            base_green: role("base-green")?,
            base_blue: role("base-blue")?,
            base_yellow: role("base-yellow")?,
            base_magenta: role("base-magenta")?,
            base_cyan: role("base-cyan")?,
            brand_corpora: role("brand-corpora")?,
            brand_corpora_foreground: role("brand-corpora-foreground")?,
            brand_exegia: scales.row(&self.brand_exegia, mode)?,
            brand_exegia_foreground: role("brand-exegia-foreground")?,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// Whether two colors paint the same pixel.
    fn same(actual: Hsla, expected: Hsla) -> bool {
        let (actual, expected) = (actual.to_rgb(), expected.to_rgb());
        let close = |a: f32, b: f32| (a - b).abs() < 0.5 / 255.;
        close(actual.r, expected.r)
            && close(actual.g, expected.g)
            && close(actual.b, expected.b)
            && close(actual.a, expected.a)
    }

    fn documents() -> (Scales, ThemeDocument) {
        (
            Scales::parse(PALETTE_TOML).expect("palette.toml parses"),
            ThemeDocument::parse(THEME_TOML).expect("theme.toml parses"),
        )
    }

    #[test]
    fn parses_oklch_and_hex_values() {
        let amber = oklch(0.769, 0.188, 70.08);
        assert!(same(
            parse_color("oklch(76.9% 0.188 70.08)").unwrap(),
            amber
        ));
        assert!(same(
            parse_color("oklch(0.769 0.188 70.08)").unwrap(),
            amber
        ));
        assert!(same(parse_color("#fff").unwrap(), gpui_kit::white()));
        assert!(same(parse_color("#000000").unwrap(), gpui_kit::black()));

        for invalid in ["", "red", "#ggg", "oklch(50% 0.1)", "oklch(50% 0.1 20 1)"] {
            assert_eq!(parse_color(invalid), None, "{invalid:?}");
        }
    }

    #[test]
    fn scales_resolve_named_colors_and_steps() {
        let (scales, _) = documents();
        assert!(same(scales.resolve("white").unwrap(), gpui_kit::white()));
        // amber.500 is oklch(76.9% 0.188 70.08) in palette.toml.
        assert!(same(
            scales.resolve("amber.500").unwrap(),
            oklch(0.769, 0.188, 70.08)
        ));
        assert!(matches!(
            scales.resolve("amber.550"),
            Err(ColorError::UnknownReference(reference)) if reference == "amber.550"
        ));
    }

    #[test]
    fn a_theme_value_may_be_a_raw_hex_color() {
        let (scales, _) = documents();
        assert!(same(
            scales.resolve("#E8B124").unwrap(),
            Rgba::try_from("#E8B124").unwrap().into()
        ));
        assert!(matches!(
            scales.resolve("#E8B12"),
            Err(ColorError::UnknownReference(reference)) if reference == "#E8B12"
        ));
    }

    #[test]
    fn light_and_shade_and_brand_colors_ignore_the_appearance() {
        let (light, dark) = (Palette::light(), Palette::dark());
        assert_eq!(light.highlight, dark.highlight);
        assert_eq!(light.shadow, dark.shadow);
        assert_eq!(light.brand_corpora, dark.brand_corpora);
        assert_eq!(light.brand_exegia, dark.brand_exegia);
        // A translucent backdrop: the alpha comes from `theme.toml`.
        assert!((light.overlay.a - 0.05).abs() < 1e-6);
        assert!((dark.overlay.a - 0.20).abs() < 1e-6);
    }

    #[test]
    fn an_invalid_palette_value_is_reported_by_name() {
        let result = Scales::parse("[colors.red]\n500 = \"crimson\"\n");
        assert!(matches!(
            result,
            Err(ColorError::InvalidColor { name, value }) if name == "red.500" && value == "crimson"
        ));
    }

    #[test]
    fn embedded_theme_carries_the_values_of_theme_css() {
        let light = Palette::light();
        // --primary: oklch(0.457 0.24 277.023);
        assert!(same(light.primary, oklch(0.457, 0.24, 277.023)));
        // --background: oklch(1 0 0);
        assert!(same(light.background, oklch(1., 0., 0.)));
        assert_eq!(light.border.a, 1.);

        let dark = Palette::dark();
        // --card: oklch(0.205 0 0);
        assert!(same(dark.card, oklch(0.205, 0., 0.)));
        // --border: oklch(1 0 0 / 10%);
        assert!(same(dark.border, oklch(1., 0., 0.).alpha(0.10)));
        // --input: oklch(1 0 0 / 15%);
        assert!(same(dark.input, oklch(1., 0., 0.).alpha(0.15)));
    }

    #[test]
    fn audio_ring_ends_between_its_last_two_stops() {
        let (scales, theme) = documents();
        let palette = theme.palette(&scales, ThemeMode::Light).unwrap();
        let fuchsia = scales.resolve("fuchsia.500").unwrap();
        let violet = scales.resolve("violet.600").unwrap();
        assert_eq!(palette.audio_ring[0], scales.resolve("yellow.400").unwrap());
        assert_eq!(palette.audio_ring[1], fuchsia.mix(violet, 0.5));
    }

    #[test]
    fn a_role_missing_from_the_theme_is_reported() {
        let (scales, mut theme) = documents();
        theme.colors.remove("card");
        assert!(matches!(
            theme.palette(&scales, ThemeMode::Light),
            Err(ColorError::MissingRole("card"))
        ));
    }

    #[test]
    fn a_reference_missing_from_the_palette_is_reported() {
        let (scales, mut theme) = documents();
        theme.colors.get_mut("card").unwrap().dark = "neutral.925".into();
        assert!(theme.palette(&scales, ThemeMode::Light).is_ok());
        assert!(matches!(
            theme.palette(&scales, ThemeMode::Dark),
            Err(ColorError::UnknownReference(reference)) if reference == "neutral.925"
        ));
    }
}
