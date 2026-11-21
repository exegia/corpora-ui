//! Renders composed components in a headless window and checks the geometry
//! and events they promise.

use std::cell::RefCell;
use std::rc::Rc;

use corpora_ui::composed::{Logo, SocialProvider, SocialProviders};
use gpui_kit::test::TestWindowExt as _;
use gpui_kit::{
    AnyWindowHandle, App, AppContext as _, Bounds, Context, Entity, IntoElement, Modifiers,
    ParentElement as _, Pixels, Point, Render, Styled as _, TestAppContext, TestSupportExt as _,
    VisualTestContext, Window, WindowBounds, WindowOptions, div, point, prelude::*, px, size,
};

/// The default rem base the geometry below is stated against.
const REM: f32 = 16.;

fn open<V: Render>(
    cx: &mut TestAppContext,
    build: impl FnOnce(&mut Window, &mut App) -> Entity<V>,
) -> AnyWindowHandle {
    cx.update(|cx| {
        let options = WindowOptions {
            window_bounds: Some(WindowBounds::Windowed(Bounds {
                origin: Point::default(),
                size: size(px(600.), px(500.)),
            })),
            ..Default::default()
        };
        gpui_kit::open_window(options, cx, build)
            .expect("open test window")
            .0
    })
}

fn assert_px(actual: Pixels, expected: f32, what: &str) {
    assert!(
        (actual - px(expected)).abs() < px(0.01),
        "{what}: expected {expected}px, got {actual:?}"
    );
}

struct LogoHost;

impl Render for LogoHost {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        div()
            .size_full()
            .flex()
            .flex_col()
            .items_start()
            .child(
                div()
                    .id("open")
                    .test_support()
                    .child(Logo::new("open-logo", "Corpora UI")),
            )
            .child(
                div()
                    .id("folded")
                    .test_support()
                    .child(Logo::new("folded-logo", "Corpora UI").folded(true)),
            )
    }
}

#[gpui_kit::test]
fn a_folded_logo_is_as_wide_as_its_mark(cx: &mut TestAppContext) {
    cx.update(corpora_ui::init);
    let window = open(cx, |_, cx| cx.new(|_| LogoHost));

    cx.update_window(window, |_, window, cx| {
        window.render_frame(cx);
        let open = window.find("open").bounds();
        let folded = window.find("folded").bounds();
        assert_px(folded.size.width, 2. * REM, "folded logo width");
        assert_px(folded.size.height, 2. * REM, "folded logo height");
        assert!(
            open.size.width > folded.size.width + px(REM),
            "the open logo shows its wordmark: {open:?}"
        );
    })
    .expect("window is open");
}

struct ProvidersHost {
    picked: Rc<RefCell<Vec<SocialProvider>>>,
}

impl Render for ProvidersHost {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        let picked = self.picked.clone();
        div().size_full().child(
            div().id("providers").test_support().w(px(320.)).child(
                SocialProviders::new("providers")
                    .on_select(move |provider, _, _| picked.borrow_mut().push(*provider)),
            ),
        )
    }
}

#[gpui_kit::test]
fn provider_buttons_stack_and_report_the_provider_clicked(cx: &mut TestAppContext) {
    cx.update(corpora_ui::init);
    let picked = Rc::new(RefCell::new(Vec::new()));
    let window = open(cx, {
        let picked = picked.clone();
        |_, cx| cx.new(|_| ProvidersHost { picked })
    });

    let bounds = cx
        .update_window(window, |_, window, cx| {
            window.render_frame(cx);
            window.find("providers").bounds()
        })
        .expect("window is open");
    // Three 2rem buttons with a 0.5rem gap between them.
    assert_px(
        bounds.size.height,
        (3. * 2. + 2. * 0.5) * REM,
        "stack height",
    );

    // The middle of the second button: Apple.
    let apple = point(
        bounds.origin.x + bounds.size.width / 2.,
        bounds.origin.y + px(3.5 * REM),
    );
    let mut cx = VisualTestContext::from_window(window, cx);
    cx.simulate_click(apple, Modifiers::none());
    assert_eq!(*picked.borrow(), vec![SocialProvider::Apple]);
}
