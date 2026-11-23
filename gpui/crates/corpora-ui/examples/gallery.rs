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

#[path = "gallery/glass.rs"]
mod glass;

use glass::GlassShowcase;

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
    Blocks,
    Glass,
}

impl Page {
    const ALL: [Page; 5] = [
        Page::Foundations,
        Page::Atoms,
        Page::Composed,
        Page::Blocks,
        Page::Glass,
    ];

    fn label(self) -> &'static str {
        match self {
            Page::Foundations => "Foundations",
            Page::Atoms => "Atoms",
            Page::Composed => "Composed",
            Page::Blocks => "Blocks",
            Page::Glass => "Glass",
        }
    }

    fn slug(self) -> &'static str {
        match self {
            Page::Foundations => "foundations",
            Page::Atoms => "atoms",
            Page::Composed => "composed",
            Page::Blocks => "blocks",
            Page::Glass => "glass",
        }
    }
}

/// The sample corpus the navigation pieces browse.
fn sample_corpus() -> corpora_ui::composed::CorpusData {
    use corpora_ui::composed::{CorpusData, CorpusLevel, CorpusLevelKind, CorpusNode};

    let book = |id: &'static str, label: &'static str, chapters: &[usize]| {
        CorpusNode::new(id, "book", label).children(chapters.iter().enumerate().map(
            |(index, verses)| {
                let chapter = index + 1;
                CorpusNode::new(format!("{id}-{chapter}"), "chapter", chapter.to_string())
                    .reference(chapter.to_string())
                    .children((1..=*verses).map(|verse| {
                        CorpusNode::new(
                            format!("{id}-{chapter}-{verse}"),
                            "verse",
                            verse.to_string(),
                        )
                        .reference(verse.to_string())
                    }))
            },
        ))
    };
    CorpusData::new(
        "New Testament",
        [
            CorpusLevel::new("group", "Group", CorpusLevelKind::Hierarchy),
            CorpusLevel::new("book", "Book", CorpusLevelKind::Hierarchy),
            CorpusLevel::new("chapter", "Chapter", CorpusLevelKind::Number),
            CorpusLevel::new("verse", "Verse", CorpusLevelKind::Number),
        ],
        [
            CorpusNode::new("gospels", "group", "Gospels").children([
                book("john", "John", &[51, 25, 36, 54, 47, 71, 53]).aliases(["Jn"]),
                book("luke", "Luke", &[80, 52, 38]).aliases(["Lk"]),
            ]),
            CorpusNode::new("letters", "group", "Letters").children([
                book("romans", "Romans", &[32, 29]).aliases(["Rom"]),
                book("jude", "Jude", &[25]).disabled(),
            ]),
        ],
    )
}

struct Gallery {
    page: Page,
    /// Set once a tab is chosen, so the first page shows without an entrance.
    page_changed: bool,
    email: Entity<InputState>,
    handle: Entity<InputState>,
    status: SharedString,
    /// Where the gallery's recommendation stands.
    proposal: corpora_ui::composed::RecommendationState,
    reactions: Vec<BubbleReaction>,
    /// The picker behind the bubble's "Add reaction" button.
    reaction_picker: Entity<EmojiPickerState>,
    composer: Entity<corpora_ui::composed::Composer>,
    /// What the gallery's composer last reported.
    composed: SharedString,
    /// The row picked in the gallery's trees.
    tree_active: SharedString,
    navigation: Entity<corpora_ui::composed::CorpusNavigation>,
    /// The navigation behind the narrow navigator on the Blocks page.
    folded_navigation: Entity<corpora_ui::composed::CorpusNavigation>,
    /// The composer of the empty AI panel on the Blocks page.
    panel_composer: Entity<corpora_ui::composed::Composer>,
    /// Whether the Blocks page's rail, and the profile card at its foot, is folded.
    rail_folded: bool,
    /// The scaffold on the Blocks page, its open panels and whether the
    /// first one still has its second card.
    scaffold: Entity<corpora_ui::blocks::Scaffold>,
    scaffold_panels: Vec<&'static str>,
    scaffold_parallels: bool,
    /// The sign-in screens on the Blocks page.
    login: Entity<corpora_ui::blocks::LoginBlock>,
    signup: Entity<corpora_ui::blocks::SignupBlock>,
    forgot_password: Entity<corpora_ui::blocks::ForgotPasswordBlock>,
    update_password: Entity<corpora_ui::blocks::UpdatePasswordBlock>,
    code_auth: Entity<corpora_ui::blocks::CodeAuthBlock>,
    onboarding: Entity<corpora_ui::blocks::OnboardingBlock>,
    auth_flow: Entity<corpora_ui::blocks::AuthFlow>,
    auth_session: Entity<corpora_ui::blocks::AuthSession>,
    linked_accounts: Entity<corpora_ui::blocks::LinkedAccountsBlock>,
    passkeys: Entity<corpora_ui::blocks::PasskeyManagerBlock>,
    passkey_sign_in: Entity<corpora_ui::blocks::PasskeySignInBlock>,
    /// The shell on the Blocks page.
    shell: Entity<corpora_ui::blocks::Shell>,
    /// The resource tree on the Blocks page.
    resources: Entity<corpora_ui::blocks::ResourceSidebar>,
    /// The picker behind the standalone emoji bar.
    bar_picker: Entity<EmojiPickerState>,
    last_emoji: Option<Emoji>,
    password: Entity<InputState>,
    logo_folded: bool,
    glass: Entity<GlassShowcase>,
}

impl Gallery {
    fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        use corpora_ui::composed::{
            Composer, ComposerAttachment, ComposerEvent, ComposerModel, ComposerOption,
        };
        let composer = cx.new(|cx| {
            Composer::new(window, cx)
                .sources([
                    ComposerOption::new("bezae", "Codex Bezae").description("Gospels and Acts"),
                    ComposerOption::new("sinaiticus", "Codex Sinaiticus")
                        .description("Complete New Testament"),
                    ComposerOption::new("p75", "Papyrus 75").description("Luke and John"),
                ])
                .commands([
                    ComposerOption::new("collate", "Collate")
                        .description("Compare witnesses line by line"),
                    ComposerOption::new("summarize", "Summarize")
                        .description("Condense the passage"),
                ])
                .models([
                    ComposerModel::new("auto", "Auto"),
                    ComposerModel::new("scholar", "Scholar").description("Slower, cites more"),
                ])
                .attachments([ComposerAttachment {
                    id: "collation".into(),
                    title: "bezae-collation.pdf".into(),
                    meta: Some("PDF".into()),
                    ..Default::default()
                }])
                .safety_note("Answers can be wrong. Check them against the witnesses.")
        });
        // Each set of navigation views needs an entity of its own: their
        // element ids derive from it.
        let navigate = |window: &mut Window, cx: &mut Context<Self>| {
            cx.new(|cx| {
                corpora_ui::composed::CorpusNavigation::new(sample_corpus(), window, cx)
                    .location("john-3-16")
            })
        };
        let navigation = navigate(window, cx);
        let folded_navigation = navigate(window, cx);
        // The sign-in screens answer themselves after a beat, as a server
        // would. The password "wrong" and the code 000000 are turned down.
        let (login, signup, forgot_password, update_password, code_auth) = {
            use corpora_ui::blocks::{
                CodeAuthBlock, CodeAuthEvent, ForgotPasswordBlock, ForgotPasswordEvent, LoginBlock,
                LoginEvent, SignupBlock, SignupEvent, UpdatePasswordBlock, UpdatePasswordEvent,
            };
            let beat = std::time::Duration::from_millis(900);
            let login = cx.new(|cx| LoginBlock::new(window, cx));
            cx.subscribe(&login, move |_, login, event: &LoginEvent, cx| {
                let refused = matches!(event, LoginEvent::Submit { password, .. } if password.as_ref() == "wrong");
                if matches!(event, LoginEvent::Submit { .. } | LoginEvent::Provider(_)) {
                    cx.spawn(async move |_, cx| {
                        cx.background_executor().timer(beat).await;
                        login.update(cx, |login, cx| {
                            if refused {
                                login.fail("That email and password do not match.", cx)
                            } else {
                                login.succeed(cx)
                            }
                        });
                    })
                    .detach();
                }
            })
            .detach();
            let signup = cx.new(|cx| SignupBlock::new(window, cx));
            cx.subscribe(&signup, move |_, signup, event: &SignupEvent, cx| {
                if matches!(event, SignupEvent::Submit { .. } | SignupEvent::Provider(_)) {
                    cx.spawn(async move |_, cx| {
                        cx.background_executor().timer(beat).await;
                        signup.update(cx, |signup, cx| signup.succeed(cx));
                    })
                    .detach();
                }
            })
            .detach();
            let forgot = cx.new(|cx| ForgotPasswordBlock::new(window, cx));
            cx.subscribe(
                &forgot,
                move |_, forgot, event: &ForgotPasswordEvent, cx| {
                    if matches!(event, ForgotPasswordEvent::Submit { .. }) {
                        cx.spawn(async move |_, cx| {
                            cx.background_executor().timer(beat).await;
                            forgot.update(cx, |forgot, cx| forgot.succeed(cx));
                        })
                        .detach();
                    }
                },
            )
            .detach();
            let update = cx.new(|cx| UpdatePasswordBlock::new(window, cx));
            cx.subscribe(
                &update,
                move |_, update, event: &UpdatePasswordEvent, cx| {
                    if matches!(event, UpdatePasswordEvent::Submit { .. }) {
                        cx.spawn(async move |_, cx| {
                            cx.background_executor().timer(beat).await;
                            update.update(cx, |update, cx| update.succeed(cx));
                        })
                        .detach();
                    }
                },
            )
            .detach();
            let code =
                cx.new(|cx| CodeAuthBlock::new(6, window, cx).destination("a•••@exegia.app"));
            cx.subscribe(&code, move |_, code, event: &CodeAuthEvent, cx| {
                if let CodeAuthEvent::Verify(digits) = event {
                    let refused = digits.as_ref() == "000000";
                    cx.spawn(async move |_, cx| {
                        cx.background_executor().timer(beat).await;
                        code.update(cx, |code, cx| {
                            if refused {
                                code.fail("That code is not the one we sent.", cx)
                            } else {
                                code.succeed(cx)
                            }
                        });
                    })
                    .detach();
                }
            })
            .detach();
            (login, signup, forgot, update, code)
        };
        // The account screens answer themselves the same way. The display
        // name "taken" is turned down, and so is every other passkey sign-in.
        let (onboarding, linked_accounts, passkeys, passkey_sign_in) = {
            use corpora_ui::blocks::{
                LinkedAccountsBlock, LinkedAccountsEvent, LinkedIdentity, OnboardingBlock,
                OnboardingEvent, OnboardingField, OnboardingStep, Passkey, PasskeyManagerBlock,
                PasskeyManagerEvent, PasskeySignInBlock, PasskeySignInEvent,
            };
            use corpora_ui::composed::SocialProvider;
            let beat = std::time::Duration::from_millis(900);
            let onboarding = cx.new(|cx| {
                OnboardingBlock::new(
                    [
                        OnboardingStep::new("profile", "Your profile")
                            .description("How other readers will see you")
                            .field(
                                OnboardingField::text("display_name", "Display name")
                                    .placeholder("Ada Lovelace")
                                    .required(),
                            )
                            .field(
                                OnboardingField::text("handle", "Handle")
                                    .placeholder("ada")
                                    .validate(|handle| {
                                        (handle.chars().count() < 3)
                                            .then(|| "Use at least 3 characters".into())
                                    }),
                            ),
                        OnboardingStep::new("work", "Your work")
                            .description("So we can suggest corpora that fit")
                            .field(
                                OnboardingField::select(
                                    "role",
                                    "Role",
                                    [
                                        ("scholar", "Scholar"),
                                        ("student", "Student"),
                                        ("translator", "Translator"),
                                    ],
                                )
                                .required(),
                            )
                            .field(
                                OnboardingField::url("website", "Website")
                                    .placeholder("https://example.com"),
                            )
                            .field(
                                OnboardingField::textarea("bio", "About you")
                                    .placeholder("A few lines on what you read"),
                            ),
                        OnboardingStep::new("notices", "Notices")
                            .field(OnboardingField::checkbox(
                                "updates",
                                "Email me when a corpus I follow changes",
                            ))
                            .field(
                                OnboardingField::checkbox("terms", "I accept the terms").required(),
                            ),
                    ],
                    window,
                    cx,
                )
            });
            cx.subscribe(
                &onboarding,
                move |_, onboarding, event: &OnboardingEvent, cx| {
                    if let OnboardingEvent::Step { values, .. } = event {
                        let refused = values.iter().any(|(name, value)| {
                            name.as_ref() == "display_name" && value.as_text() == Some("taken")
                        });
                        cx.spawn(async move |_, cx| {
                            cx.background_executor().timer(beat).await;
                            onboarding.update(cx, |onboarding, cx| {
                                if refused {
                                    onboarding.fail("That display name is already in use.", cx)
                                } else {
                                    onboarding.advance(cx)
                                }
                            });
                        })
                        .detach();
                    }
                },
            )
            .detach();

            let linked = cx.new(|_| {
                LinkedAccountsBlock::new().identities([LinkedIdentity::new(
                    "google",
                    SocialProvider::Google,
                )
                .email("ada@exegia.app")])
            });
            cx.subscribe(
                &linked,
                move |_, linked, event: &LinkedAccountsEvent, cx| {
                    let event = event.clone();
                    cx.spawn(async move |_, cx| {
                        cx.background_executor().timer(beat).await;
                        linked.update(cx, |linked, cx| {
                            let mut identities: Vec<LinkedIdentity> =
                                linked.linked().cloned().collect();
                            match event {
                                LinkedAccountsEvent::Link(provider) => identities.push(
                                    LinkedIdentity::new(provider.label().to_lowercase(), provider)
                                        .email("ada@exegia.app"),
                                ),
                                LinkedAccountsEvent::Unlink(id) => {
                                    identities.retain(|identity| identity.id != id)
                                }
                            }
                            linked.settle(cx);
                            linked.set_identities(identities, cx);
                        });
                    })
                    .detach();
                },
            )
            .detach();

            let passkeys = cx.new(|cx| {
                PasskeyManagerBlock::new(window, cx).passkeys([
                    Passkey::new("macbook")
                        .name("MacBook Pro")
                        .created("3 May 2026")
                        .last_used("19 November 2026"),
                    Passkey::new("phone").created("12 August 2026"),
                ])
            });
            let minted = std::rc::Rc::new(std::cell::Cell::new(0_u32));
            cx.subscribe(
                &passkeys,
                move |_, passkeys, event: &PasskeyManagerEvent, cx| {
                    let event = event.clone();
                    let minted = minted.clone();
                    cx.spawn(async move |_, cx| {
                        cx.background_executor().timer(beat).await;
                        passkeys.update(cx, |passkeys, cx| {
                            let mut list: Vec<Passkey> = passkeys.registered().cloned().collect();
                            match event {
                                PasskeyManagerEvent::Register => {
                                    minted.set(minted.get() + 1);
                                    list.insert(
                                        0,
                                        Passkey::new(format!("new-{}", minted.get()))
                                            .name("This device")
                                            .created("21 November 2026"),
                                    );
                                }
                                PasskeyManagerEvent::Rename { id, name } => {
                                    for passkey in
                                        list.iter_mut().filter(|passkey| passkey.id == id)
                                    {
                                        passkey.name = Some(name.clone());
                                    }
                                }
                                PasskeyManagerEvent::Delete(id) => {
                                    list.retain(|passkey| passkey.id != id)
                                }
                            }
                            passkeys.settle(cx);
                            passkeys.set_passkeys(list, cx);
                        });
                    })
                    .detach();
                },
            )
            .detach();

            let sign_in = cx.new(|_| PasskeySignInBlock::new());
            let attempts = std::rc::Rc::new(std::cell::Cell::new(0_u32));
            cx.subscribe(&sign_in, move |_, sign_in, _: &PasskeySignInEvent, cx| {
                attempts.set(attempts.get() + 1);
                let refused = attempts.get() % 2 == 1;
                cx.spawn(async move |_, cx| {
                    cx.background_executor().timer(beat).await;
                    sign_in.update(cx, |sign_in, cx| {
                        if refused {
                            sign_in.fail("No passkey on this device matches your account.", cx)
                        } else {
                            sign_in.settle(cx)
                        }
                    });
                })
                .detach();
            })
            .detach();
            (onboarding, linked, passkeys, sign_in)
        };
        // The whole journey on one card. An email starting "mfa" is sent a
        // code first; signing up always is, and then onboards.
        let auth_session = cx.new(|_| corpora_ui::blocks::AuthSession::new());
        cx.observe(&auth_session, |_, _, cx| cx.notify()).detach();
        let auth_flow = {
            use corpora_ui::blocks::{AuthFlow, AuthFlowEvent, AuthStep, AuthUser, CodeChannel};
            let beat = std::time::Duration::from_millis(900);
            let flow = cx.new(|cx| AuthFlow::new(window, cx).session(&auth_session, cx));
            let verification_is_signup = std::cell::Cell::new(false);
            cx.subscribe(&flow, move |_, flow, event: &AuthFlowEvent, cx| {
                if matches!(
                    event,
                    AuthFlowEvent::Step(_) | AuthFlowEvent::Terms | AuthFlowEvent::ResendCode
                ) {
                    return;
                }
                // Verification shares one screen, but only signup needs onboarding.
                match event {
                    AuthFlowEvent::Login { .. } => verification_is_signup.set(false),
                    AuthFlowEvent::Signup { .. } => verification_is_signup.set(true),
                    _ => {}
                }
                let signup_verification = verification_is_signup.get();
                let event = event.clone();
                cx.spawn(async move |_, cx| {
                    cx.background_executor().timer(beat).await;
                    flow.update(cx, |flow, cx| {
                        let ada = || AuthUser::new("ada", "Ada Lovelace").email("ada@exegia.app");
                        match event {
                            AuthFlowEvent::Login { password, .. }
                                if password.as_ref() == "wrong" =>
                            {
                                flow.fail("That email and password do not match.", cx)
                            }
                            AuthFlowEvent::Login { email, .. } if email.starts_with("mfa") => {
                                flow.begin_verification(email, CodeChannel::Email, cx)
                            }
                            AuthFlowEvent::Login { .. } | AuthFlowEvent::Provider(_) => {
                                flow.complete(Some(ada()), cx)
                            }
                            AuthFlowEvent::Signup { email, .. } => {
                                flow.begin_verification(email, CodeChannel::Email, cx)
                            }
                            AuthFlowEvent::VerifyCode(code) if code.as_ref() == "000000" => {
                                flow.fail("That code is not the one we sent.", cx)
                            }
                            AuthFlowEvent::VerifyCode(_) if signup_verification => {
                                flow.go_to_step(AuthStep::Onboarding, cx)
                            }
                            AuthFlowEvent::VerifyCode(_) => flow.complete(Some(ada()), cx),
                            AuthFlowEvent::OnboardingComplete(profile) => {
                                let name = profile
                                    .iter()
                                    .find(|(name, _)| name.as_ref() == "display_name")
                                    .and_then(|(_, value)| value.as_text())
                                    .unwrap_or("Reader")
                                    .to_string();
                                flow.complete(Some(AuthUser::new("new", name)), cx)
                            }
                            AuthFlowEvent::RequestReset { .. }
                            | AuthFlowEvent::UpdatePassword { .. } => flow.succeed(cx),
                            AuthFlowEvent::Step(_)
                            | AuthFlowEvent::Terms
                            | AuthFlowEvent::ResendCode => {}
                        }
                    });
                })
                .detach();
            })
            .detach();
            flow
        };
        let scaffold = cx.new(|_| corpora_ui::blocks::Scaffold::new());
        cx.observe(&scaffold, |_, _, cx| cx.notify()).detach();
        let shell = cx.new(|_| corpora_ui::blocks::Shell::new().right_open(true));
        cx.observe(&shell, |_, _, cx| cx.notify()).detach();
        let resources = cx.new(|cx| {
            use corpora_ui::blocks::{ResourceKind, ResourceSidebar, SidebarResource};
            use gpui_kit::component::menu::PopupMenuItem;

            ResourceSidebar::new(
                [
                    SidebarResource::new("gospels", "Gospels", ResourceKind::Project).children([
                        SidebarResource::new("john-notes", "Notes on John", ResourceKind::File),
                        SidebarResource::new(
                            "synoptic",
                            "Synoptic parallels",
                            ResourceKind::Folder,
                        )
                        .children([SidebarResource::new(
                            "agony",
                            "The agony in the garden, Luke 22:43-44 across the witnesses",
                            ResourceKind::File,
                        )]),
                    ]),
                    SidebarResource::new("letters", "Letters", ResourceKind::Folder).children([
                        SidebarResource::new("romans-5", "Romans 5:8", ResourceKind::Bookmark),
                    ]),
                    SidebarResource::new("john-3-16", "John 3:16", ResourceKind::Bookmark),
                    SidebarResource::new("archive", "Archive", ResourceKind::Folder).disabled(true),
                ],
                cx,
            )
            .expanded(["gospels"])
            .selected("john-notes")
            .menu(|resource, menu, _, _| {
                menu.separator()
                    .item(PopupMenuItem::new(format!("Share “{}”", resource.label)))
            })
        });
        cx.subscribe(&resources, |this, _, event, cx| {
            use corpora_ui::blocks::ResourceSidebarEvent;

            this.composed = match event {
                ResourceSidebarEvent::Select(id) => format!("Opened {id}"),
                ResourceSidebarEvent::Move(change) => format!(
                    "Moved {} {:?} {}",
                    change.item_id,
                    change.position,
                    change.target_id.as_deref().unwrap_or("the top level")
                ),
                ResourceSidebarEvent::Rename { id, label } => format!("Renamed {id} to “{label}”"),
            }
            .into();
            cx.notify();
        })
        .detach();
        cx.observe(&folded_navigation, |_, _, cx| cx.notify())
            .detach();
        cx.observe(&navigation, |_, _, cx| cx.notify()).detach();
        let panel_composer = cx.new(|cx| Composer::new(window, cx));
        cx.subscribe(&composer, |this, _, event: &ComposerEvent, cx| {
            this.composed = match event {
                ComposerEvent::Submit { text, attachments } => {
                    format!("Sent “{text}” with {} attached", attachments.len())
                }
                ComposerEvent::Stop => "Stopped".to_string(),
                ComposerEvent::SourcePicked(source) => format!("Mentioned {}", source.label),
                ComposerEvent::Command(command) => format!("Ran /{}", command.id),
                ComposerEvent::ModelChanged(model) => format!("Model: {model}"),
                ComposerEvent::FilesAdded(paths) => format!("Added {} files", paths.len()),
            }
            .into();
            cx.notify();
        })
        .detach();
        Self {
            composer,
            composed: "Nothing sent yet".into(),
            tree_active: "john-1".into(),
            navigation,
            folded_navigation,
            panel_composer,
            rail_folded: false,
            scaffold,
            scaffold_panels: vec!["Text", "Apparatus"],
            scaffold_parallels: true,
            login,
            signup,
            forgot_password,
            update_password,
            code_auth,
            onboarding,
            auth_flow,
            auth_session,
            linked_accounts,
            passkeys,
            passkey_sign_in,
            shell,
            resources,
            page: Page::Foundations,
            page_changed: false,
            status: "Pending".into(),
            proposal: Default::default(),
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
            glass: cx.new(GlassShowcase::new),
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

    fn render_buttons(&self, cx: &App) -> impl IntoElement {
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
                    )
                    .child(Button::new("button-glass").glass().label("Glass")),
            )
            .child({
                use corpora_ui::blocks::AuthAccent;
                let filled = |id: &'static str, label: &'static str, accent: AuthAccent| {
                    Button::new(id)
                        .primary()
                        .label(label)
                        .fill(accent.fill(cx), accent.foreground(cx))
                };
                row()
                    .child(filled(
                        "button-fill-corpora",
                        "Corpora fill",
                        AuthAccent::Corpora,
                    ))
                    .child(filled(
                        "button-fill-exegia",
                        "Exegia fill",
                        AuthAccent::Exegia,
                    ))
                    .child(
                        filled("button-fill-icon", "Continue", AuthAccent::Exegia)
                            .trailing_icon(IconName::ArrowRight),
                    )
                    .child(
                        filled("button-fill-loading", "Signing in", AuthAccent::Exegia)
                            .loading(true)
                            .disabled(true),
                    )
                    .child(
                        filled("button-fill-disabled", "Disabled", AuthAccent::Corpora)
                            .disabled(true),
                    )
            })
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

    fn render_glass(&self, cx: &App) -> impl IntoElement {
        use corpora_ui::atoms::{GlassEdge, GlassEdges, GlassSpec, GlassSurfaceExt as _};

        let [first, second, third, ..] = cx.palette().chart;
        let pane = |label: &'static str| {
            div()
                .px_5()
                .py_3()
                .rounded(Radius::Xl.resolve(cx))
                .text_sm()
                .font_weight(FontWeight::SEMIBOLD)
                .child(label)
        };
        Section::new("Glass")
            .child(
                Text::paragraph(
                    "Glass bends and frosts what is painted behind it. Drag the pane over the \
                     backdrop and tune its material.",
                )
                .max_w_128(),
            )
            .child(
                div()
                    .relative()
                    .w_full()
                    .rounded(Radius::Lg.resolve(cx))
                    .overflow_hidden()
                    .bg(linear_gradient(
                        100.,
                        linear_color_stop(first, 0.),
                        linear_color_stop(third, 1.),
                    ))
                    .child(
                        div().absolute().top_0().left_6().child(
                            Text::heading("Corpora")
                                .text_color(second)
                                .text_size(rems(4.)),
                        ),
                    )
                    .child(
                        row()
                            .relative()
                            .px_6()
                            .py_10()
                            .gap_4()
                            .child(pane("Clear").glass())
                            .child(pane("Deep").glass_with(GlassSpec::deep()))
                            .child(pane("Blur").glass_with(GlassSpec::blur()))
                            .child(pane("Frosted").glass_with(GlassSpec::frosted(cx)))
                            .child(pane("Accent").glass_with(GlassSpec::accent(cx)))
                            .child(pane("Destructive").glass_with(GlassSpec::destructive(cx)))
                            // The rim set side by side: lit from above only.
                            .child(
                                pane("Top lit").glass_with(
                                    GlassSpec::default().edges(
                                        GlassEdges::default().top(GlassEdge::new(px(4.), 0.7)),
                                    ),
                                ),
                            )
                            .child(
                                pane("Side lit").glass_with(
                                    GlassSpec::default().edges(
                                        GlassEdges::default().x(GlassEdge::new(px(4.), 0.7)),
                                    ),
                                ),
                            )
                            .child(Button::new("glass-button").glass().label("Button"))
                            .child(
                                Button::new("glass-button-disabled")
                                    .glass()
                                    .label("Disabled")
                                    .disabled(true),
                            ),
                    ),
            )
            .child(self.glass.clone())
    }

    fn render_marks(&self) -> impl IntoElement {
        use corpora_ui::atoms::{
            Dot, FileTypeBadge, FollowUpRow, Pill, SegmentedToggle, Stat, Tag, TagTone, Tone,
        };

        Section::new("Marks")
            .child(
                row()
                    .gap_3()
                    .children(
                        [
                            Tone::Success,
                            Tone::Warning,
                            Tone::Info,
                            Tone::Danger,
                            Tone::Neutral,
                            Tone::Accent,
                        ]
                        .map(Dot::new),
                    )
                    .children((1..=5).map(|series| Dot::new(Tone::Series(series)).small()))
                    .child(Pill::new("12"))
                    .child(Pill::new("Snapshot"))
                    .child(FileTypeBadge::new("pdf"))
                    .child(FileTypeBadge::new("csv"))
                    .child(Tag::new("Papyrus").tone(TagTone::Amber))
                    .child(Tag::new("Uncial").tone(TagTone::Purple))
                    .child(Tag::new("Minuscule"))
                    .child(Tag::new("Lectionary").tone(TagTone::Green))
                    .child(
                        SegmentedToggle::new("marks-view")
                            .option("code", "Code")
                            .option("diff", "Diff")
                            .option("notes", "Notes"),
                    ),
            )
            .child(
                row()
                    .items_start()
                    .gap_6()
                    .child(Stat::new("Attested", "1,204").delta("+38 this week"))
                    .child(
                        Stat::new("Disputed", "17")
                            .tone(Tone::Series(3))
                            .negative()
                            .delta("+4"),
                    )
                    .child(div().w(rems(20.)).child(FollowUpRow::new(
                        "marks-follow-up",
                        "How old is the oldest witness?",
                    ))),
            )
    }

    fn render_data(&self) -> impl IntoElement {
        use corpora_ui::atoms::{Stat, TagTone, Tone};
        use corpora_ui::composed::{
            CodeBlock, ContextCard, ContextCards, DiffLine, FilterRow, FilterStatus, FilterTable,
            Insight, InsightAllocation, InsightCards, InsightSegment, RecordRow, RecordsTable,
        };

        let code = "export async function collate(witnesses) {\n  const base = witnesses[0]\n  return witnesses.map((w) => diff(base, w, \"word\"))\n}";
        let record = |id: &'static str,
                      name: &'static str,
                      tags: &[(&'static str, TagTone)],
                      last: &'static str,
                      strength: &'static str| RecordRow {
            id: id.into(),
            name: name.into(),
            initial: None,
            tags: tags
                .iter()
                .map(|(label, tone)| ((*label).into(), *tone))
                .collect(),
            last_interaction: last.into(),
            strength: strength.into(),
        };

        Section::new("Composed: data")
            .child(
                row()
                    .items_start()
                    .gap_8()
                    .child(
                        div().w(rems(27.)).child(
                            CodeBlock::new("collate-code", code)
                                .filename("src/collate.ts")
                                .diff([
                                    DiffLine::context("export async function collate(witnesses) {"),
                                    DiffLine::removed("  const base = witnesses[0]"),
                                    DiffLine::added("  const base = pickBase(witnesses)"),
                                    DiffLine::context(
                                        "  return witnesses.map((w) => diff(base, w, \"word\"))",
                                    ),
                                    DiffLine::context("}"),
                                ]),
                        ),
                    )
                    .child(
                        div().w(rems(24.)).child(
                            ContextCards::new("chunks").cards([
                                ContextCard {
                                    id: "c1".into(),
                                    title: "Luke 22:43–44 in Codex Bezae".into(),
                                    meta: Some("290 characters".into()),
                                    snippet:
                                        "The longer reading, with the angel and the sweat like \
                                          drops of blood, stands in the first hand of the codex \
                                          and in most of the Old Latin."
                                            .into(),
                                    file: Some(("bezae-collation.pdf".into(), "pdf".into())),
                                },
                                ContextCard {
                                    id: "c2".into(),
                                    title: "Editorial note".into(),
                                    meta: Some("118 characters".into()),
                                    snippet:
                                        "Most modern editions print the verses in double brackets."
                                            .into(),
                                    file: None,
                                },
                            ]),
                        ),
                    ),
            )
            .child(
                row()
                    .items_start()
                    .gap_8()
                    .child(
                        div().w(rems(28.)).child(
                            FilterTable::new("tasks")
                                .statuses([
                                    FilterStatus::new("done", "Done", Tone::Success),
                                    FilterStatus::new("review", "In review", Tone::Warning),
                                    FilterStatus::new("open", "Open", Tone::Neutral),
                                ])
                                .columns(["Task", "Status", "Owner"])
                                .status_column(1)
                                .rows([
                                    FilterRow::new("t1", "done", ["Collate John 1", "", "Ada"]),
                                    FilterRow::new("t2", "review", ["Tag variants", "", "Grace"]),
                                    FilterRow::new("t3", "open", ["Align Old Latin", "", "Ada"]),
                                    FilterRow::new("t4", "done", ["Import Bezae", "", "Alan"]),
                                ]),
                        ),
                    )
                    .child(
                        div().w(rems(21.5)).child(
                            InsightCards::new("insights").insights([
                                Insight {
                                    summary:
                                        "Byzantine witnesses carry the longer reading far more \
                                          often than Alexandrian ones."
                                            .into(),
                                    stats: vec![
                                        Stat::new("Attested", "1,204").delta("+38 this week"),
                                        Stat::new("Disputed", "17")
                                            .tone(Tone::Series(3))
                                            .negative()
                                            .delta("+4"),
                                    ],
                                    allocation: Some(InsightAllocation {
                                        label: "Witnesses".into(),
                                        value: "1,221".into(),
                                        segments: vec![
                                            InsightSegment::new("byz", "Byzantine", 780.)
                                                .description(
                                                    "Mostly minuscules from the ninth century on.",
                                                ),
                                            InsightSegment::new("alex", "Alexandrian", 290.)
                                                .tone(Tone::Series(2))
                                                .description(
                                                    "The early papyri and the great uncials.",
                                                ),
                                            InsightSegment::new("west", "Western", 151.)
                                                .tone(Tone::Series(4))
                                                .description("Codex Bezae and the Old Latin."),
                                        ],
                                    }),
                                    follow_up: Some("Which witnesses omit the verses?".into()),
                                },
                                Insight {
                                    summary: "The verses are missing from the earliest papyri."
                                        .into(),
                                    stats: vec![Stat::new("Papyri", "3").tone(Tone::Series(2))],
                                    allocation: None,
                                    follow_up: Some("How old is the oldest witness?".into()),
                                },
                            ]),
                        ),
                    ),
            )
            .child(
                div()
                    .w(rems(40.))
                    .child(RecordsTable::new("witnesses").rows([
                        record(
                            "bezae",
                            "Codex Bezae",
                            &[
                                ("Uncial", TagTone::Purple),
                                ("Western", TagTone::Amber),
                                ("Bilingual", TagTone::Blue),
                            ],
                            "2 days ago",
                            "Strong",
                        ),
                        record(
                            "sinaiticus",
                            "Codex Sinaiticus",
                            &[("Uncial", TagTone::Purple), ("Alexandrian", TagTone::Green)],
                            "Last week",
                            "Strong",
                        ),
                        record(
                            "p75",
                            "Papyrus 75",
                            &[("Papyrus", TagTone::Amber)],
                            "3 weeks ago",
                            "Weak",
                        ),
                    ])),
            )
    }

    fn render_ai_panel(&self, cx: &mut Context<Self>) -> impl IntoElement {
        use corpora_ui::atoms::SignalLevel;
        use corpora_ui::blocks::{
            AiPanel, AiScope, AiScopeKind, DegradedBanner, LockedBanner, PinnedThreadBanner,
            RecommendationStack, VersionHistoryEntry, VersionHistoryRecord,
        };
        use corpora_ui::composed::Recommendation;

        let report = |what: &'static str| {
            cx.listener(move |this, _: &ClickEvent, _, cx| {
                this.composed = what.into();
                cx.notify();
            })
        };
        let mut scope = AiScope::new(AiScopeKind::Passage, "Luke");
        scope.range = Some("22:43-44".into());
        let thread = v_flex()
            .gap_3()
            .child(
                div()
                    .text_xs()
                    .text_color(cx.theme().muted_foreground)
                    .child(scope.label()),
            )
            .child(PinnedThreadBanner::new())
            .child(DegradedBanner::new("panel-degraded").on_retry(report("Asked again")))
            .child(
                RecommendationStack::new()
                    .child(
                        Recommendation::new("stack-base", "Keep the longer reading")
                            .description("The first hand of Bezae carries it.")
                            .confidence(SignalLevel::High),
                    )
                    .child(
                        Recommendation::new("stack-note", "Add a note on Papyrus 75")
                            .description("It omits both verses.")
                            .confidence(SignalLevel::Medium)
                            .collapsed(),
                    ),
            )
            .child(VersionHistoryRecord::new(VersionHistoryEntry {
                response_id: "r-204".into(),
                applying_user: Some("Grace Hopper".into()),
                node_id: "lk-22-43".into(),
                previous_value: "ὤφθη δὲ αὐτῷ ἄγγελος".into(),
                timestamp: "21 Nov 2026, 10:42".into(),
                version: "12".into(),
            }));
        let frame = |panel: AiPanel| {
            div()
                .w(rems(24.))
                .h(rems(38.))
                .rounded(Radius::Lg.resolve(cx))
                .border_1()
                .border_color(cx.theme().border)
                .overflow_hidden()
                .child(panel)
        };
        Section::new("Blocks: AI panel").child(
            h_flex()
                .items_start()
                .gap_6()
                .child(frame(
                    AiPanel::new("panel-thread", &self.composer)
                        .title("Curation")
                        .on_new_thread(report("Started a new thread"))
                        .thread(thread),
                ))
                .child(frame(
                    AiPanel::new("panel-empty", &self.panel_composer)
                        .title("Published edition")
                        .locked(true)
                        .prompts([
                            "Summarise the witnesses for this passage",
                            "Which manuscripts omit these verses?",
                        ])
                        .on_prompt_select(cx.listener(|this, prompt: &SharedString, _, cx| {
                            this.composed = format!("Asked: {prompt}").into();
                            cx.notify();
                        })),
                ))
                .child(div().w(rems(22.)).child(LockedBanner::new())),
        )
    }

    fn render_profile_card(&self, cx: &mut Context<Self>) -> impl IntoElement {
        use corpora_ui::atoms::{AvatarStatus, AvatarUser};
        use corpora_ui::blocks::{ProfileAction, ProfileCard, ProfileItem};
        use gpui_kit::Anchor;
        use gpui_kit::assets::IconName as LucideIcon;

        let ada = || AvatarUser::named("Ada", "Lovelace").status(AvatarStatus::Online);
        let muted = cx.theme().muted_foreground;
        let caption = move |text: &'static str| div().text_xs().text_color(muted).child(text);
        let entity = cx.entity();
        let said = move |what: &'static str| {
            let entity = entity.clone();
            move |_: &mut Window, cx: &mut App| {
                entity.update(cx, |this, cx| {
                    this.composed = what.into();
                    cx.notify();
                });
            }
        };
        let folded = self.rail_folded;
        let border = cx.theme().border;
        let sidebar = cx.theme().sidebar;
        Section::new("Blocks: profile card")
            .child(
                h_flex()
                    .items_start()
                    .gap_8()
                    .child(
                        v_flex()
                            .w(rems(16.))
                            .gap_2()
                            .child(caption("Default menu"))
                            .child(
                                ProfileCard::new("profile-default", ada())
                                    .username("ada@exegia.app"),
                            ),
                    )
                    .child(
                        v_flex()
                            .w(rems(16.))
                            .gap_2()
                            .child(caption("Own menu, shortcuts"))
                            .child(
                                ProfileCard::new(
                                    "profile-own",
                                    AvatarUser::named("Grace", "Hopper"),
                                )
                                .username("Editor")
                                .items([
                                    ProfileItem::Label("Grace Hopper".into()),
                                    ProfileAction::new("settings", "Settings")
                                        .icon(LucideIcon::Settings)
                                        .shortcut("⌘,")
                                        .on_select(said("Opened settings"))
                                        .into(),
                                    ProfileAction::new("billing", "Billing")
                                        .disabled(true)
                                        .into(),
                                    ProfileItem::Separator,
                                    ProfileAction::new("sign-out", "Log out")
                                        .icon(LucideIcon::LogOut)
                                        .shortcut("⇧⌘Q")
                                        .destructive()
                                        .on_select(said("Logged out"))
                                        .into(),
                                ]),
                            ),
                    )
                    .child(
                        v_flex()
                            .w(rems(16.))
                            .gap_2()
                            .child(caption("Working"))
                            .child(
                                ProfileCard::new("profile-busy", ada())
                                    .username("Signing out…")
                                    .loading(true),
                            ),
                    )
                    .child(
                        v_flex()
                            .gap_2()
                            .child(caption("At the foot of a rail"))
                            .child(
                                h_flex()
                                    .items_end()
                                    .gap_3()
                                    .child(
                                        v_flex()
                                            .w(rems(if folded { 3.5 } else { 15. }))
                                            .h(rems(9.))
                                            .justify_end()
                                            .p_1p5()
                                            .rounded(Radius::Lg.resolve(cx))
                                            .border_1()
                                            .border_color(border)
                                            .bg(sidebar)
                                            .child(
                                                ProfileCard::new("profile-rail", ada())
                                                    .username("ada@exegia.app")
                                                    .collapsed(folded)
                                                    .anchor(Anchor::BottomLeft),
                                            ),
                                    )
                                    .child(
                                        Button::new("profile-fold")
                                            .outline()
                                            .label(if folded { "Unfold rail" } else { "Fold rail" })
                                            .on_click(cx.listener(
                                                |this, _: &ClickEvent, _, cx| {
                                                    this.rail_folded = !this.rail_folded;
                                                    cx.notify();
                                                },
                                            )),
                                    ),
                            ),
                    ),
            )
            .child(
                div()
                    .text_xs()
                    .text_color(cx.theme().muted_foreground)
                    .child(self.composed.clone()),
            )
    }

    fn render_auth(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let screen = |block: gpui_kit::AnyElement| div().w(rems(24.)).child(block);
        Section::new("Blocks: auth")
            .child(
                h_flex()
                    .flex_wrap()
                    .items_start()
                    .gap_6()
                    .child(screen(self.login.clone().into_any_element()))
                    .child(screen(self.signup.clone().into_any_element()))
                    .child(screen(self.forgot_password.clone().into_any_element()))
                    .child(screen(self.update_password.clone().into_any_element()))
                    .child(screen(self.code_auth.clone().into_any_element()))
                    .child(screen(self.onboarding.clone().into_any_element())),
            )
            .child(
                Button::new("auth-reset")
                    .outline()
                    .label("Reset the six screens")
                    .on_click(cx.listener(|this, _: &ClickEvent, window, cx| {
                        this.login.update(cx, |block, cx| block.reset(window, cx));
                        this.signup.update(cx, |block, cx| block.reset(window, cx));
                        this.forgot_password
                            .update(cx, |block, cx| block.reset(window, cx));
                        this.update_password
                            .update(cx, |block, cx| block.reset(window, cx));
                        this.code_auth
                            .update(cx, |block, cx| block.reset(window, cx));
                        this.onboarding
                            .update(cx, |block, cx| block.reset(window, cx));
                    })),
            )
    }

    fn render_auth_flow(&self, cx: &mut Context<Self>) -> impl IntoElement {
        use corpora_ui::blocks::{AuthAccent, AuthStep, SessionStatus};
        let session = self.auth_session.read(cx);
        let status: gpui_kit::SharedString = match (session.status(), session.user()) {
            (SessionStatus::Authenticated, Some(user)) => {
                format!("Signed in as {}", user.name).into()
            }
            (SessionStatus::Unauthenticated, _) => "Signed out".into(),
            _ => "No session yet".into(),
        };
        let signed_in = session.is_authenticated();
        let jump = |id: &'static str, label: &'static str, step: AuthStep| {
            Button::new(id).outline().label(label).on_click(cx.listener(
                move |this, _: &ClickEvent, _, cx| {
                    this.auth_flow
                        .update(cx, |flow, cx| flow.go_to_step(step, cx));
                },
            ))
        };
        let accent = |id: &'static str, label: &'static str, accent: Option<AuthAccent>| {
            Button::new(id)
                .outline()
                .small()
                .label(label)
                .on_click(cx.listener(move |this, _: &ClickEvent, _, cx| {
                    this.auth_flow
                        .update(cx, |flow, cx| flow.set_accent(accent, cx));
                }))
        };
        Section::new("Blocks: auth flow").child(
            h_flex()
                .items_start()
                .gap_6()
                .child(div().w(rems(24.)).child(self.auth_flow.clone()))
                .child(
                    v_flex()
                        .items_start()
                        .gap_2()
                        .child(
                            div()
                                .text_sm()
                                .text_color(cx.theme().muted_foreground)
                                .child(status),
                        )
                        .child(
                            h_flex()
                                .gap_2()
                                .child(accent("flow-accent-none", "Theme accent", None))
                                .child(accent(
                                    "flow-accent-corpora",
                                    "Corpora",
                                    Some(AuthAccent::Corpora),
                                ))
                                .child(accent(
                                    "flow-accent-exegia",
                                    "Exegia",
                                    Some(AuthAccent::Exegia),
                                )),
                        )
                        .child(jump("flow-login", "Go to login", AuthStep::Login))
                        .child(jump(
                            "flow-update",
                            "Go to update password",
                            AuthStep::UpdatePassword,
                        ))
                        .child(
                            Button::new("flow-sign-out")
                                .outline()
                                .label("Sign out")
                                .disabled(!signed_in)
                                .on_click(cx.listener(|this, _: &ClickEvent, _, cx| {
                                    this.auth_session
                                        .update(cx, |session, cx| session.sign_out(cx));
                                })),
                        ),
                ),
        )
    }

    fn render_credentials(&self) -> impl IntoElement {
        let panel = |block: gpui_kit::AnyElement| div().w(rems(28.)).child(block);
        Section::new("Blocks: ways into an account").child(
            h_flex()
                .flex_wrap()
                .items_start()
                .gap_6()
                .child(panel(self.linked_accounts.clone().into_any_element()))
                .child(panel(self.passkeys.clone().into_any_element()))
                .child(div().w(rems(24.)).child(self.passkey_sign_in.clone())),
        )
    }

    fn render_resource_sidebar(&self, cx: &mut Context<Self>) -> impl IntoElement {
        let resources = self.resources.clone();
        let fold = resources.clone();
        Section::new("Blocks: resource sidebar").child(
            h_flex()
                .items_start()
                .gap_6()
                .child(
                    div()
                        .w(rems(17.))
                        .p_1p5()
                        .rounded(Radius::Lg.resolve(cx))
                        .border_1()
                        .border_color(cx.theme().border)
                        .bg(cx.theme().sidebar)
                        .child(resources.clone()),
                )
                .child(
                    v_flex()
                        .gap_2()
                        .child(
                            h_flex()
                                .gap_2()
                                .child(
                                    Button::new("resources-open")
                                        .outline()
                                        .label("Expand all")
                                        .on_click(move |_, _, cx| {
                                            resources.update(cx, |this, cx| this.expand_all(cx))
                                        }),
                                )
                                .child(
                                    Button::new("resources-shut")
                                        .outline()
                                        .label("Collapse all")
                                        .on_click(move |_, _, cx| {
                                            fold.update(cx, |this, cx| this.collapse_all(cx))
                                        }),
                                ),
                        )
                        .child(
                            div()
                                .max_w(rems(24.))
                                .text_xs()
                                .text_color(cx.theme().muted_foreground)
                                .child(
                                    "Drag a row to reorder it. Arrow keys walk the tree, \
                                         F2 renames, and Alt-Shift with an arrow moves the row.",
                                ),
                        )
                        .child(
                            div()
                                .text_xs()
                                .text_color(cx.theme().muted_foreground)
                                .child(self.composed.clone()),
                        ),
                ),
        )
    }

    fn render_corpus_navigator(&self, cx: &mut Context<Self>) -> impl IntoElement {
        use corpora_ui::blocks::CorpusNavigator;

        let state = self.navigation.read(cx);
        let reading = state
            .data()
            .format_reference(state.current().map(|id| id.as_ref()));
        let muted = cx.theme().muted_foreground;
        let passage = move |title: String| {
            v_flex()
                .gap_2()
                .child(
                    div()
                        .text_lg()
                        .font_weight(FontWeight::SEMIBOLD)
                        .child(title),
                )
                .child(div().text_color(muted).child(
                    "Οὕτως γὰρ ἠγάπησεν ὁ θεὸς τὸν κόσμον, ὥστε τὸν υἱὸν τὸν μονογενῆ \
                         ἔδωκεν, ἵνα πᾶς ὁ πιστεύων εἰς αὐτὸν μὴ ἀπόληται ἀλλ᾽ ἔχῃ ζωὴν αἰώνιον.",
                ))
        };
        Section::new("Blocks: corpus navigator").child(
            v_flex()
                .gap_6()
                .child(
                    CorpusNavigator::new("navigator-wide", &self.navigation)
                        .edition("SBLGNT")
                        .context("Parallels: 1 John 4:9, Romans 5:8.")
                        .child(passage(reading.clone())),
                )
                .child(
                    div().w(rems(42.)).child(
                        CorpusNavigator::new("navigator-folded", &self.folded_navigation)
                            .edition("SBLGNT")
                            .context("Parallels: 1 John 4:9, Romans 5:8.")
                            .child(passage(reading)),
                    ),
                ),
        )
    }

    fn render_corpus_navigation(&self, cx: &mut Context<Self>) -> impl IntoElement {
        use corpora_ui::composed::{HierarchyPicker, LocationBar, LocationGrid, ReferenceCommand};

        let navigation = self.navigation.clone();
        let state = navigation.read(cx);
        let draft = state
            .data()
            .format_reference(state.draft().map(|id| id.as_ref()));
        let moved = state.draft() != state.current();
        Section::new("Composed: corpus navigation").child(
            v_flex()
                .w(rems(44.))
                .gap_4()
                .child(LocationBar::new(&navigation))
                .child(
                    h_flex()
                        .items_start()
                        .gap_6()
                        .child(
                            v_flex()
                                .w(rems(16.))
                                .gap_4()
                                .child(ReferenceCommand::new(&navigation))
                                .child(HierarchyPicker::new(&navigation)),
                        )
                        .child(
                            v_flex()
                                .flex_1()
                                .gap_4()
                                .child(LocationGrid::new(&navigation, "chapter"))
                                .child(LocationGrid::new(&navigation, "verse"))
                                .child(
                                    h_flex()
                                        .justify_between()
                                        .gap_3()
                                        .child(
                                            div()
                                                .text_sm()
                                                .text_color(cx.theme().muted_foreground)
                                                .child(draft),
                                        )
                                        .child(
                                            Button::new("corpus-go")
                                                .primary()
                                                .label("Go to location")
                                                .disabled(!moved)
                                                .on_click(move |_, _, cx| {
                                                    navigation.update(cx, |state, cx| {
                                                        state.commit(None, cx);
                                                    });
                                                }),
                                        ),
                                ),
                        ),
                ),
        )
    }

    fn render_research_answer(&self, cx: &mut Context<Self>) -> impl IntoElement {
        use corpora_ui::atoms::Reference;
        use corpora_ui::composed::ResearchAnswer;

        let report = |what: &'static str| {
            cx.listener(move |this, _: &ClickEvent, _, cx| {
                this.composed = what.into();
                cx.notify();
            })
        };
        Section::new("Composed: research answer").child(
            h_flex()
                .items_start()
                .gap_6()
                .child(
                    ResearchAnswer::new("answer-wrath")
                        .detail("Answered from 3 passages · 0.8 s")
                        .child(
                            "The poem opens on the wrath of Achilles, not on the war: \
                             its first word names the anger that the rest of the book follows.",
                        )
                        .source(
                            Reference::new("answer-source", "Iliad · Homer corpus")
                                .preview("μῆνιν ἄειδε, θεά, Πηληϊάδεω Ἀχιλῆος"),
                        )
                        .date("8th century BCE")
                        .authors("Homer")
                        .on_copy(report("Copied the citation"))
                        .on_share(report("Shared the answer"))
                        .on_add_to_list(report("Added the answer to a list")),
                )
                .child(
                    ResearchAnswer::new("answer-plain")
                        .title("No dated source")
                        .child("Nothing in the corpus dates this reading.")
                        .source("Codex Bezae"),
                ),
        )
    }

    fn render_trees(&self, cx: &mut Context<Self>) -> impl IntoElement {
        use corpora_ui::composed::{Tree, TreeNode, TreeVariant};
        use gpui_kit::assets::IconName as Lucide;

        let books = || {
            [
                TreeNode::new("gospels", "Gospels").children([
                    TreeNode::new("john", "John").badge("21").children([
                        TreeNode::new("john-1", "Chapter 1"),
                        TreeNode::new("john-2", "Chapter 2"),
                    ]),
                    TreeNode::new("luke", "Luke")
                        .badge("24")
                        .children([TreeNode::new("luke-22", "Chapter 22")]),
                ]),
                TreeNode::new("letters", "Letters").children([
                    TreeNode::new("romans", "Romans")
                        .children([TreeNode::new("romans-1", "Chapter 1")]),
                    TreeNode::new("jude", "Jude").disabled(true),
                ]),
            ]
        };
        let rail = || {
            [
                TreeNode::new("rail-read", "Read").icon(Lucide::BookOpen),
                TreeNode::new("rail-search", "Search").icon(Lucide::Search),
                TreeNode::new("rail-settings", "Settings").icon(Lucide::Settings),
            ]
        };
        let pick = || {
            cx.listener(|this, id: &SharedString, _, cx| {
                this.tree_active = id.clone();
                cx.notify();
            })
        };
        let column = |label: &'static str, tree: Tree| {
            v_flex()
                .gap_1()
                .child(
                    div()
                        .text_xs()
                        .text_color(cx.theme().muted_foreground)
                        .child(label),
                )
                .child(tree.active(self.tree_active.clone()).on_navigate(pick()))
        };
        Section::new("Composed: tree").child(
            h_flex()
                .items_start()
                .gap_6()
                .child(
                    column(
                        "Navigation",
                        Tree::new("tree-nav", TreeVariant::Navigation).items(books()),
                    )
                    .w(rems(14.)),
                )
                .child(
                    column(
                        "Contents",
                        Tree::new("tree-toc", TreeVariant::Toc).items(books()),
                    )
                    .w(rems(14.)),
                )
                .child(
                    column(
                        "Files",
                        Tree::new("tree-files", TreeVariant::Files).items(books()),
                    )
                    .w(rems(14.)),
                )
                .child(
                    column(
                        "Rail",
                        Tree::new("tree-rail", TreeVariant::Sidebar).items(rail()),
                    )
                    .w(rems(10.)),
                )
                .child(
                    column(
                        "Folded",
                        Tree::new("tree-folded", TreeVariant::Sidebar)
                            .items(rail())
                            .collapsed(true),
                    )
                    .w(rems(2.5)),
                ),
        )
    }

    fn render_flowchart(&self) -> impl IntoElement {
        use corpora_ui::atoms::Tone;
        use corpora_ui::composed::{FlowEdge, FlowStep, Flowchart};

        Section::new("Composed: flowchart").child(
            div().w(rems(44.)).child(
                Flowchart::new("pipeline")
                    .steps([
                        FlowStep::new("load", 0, "Iliad corpus loaded")
                            .kind("Trigger")
                            .caption("Homer · Greek epic corpus"),
                        FlowStep::new("line", 1, "μῆνιν ἄειδε, θεά")
                            .kind("Text node")
                            .tone(Tone::Warning)
                            .caption("Iliad 1.1 · 18 characters")
                            .x(0.28),
                        FlowStep::new("gloss", 1, "Sing, goddess, the wrath")
                            .kind("Translation")
                            .tone(Tone::Success)
                            .caption("English · Lattimore")
                            .x(0.74)
                            .width(260.),
                    ])
                    .edges([
                        FlowEdge::new("load", "line"),
                        FlowEdge::new("load", "gloss"),
                    ]),
            ),
        )
    }

    fn render_charts(&self) -> impl IntoElement {
        use corpora_ui::composed::{Chart, ChartKind, ChartRow, ChartSeries};

        let series = || {
            [
                ChartSeries::new("greek", "Greek"),
                ChartSeries::new("latin", "Latin"),
            ]
        };
        let centuries = || {
            [
                ChartRow::new("IV", [12., 3.]),
                ChartRow::new("V", [18., 7.]),
                ChartRow::new("VI", [15., 11.]),
                ChartRow::new("VII", [22., 9.]),
                ChartRow::new("VIII", [31., 14.]),
                ChartRow::new("IX", [48., 12.]),
            ]
        };
        // A still snapshot would catch the entrance at its first frame.
        let still = std::env::args().any(|argument| argument == "--snapshot");
        let card = |chart: Chart| div().w(rems(20.)).child(chart.appear(!still));
        Section::new("Composed: charts").child(
            h_flex()
                .flex_wrap()
                .items_start()
                .gap_4()
                .child(card(
                    Chart::new("chart-line", ChartKind::Line)
                        .title("Witnesses by century")
                        .subtitle("Copies that survive")
                        .series(series())
                        .rows(centuries()),
                ))
                .child(card(
                    Chart::new("chart-area", ChartKind::Area)
                        .title("Witnesses by century")
                        .series(series())
                        .rows(centuries())
                        .selected(Some("latin".into())),
                ))
                .child(card(
                    Chart::new("chart-bar", ChartKind::Bar)
                        .title("Greek witnesses")
                        .series(series())
                        .rows(centuries()),
                ))
                .child(card(
                    Chart::new("chart-donut", ChartKind::Donut)
                        .title("Text types")
                        .badge("Share")
                        .series([ChartSeries::new("count", "Witnesses")])
                        .rows([
                            ChartRow::new("Byzantine", [781.]),
                            ChartRow::new("Alexandrian", [291.]),
                            ChartRow::new("Western", [149.]),
                        ])
                        .center("1,221")
                        .center_label("witnesses"),
                )),
        )
    }

    fn render_composer(&self, cx: &mut Context<Self>) -> impl IntoElement {
        Section::new("Composed: composer").child(
            v_flex()
                .w(rems(34.))
                .gap_2()
                .child(self.composer.clone())
                .child(
                    div()
                        .text_sm()
                        .text_color(cx.theme().muted_foreground)
                        .child(self.composed.clone()),
                ),
        )
    }

    fn render_proposals(&self, cx: &mut Context<Self>) -> impl IntoElement {
        use corpora_ui::atoms::SignalLevel;
        use corpora_ui::composed::{Recommendation, RecommendationOption, RecommendationState};

        let set = |state: RecommendationState| {
            cx.listener(move |this, _: &ClickEvent, _, cx| {
                this.proposal = state;
                cx.notify();
            })
        };
        Section::new("Composed: recommendations").child(
            v_flex()
                .w(rems(28.))
                .gap_2()
                .child(
                    Recommendation::new("rec-base", "Use Codex Bezae as the base text")
                        .description("It carries the longer reading in its first hand, for")
                        .entity("Luke 22", "LK")
                        .lead_time("2 min")
                        .options([
                            RecommendationOption {
                                label: "Codex Sinaiticus".into(),
                                status: Some("Corrected".into()),
                                signal: SignalLevel::Medium,
                            },
                            RecommendationOption {
                                label: "Papyrus 75".into(),
                                status: Some("Omits".into()),
                                signal: SignalLevel::Low,
                            },
                        ])
                        .confidence(SignalLevel::Medium)
                        .state(self.proposal)
                        .on_accept(set(RecommendationState::Accepted))
                        .on_reject(set(RecommendationState::Rejected))
                        .on_undo(set(RecommendationState::Pending)),
                )
                .child(
                    Recommendation::new("rec-running", "Align the Old Latin witnesses")
                        .description("Running against the collation now.")
                        .state(RecommendationState::Running)
                        .collapsed(),
                ),
        )
    }

    fn render_attachments(&self) -> impl IntoElement {
        use corpora_ui::composed::{Attachment, AttachmentKind, Markdown};

        Section::new("Composed: attachments and markdown")
            .child(
                row()
                    .items_start()
                    .gap_4()
                    .child(
                        Attachment::new("att-chip", "bezae-collation.pdf")
                            .meta("PDF · 2.4 MB")
                            .on_remove(|_, _, _| {}),
                    )
                    .child(
                        Attachment::new("att-image", "folio-205v.png")
                            .kind(AttachmentKind::Image)
                            .meta("PNG · 1.1 MB")
                            .thumbnail("images/owl-avatar.png")
                            .on_remove(|_, _, _| {}),
                    )
                    .child(
                        Attachment::new("att-handle", "@grace")
                            .kind(AttachmentKind::Handle {
                                initials: "GH".into(),
                            })
                            .preview(),
                    ),
            )
            .child(
                row()
                    .items_start()
                    .gap_4()
                    .child(
                        Attachment::new("att-quote", "John 1:1")
                            .kind(AttachmentKind::TextSelection {
                                quote: "In the beginning was the Word, and the Word was with \
                                        God, and the Word was God."
                                    .into(),
                            })
                            .preview(),
                    )
                    .child(
                        Attachment::new("att-reply", "Grace Hopper")
                            .kind(AttachmentKind::ChatReply {
                                time: Some("2 min ago".into()),
                                body: "Where does this reading come from?".into(),
                            })
                            .preview(),
                    )
                    .child(
                        Attachment::new("att-audio", "Reading of Luke 22")
                            .kind(AttachmentKind::Audio {
                                duration: Some("0:42".into()),
                                waveform: Vec::new(),
                            })
                            .meta("Voice note")
                            .on_action(|_, _, _| {})
                            .preview(),
                    ),
            )
            .child(
                row()
                    .items_start()
                    .gap_4()
                    .child(
                        Attachment::new("att-link", "Codex Bezae Cantabrigiensis")
                            .kind(AttachmentKind::Link {
                                domain: "cudl.lib.cam.ac.uk".into(),
                                description: Some(
                                    "A bilingual Greek and Latin codex of the Gospels and Acts."
                                        .into(),
                                ),
                                url: Some("https://cudl.lib.cam.ac.uk".into()),
                            })
                            .preview(),
                    )
                    .child(
                        Attachment::new("att-video", "Imaging session")
                            .kind(AttachmentKind::Video {
                                duration: Some("3:15".into()),
                            })
                            .on_action(|_, _, _| {})
                            .preview(),
                    )
                    .child(
                        div().w(rems(24.)).child(
                            Markdown::new(
                                "notes",
                                "## Collation notes\n\nThe longer reading stands in **Codex \
                                 Bezae** and most of the Old Latin.\n\n- Papyrus 75 omits it\n- \
                                 Sinaiticus marks it with `obeli`\n",
                            )
                            .on_expand(|_, _, _| {}),
                        ),
                    ),
            )
    }

    fn render_reading(&self, cx: &App) -> impl IntoElement {
        use corpora_ui::atoms::{TextPopover, TextSelection, Texture, TextureVariant};
        use corpora_ui::composed::{
            AppliedMark, ApplyToast, NodeSelection, ReaderSelection, SelectionCard,
            SelectionHighlight, Verse, WordSelection,
        };
        use gpui_kit::component::text::TextView;

        let gloss = |text: &'static str| {
            move |_: &mut Window, _: &mut App| Text::new(text).small().into_any_element()
        };
        let passage = v_flex()
            .gap_2()
            .p_6()
            .max_w_128()
            .child(
                Verse::new("john-1-1")
                    .chapter_popover("1:1", gloss("John, chapter 1, verse 1"))
                    .text("In the beginning was ")
                    .span("the Word", |_, _| {
                        SelectionCard::new(
                            "logos",
                            ReaderSelection::Word(WordSelection {
                                lemma: "λόγος".into(),
                                part_of_speech: Some("noun".into()),
                                frequency: Some(330),
                            }),
                        )
                        .on_view_details(|_, _, _| {})
                        .on_add_to_chat(|_, _, _| {})
                        .into_any_element()
                    })
                    .text(", and the Word was with God")
                    .note("a", gloss("Or: face to face with God"))
                    .text(", and the Word was God."),
            )
            .child(
                Verse::new("john-1-2")
                    .chapter("1:2")
                    .text("The same was in the beginning with God."),
            )
            .child(
                Verse::new("john-1-3")
                    .chapter("1:3")
                    .text("All things were made by him; and without him was not ")
                    .span("any thing", gloss("οὐδὲ ἕν: not even one thing"))
                    .text(" made that was made."),
            );

        Section::new("Composed: reading")
            .child(
                row()
                    .items_start()
                    .gap_6()
                    .children(
                        [TextureVariant::Fabric, TextureVariant::Paper].map(|variant| {
                            div()
                                .w(rems(14.))
                                .h(rems(8.))
                                .rounded(Radius::Lg.resolve(cx))
                                .border_1()
                                .border_color(cx.theme().border)
                                .overflow_hidden()
                                .child(Texture::new().with_variant(variant).child(
                                    div().p_4().child(Text::new(match variant {
                                        TextureVariant::Fabric => "Fabric",
                                        TextureVariant::Paper => "Paper",
                                    })),
                                ))
                        }),
                    )
                    .child(
                        TextPopover::new("gloss-logos", "Click for a gloss")
                            .text_sm()
                            .content(gloss("A popover that opens where the text was clicked.")),
                    ),
            )
            .child(
                div()
                    .rounded(Radius::Lg.resolve(cx))
                    .border_1()
                    .border_color(cx.theme().border)
                    .overflow_hidden()
                    .child(
                        Texture::new()
                            .with_variant(TextureVariant::Paper)
                            .child(passage),
                    ),
            )
            .child(
                row()
                    .items_start()
                    .gap_8()
                    .child(
                        div().w(rems(16.)).child(
                            SelectionCard::new(
                                "node-card",
                                ReaderSelection::Node(NodeSelection {
                                    range: "John 1:1–3".into(),
                                    node_ids: vec!["v1".into(), "v2".into(), "v3".into()],
                                    word_count: 52,
                                }),
                            )
                            .on_add_to_chat(|_, _, _| {})
                            .on_close(|_, _, _| {}),
                        ),
                    )
                    .child(
                        v_flex()
                            .gap_3()
                            .pl_4()
                            .child(SelectionHighlight::new().child("the Word was with God"))
                            .child(AppliedMark::new().child("and the Word was God"))
                            .child(
                                div()
                                    .w(rems(26.))
                                    .child(ApplyToast::new("apply-toast").on_undo(|_, _, _| {})),
                            ),
                    ),
            )
            .child(
                TextSelection::new("selection-demo")
                    .child(
                        div().max_w_128().child(
                            TextView::markdown(
                                "selection-text",
                                "Select any part of this sentence and a popover opens over \
                                 the selection with what was selected.",
                            )
                            .selectable(true),
                        ),
                    )
                    .popover(|selection, _, _| {
                        Text::new(format!("Selected: {selection}"))
                            .small()
                            .into_any_element()
                    }),
            )
    }

    fn render_text(&self) -> impl IntoElement {
        Section::new("Text")
            .child(Text::heading("Corpora"))
            .child(
                Text::paragraph("Annotated text collections, queried and read in one workspace.")
                    .max_w_96(),
            )
            .child(
                Text::paragraph(
                    "In the beginning was the Word, and the Word was with God, and the Word was God.",
                )
                .serif()
                .text_lg()
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
                .child(self.render_buttons(cx))
                .child(self.render_badges())
                .child(self.render_card())
                .child(self.render_feedback())
                .child(self.render_marks())
                .child(self.render_avatars())
                .child(self.render_chat(cx))
                .child(self.render_fields(cx)),
            Page::Composed => sections
                .child(self.render_people(cx))
                .child(self.render_conversation(cx))
                .child(self.render_reading(cx))
                .child(self.render_data())
                .child(self.render_attachments())
                .child(self.render_proposals(cx))
                .child(self.render_charts())
                .child(self.render_flowchart())
                .child(self.render_research_answer(cx))
                .child(self.render_trees(cx))
                .child(self.render_corpus_navigation(cx))
                .child(self.render_composer(cx))
                .child(self.render_sign_in()),
            Page::Blocks => sections
                .child(self.render_auth(cx))
                .child(self.render_auth_flow(cx))
                .child(self.render_credentials())
                .child(self.render_profile_card(cx))
                .child(self.render_resource_sidebar(cx))
                .child(self.render_ai_panel(cx))
                .child(self.render_corpus_navigator(cx)),
            Page::Glass => sections.child(self.render_glass(cx)),
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
        size: size(px(1400.), px(6250.)),
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
            // Some components measure themselves on their first frame and
            // settle on a later one; draw those frames before the capture.
            // A headless window draws only when asked to.
            for _ in 0..3 {
                cx.update_window(window, |_, window, _| window.refresh())
                    .expect("the gallery window is open");
                cx.capture_screenshot(window)
                    .expect("offscreen rendering must be available");
                cx.run_until_parked();
            }
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
    let mut start = Page::Foundations;
    match args.next().as_deref() {
        Some("--snapshot") => {
            let dir = args.next().expect("usage: gallery --snapshot <dir>");
            snapshot(std::path::Path::new(&dir));
            return;
        }
        // Opens on one page: `gallery --page blocks`.
        Some("--page") => {
            let slug = args.next().expect("usage: gallery --page <slug>");
            start = Page::ALL
                .into_iter()
                .find(|page| page.slug() == slug)
                .expect("no such page");
        }
        _ => {}
    }

    gpui_kit::application()
        .with_assets(corpora_ui::Assets)
        .run(move |cx| {
            corpora_ui::init(cx);
            gpui_kit::open_window(window_options(None), cx, move |window, cx| {
                cx.new(|cx| {
                    let mut gallery = Gallery::new(window, cx);
                    gallery.page = start;
                    gallery
                })
            })
            .expect("failed to open the gallery window");
            cx.activate(true);
        });
}
