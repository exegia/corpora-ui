//! A window showing the Corpora foundations and atoms in both appearances.
//!
//! ```sh
//! cargo run -p corpora-ui --example gallery
//! cargo run -p corpora-ui --example gallery -- --snapshot <dir>
//! ```

use corpora_ui::atoms::{
    Avatar, AvatarAudio, AvatarStatus, AvatarUser, Badge, BadgeVariant, Bubble, BubbleReaction,
    BubbleVariant, Button, Card, CardHeader, Chip, IconName, InputField, Kbd, Label, LabelLevel,
    Loader, Reference, SelectChip, Separator, Sizable as _, Skeleton, Spinner, Text,
};
use corpora_ui::composed::{
    ActionBar, AiMessage, EmojiActionBar, Logo, PasswordInput, SendHint, SocialLayout,
    SocialProviders, StreamToken, StreamingText, SuggestedPrompt, SuggestedPrompts, UserInfo,
    UserMessage, UserPill,
};
use corpora_ui::foundations::{self, ActiveCorporaTheme as _, AtomSize, Radius};
use gpui_kit::component::input::InputState;
use gpui_kit::component::scroll::ScrollableElement as _;
use gpui_kit::component::switch::Switch;
use gpui_kit::component::{ActiveTheme as _, ThemeMode, h_flex, v_flex};
use gpui_kit::*;

/// A titled band of the gallery.
#[derive(IntoElement)]
struct Section {
    title: SharedString,
    children: Vec<AnyElement>,
}

impl Section {
    fn new(title: impl Into<SharedString>) -> Self {
        Self {
            title: title.into(),
            children: Vec::new(),
        }
    }
}

impl ParentElement for Section {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for Section {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        v_flex()
            .gap_3()
            .child(
                div()
                    .text_sm()
                    .font_weight(FontWeight::SEMIBOLD)
                    .text_color(cx.theme().muted_foreground)
                    .child(self.title),
            )
            .children(self.children)
    }
}

/// A row of related samples that wraps when the window narrows.
fn row() -> Div {
    h_flex().flex_wrap().gap_3()
}

fn swatch(name: &'static str, color: Hsla, cx: &App) -> impl IntoElement {
    v_flex()
        .gap_1()
        .child(
            div()
                .w_24()
                .h_10()
                .bg(color)
                .border_1()
                .border_color(cx.theme().border)
                .rounded(Radius::Sm.resolve(cx)),
        )
        .child(Text::subscript(name))
}

fn radius_sample(name: &'static str, radius: Radius, cx: &App) -> impl IntoElement {
    v_flex()
        .gap_1()
        .items_center()
        .child(
            div()
                .size_16()
                .bg(cx.theme().muted)
                .border_1()
                .border_color(cx.theme().border)
                .rounded(radius.resolve(cx)),
        )
        .child(Text::subscript(name))
}

struct Gallery {
    email: Entity<InputState>,
    handle: Entity<InputState>,
    select_chip_open: bool,
    thumbs_up: bool,
    password: Entity<InputState>,
    logo_folded: bool,
}

impl Gallery {
    fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        Self {
            email: cx.new(|cx| InputState::new(window, cx).placeholder("you@example.com")),
            handle: cx.new(|cx| InputState::new(window, cx).default_value("ada lovelace")),
            select_chip_open: false,
            thumbs_up: true,
            password: cx.new(|cx| {
                InputState::new(window, cx)
                    .masked(true)
                    .placeholder("Enter your password")
                    .default_value("Codex1")
            }),
            logo_folded: false,
        }
    }

    fn render_avatars(&self) -> impl IntoElement {
        let ada = || AvatarUser::named("Ada", "Lovelace");
        Section::new("Avatar")
            .child(
                row()
                    .items_end()
                    .child(Avatar::new().user(ada()))
                    .child(Avatar::new().user(ada()).with_atom_size(AtomSize::Md))
                    .child(Avatar::new().user(ada()).with_atom_size(AtomSize::Lg))
                    .child(Avatar::new().user(ada()).with_atom_size(AtomSize::Xl))
                    .child(Avatar::new().user(ada()).with_atom_size(AtomSize::Xxl)),
            )
            .child(
                row()
                    .gap_5()
                    .child(
                        Avatar::new()
                            .user(AvatarUser::named("Grace", "Hopper").status(AvatarStatus::Online))
                            .with_atom_size(AtomSize::Lg),
                    )
                    .child(
                        Avatar::new()
                            .user(AvatarUser::named("Alan", "Turing").status(AvatarStatus::Idle))
                            .with_atom_size(AtomSize::Lg),
                    )
                    .child(
                        Avatar::new()
                            .user(
                                AvatarUser::named("Edsger", "Dijkstra")
                                    .status(AvatarStatus::Offline)
                                    .verified(true),
                            )
                            .with_atom_size(AtomSize::Lg),
                    )
                    .child(Avatar::new().with_atom_size(AtomSize::Lg))
                    .child(
                        Avatar::new()
                            .user(ada())
                            .with_atom_size(AtomSize::Lg)
                            .loading(true),
                    )
                    .child(
                        Avatar::new()
                            .user(AvatarUser::named("Barbara", "Liskov"))
                            .with_atom_size(AtomSize::Lg)
                            .audio(AvatarAudio::Unmuted),
                    )
                    .child(
                        Avatar::new()
                            .user(AvatarUser::named("Donald", "Knuth"))
                            .with_atom_size(AtomSize::Lg)
                            .audio(AvatarAudio::Speaking),
                    ),
            )
    }

    fn render_chat(&self, cx: &mut Context<Self>) -> impl IntoElement {
        Section::new("Bubble and reference").child(
            v_flex()
                .w(rems(34.))
                .child(
                    Bubble::new("message-1", BubbleVariant::Recipient)
                        .header(Avatar::new().user(AvatarUser::named("Grace", "Hopper")))
                        .header(Text::new("Grace").small().muted())
                        .message("Where does this reading come from?")
                        .tail(false),
                )
                .child(
                    Bubble::new("message-2", BubbleVariant::Recipient)
                        .continued(true)
                        .message("I could not find it in the apparatus.")
                        .reaction(
                            BubbleReaction::new("thumbs-up", "👍", "thumbs up")
                                .count(if self.thumbs_up { 2 } else { 1 })
                                .reacted(self.thumbs_up),
                        )
                        .on_toggle_reaction(cx.listener(|this, _, _, cx| {
                            this.thumbs_up = !this.thumbs_up;
                            cx.notify();
                        }))
                        .on_add_reaction(|_, _, _| {}),
                )
                .child(
                    Bubble::new("message-3", BubbleVariant::Sender)
                        .header(Avatar::new().user(AvatarUser::named("Ada", "Lovelace")))
                        .header(Text::new("You").small().muted())
                        .message("It is the Western text. Two witnesses carry it.")
                        .actions(
                            Button::new("message-3-copy")
                                .ghost()
                                .xsmall()
                                .icon(IconName::Copy)
                                .tooltip("Copy message"),
                        ),
                )
                .child(
                    Bubble::new("message-4", BubbleVariant::Ai).message(
                        v_flex()
                            .gap_2()
                            .child(
                                "The longer reading appears in Codex Bezae and the Old Latin. \
                                 Most editors print the shorter text.",
                            )
                            .child(
                                row()
                                    .gap_2()
                                    .child(Reference::new("reference-1", "Codex Bezae").preview(
                                        "A fifth-century bilingual codex of the Gospels and \
                                         Acts, the chief Greek witness to the Western text.",
                                    ))
                                    .child(Reference::new("reference-2", "Old Latin")),
                            ),
                    ),
                ),
        )
    }

    fn render_fields(&self, cx: &mut Context<Self>) -> impl IntoElement {
        Section::new("Field, chip and label")
            .child(
                row()
                    .items_start()
                    .gap_6()
                    .child(
                        InputField::new(&self.email)
                            .small()
                            .label("Email")
                            .description("Used for sign-in only."),
                    )
                    .child(
                        InputField::new(&self.handle)
                            .small()
                            .label("Handle")
                            .description("Letters, digits and dashes.")
                            .error("Remove the space: handles cannot contain spaces.")
                            .invalid(true),
                    ),
            )
            .child(
                row()
                    .child(Chip::new("order").icon(gpui_kit::assets::IconName::Cone))
                    .child(
                        SelectChip::new("status-chip", "Pending")
                            .dot(true)
                            .open(self.select_chip_open)
                            .on_click(cx.listener(|this, _, _, cx| {
                                this.select_chip_open = !this.select_chip_open;
                                cx.notify();
                            })),
                    ),
            )
            .child(
                row()
                    .items_end()
                    .gap_6()
                    .child(Text::label("Title", LabelLevel::Title))
                    .child(Text::label("Subtitle", LabelLevel::Subtitle))
                    .child(Text::label("Heading", LabelLevel::Heading))
                    .child(Text::label("Caption", LabelLevel::Caption)),
            )
    }

    fn render_people(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let grace = || AvatarUser::named("Grace", "Hopper").role("Editor");
        Section::new("Composed: user and logo")
            .child(
                row()
                    .gap_8()
                    .child(UserInfo::new(grace()).description("Online now"))
                    .child(
                        UserInfo::new(AvatarUser::named("Ada", "Lovelace"))
                            .description("2 min ago")
                            .outgoing(true),
                    )
                    .child(UserPill::new("pill-grace", grace())),
            )
            .child(
                row()
                    .gap_8()
                    .child(Logo::new("logo-monogram", "Corpora UI").folded(self.logo_folded))
                    .child(
                        Logo::new("logo-image", "Exegia")
                            .src("images/owl-avatar.png")
                            .folded(self.logo_folded),
                    )
                    .child(
                        Button::new("fold-logos")
                            .small()
                            .label(if self.logo_folded {
                                "Unfold logos"
                            } else {
                                "Fold logos"
                            })
                            .on_click(cx.listener(|this, _, _, cx| {
                                this.logo_folded = !this.logo_folded;
                                cx.notify();
                            })),
                    ),
            )
    }

    fn render_conversation(&self) -> impl IntoElement {
        let mut answer = StreamToken::words("The longer reading appears in");
        answer.push(StreamToken::Cite {
            label: "Codex Bezae".into(),
            href: None,
            preview: Some("A fifth-century bilingual codex of the Gospels and Acts.".into()),
        });
        answer.extend(StreamToken::words(
            "and the Old Latin. Most editors print the shorter text.",
        ));

        Section::new("Composed: conversation").child(
            v_flex()
                .w(rems(34.))
                .child(
                    UserMessage::new("thread-1", "Where does this reading come from?")
                        .user(AvatarUser::named("Grace", "Hopper").role("Editor"))
                        .description("2 min ago"),
                )
                .child(
                    UserMessage::new("thread-2", "Asking the agent now.")
                        .user(AvatarUser::named("Ada", "Lovelace"))
                        .outgoing(true),
                )
                .child(
                    AiMessage::new("thread-3")
                        .child(StreamingText::new("thread-3-text", vec![answer]).streaming(true))
                        .attachment(
                            ActionBar::new("thread-3-actions")
                                .action("copy", IconName::Copy, "Copy answer", |_, _, _| {})
                                .separator()
                                .action("delete", IconName::Delete, "Delete answer", |_, _, _| {}),
                        ),
                )
                .child(
                    v_flex()
                        .gap_3()
                        .child(
                            SuggestedPrompts::new("suggestions")
                                .child(SuggestedPrompt::new(
                                    "prompt-witnesses",
                                    "Which witnesses carry the longer reading?",
                                ))
                                .child(SuggestedPrompt::new(
                                    "prompt-editors",
                                    "Why do most editors print the shorter text?",
                                ))
                                .child(SuggestedPrompt::new(
                                    "prompt-date",
                                    "How old is Codex Bezae?",
                                )),
                        )
                        .child(row().child(EmojiActionBar::new("reactions").on_more(|_, _, _| {})))
                        .child(SendHint::new().compact(false))
                        .child(SendHint::new()),
                ),
        )
    }

    fn render_sign_in(&self) -> impl IntoElement {
        Section::new("Composed: sign-in").child(
            row()
                .items_start()
                .gap_8()
                .child(
                    v_flex()
                        .w(rems(18.))
                        .gap_4()
                        .child(SocialProviders::new("providers-stack"))
                        .child(
                            SocialProviders::new("providers-row")
                                .layout(SocialLayout::Row)
                                .providers([
                                    corpora_ui::composed::SocialProvider::Google,
                                    corpora_ui::composed::SocialProvider::Apple,
                                    corpora_ui::composed::SocialProvider::Github,
                                    corpora_ui::composed::SocialProvider::X,
                                ]),
                        ),
                )
                .child(
                    div()
                        .w(rems(18.))
                        .child(PasswordInput::new(&self.password).show_strength(true)),
                ),
        )
    }

    fn render_colors(&self, cx: &App) -> impl IntoElement {
        let theme = cx.theme();
        let palette = cx.palette();
        Section::new("Color").child(
            row()
                .child(swatch("background", theme.background, cx))
                .child(swatch("foreground", theme.foreground, cx))
                .child(swatch("card", palette.card, cx))
                .child(swatch("primary", theme.primary, cx))
                .child(swatch("secondary", theme.secondary, cx))
                .child(swatch("muted", theme.muted, cx))
                .child(swatch("accent", theme.accent, cx))
                .child(swatch("border", theme.border, cx))
                .child(swatch("destructive", palette.destructive, cx))
                .child(swatch("info", palette.info, cx))
                .child(swatch("success", palette.success, cx))
                .child(swatch("warning", palette.warning, cx))
                .child(swatch("invert", palette.invert, cx)),
        )
    }

    fn render_radius(&self, cx: &App) -> impl IntoElement {
        Section::new("Radius").child(
            row()
                .gap_4()
                .child(radius_sample("sm", Radius::Sm, cx))
                .child(radius_sample("md", Radius::Md, cx))
                .child(radius_sample("lg", Radius::Lg, cx))
                .child(radius_sample("xl", Radius::Xl, cx))
                .child(radius_sample("2xl", Radius::Xl2, cx))
                .child(radius_sample("full", Radius::Full, cx)),
        )
    }

    fn render_buttons(&self) -> impl IntoElement {
        Section::new("Button")
            .child(
                row()
                    .child(Button::new("button-primary").primary().label("Primary"))
                    .child(
                        Button::new("button-secondary")
                            .secondary()
                            .label("Secondary"),
                    )
                    .child(Button::new("button-outline").outline().label("Outline"))
                    .child(Button::new("button-ghost").ghost().label("Ghost"))
                    .child(
                        Button::new("button-destructive")
                            .destructive()
                            .label("Destructive"),
                    )
                    .child(
                        Button::new("button-destructive-outline")
                            .destructive_outline()
                            .label("Destructive outline"),
                    ),
            )
            .child(
                row()
                    .child(
                        Button::new("button-xs")
                            .xsmall()
                            .outline()
                            .label("Extra small"),
                    )
                    .child(Button::new("button-sm").small().outline().label("Small"))
                    .child(Button::new("button-md").outline().label("Medium"))
                    .child(Button::new("button-lg").large().outline().label("Large"))
                    .child(
                        Button::new("button-xl")
                            .with_atom_size(AtomSize::Xl)
                            .label("Extra large"),
                    ),
            )
            .child(
                row()
                    .child(
                        Button::new("button-leading-icon")
                            .primary()
                            .icon(IconName::Plus)
                            .label("New corpus"),
                    )
                    .child(
                        Button::new("button-leading-icon-outline")
                            .outline()
                            .icon(IconName::Copy)
                            .label("Copy link"),
                    )
                    .child(
                        Button::new("button-trailing-icon")
                            .primary()
                            .label("Continue")
                            .trailing_icon(IconName::ArrowRight),
                    )
                    .child(
                        Button::new("button-trailing-icon-outline")
                            .outline()
                            .label("Open reader")
                            .trailing_icon(IconName::ArrowRight),
                    ),
            )
            .child(
                row()
                    .child(
                        Button::new("button-icon-primary")
                            .primary()
                            .icon(IconName::Plus)
                            .tooltip("New corpus"),
                    )
                    .child(
                        Button::new("button-icon-secondary")
                            .secondary()
                            .icon(IconName::Search)
                            .tooltip("Search"),
                    )
                    .child(
                        Button::new("button-icon-outline")
                            .outline()
                            .icon(IconName::Settings)
                            .tooltip("Settings"),
                    )
                    .child(
                        Button::new("button-icon-ghost")
                            .ghost()
                            .icon(IconName::Ellipsis)
                            .tooltip("More actions"),
                    )
                    .child(
                        Button::new("button-icon-destructive")
                            .destructive()
                            .icon(IconName::Delete)
                            .tooltip("Delete corpus"),
                    ),
            )
            .child(
                row()
                    .child(
                        Button::new("button-disabled")
                            .primary()
                            .label("Disabled")
                            .disabled(true),
                    )
                    .child(
                        Button::new("button-loading")
                            .primary()
                            .label("Saving")
                            .loading(true),
                    ),
            )
    }

    fn render_badges(&self) -> impl IntoElement {
        let roles = [
            ("Primary", BadgeVariant::Primary),
            ("Info", BadgeVariant::Info),
            ("Success", BadgeVariant::Success),
            ("Warning", BadgeVariant::Warning),
            ("Destructive", BadgeVariant::Destructive),
            ("Invert", BadgeVariant::Invert),
        ];
        Section::new("Badge")
            .child(
                row()
                    .children(
                        roles.map(|(name, variant)| Badge::new().with_variant(variant).child(name)),
                    )
                    .child(Badge::secondary().child("Secondary"))
                    .child(
                        Badge::new()
                            .with_variant(BadgeVariant::Outline)
                            .child("Outline"),
                    ),
            )
            .child(row().children(
                roles.map(|(name, variant)| Badge::new().with_variant(variant).light().child(name)),
            ))
            .child(row().children(
                roles.map(|(name, variant)| {
                    Badge::new().with_variant(variant).outline().child(name)
                }),
            ))
            .child(
                row()
                    .child(Badge::secondary().with_atom_size(AtomSize::Xs).child("xs"))
                    .child(Badge::secondary().with_atom_size(AtomSize::Sm).child("sm"))
                    .child(Badge::secondary().child("md"))
                    .child(Badge::secondary().with_atom_size(AtomSize::Lg).child("lg"))
                    .child(Badge::secondary().with_atom_size(AtomSize::Xl).child("xl"))
                    .child(Badge::secondary().pill().child("12")),
            )
    }

    fn render_card(&self) -> impl IntoElement {
        Section::new("Card").child(
            Card::new()
                .max_w_96()
                .header(
                    CardHeader::new("Members")
                        .description("People with access to this corpus")
                        .action(Badge::success().light().child("Synced")),
                )
                .content(
                    v_flex()
                        .gap_2()
                        .child(Skeleton::new().w_full())
                        .child(Skeleton::new().w_3_4())
                        .child(Skeleton::new().w_1_2()),
                )
                .footer(
                    h_flex()
                        .w_full()
                        .justify_end()
                        .gap_2()
                        .child(Button::new("card-cancel").outline().label("Cancel"))
                        .child(Button::new("card-invite").primary().label("Invite")),
                ),
        )
    }

    fn render_text(&self) -> impl IntoElement {
        Section::new("Text")
            .child(Text::heading("Corpora"))
            .child(
                Text::paragraph("Annotated text collections, queried and read in one workspace.")
                    .max_w_96(),
            )
            .child(Text::new("Updated 2 minutes ago").muted().small())
            .child(Text::subscript("Revision 14"))
            .child(Label::new("Corpus name"))
    }

    fn render_feedback(&self) -> impl IntoElement {
        Section::new("Feedback and keys")
            .child(
                row()
                    .gap_6()
                    .child(Spinner::new())
                    .child(Loader::new().with_atom_size(AtomSize::Lg))
                    .child(Loader::dots())
                    .child(Loader::dots().with_atom_size(AtomSize::Sm)),
            )
            .child(
                row()
                    .children(Keystroke::parse("cmd-k").ok().map(Kbd::new))
                    .children(Keystroke::parse("escape").ok().map(Kbd::new)),
            )
            .child(Separator::horizontal())
    }
}

impl Render for Gallery {
    fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let is_dark = cx.theme().is_dark();

        v_flex()
            .size_full()
            .bg(cx.theme().background)
            .text_color(cx.theme().foreground)
            .child(
                h_flex()
                    .flex_shrink_0()
                    .justify_between()
                    .px_6()
                    .py_3()
                    .border_b_1()
                    .border_color(cx.theme().border)
                    .child(Text::new("Corpora UI").large())
                    .child(
                        Switch::new("dark-appearance")
                            .label("Dark")
                            .checked(is_dark)
                            .on_change(|dark, _, cx| {
                                let mode = if *dark {
                                    ThemeMode::Dark
                                } else {
                                    ThemeMode::Light
                                };
                                foundations::set_mode(mode, cx);
                            }),
                    ),
            )
            .child(
                v_flex()
                    .id("gallery")
                    .flex_1()
                    .min_h_0()
                    .p_6()
                    .gap_6()
                    .overflow_y_scrollbar()
                    .child(self.render_colors(cx))
                    .child(self.render_radius(cx))
                    .child(self.render_buttons())
                    .child(self.render_badges())
                    .child(self.render_card())
                    .child(self.render_text())
                    .child(self.render_feedback())
                    .child(self.render_avatars())
                    .child(self.render_chat(cx))
                    .child(self.render_fields(cx))
                    .child(self.render_people(cx))
                    .child(self.render_conversation())
                    .child(self.render_sign_in()),
            )
    }
}

fn window_options(bounds: Option<Bounds<Pixels>>) -> WindowOptions {
    WindowOptions {
        titlebar: Some(TitlebarOptions {
            title: Some("Corpora UI".into()),
            ..Default::default()
        }),
        window_bounds: bounds.map(WindowBounds::Windowed),
        ..Default::default()
    }
}

/// A point inside the first button of the gallery, for the hover snapshot.
const HOVER_PROBE: Point<Pixels> = point(px(60.), px(472.));

/// Renders the gallery offscreen in both appearances and writes one PNG each
/// into `dir`, for reviewing a change without opening a window.
fn snapshot(dir: &std::path::Path) {
    // Tall enough to show every section without scrolling.
    let bounds = Bounds {
        origin: Point::default(),
        size: size(px(1000.), px(3500.)),
    };
    let mut cx = HeadlessAppContext::with_platform(
        gpui_kit::platform::current_platform(true).text_system(),
        std::sync::Arc::new(corpora_ui::Assets),
        gpui_kit::platform::current_headless_renderer,
    );
    cx.update(corpora_ui::init);

    for (mode, file) in [
        (ThemeMode::Light, "gallery-light.png"),
        (ThemeMode::Dark, "gallery-dark.png"),
    ] {
        let (window, _) = cx
            .update(|cx| {
                foundations::set_mode(mode, cx);
                let mut options = window_options(Some(bounds));
                options.focus = false;
                options.show = false;
                gpui_kit::open_window(options, cx, |window, cx| {
                    cx.new(|cx| Gallery::new(window, cx))
                })
            })
            .expect("failed to open the offscreen gallery window");
        cx.run_until_parked();
        let path = dir.join(file);
        cx.capture_screenshot(window)
            .expect("offscreen rendering must be available")
            .save(&path)
            .expect("failed to write the snapshot");
        println!("{}", path.display());

        // The same frame with the pointer resting on the primary button.
        cx.update_window(window, |_, window, cx| {
            window.simulate_mouse_move(HOVER_PROBE, cx);
        })
        .expect("the offscreen window is open");
        cx.run_until_parked();
        let path = dir.join(file.replace(".png", "-hover.png"));
        cx.capture_screenshot(window)
            .expect("offscreen rendering must be available")
            .save(&path)
            .expect("failed to write the snapshot");
        println!("{}", path.display());
    }
}

fn main() {
    let mut args = std::env::args().skip(1);
    if args.next().as_deref() == Some("--snapshot") {
        let dir = args.next().expect("usage: gallery --snapshot <dir>");
        snapshot(std::path::Path::new(&dir));
        return;
    }

    gpui_kit::application()
        .with_assets(corpora_ui::Assets)
        .run(|cx| {
            corpora_ui::init(cx);
            gpui_kit::open_window(window_options(None), cx, |window, cx| {
                cx.new(|cx| Gallery::new(window, cx))
            })
            .expect("failed to open the gallery window");
            cx.activate(true);
        });
}
