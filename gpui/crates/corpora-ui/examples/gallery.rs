//! A window showing the Corpora foundations and atoms in both appearances.
//!
//! ```sh
//! cargo run -p corpora-ui --example gallery
//! cargo run -p corpora-ui --example gallery -- --snapshot <dir>
//! ```

use corpora_ui::atoms::{
    Avatar, AvatarAudio, AvatarStatus, AvatarUser, Badge, BadgeVariant, Bubble, BubbleReaction,
    BubbleVariant, Button, Card, CardFrame, CardFrameHeader, CardHeader, Chip, Emoji,
    EmojiPickerState, Frame, IconName, InputField, Kbd, Label, LabelLevel, Loader, Reference,
    SelectChip, Separator, Sizable as _, Skeleton, Spinner, Text,
};
use corpora_ui::composed::{
    ActionBar, AiMessage, EmojiActionBar, Logo, PasswordInput, ReactionPicker, SendHint,
    SocialLayout, SocialProviders, StreamToken, StreamingText, SuggestedPrompt, SuggestedPrompts,
    UserInfo, UserMessage, UserPill,
};
use corpora_ui::foundations::motion::{DISTANCE_SMALL, DURATION_FAST, EASE_SMOOTH_OUT};
use corpora_ui::foundations::{self, ActiveCorporaTheme as _, AtomSize, Radius};
use gpui_kit::component::input::InputState;
use gpui_kit::component::scroll::ScrollableElement as _;
use gpui_kit::component::switch::Switch;
use gpui_kit::component::tab::{Tab, TabBar};
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

/// The categories of the library, one page of the gallery each.
#[derive(Clone, Copy, PartialEq, Eq)]
enum Page {
    Foundations,
    Atoms,
    Composed,
}

impl Page {
    const ALL: [Page; 3] = [Page::Foundations, Page::Atoms, Page::Composed];

    fn label(self) -> &'static str {
        match self {
            Page::Foundations => "Foundations",
            Page::Atoms => "Atoms",
            Page::Composed => "Composed",
        }
    }

    fn slug(self) -> &'static str {
        match self {
            Page::Foundations => "foundations",
            Page::Atoms => "atoms",
            Page::Composed => "composed",
        }
    }
}

struct Gallery {
    page: Page,
    /// Set once a tab is chosen, so the first page shows without an entrance.
    page_changed: bool,
    email: Entity<InputState>,
    handle: Entity<InputState>,
    status: SharedString,
    reactions: Vec<BubbleReaction>,
    /// The picker behind the bubble's "Add reaction" button.
    reaction_picker: Entity<EmojiPickerState>,
    /// The picker behind the standalone emoji bar.
    bar_picker: Entity<EmojiPickerState>,
    last_emoji: Option<Emoji>,
    password: Entity<InputState>,
    logo_folded: bool,
}

impl Gallery {
    fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        Self {
            page: Page::Foundations,
            page_changed: false,
            status: "Pending".into(),
            reactions: vec![
                BubbleReaction::new("👍", "👍", "thumbs up")
                    .count(2)
                    .reacted(true),
            ],
            reaction_picker: cx.new(|cx| EmojiPickerState::new(window, cx)),
            bar_picker: cx.new(|cx| EmojiPickerState::new(window, cx)),
            last_emoji: None,
            email: cx.new(|cx| InputState::new(window, cx).placeholder("you@example.com")),
            handle: cx.new(|cx| InputState::new(window, cx).default_value("ada lovelace")),
            password: cx.new(|cx| {
                InputState::new(window, cx)
                    .masked(true)
                    .placeholder("Enter your password")
                    .default_value("Codex1")
            }),
            logo_folded: false,
        }
    }

    /// Adds the current user's reaction, or takes it back if they already
    /// gave it. A reaction nobody holds any more leaves the pill.
    fn toggle_reaction(&mut self, emoji: &SharedString, label: &SharedString) {
        match self.reactions.iter_mut().find(|r| r.emoji == *emoji) {
            Some(reaction) if reaction.reacted => {
                reaction.reacted = false;
                reaction.count -= 1;
            }
            Some(reaction) => {
                reaction.reacted = true;
                reaction.count += 1;
            }
            None => self.reactions.push(
                BubbleReaction::new(emoji.clone(), emoji.clone(), label.clone())
                    .count(1)
                    .reacted(true),
            ),
        }
        self.reactions.retain(|reaction| reaction.count > 0);
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
                        .reactions(self.reactions.clone())
                        .on_toggle_reaction(cx.listener(
                            |this, reaction: &BubbleReaction, _, cx| {
                                this.toggle_reaction(&reaction.emoji, &reaction.label);
                                cx.notify();
                            },
                        ))
                        .add_reaction(
                            ReactionPicker::new("message-2-react", &self.reaction_picker)
                                .on_select(cx.listener(|this, emoji: &Emoji, _, cx| {
                                    this.toggle_reaction(&emoji.emoji, &emoji.label);
                                    cx.notify();
                                })),
                        ),
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
                        SelectChip::new("status-chip", self.status.clone())
                            .dot(self.status == "Pending")
                            .options(["Pending", "Paid", "Refunded", "Cancelled"])
                            .on_pick(cx.listener(|this, status: &SharedString, _, cx| {
                                this.status = status.clone();
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

    fn render_conversation(&self, cx: &mut Context<Self>) -> impl IntoElement {
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
                        .child(
                            row()
                                .items_start()
                                .child(
                                    EmojiActionBar::new("reactions")
                                        .picker(&self.bar_picker)
                                        .surface(true)
                                        .on_select(cx.listener(|this, emoji: &Emoji, _, cx| {
                                            this.last_emoji = Some(emoji.clone());
                                            cx.notify();
                                        })),
                                )
                                .child(
                                    Text::new(match &self.last_emoji {
                                        Some(emoji) => {
                                            format!("Picked {} {}", emoji.emoji, emoji.label)
                                        }
                                        None => "No emoji picked yet".to_string(),
                                    })
                                    .small()
                                    .muted(),
                                ),
                        )
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
        let lines = || {
            v_flex()
                .gap_2()
                .child(Skeleton::new().w_full())
                .child(Skeleton::new().w_3_4())
                .child(Skeleton::new().w_1_2())
        };
        let actions = |id: &'static str| {
            h_flex()
                .w_full()
                .justify_end()
                .gap_2()
                .child(Button::new((id, 0usize)).outline().label("Cancel"))
                .child(Button::new((id, 1usize)).primary().label("Invite"))
        };
        let header = || {
            CardHeader::new("Members")
                .description("People with access to this corpus")
                .action(Badge::success().light().child("Synced"))
        };
        let note = || Text::new("Changes apply to every reader.").small().muted();
        let sample = |name: &'static str, card: AnyElement| {
            v_flex()
                .w_80()
                .gap_2()
                .child(Text::subscript(name))
                .child(card)
        };

        Section::new("Card")
            .child(
                row()
                    .items_start()
                    .gap_6()
                    .child(sample(
                        "Content only",
                        Card::new().content(lines()).into_any_element(),
                    ))
                    .child(sample(
                        "With header",
                        Card::new()
                            .header(header())
                            .content(lines())
                            .into_any_element(),
                    ))
                    .child(sample(
                        "With footer",
                        Card::new()
                            .content(lines())
                            .footer(actions("card-footer"))
                            .into_any_element(),
                    )),
            )
            .child(
                row()
                    .items_start()
                    .gap_6()
                    .child(sample(
                        "Full",
                        Card::new()
                            .header(header())
                            .content(lines())
                            .footer(actions("card-full"))
                            .into_any_element(),
                    ))
                    .child(sample(
                        "Full, divided",
                        Card::new()
                            .divided(true)
                            .header(header())
                            .content(lines())
                            .footer(actions("card-divided"))
                            .into_any_element(),
                    ))
                    .child(sample(
                        "Framed, header and footer",
                        CardFrame::new()
                            .header(
                                CardFrameHeader::new("Members")
                                    .description("People with access")
                                    .action(
                                        Button::new("frame-invite")
                                            .outline()
                                            .small()
                                            .label("Invite"),
                                    ),
                            )
                            .card(Card::new().content(lines()))
                            .footer(note())
                            .into_any_element(),
                    )),
            )
            .child(
                row()
                    .items_start()
                    .gap_6()
                    .child(sample(
                        "Framed, header",
                        CardFrame::new()
                            .header(CardFrameHeader::new("Members"))
                            .card(Card::new().content(lines()))
                            .into_any_element(),
                    ))
                    .child(sample(
                        "Framed, footer",
                        CardFrame::new()
                            .card(Card::new().header(header()).content(lines()))
                            .footer(note())
                            .into_any_element(),
                    ))
                    .child(sample(
                        "Framed, stacked cards",
                        CardFrame::new()
                            .header(CardFrameHeader::new("Witnesses"))
                            .card(Card::new().content(lines()))
                            .card(Card::new().content(lines()))
                            .footer(note())
                            .into_any_element(),
                    ))
                    .child(sample(
                        "Frame with panels",
                        Frame::new()
                            .header(
                                CardFrameHeader::new("Witnesses")
                                    .description("Sources for this reading"),
                            )
                            .panel(lines())
                            .panel(lines())
                            .into_any_element(),
                    )),
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
        let page = self.page;
        let selected = Page::ALL.iter().position(|p| *p == page).unwrap_or(0);

        let sections = v_flex().gap_6();
        let sections = match page {
            Page::Foundations => sections
                .child(self.render_colors(cx))
                .child(self.render_radius(cx))
                .child(self.render_text()),
            Page::Atoms => sections
                .child(self.render_buttons())
                .child(self.render_badges())
                .child(self.render_card())
                .child(self.render_feedback())
                .child(self.render_avatars())
                .child(self.render_chat(cx))
                .child(self.render_fields(cx)),
            Page::Composed => sections
                .child(self.render_people(cx))
                .child(self.render_conversation(cx))
                .child(self.render_sign_in()),
        };
        // A page fades and rises into place when its tab is chosen.
        let reduce_motion = cx.reduce_motion() || !self.page_changed;
        let sections = sections.with_animation(
            ("gallery-page", selected),
            Animation::new(DURATION_FAST),
            move |sections, progress| {
                if reduce_motion {
                    return sections;
                }
                let eased = EASE_SMOOTH_OUT.easing().sample(progress);
                sections.opacity(eased).mt(DISTANCE_SMALL * (1. - eased))
            },
        );

        v_flex()
            .size_full()
            .bg(cx.theme().background)
            .text_color(cx.theme().foreground)
            .child(
                h_flex()
                    .flex_shrink_0()
                    .gap_6()
                    .px_6()
                    .py_3()
                    .border_b_1()
                    .border_color(cx.theme().border)
                    .child(Text::new("Corpora UI").large())
                    .child(
                        TabBar::new("categories")
                            .segmented()
                            .selected_index(selected)
                            .children(Page::ALL.map(|page| Tab::new().label(page.label())))
                            .on_click(cx.listener(|this, index: &usize, _, cx| {
                                this.page = Page::ALL[*index];
                                this.page_changed = true;
                                cx.notify();
                            })),
                    )
                    .child(div().flex_1())
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
                div()
                    .id("gallery")
                    .flex_1()
                    .min_h_0()
                    .p_6()
                    .overflow_y_scrollbar()
                    .child(sections),
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

/// A point inside the first button of the Atoms page, for the hover snapshot.
const HOVER_PROBE: Point<Pixels> = point(px(60.), px(140.));

/// Renders every page of the gallery offscreen in both appearances and writes
/// one PNG each into `dir`, for reviewing a change without opening a window.
fn snapshot(dir: &std::path::Path) {
    // Tall enough to show every section without scrolling.
    let bounds = Bounds {
        origin: Point::default(),
        size: size(px(1400.), px(2400.)),
    };
    let mut cx = HeadlessAppContext::with_platform(
        gpui_kit::platform::current_platform(true).text_system(),
        std::sync::Arc::new(corpora_ui::Assets),
        gpui_kit::platform::current_headless_renderer,
    );
    cx.update(corpora_ui::init);

    for (mode, mode_name) in [(ThemeMode::Light, "light"), (ThemeMode::Dark, "dark")] {
        for page in Page::ALL {
            let (window, _) = cx
                .update(|cx| {
                    foundations::set_mode(mode, cx);
                    let mut options = window_options(Some(bounds));
                    options.focus = false;
                    options.show = false;
                    gpui_kit::open_window(options, cx, |window, cx| {
                        cx.new(|cx| {
                            let mut gallery = Gallery::new(window, cx);
                            gallery.page = page;
                            // Dark shows the full emoji picker, light the
                            // quick row.
                            if mode == ThemeMode::Dark {
                                gallery
                                    .bar_picker
                                    .update(cx, |picker, cx| picker.set_expanded(true, cx));
                            }
                            gallery
                        })
                    })
                })
                .expect("failed to open the offscreen gallery window");
            cx.run_until_parked();
            let save = |cx: &mut HeadlessAppContext, suffix: &str| {
                let path = dir.join(format!("gallery-{}-{mode_name}{suffix}.png", page.slug()));
                cx.capture_screenshot(window)
                    .expect("offscreen rendering must be available")
                    .save(&path)
                    .expect("failed to write the snapshot");
                println!("{}", path.display());
            };
            save(&mut cx, "");

            if page == Page::Atoms {
                // The same frame with the pointer resting on the primary button.
                cx.update_window(window, |_, window, cx| {
                    window.simulate_mouse_move(HOVER_PROBE, cx);
                })
                .expect("the offscreen window is open");
                cx.run_until_parked();
                save(&mut cx, "-hover");
            }
        }
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
