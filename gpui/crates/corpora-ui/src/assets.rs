//! The asset source a Corpora application registers.

use std::borrow::Cow;

use gpui_kit::assets::Assets as ComponentAssets;
use gpui_kit::{AssetSource, Result, SharedString};

// The icons the atoms draw that GPUI Component's default bundle leaves out.
// Add an icon here when an atom starts using it.
gpui_kit::assets::icon_assets!(AtomIcons, [BadgeCheck, Cone, Link2]);

/// GPUI Component's default icons plus the ones the Corpora atoms need.
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
        Ok(paths)
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use gpui_kit::assets::IconName;

    #[test]
    fn serves_the_atom_icons_and_the_component_defaults() {
        for icon in [IconName::Link2, IconName::BadgeCheck, IconName::Search] {
            let path = icon.path();
            assert!(
                Assets.load(&path).unwrap().is_some(),
                "{path} is not served"
            );
        }
    }
}
