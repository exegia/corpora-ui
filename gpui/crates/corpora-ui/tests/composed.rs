//! Renders composed components in a headless window and checks the geometry
//! and events they promise.

use std::cell::RefCell;
use std::rc::Rc;

use corpora_ui::atoms::{Emoji, EmojiPickerState, Reveal, SelectChip};
use corpora_ui::composed::{EmojiActionBar, Logo, ReactionPicker, SocialProvider, SocialProviders};
use gpui_kit::test::TestWindowExt as _;
use gpui_kit::{
    AnyWindowHandle, App, AppContext as _, Bounds, Context, Entity, IntoElement, Modifiers,
    ParentElement as _, Pixels, Point, Render, ScrollDelta, ScrollEvent, SharedString, Styled as _,
    TestAppContext, TestSupportExt as _, VisualTestContext, Window, WindowBounds, WindowOptions,
    div, point, prelude::*, px, size,
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

    // The first emoji of the first group: under the floating header (the
    // search field and the group filters) and the group's label.
    let first = point(bar.origin.x + px(1.5 * REM), bar.origin.y + px(7.25 * REM));
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
    // The bar measures its quick row on its first frame and settles on the
    // next, as it does on screen before anyone can click.
    cx.update(|window, cx| {
        window.render_frame(cx);
        window.render_frame(cx);
    });

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

#[gpui_kit::test]
fn the_emoji_bar_at_rest_is_as_wide_as_its_quick_row(cx: &mut TestAppContext) {
    cx.update(corpora_ui::init);
    let window = open(cx, |window, cx| {
        let picker = cx.new(|cx| EmojiPickerState::new(window, cx));
        cx.new(|_| PickerHost {
            picker,
            picked: Rc::default(),
        })
    });

    let bar = cx
        .update_window(window, |_, window, cx| {
            // One frame to measure the row, one to settle on its width.
            window.render_frame(cx);
            window.render_frame(cx);
            window.find("bar").bounds()
        })
        .expect("window is open");
    assert_px(bar.size.height, 2. * REM, "quick row height");
    assert!(
        bar.size.width > px(8. * REM) && bar.size.width < px(19. * REM),
        "the bar hugs its row instead of holding the picker's width: {:?}",
        bar.size.width
    );
}

/// A page that scrolls, with an open picker on it.
struct ScrollHost {
    picker: Entity<EmojiPickerState>,
}

impl Render for ScrollHost {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        div()
            .id("page")
            .size_full()
            .overflow_y_scroll()
            .child(
                div()
                    .id("bar")
                    .test_support()
                    .child(EmojiActionBar::new("reactions").picker(&self.picker)),
            )
            .child(div().h(px(2000.)))
    }
}

#[gpui_kit::test]
fn the_wheel_over_the_picker_scrolls_its_list_not_the_page(cx: &mut TestAppContext) {
    cx.update(corpora_ui::init);
    let window = open(cx, |window, cx| {
        let picker = cx.new(|cx| EmojiPickerState::new(window, cx));
        picker.update(cx, |picker, cx| picker.set_expanded(true, cx));
        cx.new(|_| ScrollHost { picker })
    });
    let find_bar = |cx: &mut TestAppContext| {
        cx.update_window(window, |_, window, cx| {
            window.render_frame(cx);
            window.render_frame(cx);
            window.find("bar").bounds()
        })
        .expect("window is open")
    };

    let before = find_bar(cx);
    let over_list = point(
        before.origin.x + px(4. * REM),
        before.origin.y + px(8. * REM),
    );
    let mut visual = VisualTestContext::from_window(window, cx);
    visual.simulate_event(ScrollEvent {
        position: over_list,
        delta: ScrollDelta::Pixels(point(px(0.), px(-120.))),
        ..Default::default()
    });
    visual.run_until_parked();

    assert_eq!(find_bar(cx).origin, before.origin, "the page stayed put");
}

#[gpui_kit::test]
fn a_group_filter_scrolls_the_picker_to_that_group(cx: &mut TestAppContext) {
    cx.update(corpora_ui::init);
    let picked = Rc::new(RefCell::new(Vec::new()));
    let window = open(cx, {
        let picked = picked.clone();
        move |window, cx| {
            let picker = cx.new(|cx| EmojiPickerState::new(window, cx));
            picker.update(cx, |picker, cx| picker.set_expanded(true, cx));
            cx.new(|_| PickerHost { picker, picked })
        }
    });
    let bar = cx
        .update_window(window, |_, window, cx| {
            window.render_frame(cx);
            window.find("bar").bounds()
        })
        .expect("window is open");

    // The second filter, "People & body", in the row under the search field.
    let filter = point(bar.origin.x + px(3.75 * REM), bar.origin.y + px(3.25 * REM));
    let first = point(bar.origin.x + px(1.5 * REM), bar.origin.y + px(7.25 * REM));
    let mut visual = VisualTestContext::from_window(window, cx);
    visual.simulate_click(filter, Modifiers::none());
    // The jump is animated; let it run out.
    visual
        .executor()
        .advance_clock(std::time::Duration::from_millis(500));
    visual.run_until_parked();
    visual.update(|window, cx| window.render_frame(cx));

    // The group's label now sits just under the header, so its first emoji
    // is where the first group's was.
    visual.simulate_click(first, Modifiers::none());
    assert_eq!(picked.borrow().len(), 1, "one emoji picked");
    assert_eq!(picked.borrow()[0].label, "waving hand");
}

struct GlossHost;

impl Render for GlossHost {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        div()
            .size_full()
            .p(px(200.))
            .child(div().id("gloss-trigger").test_support().child(
                corpora_ui::atoms::TextPopover::new("gloss", "the Word").content(|_, _| {
                    div()
                        .id("gloss-content")
                        .test_support()
                        .child("word, reason")
                        .into_any_element()
                }),
            ))
    }
}

#[gpui_kit::test]
fn clicked_text_opens_its_popover_and_escape_closes_it(cx: &mut TestAppContext) {
    cx.update(corpora_ui::init);
    let window = open(cx, |_, cx| cx.new(|_| GlossHost));
    let trigger = cx
        .update_window(window, |_, window, cx| {
            window.render_frame(cx);
            window.find("gloss-trigger").bounds()
        })
        .expect("window is open");

    let mut visual = VisualTestContext::from_window(window, cx);
    visual.simulate_mouse_move(trigger.center(), None, Modifiers::none());
    visual.simulate_click(trigger.center(), Modifiers::none());
    visual.run_until_parked();
    let content = visual.update(|window, cx| {
        window.render_frame(cx);
        window.find("gloss-content").bounds()
    });
    assert!(
        content.bottom() <= trigger.top(),
        "the popover floats above the clicked text: {content:?} over {trigger:?}"
    );

    visual.simulate_keystrokes("escape");
    visual.run_until_parked();
    let still_open = visual.update(|window, cx| {
        window.render_frame(cx);
        window.try_find("gloss-content").is_some()
    });
    assert!(!still_open, "Escape closes the popover");
}

/// What the data pieces reported, for the tests below.
#[derive(Default)]
struct DataLog {
    view: Option<SharedString>,
    filter: Option<Option<SharedString>>,
    selected: Option<Vec<SharedString>>,
}

struct DataHost {
    log: Rc<RefCell<DataLog>>,
}

impl Render for DataHost {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        use corpora_ui::atoms::{SegmentedToggle, Tone};
        use corpora_ui::composed::{FilterRow, FilterStatus, FilterTable, RecordRow, RecordsTable};

        let (view, filter, selected) = (self.log.clone(), self.log.clone(), self.log.clone());
        let record = |id: &'static str, name: &'static str| RecordRow {
            id: id.into(),
            name: name.into(),
            ..RecordRow::default()
        };
        div()
            .size_full()
            .flex()
            .flex_col()
            .items_start()
            .gap_4()
            .child(
                div().id("toggle").test_support().child(
                    SegmentedToggle::new("view")
                        .option("code", "Code")
                        .option("diff", "Diff")
                        .on_change(move |value, _, _| {
                            view.borrow_mut().view = Some(value.clone());
                        }),
                ),
            )
            .child(
                div().id("filter-table").test_support().w(px(400.)).child(
                    FilterTable::new("tasks")
                        .statuses([
                            FilterStatus::new("done", "Done", Tone::Success),
                            FilterStatus::new("open", "Open", Tone::Neutral),
                        ])
                        .columns(["Task", "Status"])
                        .status_column(1)
                        .rows([
                            FilterRow::new("t1", "done", ["Collate", ""]),
                            FilterRow::new("t2", "open", ["Align", ""]),
                            FilterRow::new("t3", "open", ["Tag", ""]),
                        ])
                        .on_filter_change(move |status, _, _| {
                            filter.borrow_mut().filter = Some(status.cloned());
                        }),
                ),
            )
            .child(
                div().id("records").test_support().w(px(500.)).child(
                    RecordsTable::new("witnesses")
                        .rows([record("bezae", "Codex Bezae"), record("p75", "Papyrus 75")])
                        .on_selection_change(move |ids, _, _| {
                            selected.borrow_mut().selected = Some(ids.iter().cloned().collect());
                        }),
                ),
            )
    }
}

#[gpui_kit::test]
fn data_pieces_report_the_view_filter_and_selection_picked(cx: &mut TestAppContext) {
    cx.update(corpora_ui::init);
    let log = Rc::new(RefCell::new(DataLog::default()));
    let host_log = log.clone();
    let window = open(cx, |_, cx| cx.new(|_| DataHost { log: host_log }));
    let mut visual = VisualTestContext::from_window(window, cx);
    let bounds = |visual: &mut VisualTestContext, id: &'static str| {
        visual.update(|window, cx| {
            window.render_frame(cx);
            window.render_frame(cx);
            window.find(id).bounds()
        })
    };

    // The last segment sits at the trailing end of the toggle.
    let toggle = bounds(&mut visual, "toggle");
    visual.simulate_click(
        point(toggle.right() - px(12.), toggle.center().y),
        Modifiers::none(),
    );
    assert_eq!(log.borrow().view.as_deref(), Some("diff"));

    // "All 3" comes first in the filter row, then "Done 1".
    let table = bounds(&mut visual, "filter-table");
    visual.simulate_click(
        point(table.left() + px(80.), table.top() + px(12.)),
        Modifiers::none(),
    );
    assert_eq!(log.borrow().filter, Some(Some("done".into())));
    let filtered = bounds(&mut visual, "filter-table");
    assert!(
        filtered.size.height < table.size.height,
        "two of the three rows are filtered out: {filtered:?} from {table:?}"
    );

    // The header's checkbox selects every row.
    let records = bounds(&mut visual, "records");
    visual.simulate_click(
        point(records.left() + px(20.), records.top() + px(16.)),
        Modifiers::none(),
    );
    assert_eq!(
        log.borrow().selected,
        Some(vec!["bezae".into(), "p75".into()])
    );
}
