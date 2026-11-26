//! Development annotations for the gallery, by `gpui-agentation`.
//!
//! Only a debug build on macOS has them. Every reference to the annotation
//! crate is in the gated `imp` module below; the other `imp` is what a
//! release build gets: the same calls, doing nothing. The library itself
//! never depends on the crate, only this example does.
//!
//! Notes are kept in `gpui/target/agentation/feedback.json`, which Git
//! ignores, and served to MCP clients on the loopback port [`PORT`]. The
//! running gallery shows the exact endpoint under Debug > Settings.

pub use imp::Devtools;

/// The loopback port the annotation server asks for. The Agentation example
/// uses 4750; a second gallery process finds this one busy and keeps its
/// notes local.
#[cfg(all(debug_assertions, target_os = "macos"))]
const PORT: u16 = 4751;

#[cfg(all(debug_assertions, target_os = "macos"))]
mod imp {
    use gpui_agentation::{Agentation, Assets, HostMode, InitOptions, RendererPolicy};
    use gpui_kit::{
        AnyElement, App, Application, IntoElement, KeyBinding, Menu, MenuItem, Window, actions,
    };

    actions!(gallery_devtools, [Quit]);

    /// The annotation tools of one gallery window, or nothing.
    pub struct Devtools {
        feedback: Option<Agentation>,
    }

    impl Devtools {
        /// Puts Agentation's icons behind the gallery's own assets.
        pub fn application(app: Application) -> Application {
            app.with_assets(Assets::before(corpora_ui::Assets))
        }

        /// Call after `corpora_ui::init`, which initializes GPUI Kit.
        pub fn init(cx: &mut App) {
            let options = InitOptions {
                host: HostMode::KitInitialized,
                // The gallery has no inspector of its own to keep.
                inspector: RendererPolicy::Replace,
            };
            if let Err(error) = gpui_agentation::init_with_options(options, cx) {
                eprintln!("gallery: annotations are unavailable: {error}");
                return;
            }
            // macOS takes the first menu as the application's, so the Debug
            // menu needs one before it.
            cx.on_action(|_: &Quit, cx| cx.quit());
            cx.bind_keys([KeyBinding::new("cmd-q", Quit, None)]);
            cx.set_menus(vec![
                Menu::new("Corpora UI").items([MenuItem::action("Quit", Quit)]),
                gpui_agentation::debug_menu(),
            ]);
        }

        /// No tools: what the offscreen snapshots use.
        pub fn unmounted() -> Self {
            Self { feedback: None }
        }

        /// The tools for `window`, starting on `route`. The gallery stays
        /// usable when the store cannot be opened.
        pub fn mount(route: &str, window: &mut Window, cx: &mut App) -> Self {
            let store = concat!(
                env!("CARGO_MANIFEST_DIR"),
                "/../../target/agentation/feedback.json"
            );
            let feedback =
                Agentation::mount("Corpora UI gallery", route, store, super::PORT, window, cx)
                    .map_err(|error| eprintln!("gallery: annotations are unavailable: {error}"))
                    .ok();
            Self { feedback }
        }

        /// Registers the window's content as one screen. Controls inside it
        /// need no wrappers: Inspect picks any element.
        #[track_caller]
        pub fn frame(
            &self,
            content: impl IntoElement,
            window: &mut Window,
            cx: &mut App,
        ) -> AnyElement {
            match &self.feedback {
                Some(feedback) => feedback.root("gallery", "Gallery", content, window, cx),
                None => content.into_any_element(),
            }
        }

        /// Call when the gallery has moved to another page.
        pub fn set_route(&self, route: &str, window: &mut Window, cx: &mut App) {
            if let Some(feedback) = &self.feedback {
                feedback.set_route(route, window, cx);
            }
        }
    }
}

#[cfg(not(all(debug_assertions, target_os = "macos")))]
mod imp {
    use gpui_kit::{AnyElement, App, Application, IntoElement, Window};

    pub struct Devtools;

    impl Devtools {
        pub fn application(app: Application) -> Application {
            app.with_assets(corpora_ui::Assets)
        }

        pub fn init(_: &mut App) {}

        pub fn unmounted() -> Self {
            Self
        }

        pub fn mount(_: &str, _: &mut Window, _: &mut App) -> Self {
            Self
        }

        pub fn frame(&self, content: impl IntoElement, _: &mut Window, _: &mut App) -> AnyElement {
            content.into_any_element()
        }

        pub fn set_route(&self, _: &str, _: &mut Window, _: &mut App) {}
    }
}
