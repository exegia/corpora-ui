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

struct ProfileHost {
    collapsed: bool,
}

impl Render for ProfileHost {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        use corpora_ui::atoms::AvatarUser;
        use corpora_ui::blocks::ProfileCard;

        div().size_full().flex().flex_col().items_start().child(
            div()
                .id("card")
                .test_support()
                .when(!self.collapsed, |this| this.w(px(240.)))
                .child(
                    ProfileCard::new("account", AvatarUser::named("Ada", "Lovelace"))
                        .username("ada@exegia.app")
                        .collapsed(self.collapsed),
                ),
        )
    }
}

#[gpui_kit::test]
fn profile_card_folds_to_its_avatar(cx: &mut TestAppContext) {
    cx.update(corpora_ui::init);
    cx.update(|cx| cx.set_reduce_motion(true));
    let held = Rc::new(RefCell::new(None));
    let host_held = held.clone();
    let window = open(cx, px(600.), move |_, cx| {
        let host = cx.new(|_| ProfileHost { collapsed: false });
        *host_held.borrow_mut() = Some(host.clone());
        host
    });
    let host = held.borrow().clone().unwrap();
    let mut visual = VisualTestContext::from_window(window, cx);
    let open_card = frame(&mut visual, "card");
    assert_eq!(open_card.size.width, px(240.));

    visual.update(|_, cx| {
        host.update(cx, |host, cx| {
            host.collapsed = true;
            cx.notify();
        })
    });
    let folded = frame(&mut visual, "card");
    // Only the 2rem avatar is left, inside the row's 2.5rem height.
    assert!(
        folded.size.width <= px(40.),
        "the name and chevron are gone: {folded:?}"
    );
    assert_eq!(folded.size.height, open_card.size.height);
}

struct SidebarHost {
    sidebar: Entity<corpora_ui::blocks::ResourceSidebar>,
}

impl Render for SidebarHost {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        div().size_full().flex().flex_col().child(
            div()
                .id("sidebar")
                .test_support()
                .w(px(280.))
                .child(self.sidebar.clone()),
        )
    }
}

#[gpui_kit::test]
fn resource_sidebar_opens_selects_moves_and_renames(cx: &mut TestAppContext) {
    use corpora_ui::blocks::{
        DropPosition, ResourceKind, ResourceMove, ResourceSidebar, ResourceSidebarEvent,
        SidebarResource,
    };

    cx.update(corpora_ui::init);
    let held = Rc::new(RefCell::new(None));
    let host_held = held.clone();
    let events = Rc::new(RefCell::new(Vec::new()));
    let seen = events.clone();
    let window = open(cx, px(600.), move |_, cx| {
        let sidebar = cx.new(|cx| {
            ResourceSidebar::new(
                [
                    SidebarResource::new("notes", "Notes", ResourceKind::Folder).children([
                        SidebarResource::new("draft", "Draft", ResourceKind::File),
                        SidebarResource::new("memo", "Memo", ResourceKind::File),
                    ]),
                    SidebarResource::new("john", "John 3:16", ResourceKind::Bookmark),
                ],
                cx,
            )
        });
        cx.subscribe(&sidebar, move |_, event: &ResourceSidebarEvent, _| {
            seen.borrow_mut().push(event.clone());
        })
        .detach();
        *host_held.borrow_mut() = Some(sidebar.clone());
        cx.new(|_| SidebarHost { sidebar })
    });
    let sidebar = held.borrow().clone().unwrap();
    let mut visual = VisualTestContext::from_window(window, cx);
    let shut = frame(&mut visual, "sidebar");

    // A click on a folder opens it; its two files add two rows.
    visual.simulate_click(
        shut.origin + gpui_kit::point(px(60.), px(18.)),
        Default::default(),
    );
    let unfolded = frame(&mut visual, "sidebar");
    assert!(
        unfolded.size.height >= shut.size.height + px(72.),
        "two rows appeared: {unfolded:?} from {shut:?}"
    );

    // A click on a file selects it.
    visual.simulate_click(
        shut.origin + gpui_kit::point(px(60.), px(56.)),
        Default::default(),
    );
    visual.update(|_, cx| {
        assert_eq!(
            sidebar.read(cx).selected_id().map(|id| id.as_ref()),
            Some("draft")
        );
    });

    // The keyboard walks down, and Alt-Shift-Down carries the row with it.
    visual.simulate_keystrokes("down");
    visual.update(|_, cx| {
        assert_eq!(
            sidebar.read(cx).focused_id().map(|id| id.as_ref()),
            Some("memo")
        );
    });
    visual.simulate_keystrokes("alt-shift-down");
    visual.update(|_, cx| {
        let state = sidebar.read(cx);
        let top: Vec<&str> = state.items().iter().map(|item| item.id.as_ref()).collect();
        assert_eq!(top, ["notes", "john", "memo"]);
    });

    visual.update(|_, cx| {
        sidebar.update(cx, |state, cx| {
            // A file cannot hold another row.
            assert!(!state.move_resource(
                ResourceMove {
                    item_id: "memo".into(),
                    target_id: Some("john".into()),
                    position: DropPosition::Inside,
                },
                cx,
            ));
            state.rename("john", "  John 3:17 ", cx);
            // Blank labels are dropped.
            state.rename("john", "   ", cx);
            assert_eq!(state.item("john").unwrap().label.as_ref(), "John 3:17");
        });
    });
    // F2 turns the label into a field; typing replaces it and Enter commits.
    visual.simulate_keystrokes("f2");
    visual.update(|_, cx| {
        assert_eq!(
            sidebar.read(cx).renaming_id().map(|id| id.as_ref()),
            Some("memo")
        );
    });
    frame(&mut visual, "sidebar");
    visual.simulate_input("Psalm 23");
    visual.simulate_keystrokes("enter");
    visual.update(|_, cx| {
        let state = sidebar.read(cx);
        assert_eq!(state.renaming_id(), None);
        assert_eq!(state.item("memo").unwrap().label.as_ref(), "Psalm 23");
    });
    // Escape leaves the label as it was.
    visual.simulate_keystrokes("f2");
    frame(&mut visual, "sidebar");
    visual.simulate_input("Thrown away");
    visual.simulate_keystrokes("escape");
    visual.update(|_, cx| {
        let state = sidebar.read(cx);
        assert_eq!(state.renaming_id(), None);
        assert_eq!(state.item("memo").unwrap().label.as_ref(), "Psalm 23");
    });

    assert_eq!(
        *events.borrow(),
        [
            ResourceSidebarEvent::Select("draft".into()),
            ResourceSidebarEvent::Move(ResourceMove {
                item_id: "memo".into(),
                target_id: Some("john".into()),
                position: DropPosition::After,
            }),
            ResourceSidebarEvent::Rename {
                id: "john".into(),
                label: "John 3:17".into(),
            },
            ResourceSidebarEvent::Rename {
                id: "memo".into(),
                label: "Psalm 23".into(),
            },
        ]
    );
}

struct ShellHost {
    shell: Entity<corpora_ui::blocks::Shell>,
}

impl Render for ShellHost {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        use corpora_ui::blocks::ShellLayout;

        div().size_full().child(
            ShellLayout::new("shell", &self.shell)
                .left(div().id("rail").test_support().size_full())
                .right(div().id("panel").test_support().size_full())
                .child(div().id("page").test_support().h(px(40.)).child("Page")),
        )
    }
}

fn shell(
    cx: &mut TestAppContext,
    width: Pixels,
) -> (AnyWindowHandle, Entity<corpora_ui::blocks::Shell>) {
    cx.update(corpora_ui::init);
    cx.update(|cx| cx.set_reduce_motion(true));
    let held = Rc::new(RefCell::new(None));
    let host_held = held.clone();
    let window = open(cx, width, move |_, cx| {
        let shell = cx.new(|_| corpora_ui::blocks::Shell::new().right_open(true));
        *host_held.borrow_mut() = Some(shell.clone());
        cx.new(|_| ShellHost { shell })
    });
    let shell = held.borrow().clone().unwrap();
    (window, shell)
}

#[gpui_kit::test]
fn shell_gives_each_column_its_share_and_folds_the_rail(cx: &mut TestAppContext) {
    use corpora_ui::blocks::{RailMode, ShellSide};

    let (window, shell) = shell(cx, px(1200.));
    let mut visual = VisualTestContext::from_window(window, cx);
    assert_eq!(frame(&mut visual, "rail").size.width, px(256.));
    assert_eq!(frame(&mut visual, "panel").size.width, px(318.));
    let page = frame(&mut visual, "page");
    assert!(
        page.size.width >= px(360.),
        "the body keeps its floor: {page:?}"
    );

    // Folding the rail leaves its icons and hands the body the rest.
    visual.update(|_, cx| shell.update(cx, |shell, cx| shell.toggle(ShellSide::Left, cx)));
    assert_eq!(frame(&mut visual, "rail").size.width, px(56.));
    assert!(frame(&mut visual, "page").size.width > page.size.width + px(190.));
    visual.update(|_, cx| {
        assert_eq!(shell.read(cx).rail_mode(), RailMode::Icon);
        assert!(shell.read(cx).collapsed());
    });

    // A resize stops at the panel's floor and at the body's.
    visual.update(|_, cx| {
        shell.update(cx, |shell, cx| {
            shell.resize(ShellSide::Right, 100., cx);
            assert_eq!(shell.width(ShellSide::Right), 320.);
            shell.resize(ShellSide::Right, 5000., cx);
            assert_eq!(shell.width(ShellSide::Right), 1200. - 32. - 56. - 360.);
        })
    });
}

#[gpui_kit::test]
fn shell_stands_the_panel_down_when_there_is_no_room(cx: &mut TestAppContext) {
    use corpora_ui::blocks::{RailMode, ShellSide};

    let (window, shell) = shell(cx, px(700.));
    let mut visual = VisualTestContext::from_window(window, cx);
    frame(&mut visual, "page");
    visual.update(|_, cx| {
        let shell = shell.read(cx);
        assert!(!shell.fits());
        assert!(!shell.is_open(ShellSide::Right));
        // 700 - 24 - 360 leaves 316 for the rail, more than it asks for.
        assert_eq!(shell.rail_mode(), RailMode::Expanded);
        assert_eq!(shell.width(ShellSide::Left), 256.);
    });
}

struct ScaffoldHost {
    scaffold: Entity<corpora_ui::blocks::Scaffold>,
}

impl Render for ScaffoldHost {
    fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
        use corpora_ui::blocks::{ScaffoldLayout, ScaffoldPanel, ScaffoldTab};

        let mut layout = ScaffoldLayout::new("scaffold", &self.scaffold).inspector(
            "Inspector",
            div().id("details").test_support().child("Details"),
        );
        for name in ["a", "b", "c"] {
            layout = layout
                .tab(ScaffoldTab::new(name, name))
                .panel(ScaffoldPanel::new(
                    name,
                    div().id(name).test_support().size_full(),
                ));
        }
        div().size_full().child(layout)
    }
}

fn scaffold(
    cx: &mut TestAppContext,
    width: Pixels,
) -> (AnyWindowHandle, Entity<corpora_ui::blocks::Scaffold>) {
    cx.update(corpora_ui::init);
    cx.update(|cx| cx.set_reduce_motion(true));
    let held = Rc::new(RefCell::new(None));
    let host_held = held.clone();
    let window = open(cx, width, move |_, cx| {
        let scaffold = cx.new(|_| corpora_ui::blocks::Scaffold::new());
        *host_held.borrow_mut() = Some(scaffold.clone());
        cx.new(|_| ScaffoldHost { scaffold })
    });
    let scaffold = held.borrow().clone().unwrap();
    (window, scaffold)
}

#[gpui_kit::test]
fn scaffold_shares_the_canvas_and_resizes_a_panel(cx: &mut TestAppContext) {
    let (window, scaffold) = scaffold(cx, px(1208.));
    let mut visual = VisualTestContext::from_window(window, cx);
    // 1208 less an 8px gutter each side leaves 1192: three panels of 392
    // and two gaps. Each card's border takes 2 from its content.
    for name in ["a", "b", "c"] {
        let panel = frame(&mut visual, name);
        assert!(
            (f32::from(panel.size.width) - 390.).abs() < 1.,
            "{name} takes a third: {panel:?}"
        );
    }

    // A drag widens one panel; the middle one gives the room up.
    visual.update(|_, cx| scaffold.update(cx, |scaffold, cx| scaffold.resize_panel("a", 500., cx)));
    assert_eq!(frame(&mut visual, "a").size.width, px(498.));
    assert!(frame(&mut visual, "b").size.width < px(330.));

    // The inspector slides over the canvas and takes no room from it.
    let before = frame(&mut visual, "c");
    visual.update(|_, cx| scaffold.update(cx, |scaffold, cx| scaffold.toggle_inspector(cx)));
    assert_eq!(frame(&mut visual, "c"), before);
    assert_eq!(frame(&mut visual, "details").size.width, px(270.));
}

#[gpui_kit::test]
fn scaffold_hides_the_oldest_panel_when_narrow(cx: &mut TestAppContext) {
    let (window, scaffold) = scaffold(cx, px(700.));
    let mut visual = VisualTestContext::from_window(window, cx);
    frame(&mut visual, "c");
    visual.update(|_, cx| {
        let state = scaffold.read(cx);
        assert_eq!(state.capacity(), 2);
        assert_eq!(state.hidden_ids(), ["a"]);
    });
    // Its tab brings it back, in place of the next oldest.
    visual.update(|_, cx| scaffold.update(cx, |scaffold, cx| scaffold.toggle_panel("a", cx)));
    frame(&mut visual, "a");
    visual.update(|_, cx| assert_eq!(scaffold.read(cx).hidden_ids(), ["b"]));
}

#[gpui_kit::test]
fn login_waits_for_both_fields_and_for_the_host(cx: &mut TestAppContext) {
    use corpora_ui::blocks::{AuthStatus, LoginBlock, LoginEvent};

    cx.update(corpora_ui::init);
    cx.update(|cx| cx.set_reduce_motion(true));
    let held = Rc::new(RefCell::new(None));
    let host_held = held.clone();
    let window = open(cx, px(480.), move |window, cx| {
        let login = cx.new(|cx| LoginBlock::new(window, cx));
        *host_held.borrow_mut() = Some(login.clone());
        login
    });
    let login = held.borrow().clone().unwrap();
    let mut visual = VisualTestContext::from_window(window, cx);
    let events = Rc::new(RefCell::new(Vec::new()));
    let log = events.clone();
    visual.update(|_, cx| {
        cx.subscribe(&login, move |_, event: &LoginEvent, _| {
            log.borrow_mut().push(event.clone())
        })
        .detach()
    });

    // Half a form sends nothing.
    visual.update(|window, cx| {
        login.update(cx, |login, cx| {
            login.email_input().clone().update(cx, |input, cx| {
                input.set_value("ada@exegia.app", window, cx)
            });
            login.submit(cx);
        })
    });
    assert!(events.borrow().is_empty());

    visual.update(|window, cx| {
        login.update(cx, |login, cx| {
            login
                .password_input()
                .clone()
                .update(cx, |input, cx| input.set_value("analytical", window, cx));
            login.submit(cx);
            // A second press while the host is thinking is ignored.
            login.submit(cx);
        })
    });
    assert_eq!(
        *events.borrow(),
        [LoginEvent::Submit {
            email: "ada@exegia.app".into(),
            password: "analytical".into(),
            remember: false,
        }]
    );
    visual.update(|window, cx| {
        login.update(cx, |login, cx| {
            assert_eq!(login.status(), AuthStatus::Loading);
            login.fail("No such account.", cx);
            assert_eq!(login.status(), AuthStatus::Idle);
            assert_eq!(
                login.error().map(|error| error.as_ref()),
                Some("No such account.")
            );
            login.submit(cx);
            assert_eq!(login.error(), None);
            login.succeed(cx);
            assert_eq!(login.status(), AuthStatus::Success);
            login.reset(window, cx);
            assert_eq!(login.status(), AuthStatus::Idle);
            assert!(login.email_input().read(cx).value().is_empty());
        })
    });
    assert_eq!(events.borrow().len(), 2);
}

#[gpui_kit::test]
fn signup_and_code_hold_back_what_is_not_ready(cx: &mut TestAppContext) {
    use corpora_ui::blocks::{CodeAuthBlock, CodeAuthEvent, SignupBlock, SignupEvent};

    cx.update(corpora_ui::init);
    let held = Rc::new(RefCell::new(None));
    let host_held = held.clone();
    let window = open(cx, px(480.), move |window, cx| {
        let code = cx.new(|cx| CodeAuthBlock::new(6, window, cx).auto_submit(false));
        let signup = cx.new(|cx| SignupBlock::new(window, cx).show_terms(false));
        *host_held.borrow_mut() = Some((signup.clone(), code));
        signup
    });
    let (signup, code) = held.borrow().clone().unwrap();
    let mut visual = VisualTestContext::from_window(window, cx);
    let sent = Rc::new(RefCell::new(Vec::new()));
    let verified = Rc::new(RefCell::new(Vec::new()));
    let (sent_log, verified_log) = (sent.clone(), verified.clone());
    visual.update(|_, cx| {
        cx.subscribe(&signup, move |_, event: &SignupEvent, _| {
            sent_log.borrow_mut().push(event.clone())
        })
        .detach();
        cx.subscribe(&code, move |_, event: &CodeAuthEvent, _| {
            verified_log.borrow_mut().push(event.clone())
        })
        .detach();
    });

    visual.update(|window, cx| {
        signup.update(cx, |signup, cx| {
            let (email, password) = (
                signup.email_input().clone(),
                signup.password_input().clone(),
            );
            email.update(cx, |input, cx| {
                input.set_value("ada@exegia.app", window, cx)
            });
            password.update(cx, |input, cx| input.set_value("weak", window, cx));
            signup.submit(cx);
            assert_eq!(
                signup.error().map(|error| error.as_ref()),
                Some("Please meet all password requirements.")
            );
            password.update(cx, |input, cx| input.set_value("Engine1843", window, cx));
            signup.submit(cx);
        });
        code.update(cx, |code, cx| {
            assert_eq!(code.remaining(), 30);
            let digits = code.code_input().clone();
            digits.update(cx, |input, cx| input.set_value("1843", window, cx));
            code.verify(cx);
            digits.update(cx, |input, cx| input.set_value("184312", window, cx));
            code.verify(cx);
        });
    });
    assert_eq!(
        *sent.borrow(),
        [SignupEvent::Submit {
            name: "".into(),
            email: "ada@exegia.app".into(),
            password: "Engine1843".into(),
        }]
    );
    assert_eq!(*verified.borrow(), [CodeAuthEvent::Verify("184312".into())]);
}

#[gpui_kit::test]
fn onboarding_checks_a_step_before_sending_it_and_keeps_what_was_typed(cx: &mut TestAppContext) {
    use corpora_ui::blocks::{
        AuthStatus, OnboardingBlock, OnboardingEvent, OnboardingField, OnboardingStep,
        OnboardingValue,
    };

    cx.update(corpora_ui::init);
    cx.update(|cx| cx.set_reduce_motion(true));
    let held = Rc::new(RefCell::new(None));
    let host_held = held.clone();
    let window = open(cx, px(480.), move |window, cx| {
        let onboarding = cx.new(|cx| {
            OnboardingBlock::new(
                [
                    OnboardingStep::new("profile", "Your profile")
                        .field(OnboardingField::text("display_name", "Display name").required())
                        .field(OnboardingField::url("website", "Website")),
                    OnboardingStep::new("work", "Your work")
                        .field(
                            OnboardingField::select("role", "Role", [("scholar", "Scholar")])
                                .required(),
                        )
                        .field(OnboardingField::checkbox("updates", "Send me updates")),
                ],
                window,
                cx,
            )
        });
        *host_held.borrow_mut() = Some(onboarding.clone());
        onboarding
    });
    let onboarding = held.borrow().clone().unwrap();
    let mut visual = VisualTestContext::from_window(window, cx);
    let events = Rc::new(RefCell::new(Vec::new()));
    let log = events.clone();
    visual.update(|_, cx| {
        cx.subscribe(&onboarding, move |_, event: &OnboardingEvent, _| {
            log.borrow_mut().push(event.clone())
        })
        .detach()
    });
    let text = |value: &'static str| OnboardingValue::Text(value.into());

    // A step that fails its checks says why and sends nothing.
    visual.update(|window, cx| {
        onboarding.update(cx, |onboarding, cx| {
            let website = onboarding.text_input("website").unwrap();
            website.update(cx, |input, cx| input.set_value("exegia.app", window, cx));
            onboarding.submit(cx);
            assert_eq!(
                onboarding.field_error("display_name").map(|e| e.as_ref()),
                Some("Display name is required")
            );
            assert_eq!(
                onboarding.field_error("website").map(|e| e.as_ref()),
                Some("Enter a valid URL")
            );
            assert_eq!(onboarding.status(), AuthStatus::Idle);
            // The second step is out of reach until the first is saved.
            onboarding.go_to(1, cx);
            assert_eq!(onboarding.step_index(), 0);

            let name = onboarding.text_input("display_name").unwrap();
            name.update(cx, |input, cx| input.set_value("  Ada  ", window, cx));
            website.update(cx, |input, cx| {
                input.set_value("https://exegia.app", window, cx)
            });
            onboarding.submit(cx);
            assert_eq!(onboarding.status(), AuthStatus::Loading);
        })
    });
    assert_eq!(
        *events.borrow(),
        [OnboardingEvent::Step {
            id: "profile".into(),
            values: vec![
                ("display_name".into(), text("Ada")),
                ("website".into(), text("https://exegia.app")),
            ],
        }]
    );

    visual.update(|_, cx| {
        onboarding.update(cx, |onboarding, cx| {
            onboarding.fail("Try again.", cx);
            assert_eq!(onboarding.step_index(), 0);
            onboarding.submit(cx);
            onboarding.advance(cx);
            assert_eq!(onboarding.step_index(), 1);
            assert_eq!(onboarding.error(), None);

            // Going back keeps the fields, and the reached step stays open.
            onboarding.back(cx);
            assert_eq!(onboarding.step_index(), 0);
            let name = onboarding.text_input("display_name").unwrap();
            assert_eq!(name.read(cx).value().as_ref(), "  Ada  ");
            onboarding.go_to(1, cx);
            assert_eq!(onboarding.step_index(), 1);

            onboarding.submit(cx);
            assert_eq!(
                onboarding.field_error("role").map(|e| e.as_ref()),
                Some("Role is required")
            );
            onboarding.choose("role", Some("scholar".into()), cx);
            assert_eq!(onboarding.field_error("role"), None);
            onboarding.set_flag("updates", true, cx);
            onboarding.submit(cx);
            onboarding.advance(cx);
            assert_eq!(onboarding.status(), AuthStatus::Success);
        })
    });
    visual.run_until_parked();
    let events = events.borrow();
    assert_eq!(events.len(), 4);
    assert_eq!(
        events[3],
        OnboardingEvent::Complete(vec![
            ("display_name".into(), text("Ada")),
            ("website".into(), text("https://exegia.app")),
            ("role".into(), text("scholar")),
            ("updates".into(), OnboardingValue::Flag(true)),
        ])
    );
}

#[gpui_kit::test]
fn credentials_guard_the_last_way_in_and_confirm_a_deletion(cx: &mut TestAppContext) {
    use corpora_ui::blocks::{
        LinkedAccountsBlock, LinkedAccountsEvent, LinkedIdentity, Passkey, PasskeyManagerBlock,
        PasskeyManagerEvent, PasskeySignInBlock, PasskeySignInEvent,
    };
    use corpora_ui::composed::SocialProvider;

    struct Host {
        linked: Entity<LinkedAccountsBlock>,
        passkeys: Entity<PasskeyManagerBlock>,
        sign_in: Entity<PasskeySignInBlock>,
    }
    impl Render for Host {
        fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
            div()
                .flex()
                .flex_col()
                .child(self.linked.clone())
                .child(self.passkeys.clone())
                .child(self.sign_in.clone())
        }
    }

    cx.update(corpora_ui::init);
    cx.update(|cx| cx.set_reduce_motion(true));
    let held = Rc::new(RefCell::new(None));
    let host_held = held.clone();
    let window = open(cx, px(560.), move |window, cx| {
        let linked = cx.new(|_| {
            LinkedAccountsBlock::new()
                .identities([LinkedIdentity::new("g", SocialProvider::Google)])
        });
        let passkeys = cx.new(|cx| {
            PasskeyManagerBlock::new(window, cx)
                .passkeys([Passkey::new("mac").name("MacBook"), Passkey::new("phone")])
        });
        let sign_in = cx.new(|_| PasskeySignInBlock::new());
        *host_held.borrow_mut() = Some((linked.clone(), passkeys.clone(), sign_in.clone()));
        cx.new(|_| Host {
            linked,
            passkeys,
            sign_in,
        })
    });
    let (linked, passkeys, sign_in) = held.borrow().clone().unwrap();
    let mut visual = VisualTestContext::from_window(window, cx);
    let links = Rc::new(RefCell::new(Vec::new()));
    let keys = Rc::new(RefCell::new(Vec::new()));
    let entries = Rc::new(RefCell::new(0));
    let (link_log, key_log, entry_log) = (links.clone(), keys.clone(), entries.clone());
    visual.update(|_, cx| {
        cx.subscribe(&linked, move |_, event: &LinkedAccountsEvent, _| {
            link_log.borrow_mut().push(event.clone())
        })
        .detach();
        cx.subscribe(&passkeys, move |_, event: &PasskeyManagerEvent, _| {
            key_log.borrow_mut().push(event.clone())
        })
        .detach();
        cx.subscribe(&sign_in, move |_, _: &PasskeySignInEvent, _| {
            *entry_log.borrow_mut() += 1
        })
        .detach();
    });

    visual.update(|_, cx| {
        linked.update(cx, |linked, cx| {
            // The only identity stays.
            assert!(linked.is_last_method());
            linked.unlink("g", cx);
            assert!(!linked.is_busy());

            linked.link(SocialProvider::Github, cx);
            // One request at a time.
            linked.link(SocialProvider::Apple, cx);
            linked.settle(cx);
            linked.set_identities(
                [
                    LinkedIdentity::new("g", SocialProvider::Google),
                    LinkedIdentity::new("gh", SocialProvider::Github),
                ],
                cx,
            );
            assert!(!linked.is_last_method());
            linked.unlink("g", cx);
            linked.fail("Could not disconnect.", cx);
            assert_eq!(
                linked.error().map(|error| error.as_ref()),
                Some("Could not disconnect.")
            );
            assert_eq!(linked.linked().count(), 2);
        });
        sign_in.update(cx, |sign_in, cx| {
            sign_in.sign_in(cx);
            sign_in.sign_in(cx);
            assert!(sign_in.is_loading());
            sign_in.fail("No passkey found.", cx);
            assert!(!sign_in.is_loading());
        });
    });
    assert_eq!(
        *links.borrow(),
        [
            LinkedAccountsEvent::Link(SocialProvider::Github),
            LinkedAccountsEvent::Unlink("g".into()),
        ]
    );
    assert_eq!(*entries.borrow(), 1);

    visual.update(|window, cx| {
        passkeys.update(cx, |passkeys, cx| {
            // The field opens on the name it has; an empty one is refused.
            passkeys.start_rename("mac", window, cx);
            assert_eq!(passkeys.rename_input().read(cx).value().as_ref(), "MacBook");
            passkeys
                .rename_input()
                .clone()
                .update(cx, |input, cx| input.set_value("   ", window, cx));
            passkeys.submit_rename(cx);
            assert!(passkeys.rename_error().is_some());
            assert!(!passkeys.is_busy());
            passkeys
                .rename_input()
                .clone()
                .update(cx, |input, cx| input.set_value(" Studio ", window, cx));
            passkeys.submit_rename(cx);
            assert!(passkeys.is_busy());
            passkeys.settle(cx);
            assert_eq!(passkeys.renaming(), None);

            // Asking to delete closes a rename and sends nothing yet.
            passkeys.start_rename("phone", window, cx);
            passkeys.ask_delete("phone", cx);
            assert_eq!(passkeys.renaming(), None);
            assert_eq!(passkeys.confirming().map(|id| id.as_ref()), Some("phone"));
            passkeys.cancel_delete(cx);
            passkeys.confirm_delete(cx);
            assert!(!passkeys.is_busy());

            passkeys.ask_delete("phone", cx);
            passkeys.confirm_delete(cx);
            passkeys.settle(cx);
            assert_eq!(passkeys.confirming(), None);
            passkeys.set_passkeys([Passkey::new("mac").name("Studio")], cx);
            assert_eq!(passkeys.registered().count(), 1);
            passkeys.register(cx);
        })
    });
    visual.run_until_parked();
    assert_eq!(
        *keys.borrow(),
        [
            PasskeyManagerEvent::Rename {
                id: "mac".into(),
                name: "Studio".into(),
            },
            PasskeyManagerEvent::Delete("phone".into()),
            PasskeyManagerEvent::Register,
        ]
    );
}

#[gpui_kit::test]
fn auth_flow_follows_its_directives_and_signs_the_session_in(cx: &mut TestAppContext) {
    use corpora_ui::blocks::{
        AuthFlow, AuthFlowEvent, AuthSession, AuthStatus, AuthStep, AuthUser, CodeChannel,
        LoginEvent, SessionStatus,
    };

    cx.update(corpora_ui::init);
    cx.update(|cx| cx.set_reduce_motion(true));
    let held = Rc::new(RefCell::new(None));
    let host_held = held.clone();
    let window = open(cx, px(480.), move |window, cx| {
        let session = cx.new(|_| AuthSession::new());
        let flow = cx.new(|cx| AuthFlow::new(window, cx).session(&session, cx));
        *host_held.borrow_mut() = Some((flow.clone(), session));
        flow
    });
    let (flow, session) = held.borrow().clone().unwrap();
    let mut visual = VisualTestContext::from_window(window, cx);
    let events = Rc::new(RefCell::new(Vec::new()));
    let log = events.clone();
    visual.update(|_, cx| {
        cx.subscribe(&flow, move |_, event: &AuthFlowEvent, _| {
            log.borrow_mut().push(event.clone())
        })
        .detach()
    });
    let login = visual.update(|_, cx| flow.read(cx).login().clone());
    let code = visual.update(|_, cx| flow.read(cx).code().clone());

    // The login block's links move the flow without the host.
    visual.update(|_, cx| login.update(cx, |_, cx| cx.emit(LoginEvent::Signup)));
    visual.run_until_parked();
    assert_eq!(
        visual.update(|_, cx| flow.read(cx).step()),
        AuthStep::Signup
    );
    visual.update(|_, cx| flow.update(cx, |flow, cx| flow.go_to_step(AuthStep::Login, cx)));
    visual.run_until_parked();

    visual.update(|window, cx| {
        login.update(cx, |login, cx| {
            let (email, password) = (login.email_input().clone(), login.password_input().clone());
            email.update(cx, |input, cx| {
                input.set_value("ada@exegia.app", window, cx)
            });
            password.update(cx, |input, cx| input.set_value("analytical", window, cx));
            login.submit(cx);
        })
    });
    visual.run_until_parked();
    assert_eq!(
        events.borrow().last(),
        Some(&AuthFlowEvent::Login {
            email: "ada@exegia.app".into(),
            password: "analytical".into(),
            remember: false,
        })
    );

    // A failure lands in the block on screen.
    visual.update(|_, cx| flow.update(cx, |flow, cx| flow.fail("No such account.", cx)));
    assert_eq!(
        visual.update(|_, cx| login.read(cx).error().cloned()),
        Some("No such account.".into())
    );

    // A code went out: the flow remembers where, and shows it masked.
    visual.update(|_, cx| {
        flow.update(cx, |flow, cx| {
            flow.begin_verification("ada@exegia.app", CodeChannel::Email, cx);
            assert_eq!(flow.step(), AuthStep::VerifyCode);
            assert_eq!(flow.masked_identifier().as_deref(), Some("a•••@exegia.app"));
        })
    });
    visual.run_until_parked();
    visual.update(|window, cx| {
        code.update(cx, |code, cx| {
            let digits = code.code_input().clone();
            digits.update(cx, |input, cx| input.set_value("184312", window, cx));
            code.verify(cx);
        })
    });
    visual.run_until_parked();
    assert_eq!(
        events.borrow().last(),
        Some(&AuthFlowEvent::VerifyCode("184312".into()))
    );

    visual.update(|_, cx| {
        flow.update(cx, |flow, cx| {
            flow.complete(Some(AuthUser::new("ada", "Ada Lovelace")), cx);
            assert_eq!(flow.step(), AuthStep::Success);
        });
        assert_eq!(session.read(cx).status(), SessionStatus::Authenticated);
        assert_eq!(
            session.read(cx).user().map(|user| user.name.as_ref()),
            Some("Ada Lovelace")
        );
        // Signing out sends the flow back to an empty login.
        session.update(cx, |session, cx| session.sign_out(cx));
    });
    visual.run_until_parked();
    visual.update(|_, cx| {
        assert_eq!(flow.read(cx).step(), AuthStep::Login);
        assert_eq!(flow.read(cx).identifier(), None);
        assert_eq!(login.read(cx).status(), AuthStatus::Idle);
        assert!(login.read(cx).email_input().read(cx).value().is_empty());
    });
}
