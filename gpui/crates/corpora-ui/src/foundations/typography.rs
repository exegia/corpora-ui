//! Font families.

use gpui_kit::{App, SharedString};

/// `--font-sans`, most preferred first. The variable build and the static
/// family register under different names.
pub const FONT_SANS: &[&str] = &["Inter Variable", "Inter"];
/// `--font-heading`, most preferred first.
pub const FONT_HEADING: &[&str] = &["Figtree Variable", "Figtree"];

/// The font families in use, resolved against what this machine has.
///
/// GPUI uses a family named in the theme as-is, so naming one that is not
/// installed breaks text layout. A family that is missing therefore resolves
/// to `None`, and text falls back to the theme's font (the system UI font
/// unless the application changed it).
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct FontFamilies {
    sans: Option<SharedString>,
    heading: Option<SharedString>,
}

impl FontFamilies {
    /// Picks the first installed family of each stack.
    pub fn resolve(cx: &App) -> Self {
        let installed = cx.text_system().all_font_names();
        Self {
            sans: first_installed(FONT_SANS, &installed),
            heading: first_installed(FONT_HEADING, &installed),
        }
    }

    /// The heading family, or the sans family when no heading font is
    /// installed. `None` means "use the theme's font".
    pub fn heading(&self) -> Option<SharedString> {
        self.heading.clone().or_else(|| self.sans.clone())
    }

    /// The body family to write into the theme, when one is installed.
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
        let installed = vec!["Helvetica".to_string(), "Inter".to_string()];
        assert_eq!(
            first_installed(FONT_SANS, &installed),
            Some(SharedString::new_static("Inter"))
        );
        assert_eq!(first_installed(FONT_HEADING, &installed), None);
    }

    #[test]
    fn heading_falls_back_to_sans() {
        let fonts = FontFamilies {
            sans: Some("Inter".into()),
            heading: None,
        };
        assert_eq!(fonts.heading(), Some("Inter".into()));
        assert_eq!(FontFamilies::default().heading(), None);
    }
}
