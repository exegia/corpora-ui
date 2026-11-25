//! Renders the atoms in a headless window and checks the theme they read and
//! the geometry they promise.

use corpora_ui::atoms::{Badge, Button, Card, CardHeader, IconName, Loader};
use corpora_ui::foundations::{
    self, ActiveCorporaTheme as _, AtomSize, DARK_THEME_NAME, LIGHT_THEME_NAME, Palette, Radius,
};
use gpui_kit::component::{ActiveTheme as _, ThemeMode};
use gpui_kit::test::TestWindowExt as _;
use gpui_kit::{
    AnyWindowHandle, App, AppContext as _, Bounds, Context, Entity, Hsla, IntoElement, Modifiers,
    MouseButton, ParentElement as _, Pixels, Point, Render, Styled as _, TestAppContext,
    TestSupportExt as _, VisualTestContext, Window, WindowBounds, WindowOptions, div, prelude::*,
    px, size,
};

/// The default rem base the geometry below is stated against.
const REM: f32 = 16.;
/// `p-6`: the card's inset.
const CARD_INSET: f32 = 1.5 * REM;
/// `pt-4`: the footer's top inset when content precedes it.
const FOOTER_GAP: f32 = REM;
const HAIRLINE: f32 = 1.;

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

fn assert_same_color(actual: Hsla, expected: Hsla, what: &str) {
    let close = |a: f32, b: f32| (a - b).abs() < 0.01;
    assert!(
        close(actual.l, expected.l) && close(actual.s, expected.s) && close(actual.a, expected.a),
        "{what}: expected {expected:?}, got {actual:?}"
    );
}

#[gpui_kit::test]
fn init_installs_the_corpora_theme_in_both_appearances(cx: &mut TestAppContext) {
    cx.update(|cx| {
        corpora_ui::init(cx);

        let light = Palette::light();
        assert_eq!(cx.theme().theme_name().as_ref(), LIGHT_THEME_NAME);
        assert_same_color(cx.theme().primary, light.primary, "light primary");
        assert_same_color(cx.theme().danger, light.destructive, "light destructive");
        assert_same_color(cx.palette().card, light.card, "light card");
        assert_px(Radius::Lg.resolve(cx), 14., "base radius");
        assert_px(Radius::Sm.resolve(cx), 8.4, "small radius");

        foundations::set_mode(ThemeMode::Dark, cx);

        let dark = Palette::dark();
        assert_eq!(cx.theme().theme_name().as_ref(), DARK_THEME_NAME);
        assert_same_color(cx.theme().background, dark.background, "dark background");
        // Dark borders are translucent white; the alpha has to survive the trip.
        assert_same_color(cx.theme().border, dark.border, "dark border");
        assert_same_color(cx.palette().card, dark.card, "dark card");
        assert_same_color(
            cx.palette().destructive_foreground,
            dark.destructive_foreground,
            "dark destructive text",
        );
    });
}

/// The slots whose fallback is GPUI Component's own color, not one derived
/// from a Corpora role. The theme has to set each of them.
#[gpui_kit::test]
fn no_stock_color_leaks_into_the_theme(cx: &mut TestAppContext) {
    cx.update(|cx| {
        corpora_ui::init(cx);

        for mode in [ThemeMode::Light, ThemeMode::Dark] {
            foundations::set_mode(mode, cx);
            let theme = cx.theme();
            let palette = cx.palette();
            for (actual, expected, what) in [
                (theme.overlay, palette.overlay, "overlay"),
                (theme.red, palette.base_red, "base red"),
                (theme.green, palette.base_green, "base green"),
                (theme.blue, palette.base_blue, "base blue"),
                (theme.yellow, palette.base_yellow, "base yellow"),
                (theme.magenta, palette.base_magenta, "base magenta"),
                (theme.cyan, palette.base_cyan, "base cyan"),
            ] {
                // Hue matters here, so compare the channels that get painted.
                let (actual, expected) = (actual.to_rgb(), expected.to_rgb());
                let close = |a: f32, b: f32| (a - b).abs() < 0.01;
                assert!(
                    close(actual.r, expected.r)
                        && close(actual.g, expected.g)
                        && close(actual.b, expected.b)
                        && close(actual.a, expected.a),
                    "{mode:?} {what}: expected {expected:?}, got {actual:?}"
                );
            }
        }
    });
}

struct CardHost;

impl Render for CardHost {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        div().size_full().child(
            div().id("card").test_support().w(px(320.)).child(
                Card::new()
                    .header(CardHeader::new("Members").description("People with access"))
                    .content(div().id("content").test_support().w_full().h(px(40.)))
                    .footer(div().id("footer").test_support().size(px(20.))),
            ),
        )
    }
}

#[gpui_kit::test]
fn card_parts_share_one_inset_and_sit_flush(cx: &mut TestAppContext) {
    cx.update(corpora_ui::init);
    let window = open(cx, |_, cx| cx.new(|_| CardHost));

    cx.update_window(window, |_, window, cx| {
        window.render_frame(cx);
        let card = window.find("card").bounds();
        let content = window.find("content").bounds();
        let footer = window.find("footer").bounds();

        // Content and footer hang off the same leading spine.
        assert_px(
            content.left() - card.left(),
            HAIRLINE + CARD_INSET,
            "content inset",
        );
        assert_px(footer.left() - content.left(), 0., "footer leading edge");
        assert_px(
            card.right() - content.right(),
            HAIRLINE + CARD_INSET,
            "content trailing inset",
        );
        // Content gives up its bottom inset to the footer, which keeps a
        // tighter one, so the two do not stack into a double gap.
        assert_px(
            footer.top() - content.bottom(),
            FOOTER_GAP,
            "content to footer",
        );
        assert_px(
            card.bottom() - footer.bottom(),
            HAIRLINE + CARD_INSET,
            "footer bottom inset",
        );
    })
    .unwrap();
}

struct BadgeHost;

impl Render for BadgeHost {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        let badge = |id: &'static str, size: AtomSize| {
            div()
                .id(id)
                .test_support()
                .child(Badge::secondary().with_atom_size(size).child("8"))
        };
        div()
            .size_full()
            .flex()
            .items_start()
            .gap_2()
            .child(badge("badge-xs", AtomSize::Xs))
            .child(badge("badge-md", AtomSize::Md))
            .child(badge("badge-xl", AtomSize::Xl))
    }
}

#[gpui_kit::test]
fn badge_heights_follow_the_size_scale(cx: &mut TestAppContext) {
    cx.update(corpora_ui::init);
    let window = open(cx, |_, cx| cx.new(|_| BadgeHost));

    cx.update_window(window, |_, window, cx| {
        window.render_frame(cx);
        for (id, height) in [("badge-xs", 16.), ("badge-md", 20.), ("badge-xl", 24.)] {
            let bounds = window.find(id).bounds();
            assert_px(bounds.size.height, height, id);
            // `min-w` equals the height, so a short badge is never narrower
            // than a square; wider insets at the large end may exceed it.
            assert!(bounds.size.width >= px(height), "{id} is at least square");
        }
    })
    .unwrap();
}

struct LoaderHost;

impl Render for LoaderHost {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        Loader::dots()
    }
}

#[gpui_kit::test]
fn dots_loader_animates_and_stands_still_under_reduced_motion(cx: &mut TestAppContext) {
    cx.update(corpora_ui::init);

    let animated = open(cx, |_, cx| cx.new(|_| LoaderHost));
    cx.run_until_parked();
    let frames = cx
        .update_window(animated, |_, window, cx| window.simulate_next_frame(cx))
        .unwrap();
    assert!(frames > 0, "a bouncing loader keeps requesting frames");

    cx.update(|cx| cx.set_reduce_motion(true));
    let still = open(cx, |_, cx| cx.new(|_| LoaderHost));
    cx.run_until_parked();
    let frames = cx
        .update_window(still, |_, window, cx| window.simulate_next_frame(cx))
        .unwrap();
    assert_eq!(frames, 0, "reduced motion requests no frame");
}

struct ButtonHost;

impl Render for ButtonHost {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        let host = |id: &'static str, button: Button| {
            div().id(id).test_support().flex().flex_none().child(button)
        };
        div()
            .size_full()
            .flex()
            .items_start()
            .gap_4()
            .child(host(
                "host-xs",
                Button::new("xs").with_atom_size(AtomSize::Xs).label("Go"),
            ))
            .child(host("host-md", Button::new("md").primary().label("Go")))
            .child(host(
                "host-xl",
                Button::new("xl").with_atom_size(AtomSize::Xl).label("Go"),
            ))
            .child(host("host-icon", Button::new("icon").icon(IconName::Plus)))
            .child(host("host-glass", Button::new("glass").glass().label("Go")))
    }
}

#[gpui_kit::test]
fn button_frames_follow_the_size_scale_and_hold_still_when_pressed(cx: &mut TestAppContext) {
    cx.update(corpora_ui::init);
    let window = open(cx, |_, cx| cx.new(|_| ButtonHost));

    let pressed_at = cx
        .update_window(window, |_, window, cx| {
            window.render_frame(cx);
            for (id, height) in [
                ("host-xs", 20.),
                ("host-md", 32.),
                ("host-xl", 40.),
                ("host-glass", 32.),
            ] {
                assert_px(window.find(id).bounds().size.height, height, id);
            }
            let icon = window.find("host-icon").bounds();
            assert_px(icon.size.height, 32., "icon-only height");
            assert_px(icon.size.width, 32., "icon-only width");
            window.find("host-md").bounds()
        })
        .unwrap();

    let mut pointer = VisualTestContext::from_window(window, cx);
    pointer.simulate_mouse_move(pressed_at.center(), None, Modifiers::default());
    pointer.simulate_mouse_down(pressed_at.center(), MouseButton::Left, Modifiers::default());
    pointer.run_until_parked();

    cx.update_window(window, |_, window, cx| {
        let frames = window.simulate_next_frame(cx);
        assert!(frames > 0, "a press animates the squeeze");
        window.render_frame(cx);
        assert_eq!(
            window.find("host-md").bounds(),
            pressed_at,
            "the squeeze does not move the layout box"
        );
    })
    .unwrap();
}
