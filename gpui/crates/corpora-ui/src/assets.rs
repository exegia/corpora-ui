//! The asset source a Corpora application registers.

use std::borrow::Cow;

use gpui_kit::assets::Assets as ComponentAssets;
use gpui_kit::{AssetSource, Result, SharedString};

// The icons the atoms draw that GPUI Component's default bundle leaves out.
// Add an icon here when an atom starts using it.
gpui_kit::assets::icon_assets!(
    AtomIcons,
    [BadgeCheck, Cone, Link2, Sparkle, Sparkles, Github, Apple]
);

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

/// GPUI Component's default icons plus the icons, images and brand marks the
/// Corpora components need.
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
        for extra in [OWL_AVATAR, GOOGLE_MARK, X_MARK] {
            if extra.starts_with(path) {
                paths.push(extra.into());
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
