//! Renders blocks in a headless window and checks the layout and events
//! they promise.

use std::cell::RefCell;
use std::rc::Rc;

use corpora_ui::blocks::CorpusNavigator;
use corpora_ui::composed::{
    CorpusData, CorpusLevel, CorpusLevelKind, CorpusNavigation, CorpusNode,
};
use gpui_kit::test::TestWindowExt as _;
use gpui_kit::{
    AnyWindowHandle, App, AppContext as _, Bounds, Context, Entity, IntoElement,
    ParentElement as _, Pixels, Point, Render, Styled as _, TestAppContext, TestSupportExt as _,
    VisualTestContext, Window, WindowBounds, WindowOptions, div, prelude::*, px, size,
};

fn open<V: Render>(
    cx: &mut TestAppContext,
    width: Pixels,
    build: impl FnOnce(&mut Window, &mut App) -> Entity<V>,
) -> AnyWindowHandle {
    cx.update(|cx| {
        let options = WindowOptions {
            window_bounds: Some(WindowBounds::Windowed(Bounds {
                origin: Point::default(),
                size: size(width, px(1200.)),
            })),
            ..Default::default()
        };
        gpui_kit::open_window(options, cx, build)
            .expect("open test window")
            .0
    })
}

struct NavigatorHost {
    navigation: Entity<CorpusNavigation>,
}

impl Render for NavigatorHost {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        div().size_full().flex().flex_col().child(
            div().id("navigator").test_support().child(
                CorpusNavigator::new("reader", &self.navigation)
                    .child(div().id("reading").test_support().child("In the beginning")),
            ),
        )
    }
}

fn navigator(
    cx: &mut TestAppContext,
    width: Pixels,
) -> (AnyWindowHandle, Entity<CorpusNavigation>) {
    cx.update(corpora_ui::init);
    // The fold opens at once, without its reveal.
    cx.update(|cx| cx.set_reduce_motion(true));
    let held = Rc::new(RefCell::new(None));
    let host_held = held.clone();
    let window = open(cx, width, move |window, cx| {
        let data = CorpusData::new(
            "Sample",
            [
                CorpusLevel::new("book", "Book", CorpusLevelKind::Hierarchy),
                CorpusLevel::new("chapter", "Chapter", CorpusLevelKind::Number),
            ],
            [
                CorpusNode::new("john", "book", "John").children((1..=3).map(|chapter| {
                    CorpusNode::new(format!("john-{chapter}"), "chapter", chapter.to_string())
                })),
            ],
        );
        let navigation = cx.new(|cx| CorpusNavigation::new(data, window, cx).location("john-1"));
        *host_held.borrow_mut() = Some(navigation.clone());
        cx.new(|_| NavigatorHost { navigation })
    });
    let navigation = held.borrow().clone().unwrap();
    (window, navigation)
}

fn frame(visual: &mut VisualTestContext, id: &'static str) -> Bounds<Pixels> {
    visual.update(|window, cx| {
        // The navigator reads its width on one frame and lays out on the next.
        for _ in 0..3 {
            window.render_frame(cx);
        }
        window.find(id).bounds()
    })
}

#[gpui_kit::test]
fn corpus_navigator_stands_the_picker_beside_the_reading_when_wide(cx: &mut TestAppContext) {
    let (window, _) = navigator(cx, px(1200.));
    let mut visual = VisualTestContext::from_window(window, cx);
    let reading = frame(&mut visual, "reading");
    // The picker column is 18rem wide, then the reading's own padding.
    assert!(
        reading.left() > px(288.),
        "the reading starts past the picker: {reading:?}"
    );
}

#[gpui_kit::test]
fn corpus_navigator_folds_the_picker_behind_browse_when_narrow(cx: &mut TestAppContext) {
    let (window, navigation) = navigator(cx, px(700.));
    let mut visual = VisualTestContext::from_window(window, cx);
    let reading = frame(&mut visual, "reading");
    assert!(
        reading.left() < px(40.),
        "the reading takes the full width: {reading:?}"
    );
    let shut = frame(&mut visual, "navigator");

    visual.update(|_, cx| navigation.update(cx, |state, cx| state.set_picker_open(true, cx)));
    let unfolded = frame(&mut visual, "navigator");
    assert!(
        unfolded.size.height > shut.size.height + px(100.),
        "the picker unfolded: {unfolded:?} from {shut:?}"
    );

    // Picking a place and going there folds it away again.
    visual.update(|_, cx| {
        navigation.update(cx, |state, cx| {
            state.select("john-3", cx);
            state.commit(None, cx);
            assert!(!state.picker_open());
        });
    });
    let refolded = frame(&mut visual, "navigator");
    // The "Return to" row is new, so it is a little taller than at first.
    assert!(
        refolded.size.height < unfolded.size.height - px(100.),
        "the picker folded: {refolded:?} from {unfolded:?}"
    );
}

struct PanelHost {
    composer: Entity<corpora_ui::composed::Composer>,
    locked: bool,
    picked: Rc<RefCell<Vec<gpui_kit::SharedString>>>,
}

impl Render for PanelHost {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        use corpora_ui::blocks::AiPanel;

        let picked = self.picked.clone();
        div().size_full().child(
            div()
                .id("panel")
                .test_support()
                .w(px(400.))
                .h(px(600.))
                .child(
                    AiPanel::new("ai", &self.composer)
                        .locked(self.locked)
                        .prompts(["List the variants"])
                        .on_prompt_select(move |prompt, _, _| {
                            picked.borrow_mut().push(prompt.clone())
                        }),
                ),
        )
    }
}

#[gpui_kit::test]
fn ai_panel_offers_prompts_in_an_empty_thread_and_locks_its_composer(cx: &mut TestAppContext) {
    use corpora_ui::composed::{Composer, ComposerEvent};

    cx.update(corpora_ui::init);
    let picked = Rc::new(RefCell::new(Vec::new()));
    let sent = Rc::new(RefCell::new(0));
    let held = Rc::new(RefCell::new(None));
    let (host_picked, host_sent, host_held) = (picked.clone(), sent.clone(), held.clone());
    let window = open(cx, px(600.), move |window, cx| {
        let composer = cx.new(|cx| Composer::new(window, cx));
        cx.subscribe(&composer, move |_, event: &ComposerEvent, _| {
            if matches!(event, ComposerEvent::Submit { .. }) {
                *host_sent.borrow_mut() += 1;
            }
        })
        .detach();
        let host = cx.new(|_| PanelHost {
            composer: composer.clone(),
            locked: false,
            picked: host_picked,
        });
        *host_held.borrow_mut() = Some((host.clone(), composer));
        host
    });
    let (host, composer) = held.borrow().clone().unwrap();
    let mut visual = VisualTestContext::from_window(window, cx);
    let panel = frame(&mut visual, "panel");

    // The prompt sits at the foot of the thread, just above the composer.
    let mut found = false;
    for lift in (60..220).step_by(10) {
        visual.simulate_click(
            gpui_kit::point(panel.left() + px(60.), panel.bottom() - px(lift as f32)),
            gpui_kit::Modifiers::none(),
        );
        if !picked.borrow().is_empty() {
            found = true;
            break;
        }
    }
    assert!(found, "a click on the prompt row picks it");
    assert_eq!(picked.borrow()[0], "List the variants");

    // Typing sends while the panel is open for edits.
    visual.update(|window, cx| composer.update(cx, |composer, cx| composer.focus(window, cx)));
    visual.simulate_input("hello");
    visual.simulate_keystrokes("enter");
    assert_eq!(*sent.borrow(), 1);

    // Locked, the same keys send nothing.
    visual.update(|_, cx| {
        host.update(cx, |host, cx| {
            host.locked = true;
            cx.notify();
        })
    });
    frame(&mut visual, "panel");
    visual.simulate_input("again");
    visual.simulate_keystrokes("enter");
    assert_eq!(*sent.borrow(), 1, "a locked panel does not send");
}
