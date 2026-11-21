//! The asset source a Corpora application registers.

use std::borrow::Cow;

use gpui_kit::assets::Assets as ComponentAssets;
use gpui_kit::{AssetSource, Result, SharedString};

use crate::reicon;

// The Lucide icons the atoms draw that neither Reicon nor GPUI Component's
// default bundle covers. Add an icon here only when `scripts/reicon.mjs`
// has no Reicon drawing for it.
gpui_kit::assets::icon_assets!(AtomIcons, [Cone]);

/// Path of the Exegia agent's portrait.
pub(crate) const OWL_AVATAR: &str = "images/owl-avatar.png";
/// Path of Google's four-color mark. Drawn as an image, not an icon, so it
/// keeps its colors.
pub(crate) const GOOGLE_MARK: &str = "brands/google.svg";
/// Path of the X mark.
pub(crate) const X_MARK: &str = "brands/x.svg";

/// The images and brand marks that are not Lucide icons.
fn embedded(path: &str) -> Option<&'static [u8]> {
    match path {
        OWL_AVATAR => Some(include_bytes!("../assets/images/owl-avatar.png")),
        GOOGLE_MARK => Some(include_bytes!("../assets/brands/google.svg")),
        X_MARK => Some(include_bytes!("../assets/brands/x.svg")),
        _ => None,
    }
}

/// The icons, images and brand marks the Corpora components need.
///
/// Icons are [Reicon](https://reicon.dev) drawings. GPUI Component asks for
/// Lucide file names (`icons/search.svg`); this source answers each with the
/// Reicon drawing of the same idea, so the stock components share the icon
/// language. A name Reicon has no drawing for falls back to Lucide.
///
/// Register it in place of `gpui_kit::assets::Assets`:
///
/// ```no_run
/// gpui_kit::application().with_assets(corpora_ui::Assets);
/// ```
///
/// Without it, [`crate::atoms::Reference`] and a verified
/// [`crate::atoms::Avatar`] draw a blank where their icon belongs.
#[derive(Clone, Copy, Debug, Default)]
pub struct Assets;

impl AssetSource for Assets {
    fn load(&self, path: &str) -> Result<Option<Cow<'static, [u8]>>> {
        if let Some(bytes) = embedded(path) {
            return Ok(Some(Cow::Borrowed(bytes)));
        }
        if let Some(bytes) = reicon::load(path) {
            return Ok(Some(Cow::Borrowed(bytes)));
        }
        match AtomIcons.load(path)? {
            Some(bytes) => Ok(Some(bytes)),
            None => ComponentAssets.load(path),
        }
    }

    fn list(&self, path: &str) -> Result<Vec<SharedString>> {
        let mut paths = ComponentAssets.list(path)?;
        for extra in AtomIcons.list(path)? {
            if !paths.contains(&extra) {
                paths.push(extra);
            }
        }
        let extras = [OWL_AVATAR, GOOGLE_MARK, X_MARK];
        for extra in extras.iter().chain(reicon::PATHS) {
            if extra.starts_with(path) && !paths.iter().any(|known| known == extra) {
                paths.push((*extra).into());
            }
        }
        Ok(paths)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use gpui_kit::assets::IconName;

    #[test]
    fn icons_are_reicon_drawings() {
        // Reicon draws filled outlines; Lucide draws strokes.
        for icon in [IconName::Search, IconName::Apple, IconName::Sparkles] {
            let bytes = Assets.load(&icon.path()).unwrap().expect("icon is served");
            let svg = std::str::from_utf8(&bytes).unwrap();
            assert!(
                !svg.contains("stroke-linecap"),
                "{} is still Lucide",
                icon.path()
            );
        }
        // No Reicon drawing: the Lucide one is served.
        assert!(Assets.load(&IconName::Cone.path()).unwrap().is_some());
        assert!(
            Assets
                .load(&IconName::WindowClose.path())
                .unwrap()
                .is_some()
        );
    }

    #[test]
    fn serves_the_atom_icons_and_the_component_defaults() {
        for path in [OWL_AVATAR, GOOGLE_MARK, X_MARK] {
            assert!(Assets.load(path).unwrap().is_some(), "{path} is not served");
        }
        for icon in [IconName::Link2, IconName::BadgeCheck, IconName::Search] {
            let path = icon.path();
            assert!(
                Assets.load(&path).unwrap().is_some(),
                "{path} is not served"
            );
        }
    }
}
