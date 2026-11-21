//! Renders composed components in a headless window and checks the geometry
//! and events they promise.

use std::cell::RefCell;
use std::rc::Rc;

use corpora_ui::atoms::{Emoji, EmojiPickerState, Reveal, SelectChip};
use corpora_ui::composed::{EmojiActionBar, Logo, ReactionPicker, SocialProvider, SocialProviders};
use gpui_kit::test::TestWindowExt as _;
use gpui_kit::{
    AnyWindowHandle, App, AppContext as _, Bounds, Context, Entity, IntoElement, Modifiers,
    ParentElement as _, Pixels, Point, Render, SharedString, Styled as _, TestAppContext,
    TestSupportExt as _, VisualTestContext, Window, WindowBounds, WindowOptions, div, point,
    prelude::*, px, size,
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

struct RevealHost;

impl Render for RevealHost {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        let content = || div().h(px(40.)).w(px(100.));
        div()
            .size_full()
            .flex()
            .flex_col()
            .items_start()
            .child(
                div()
                    .id("shown")
                    .test_support()
                    .w(px(200.))
                    .child(Reveal::new("shown-reveal", true).child(content())),
            )
            .child(
                div()
                    .id("hidden")
                    .test_support()
                    .w(px(200.))
                    .child(Reveal::new("hidden-reveal", false).child(content())),
            )
    }
}

#[gpui_kit::test]
fn a_reveal_takes_its_contents_height_only_when_open(cx: &mut TestAppContext) {
    cx.update(corpora_ui::init);
    let window = open(cx, |_, cx| cx.new(|_| RevealHost));

    cx.update_window(window, |_, window, cx| {
        window.render_frame(cx);
        assert_px(
            window.find("shown").bounds().size.height,
            40.,
            "open reveal",
        );
        assert_px(
            window.find("hidden").bounds().size.height,
            0.,
            "closed reveal",
        );
    })
    .expect("window is open");
}

struct ChipHost {
    picked: Rc<RefCell<Vec<SharedString>>>,
}

impl Render for ChipHost {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        let picked = self.picked.clone();
        div().size_full().p(px(20.)).flex().items_start().child(
            div().id("chip").test_support().child(
                SelectChip::new("status", "Pending")
                    .options(["Pending", "Paid", "Refunded"])
                    .on_pick(move |option, _, _| picked.borrow_mut().push(option.clone())),
            ),
        )
    }
}

#[gpui_kit::test]
fn a_select_chip_opens_a_menu_of_its_options(cx: &mut TestAppContext) {
    cx.update(corpora_ui::init);
    let picked = Rc::new(RefCell::new(Vec::new()));
    let window = open(cx, {
        let picked = picked.clone();
        |_, cx| cx.new(|_| ChipHost { picked })
    });

    let chip = cx
        .update_window(window, |_, window, cx| {
            window.render_frame(cx);
            window.find("chip").bounds()
        })
        .expect("window is open");
    let mut cx = VisualTestContext::from_window(window, cx);
    cx.simulate_click(chip.center(), Modifiers::none());
    cx.run_until_parked();
    // The menu takes focus: the first Down lands on "Pending", the second on
    // "Paid".
    cx.simulate_keystrokes("down down enter");
    assert_eq!(*picked.borrow(), vec![SharedString::from("Paid")]);
}

struct PickerHost {
    picker: Entity<EmojiPickerState>,
    picked: Rc<RefCell<Vec<Emoji>>>,
}

impl Render for PickerHost {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        let picked = self.picked.clone();
        div().size_full().flex().items_start().child(
            div().id("bar").test_support().child(
                EmojiActionBar::new("reactions")
                    .picker(&self.picker)
                    .on_select(move |emoji, _, _| picked.borrow_mut().push(emoji.clone())),
            ),
        )
    }
}

#[gpui_kit::test]
fn the_emoji_bar_swaps_to_the_full_picker_and_back_on_a_pick(cx: &mut TestAppContext) {
    cx.update(corpora_ui::init);
    let picked = Rc::new(RefCell::new(Vec::new()));
    let mut state = None;
    let window = open(cx, {
        let picked = picked.clone();
        let state = &mut state;
        move |window, cx| {
            let picker = cx.new(|cx| EmojiPickerState::new(window, cx));
            // Expanded before the first frame, so there is no animation to
            // wait for.
            picker.update(cx, |picker, cx| picker.set_expanded(true, cx));
            *state = Some(picker.clone());
            cx.new(|_| PickerHost { picker, picked })
        }
    });
    let state = state.expect("the window built its picker");

    let bar = cx
        .update_window(window, |_, window, cx| {
            window.render_frame(cx);
            window.find("bar").bounds()
        })
        .expect("window is open");
    assert_px(bar.size.height, 20.375 * REM, "full picker height");
    assert_px(bar.size.width, 19. * REM, "full picker width");

    // The first emoji of the first group: under the search field and the
    // group's header.
    let first = point(bar.origin.x + px(1.5 * REM), bar.origin.y + px(5.5 * REM));
    let mut cx = VisualTestContext::from_window(window, cx);
    cx.simulate_click(first, Modifiers::none());
    assert_eq!(picked.borrow().len(), 1, "one emoji picked");
    assert_eq!(picked.borrow()[0].label, "grinning face");
    assert!(
        !cx.update(|_, cx| state.read(cx).is_expanded()),
        "a pick folds the bar back to its quick row"
    );
}

struct ReactHost {
    picker: Entity<EmojiPickerState>,
    picked: Rc<RefCell<Vec<Emoji>>>,
}

impl Render for ReactHost {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        let picked = self.picked.clone();
        div().size_full().p(px(20.)).flex().items_start().child(
            div().id("react").test_support().child(
                ReactionPicker::new("message-react", &self.picker)
                    .on_select(move |emoji, _, _| picked.borrow_mut().push(emoji.clone())),
            ),
        )
    }
}

#[gpui_kit::test]
fn the_reaction_button_opens_quick_reactions_under_itself(cx: &mut TestAppContext) {
    cx.update(corpora_ui::init);
    let picked = Rc::new(RefCell::new(Vec::new()));
    let window = open(cx, {
        let picked = picked.clone();
        move |window, cx| {
            let picker = cx.new(|cx| EmojiPickerState::new(window, cx));
            cx.new(|_| ReactHost { picker, picked })
        }
    });

    let trigger = cx
        .update_window(window, |_, window, cx| {
            window.render_frame(cx);
            window.find("react").bounds()
        })
        .expect("window is open");
    let mut cx = VisualTestContext::from_window(window, cx);
    cx.simulate_click(trigger.center(), Modifiers::none());
    cx.run_until_parked();

    // The popover hangs under the trigger, its quick row first: the heart
    // sits one popover inset in and half a button down.
    let heart = point(
        trigger.origin.x + px(1.75 * REM),
        trigger.origin.y + trigger.size.height + px(1.75 * REM),
    );
    cx.simulate_click(heart, Modifiers::none());
    assert_eq!(
        picked
            .borrow()
            .iter()
            .map(|e| e.label.clone())
            .collect::<Vec<_>>(),
        vec![SharedString::from("heart")]
    );
}
