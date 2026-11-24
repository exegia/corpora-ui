//! Re-reads `palette.toml` and `theme.toml` while the application runs.
//!
//! Only under the `hot-reload` feature. Both files are compiled in and
//! resolved once, so a hot patch cannot carry an edit to them. This reads the
//! sources on disk instead and installs each version that resolves.

use std::path::{Path, PathBuf};
use std::time::Duration;

use gpui_kit::App;

use super::theme::ActiveCorporaTheme as _;
use super::{color, theme};

/// How often the two files are read: soon enough after a save to feel
/// immediate.
const INTERVAL: Duration = Duration::from_millis(400);

/// The text of `palette.toml` and of `theme.toml`.
type Sources = (String, String);

/// Watches the two files in this crate's own source tree.
pub(super) fn watch(cx: &mut App) {
    watch_dir(
        PathBuf::from(concat!(env!("CARGO_MANIFEST_DIR"), "/src/foundations")),
        cx,
    );
}

/// `None` while either file is missing or unreadable, as it may be for a
/// moment while an editor saves it.
fn read(dir: &Path) -> Option<Sources> {
    Some((
        std::fs::read_to_string(dir.join("palette.toml")).ok()?,
        std::fs::read_to_string(dir.join("theme.toml")).ok()?,
    ))
}

/// Compares text, not modification times, which some volumes keep too
/// coarsely to tell two quick saves apart.
fn watch_dir(dir: PathBuf, cx: &mut App) {
    cx.spawn(async move |cx| {
        // What is installed now: the sources this build was compiled with.
        let mut applied: Sources = (color::PALETTE_TOML.into(), color::THEME_TOML.into());
        loop {
            cx.background_executor().timer(INTERVAL).await;
            let read_dir = dir.clone();
            let sources = cx
                .background_executor()
                .spawn(async move { read(&read_dir) })
                .await;
            let Some(sources) = sources.filter(|sources| *sources != applied) else {
                continue;
            };
            match color::resolve(&sources.0, &sources.1) {
                Ok((light, dark)) => cx.update(|cx| {
                    let fonts = cx.corpora_theme().fonts().clone();
                    theme::install(light, dark, fonts, cx);
                }),
                // The last colors that resolved stay.
                Err(error) => eprintln!("corpora-ui: colors not reloaded: {error}"),
            }
            // Kept either way, so a file that does not resolve is reported
            // once and not on every read.
            applied = sources;
        }
    })
    .detach();
}

#[cfg(test)]
mod tests {
    use gpui_kit::TestAppContext;
    use gpui_kit::component::ActiveTheme as _;

    use super::*;

    /// `theme.toml` with both appearances of `primary` set to `reference`.
    fn with_primary(reference: &str) -> String {
        let source = color::THEME_TOML;
        let start = source.find("[colors.primary]").expect("a primary role");
        let end = start + source[start..].find("\n\n").expect("a blank line after it");
        format!(
            "{}[colors.primary]\nlight = \"{reference}\"\ndark = \"{reference}\"{}",
            &source[..start],
            &source[end..]
        )
    }

    #[gpui_kit::test]
    fn a_saved_theme_is_installed_and_one_that_does_not_resolve_is_not(cx: &mut TestAppContext) {
        let dir = std::env::temp_dir().join(format!("corpora-ui-reload-{}", std::process::id()));
        std::fs::create_dir_all(&dir).unwrap();
        std::fs::write(dir.join("palette.toml"), color::PALETTE_TOML).unwrap();
        std::fs::write(dir.join("theme.toml"), color::THEME_TOML).unwrap();

        cx.update(crate::init);
        cx.update(|cx| watch_dir(dir.clone(), cx));
        let primary = |cx: &mut TestAppContext| cx.update(|cx| cx.palette().primary);
        let tick = |cx: &mut TestAppContext| {
            cx.executor().advance_clock(INTERVAL);
            cx.run_until_parked();
        };

        // The files on disk are the ones compiled in: nothing to install.
        let embedded = primary(cx);
        tick(cx);
        assert_eq!(primary(cx), embedded);

        let (red, _) = color::resolve(color::PALETTE_TOML, &with_primary("red.500")).unwrap();
        assert_ne!(red.primary, embedded);
        std::fs::write(dir.join("theme.toml"), with_primary("red.500")).unwrap();
        tick(cx);
        assert_eq!(primary(cx), red.primary);
        // The stock theme follows, through its hex form.
        let stock = cx.update(|cx| cx.theme().primary);
        assert!((stock.h - red.primary.h).abs() < 0.01);

        std::fs::write(dir.join("theme.toml"), with_primary("red.555")).unwrap();
        tick(cx);
        assert_eq!(primary(cx), red.primary, "the last good colors stay");

        std::fs::remove_dir_all(&dir).unwrap();
    }
}
