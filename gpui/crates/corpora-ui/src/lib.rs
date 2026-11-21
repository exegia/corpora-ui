//! Corpora UI for GPUI.
//!
//! The GPUI counterpart of the React library in `react/`, built on
//! [GPUI Kit](https://gpui-kit.com). Register [`Assets`] and call [`init`]
//! once at startup, in place of `gpui_kit::assets::Assets` and
//! `gpui_kit::init`:
//!
//! ```no_run
//! use gpui_kit::*;
//!
//! # struct Workspace;
//! # impl Render for Workspace {
//! #     fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement { div() }
//! # }
//! gpui_kit::application().with_assets(corpora_ui::Assets).run(|cx| {
//!     corpora_ui::init(cx);
//!     gpui_kit::open_window(WindowOptions::default(), cx, |_, cx| cx.new(|_| Workspace))
//!         .expect("failed to open window");
//! });
//! ```

mod assets;
pub mod atoms;
pub mod composed;
pub mod foundations;

pub use assets::Assets;

use gpui_kit::App;

/// Initializes GPUI Kit and installs the Corpora theme.
///
/// Call it once, before opening a window or building any component.
pub fn init(cx: &mut App) {
    gpui_kit::init(cx);
    foundations::theme::init(cx);
}
