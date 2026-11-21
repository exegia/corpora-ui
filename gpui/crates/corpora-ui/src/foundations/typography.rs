//! Font families.

use std::borrow::Cow;

use gpui_kit::{App, SharedString};

/// The family of every interface label: [Allo](https://allo.joshpuckett.me).
/// It stands in for React's `--font-sans` and `--font-heading`.
pub const FONT_SANS: &[&str] = &["Allo"];
/// The family of reading text, such as scripture and long prose: Caudex.
pub const FONT_SERIF: &[&str] = &["Caudex"];

/// The font files the crate ships, so a label looks the same on a machine
/// that has neither family installed. Both are under the SIL Open Font
/// License; see `assets/fonts`.
const BUNDLED: &[&[u8]] = &[
    include_bytes!("../../assets/fonts/Allo-Regular.otf"),
    include_bytes!("../../assets/fonts/Allo-Oblique.otf"),
    include_bytes!("../../assets/fonts/Allo-Medium.otf"),
    include_bytes!("../../assets/fonts/Allo-SemiBold.otf"),
    include_bytes!("../../assets/fonts/Allo-Bold.otf"),
    include_bytes!("../../assets/fonts/Caudex-Regular.ttf"),
    include_bytes!("../../assets/fonts/Caudex-Italic.ttf"),
    include_bytes!("../../assets/fonts/Caudex-Bold.ttf"),
    include_bytes!("../../assets/fonts/Caudex-BoldItalic.ttf"),
];

/// Loads the bundled fonts into the text system. Returns whether they are
/// now available.
pub(crate) fn register(cx: &App) -> bool {
    let fonts = BUNDLED.iter().map(|bytes| Cow::Borrowed(*bytes)).collect();
    cx.text_system().add_fonts(fonts).is_ok()
}

/// The font families in use, resolved against what this machine has.
///
/// GPUI uses a family named in the theme as-is, so naming one that is not
/// available breaks text layout. A family that is missing therefore resolves
/// to `None`, and text falls back to the theme's font (the system UI font
/// unless the application changed it).
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct FontFamilies {
    sans: Option<SharedString>,
    serif: Option<SharedString>,
}

impl FontFamilies {
    /// Loads the bundled fonts and picks the first available family of each
    /// stack.
    pub fn resolve(cx: &App) -> Self {
        let bundled = register(cx);
        let installed = cx.text_system().all_font_names();
        let pick = |stack: &[&'static str]| {
            first_installed(stack, &installed)
                // A loaded font file is usable even where the platform does
                // not list it among the installed families.
                .or_else(|| bundled.then(|| SharedString::new_static(stack[0])))
        };
        Self {
            sans: pick(FONT_SANS),
            serif: pick(FONT_SERIF),
        }
    }

    /// The heading family. Headings share the interface family. `None`
    /// means "use the theme's font".
    pub fn heading(&self) -> Option<SharedString> {
        self.sans.clone()
    }

    /// The reading family, or `None` to use the theme's font.
    pub fn serif(&self) -> Option<SharedString> {
        self.serif.clone()
    }

    /// The body family to write into the theme, when one is available.
    pub(crate) fn sans_override(&self) -> Option<SharedString> {
        self.sans.clone()
    }
}

fn first_installed(stack: &[&'static str], installed: &[String]) -> Option<SharedString> {
    stack
        .iter()
        .find(|family| installed.iter().any(|name| name == *family))
        .map(|family| SharedString::new_static(family))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn picks_the_first_installed_family() {
        let installed = vec!["Helvetica".to_string(), "Allo".to_string()];
        assert_eq!(
            first_installed(FONT_SANS, &installed),
            Some(SharedString::new_static("Allo"))
        );
        assert_eq!(first_installed(FONT_SERIF, &installed), None);
    }

    #[test]
    fn heading_shares_the_interface_family() {
        let fonts = FontFamilies {
            sans: Some("Allo".into()),
            serif: None,
        };
        assert_eq!(fonts.heading(), Some("Allo".into()));
        assert_eq!(FontFamilies::default().heading(), None);
    }
}
