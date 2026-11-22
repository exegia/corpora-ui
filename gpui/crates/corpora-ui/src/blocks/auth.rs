//! Sign-in screens: `react/src/components/blocks/auth`.
//!
//! Each block is an entity that owns its fields. It emits what the user
//! asked for and waits: the host answers with `succeed` or `fail`.

mod flow;

pub use flow::{
    AuthFlow, AuthFlowEvent, AuthSession, AuthSessionEvent, AuthStep, AuthUser, SessionStatus,
    mask_identifier,
};

use std::rc::Rc;
use std::time::Duration;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::base::motion::{Transition, transition};
use gpui_kit::component::checkbox::Checkbox;
use gpui_kit::component::input::{InputEvent, InputState, OtpEvent, OtpInput, OtpState};
use gpui_kit::component::{ActiveTheme as _, Disableable as _, Icon, Sizable as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    AnyElement, App, AppContext as _, Context, Entity, EventEmitter, FontWeight, IntoElement,
    ParentElement, Render, RenderOnce, SharedString, Styled as _, Task, Window, div, rems,
};

use crate::atoms::{Button, Card, InputField, Reveal};
use crate::composed::{
    PASSWORD_REQUIREMENTS, PasswordInput, SocialAction, SocialProvider, SocialProviders,
    password_strength,
};
use crate::foundations::ActiveCorporaTheme as _;
use crate::foundations::motion::{DURATION_FAST, EASE_SMOOTH_OUT};

pub(super) type LogoBuilder = Rc<dyn Fn(&mut Window, &mut App) -> AnyElement>;

/// Where an attempt stands.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum AuthStatus {
    #[default]
    Idle,
    /// Sent to the host; the fields are locked until it answers.
    Loading,
    Success,
}

/// What every block shows around its form.
#[derive(Clone, Default)]
struct Chrome {
    title: SharedString,
    description: SharedString,
    logo: Option<LogoBuilder>,
    status: AuthStatus,
    error: Option<SharedString>,
}

impl Chrome {
    fn new(title: &'static str, description: &'static str) -> Self {
        Self {
            title: title.into(),
            description: description.into(),
            ..Self::default()
        }
    }

    fn begin(&mut self) {
        self.error = None;
        self.status = AuthStatus::Loading;
    }

    fn loading(&self) -> bool {
        self.status == AuthStatus::Loading
    }

    fn card(&self, window: &mut Window, cx: &mut App) -> AuthCard {
        let card = AuthCard::new(self.title.clone()).description(self.description.clone());
        match &self.logo {
            Some(logo) => card.logo(logo(window, cx)),
            None => card,
        }
    }
}

/// The builder methods and host answers every block shares.
macro_rules! auth_block {
    ($block:ident) => {
        impl $block {
            pub fn title(mut self, title: impl Into<SharedString>) -> Self {
                self.chrome.title = title.into();
                self
            }

            pub fn description(mut self, description: impl Into<SharedString>) -> Self {
                self.chrome.description = description.into();
                self
            }

            /// Drawn above the title.
            pub fn logo<E: IntoElement>(
                mut self,
                logo: impl Fn(&mut Window, &mut App) -> E + 'static,
            ) -> Self {
                self.chrome.logo = Some(Rc::new(move |window, cx| {
                    logo(window, cx).into_any_element()
                }));
                self
            }

            /// Replaces what is drawn above the title.
            pub fn set_logo<E: IntoElement>(
                &mut self,
                logo: impl Fn(&mut Window, &mut App) -> E + 'static,
                cx: &mut Context<Self>,
            ) {
                self.chrome.logo = Some(Rc::new(move |window, cx| {
                    logo(window, cx).into_any_element()
                }));
                cx.notify();
            }

            pub fn status(&self) -> AuthStatus {
                self.chrome.status
            }

            pub fn error(&self) -> Option<&SharedString> {
                self.chrome.error.as_ref()
            }

            /// The host's answer to a submit: it went through.
            pub fn succeed(&mut self, cx: &mut Context<Self>) {
                self.chrome.error = None;
                self.chrome.status = AuthStatus::Success;
                self.settle();
                cx.notify();
            }

            /// Empties the fields and returns to the form, for a second use.
            pub fn reset(&mut self, window: &mut Window, cx: &mut Context<Self>) {
                self.chrome.error = None;
                self.chrome.status = AuthStatus::Idle;
                self.settle();
                self.clear(window, cx);
                cx.notify();
            }

            /// The host's answer to a submit: it did not. The form unlocks
            /// and shows `message`.
            pub fn fail(&mut self, message: impl Into<SharedString>, cx: &mut Context<Self>) {
                self.chrome.error = Some(message.into());
                self.chrome.status = AuthStatus::Idle;
                self.settle();
                cx.notify();
            }
        }
    };
}

/// A loose check that text reads as an email address.
pub fn is_email(text: &str) -> bool {
    let text = text.trim();
    let Some((local, domain)) = text.split_once('@') else {
        return false;
    };
    !local.is_empty()
        && !text.contains(char::is_whitespace)
        && !domain.contains('@')
        && domain.split_once('.').is_some_and(|(name, rest)| {
            !name.is_empty() && !rest.is_empty() && !rest.ends_with('.')
        })
}

pub(super) fn text_input(
    placeholder: &'static str,
    masked: bool,
    window: &mut Window,
    cx: &mut App,
) -> Entity<InputState> {
    cx.new(|cx| {
        InputState::new(window, cx)
            .placeholder(placeholder)
            .masked(masked)
    })
}

/// The card every auth block draws itself in: a logo, a title, the form,
/// and a footer line under the card.
#[derive(IntoElement)]
pub struct AuthCard {
    title: SharedString,
    description: Option<SharedString>,
    logo: Option<AnyElement>,
    footer: Option<AnyElement>,
    children: Vec<AnyElement>,
}

impl AuthCard {
    pub fn new(title: impl Into<SharedString>) -> Self {
        Self {
            title: title.into(),
            description: None,
            logo: None,
            footer: None,
            children: Vec::new(),
        }
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }

    pub fn logo(mut self, logo: impl IntoElement) -> Self {
        self.logo = Some(logo.into_any_element());
        self
    }

    pub fn footer(mut self, footer: impl IntoElement) -> Self {
        self.footer = Some(footer.into_any_element());
        self
    }
}

impl ParentElement for AuthCard {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for AuthCard {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let muted = cx.theme().muted_foreground;
        v_flex()
            .w_full()
            .max_w(rems(24.))
            .gap_3()
            .child(
                Card::new().content(
                    v_flex()
                        .gap_5()
                        .child(
                            v_flex()
                                .gap_1()
                                .when_some(self.logo, |this, logo| {
                                    this.child(h_flex().mb_1p5().child(logo))
                                })
                                .child(
                                    div()
                                        .text_lg()
                                        .font_weight(FontWeight::SEMIBOLD)
                                        .child(self.title),
                                )
                                .when_some(self.description, |this, description| {
                                    this.child(div().text_sm().text_color(muted).child(description))
                                }),
                        )
                        .children(self.children),
                ),
            )
            .when_some(self.footer, |this, footer| {
                this.child(
                    h_flex()
                        .justify_center()
                        .gap_1()
                        .text_sm()
                        .text_color(muted)
                        .child(footer),
                )
            })
    }
}

/// A [`Reveal`] for a column with a gap: folded, it gives its gap back, so
/// the rows around it do not stand two gaps apart.
#[derive(IntoElement)]
pub(super) struct Fold {
    id: SharedString,
    open: bool,
    gap: f32,
    child: AnyElement,
}

impl Fold {
    pub(super) fn new(id: impl Into<SharedString>, open: bool, child: impl IntoElement) -> Self {
        Self {
            id: id.into(),
            open,
            gap: 1.,
            child: child.into_any_element(),
        }
    }

    /// The column's gap in rems. Defaults to 1, `gap_4`.
    pub(super) fn gap(mut self, gap: f32) -> Self {
        self.gap = gap;
        self
    }
}

impl RenderOnce for Fold {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let open = transition(
            (self.id.clone(), "fold-gap"),
            if self.open { 1. } else { 0. },
            Transition::new(DURATION_FAST).easing(EASE_SMOOTH_OUT.easing()),
            window,
            cx,
        );
        div()
            .w_full()
            .mt(rems(-self.gap * (1. - open)))
            .child(Reveal::new(self.id, self.open).child(div().w_full().child(self.child)))
    }
}

/// A line of what went wrong, folded away while there is nothing to say.
#[derive(IntoElement)]
pub struct AuthError {
    id: SharedString,
    message: Option<SharedString>,
    gap: f32,
}

impl AuthError {
    pub fn new(id: impl Into<SharedString>, message: Option<SharedString>) -> Self {
        Self {
            id: id.into(),
            message,
            gap: 1.,
        }
    }

    /// The gap, in rems, of the column the line sits in, which it gives
    /// back while folded. Defaults to 1, `gap_4`.
    pub fn gap(mut self, gap: f32) -> Self {
        self.gap = gap;
        self
    }
}

impl RenderOnce for AuthError {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let danger = cx.theme().danger;
        Fold::new(
            self.id,
            self.message.is_some(),
            div()
                .text_sm()
                .text_color(danger)
                .child(self.message.unwrap_or_default()),
        )
        .gap(self.gap)
    }
}

/// The check that ends a flow, over a title and a line of detail.
#[derive(IntoElement)]
pub struct AuthSuccess {
    title: SharedString,
    description: Option<SharedString>,
    children: Vec<AnyElement>,
}

impl AuthSuccess {
    pub fn new(title: impl Into<SharedString>) -> Self {
        Self {
            title: title.into(),
            description: None,
            children: Vec::new(),
        }
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }
}

impl ParentElement for AuthSuccess {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for AuthSuccess {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let success = cx.palette().success;
        let muted = cx.theme().muted_foreground;
        v_flex()
            .items_center()
            .gap_3()
            .py_4()
            .child(
                h_flex()
                    .size_12()
                    .justify_center()
                    .rounded_full()
                    .bg(success.opacity(0.12))
                    .text_color(success)
                    .child(Icon::new(LucideIcon::Check)),
            )
            .child(
                v_flex()
                    .items_center()
                    .gap_1()
                    .child(div().font_weight(FontWeight::MEDIUM).child(self.title))
                    .when_some(self.description, |this, description| {
                        this.child(div().text_sm().text_color(muted).child(description))
                    }),
            )
            .children(self.children)
    }
}

/// A rule with a label in its middle, between two ways to sign in.
#[derive(IntoElement)]
pub struct AuthSeparator {
    label: SharedString,
}

impl AuthSeparator {
    pub fn new(label: impl Into<SharedString>) -> Self {
        Self {
            label: label.into(),
        }
    }
}

impl RenderOnce for AuthSeparator {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let border = cx.theme().border;
        let rule = || div().flex_1().h_px().bg(border);
        h_flex()
            .gap_3()
            .child(rule())
            .child(
                div()
                    .text_xs()
                    .text_color(cx.theme().muted_foreground)
                    .child(self.label.to_uppercase()),
            )
            .child(rule())
    }
}

/// The submit button every form ends with.
pub(super) fn submit(id: &'static str, label: &'static str, loading: bool) -> Button {
    Button::new(id)
        .primary()
        .full_width(true)
        .label(label)
        .loading(loading)
        .disabled(loading)
}

// ---------------------------------------------------------------------------

/// What a [`LoginBlock`] asks of its host.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum LoginEvent {
    /// Answer with `succeed` or `fail`.
    Submit {
        email: SharedString,
        password: SharedString,
        remember: bool,
    },
    /// Answer with `succeed` or `fail`.
    Provider(SocialProvider),
    ForgotPassword,
    Signup,
}

/// Email and password sign-in, with identity providers beside it.
///
/// The password field appears once the email reads as one, and the Login
/// button once both are filled; until then the providers are offered.
///
/// ```ignore
/// let login = cx.new(|cx| LoginBlock::new(window, cx));
/// cx.subscribe(&login, |this, login, event, cx| match event {
///     LoginEvent::Submit { email, password, .. } => this.sign_in(login, email, password, cx),
///     _ => {}
/// })
/// .detach();
/// ```
pub struct LoginBlock {
    chrome: Chrome,
    email: Entity<InputState>,
    password: Entity<InputState>,
    remember: bool,
    providers: Vec<SocialProvider>,
    loading_provider: Option<SocialProvider>,
    show_remember: bool,
    show_forgot: bool,
}

impl EventEmitter<LoginEvent> for LoginBlock {}
auth_block!(LoginBlock);

impl LoginBlock {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let email = text_input("you@example.com", false, window, cx);
        let password = text_input("Enter your password", true, window, cx);
        for input in [&email, &password] {
            cx.subscribe(input, |this, _, event: &InputEvent, cx| match event {
                InputEvent::PressEnter { .. } => this.submit(cx),
                InputEvent::Change => cx.notify(),
                _ => {}
            })
            .detach();
        }
        Self {
            chrome: Chrome::new(
                "Login to your account",
                "Enter your email and password to login",
            ),
            email,
            password,
            remember: false,
            providers: vec![
                SocialProvider::Google,
                SocialProvider::Apple,
                SocialProvider::Github,
            ],
            loading_provider: None,
            show_remember: true,
            show_forgot: true,
        }
    }

    /// The identity providers offered. None hides that half of the card.
    pub fn providers(mut self, providers: impl IntoIterator<Item = SocialProvider>) -> Self {
        self.providers = providers.into_iter().collect();
        self
    }

    /// Replaces the identity providers offered.
    pub fn set_providers(
        &mut self,
        providers: impl IntoIterator<Item = SocialProvider>,
        cx: &mut Context<Self>,
    ) {
        self.providers = providers.into_iter().collect();
        cx.notify();
    }

    pub fn show_remember_me(mut self, show: bool) -> Self {
        self.show_remember = show;
        self
    }

    pub fn show_forgot_password(mut self, show: bool) -> Self {
        self.show_forgot = show;
        self
    }

    /// The email field, to prefill or focus.
    pub fn email_input(&self) -> &Entity<InputState> {
        &self.email
    }

    /// The password field, to prefill or focus.
    pub fn password_input(&self) -> &Entity<InputState> {
        &self.password
    }

    fn clear(&mut self, window: &mut Window, cx: &mut Context<Self>) {
        self.email
            .update(cx, |input, cx| input.set_value("", window, cx));
        self.password
            .update(cx, |input, cx| input.set_value("", window, cx));
        self.remember = false;
    }

    fn settle(&mut self) {
        self.loading_provider = None;
    }

    fn ready(&self, cx: &App) -> bool {
        is_email(&self.email.read(cx).value()) && !self.password.read(cx).value().trim().is_empty()
    }

    fn busy(&self) -> bool {
        self.chrome.loading() || self.loading_provider.is_some()
    }

    /// Sends the form if it is complete. Enter in a field does the same.
    pub fn submit(&mut self, cx: &mut Context<Self>) {
        if self.busy() || !self.ready(cx) {
            return;
        }
        self.chrome.begin();
        cx.emit(LoginEvent::Submit {
            email: self.email.read(cx).value().trim().to_string().into(),
            password: self.password.read(cx).value(),
            remember: self.remember,
        });
        cx.notify();
    }
}

impl Render for LoginBlock {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let card = self.chrome.card(window, cx);
        if self.chrome.status == AuthStatus::Success {
            return card
                .child(AuthSuccess::new("Welcome back").description("You are now logged in."));
        }
        let busy = self.busy();
        let email_valid = is_email(&self.email.read(cx).value());
        let ready = self.ready(cx);
        let remember = self.remember;

        card.footer(
            h_flex().gap_1().child("Don't have an account?").child(
                Button::new("login-signup")
                    .ghost()
                    .xsmall()
                    .label("Sign up")
                    .on_click(cx.listener(|_, _, _, cx| cx.emit(LoginEvent::Signup))),
            ),
        )
        .child(
            v_flex()
                .gap_4()
                .child(InputField::new(&self.email).label("Email").disabled(busy))
                .child(Fold::new(
                    "login-password",
                    email_valid,
                    v_flex()
                        .gap_1p5()
                        .child(
                            div()
                                .text_sm()
                                .font_weight(FontWeight::MEDIUM)
                                .child("Password"),
                        )
                        .child(PasswordInput::new(&self.password).disabled(busy))
                        .when(self.show_forgot, |this| {
                            this.child(
                                h_flex().justify_end().child(
                                    Button::new("login-forgot")
                                        .ghost()
                                        .xsmall()
                                        .label("Forgot password?")
                                        .on_click(cx.listener(|_, _, _, cx| {
                                            cx.emit(LoginEvent::ForgotPassword)
                                        })),
                                ),
                            )
                        }),
                ))
                .when(self.show_remember, |this| {
                    this.child(
                        Checkbox::new("login-remember")
                            .label("Remember me")
                            .checked(remember)
                            .on_click(cx.listener(|this, checked: &bool, _, cx| {
                                this.remember = *checked;
                                cx.notify();
                            })),
                    )
                })
                .child(AuthError::new("login-error", self.chrome.error.clone()))
                .child(Fold::new(
                    "login-submit",
                    ready,
                    submit("login-button", "Login", self.chrome.loading())
                        .on_click(cx.listener(|this, _, _, cx| this.submit(cx))),
                ))
                .when(!self.providers.is_empty(), |this| {
                    this.child(Fold::new(
                        "login-providers",
                        !ready,
                        v_flex()
                            .w_full()
                            .gap_4()
                            .child(AuthSeparator::new("Or continue with"))
                            .child(
                                SocialProviders::new("login-social")
                                    .providers(self.providers.clone())
                                    .action(SocialAction::Login)
                                    .loading(self.loading_provider)
                                    .disabled(self.chrome.loading())
                                    .on_select(cx.listener(|this, provider, _, cx| {
                                        this.chrome.error = None;
                                        this.loading_provider = Some(*provider);
                                        cx.emit(LoginEvent::Provider(*provider));
                                        cx.notify();
                                    })),
                            ),
                    ))
                }),
        )
    }
}

// ---------------------------------------------------------------------------

/// What a [`SignupBlock`] asks of its host.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum SignupEvent {
    /// Answer with `succeed` or `fail`.
    Submit {
        name: SharedString,
        email: SharedString,
        password: SharedString,
    },
    /// Answer with `succeed` or `fail`.
    Provider(SocialProvider),
    Login,
    /// The reader asked to see the terms.
    Terms,
}

/// Account creation: providers first, then name, email and a password the
/// strength meter has to pass.
pub struct SignupBlock {
    chrome: Chrome,
    name: Entity<InputState>,
    email: Entity<InputState>,
    password: Entity<InputState>,
    providers: Vec<SocialProvider>,
    loading_provider: Option<SocialProvider>,
    show_name: bool,
    show_terms: bool,
    terms: bool,
    enforce_strength: bool,
}

impl EventEmitter<SignupEvent> for SignupBlock {}
auth_block!(SignupBlock);

impl SignupBlock {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let name = text_input("Your name", false, window, cx);
        let email = text_input("you@example.com", false, window, cx);
        let password = text_input("Create a password", true, window, cx);
        for input in [&name, &email, &password] {
            cx.subscribe(input, |this, _, event: &InputEvent, cx| match event {
                InputEvent::PressEnter { .. } => this.submit(cx),
                InputEvent::Change => cx.notify(),
                _ => {}
            })
            .detach();
        }
        Self {
            chrome: Chrome::new(
                "Create your account",
                "Start exploring manuscripts in minutes",
            ),
            name,
            email,
            password,
            providers: vec![
                SocialProvider::Google,
                SocialProvider::Apple,
                SocialProvider::Github,
            ],
            loading_provider: None,
            show_name: true,
            show_terms: true,
            terms: false,
            enforce_strength: true,
        }
    }

    pub fn providers(mut self, providers: impl IntoIterator<Item = SocialProvider>) -> Self {
        self.providers = providers.into_iter().collect();
        self
    }

    /// Replaces the identity providers offered.
    pub fn set_providers(
        &mut self,
        providers: impl IntoIterator<Item = SocialProvider>,
        cx: &mut Context<Self>,
    ) {
        self.providers = providers.into_iter().collect();
        cx.notify();
    }

    pub fn show_name_field(mut self, show: bool) -> Self {
        self.show_name = show;
        self
    }

    /// Whether the terms checkbox is shown, and has to be ticked.
    pub fn show_terms(mut self, show: bool) -> Self {
        self.show_terms = show;
        self
    }

    /// Whether the password has to meet every listed requirement.
    pub fn enforce_strong_password(mut self, enforce: bool) -> Self {
        self.enforce_strength = enforce;
        self
    }

    pub fn terms_accepted(&self) -> bool {
        self.terms
    }

    /// The name field, to prefill or focus.
    pub fn name_input(&self) -> &Entity<InputState> {
        &self.name
    }

    /// The email field, to prefill or focus.
    pub fn email_input(&self) -> &Entity<InputState> {
        &self.email
    }

    /// The password field, to prefill or focus.
    pub fn password_input(&self) -> &Entity<InputState> {
        &self.password
    }

    fn clear(&mut self, window: &mut Window, cx: &mut Context<Self>) {
        self.name
            .update(cx, |input, cx| input.set_value("", window, cx));
        self.email
            .update(cx, |input, cx| input.set_value("", window, cx));
        self.password
            .update(cx, |input, cx| input.set_value("", window, cx));
        self.terms = false;
    }

    fn settle(&mut self) {
        self.loading_provider = None;
    }

    fn busy(&self) -> bool {
        self.chrome.loading() || self.loading_provider.is_some()
    }

    fn strong(&self, cx: &App) -> bool {
        !self.enforce_strength
            || password_strength(&self.password.read(cx).value()) == PASSWORD_REQUIREMENTS.len()
    }

    fn ready(&self, cx: &App) -> bool {
        is_email(&self.email.read(cx).value())
            && !self.password.read(cx).value().trim().is_empty()
            && self.strong(cx)
            && (!self.show_terms || self.terms)
    }

    /// Sends the form if it is complete. Enter in a field does the same.
    pub fn submit(&mut self, cx: &mut Context<Self>) {
        if self.busy() || !is_email(&self.email.read(cx).value()) {
            return;
        }
        if !self.strong(cx) {
            self.chrome.error = Some("Please meet all password requirements.".into());
        } else if self.show_terms && !self.terms {
            self.chrome.error = Some("Please accept the terms to continue.".into());
        } else if self.ready(cx) {
            self.chrome.begin();
            cx.emit(SignupEvent::Submit {
                name: self.name.read(cx).value().trim().to_string().into(),
                email: self.email.read(cx).value().trim().to_string().into(),
                password: self.password.read(cx).value(),
            });
        }
        cx.notify();
    }
}

impl Render for SignupBlock {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let card = self.chrome.card(window, cx);
        if self.chrome.status == AuthStatus::Success {
            return card.child(
                AuthSuccess::new("Account created")
                    .description("Check your inbox to confirm your email address."),
            );
        }
        let busy = self.busy();
        let email_valid = is_email(&self.email.read(cx).value());
        let ready = self.ready(cx);
        let terms = self.terms;

        card.footer(
            h_flex().gap_1().child("Already have an account?").child(
                Button::new("signup-login")
                    .ghost()
                    .xsmall()
                    .label("Login")
                    .on_click(cx.listener(|_, _, _, cx| cx.emit(SignupEvent::Login))),
            ),
        )
        .child(
            v_flex()
                .gap_4()
                .when(!self.providers.is_empty(), |this| {
                    this.child(
                        SocialProviders::new("signup-social")
                            .providers(self.providers.clone())
                            .action(SocialAction::Signup)
                            .loading(self.loading_provider)
                            .disabled(self.chrome.loading())
                            .on_select(cx.listener(|this, provider, _, cx| {
                                this.chrome.error = None;
                                this.loading_provider = Some(*provider);
                                cx.emit(SignupEvent::Provider(*provider));
                                cx.notify();
                            })),
                    )
                    .child(AuthSeparator::new("Or with email"))
                })
                .when(self.show_name, |this| {
                    this.child(InputField::new(&self.name).label("Name").disabled(busy))
                })
                .child(InputField::new(&self.email).label("Email").disabled(busy))
                .child(Fold::new(
                    "signup-password",
                    email_valid,
                    v_flex()
                        .gap_1p5()
                        .child(
                            div()
                                .text_sm()
                                .font_weight(FontWeight::MEDIUM)
                                .child("Password"),
                        )
                        .child(
                            PasswordInput::new(&self.password)
                                .show_strength(self.enforce_strength)
                                .disabled(busy),
                        ),
                ))
                .when(self.show_terms, |this| {
                    this.child(
                        h_flex()
                            .gap_1()
                            .child(
                                Checkbox::new("signup-terms")
                                    .label("I agree to the")
                                    .checked(terms)
                                    .on_click(cx.listener(|this, checked: &bool, _, cx| {
                                        this.terms = *checked;
                                        this.chrome.error = None;
                                        cx.notify();
                                    })),
                            )
                            .child(
                                Button::new("signup-terms-open")
                                    .ghost()
                                    .xsmall()
                                    .label("terms")
                                    .on_click(
                                        cx.listener(|_, _, _, cx| cx.emit(SignupEvent::Terms)),
                                    ),
                            ),
                    )
                })
                .child(AuthError::new("signup-error", self.chrome.error.clone()))
                .child(Fold::new(
                    "signup-submit",
                    ready,
                    submit("signup-button", "Create account", self.chrome.loading())
                        .on_click(cx.listener(|this, _, _, cx| this.submit(cx))),
                )),
        )
    }
}

// ---------------------------------------------------------------------------

/// What a [`ForgotPasswordBlock`] asks of its host.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum ForgotPasswordEvent {
    /// Answer with `succeed` or `fail`.
    Submit {
        email: SharedString,
    },
    BackToLogin,
}

/// Asks for the email a reset link goes to.
pub struct ForgotPasswordBlock {
    chrome: Chrome,
    email: Entity<InputState>,
}

impl EventEmitter<ForgotPasswordEvent> for ForgotPasswordBlock {}
auth_block!(ForgotPasswordBlock);

impl ForgotPasswordBlock {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let email = text_input("you@example.com", false, window, cx);
        cx.subscribe(&email, |this, _, event: &InputEvent, cx| match event {
            InputEvent::PressEnter { .. } => this.submit(cx),
            InputEvent::Change => cx.notify(),
            _ => {}
        })
        .detach();
        Self {
            chrome: Chrome::new(
                "Reset your password",
                "Enter your email and we will send you a reset link",
            ),
            email,
        }
    }

    /// The email field, to prefill or focus.
    pub fn email_input(&self) -> &Entity<InputState> {
        &self.email
    }

    fn clear(&mut self, window: &mut Window, cx: &mut Context<Self>) {
        self.email
            .update(cx, |input, cx| input.set_value("", window, cx));
    }

    fn settle(&mut self) {}

    /// Sends the form if it is complete. Enter in a field does the same.
    pub fn submit(&mut self, cx: &mut Context<Self>) {
        let email = self.email.read(cx).value();
        if self.chrome.loading() || !is_email(&email) {
            return;
        }
        self.chrome.begin();
        cx.emit(ForgotPasswordEvent::Submit {
            email: email.trim().to_string().into(),
        });
        cx.notify();
    }
}

impl Render for ForgotPasswordBlock {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let back = Button::new("forgot-back")
            .ghost()
            .xsmall()
            .label("Back to login")
            .on_click(cx.listener(|_, _, _, cx| cx.emit(ForgotPasswordEvent::BackToLogin)));
        let card = self.chrome.card(window, cx).footer(back);
        if self.chrome.status == AuthStatus::Success {
            let email = self.email.read(cx).value();
            return card.child(
                AuthSuccess::new("Check your inbox")
                    .description(format!("We sent a reset link to {}.", email.trim())),
            );
        }
        let loading = self.chrome.loading();
        let valid = is_email(&self.email.read(cx).value());
        card.child(
            v_flex()
                .gap_4()
                .child(
                    InputField::new(&self.email)
                        .label("Email")
                        .disabled(loading),
                )
                .child(AuthError::new("forgot-error", self.chrome.error.clone()))
                .child(
                    submit("forgot-button", "Send reset link", loading)
                        .disabled(loading || !valid)
                        .on_click(cx.listener(|this, _, _, cx| this.submit(cx))),
                ),
        )
    }
}

// ---------------------------------------------------------------------------

/// What an [`UpdatePasswordBlock`] asks of its host.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum UpdatePasswordEvent {
    /// Answer with `succeed` or `fail`.
    Submit { password: SharedString },
    /// The reader left the success screen.
    Done,
}

/// A new password for a signed-in reader, typed twice.
///
/// The confirmation appears once the password is strong enough, and the
/// button once the two match.
pub struct UpdatePasswordBlock {
    chrome: Chrome,
    password: Entity<InputState>,
    confirm: Entity<InputState>,
    min_strength: usize,
}

impl EventEmitter<UpdatePasswordEvent> for UpdatePasswordBlock {}
auth_block!(UpdatePasswordBlock);

impl UpdatePasswordBlock {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let password = text_input("New password", true, window, cx);
        let confirm = text_input("Confirm new password", true, window, cx);
        for input in [&password, &confirm] {
            cx.subscribe(input, |this, _, event: &InputEvent, cx| match event {
                InputEvent::PressEnter { .. } => this.submit(cx),
                InputEvent::Change => cx.notify(),
                _ => {}
            })
            .detach();
        }
        Self {
            chrome: Chrome::new(
                "Update your password",
                "Choose a new password for your account",
            ),
            password,
            confirm,
            min_strength: PASSWORD_REQUIREMENTS.len(),
        }
    }

    /// How many of the listed requirements the password has to meet.
    pub fn min_strength(mut self, min_strength: usize) -> Self {
        self.min_strength = min_strength.min(PASSWORD_REQUIREMENTS.len());
        self
    }

    /// The new password field, to prefill or focus.
    pub fn password_input(&self) -> &Entity<InputState> {
        &self.password
    }

    /// The confirmation field, to prefill or focus.
    pub fn confirm_input(&self) -> &Entity<InputState> {
        &self.confirm
    }

    fn clear(&mut self, window: &mut Window, cx: &mut Context<Self>) {
        self.password
            .update(cx, |input, cx| input.set_value("", window, cx));
        self.confirm
            .update(cx, |input, cx| input.set_value("", window, cx));
    }

    fn settle(&mut self) {}

    fn strong(&self, cx: &App) -> bool {
        password_strength(&self.password.read(cx).value()) >= self.min_strength
    }

    fn matches(&self, cx: &App) -> bool {
        let confirm = self.confirm.read(cx).value();
        !confirm.is_empty() && confirm == self.password.read(cx).value()
    }

    /// Sends the form if it is complete. Enter in a field does the same.
    pub fn submit(&mut self, cx: &mut Context<Self>) {
        if self.chrome.loading() || !self.strong(cx) || !self.matches(cx) {
            return;
        }
        self.chrome.begin();
        cx.emit(UpdatePasswordEvent::Submit {
            password: self.password.read(cx).value(),
        });
        cx.notify();
    }
}

impl Render for UpdatePasswordBlock {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let card = self.chrome.card(window, cx);
        if self.chrome.status == AuthStatus::Success {
            return card.child(
                AuthSuccess::new("Password updated")
                    .description("Your password has been changed successfully.")
                    .child(
                        Button::new("update-done").outline().label("Done").on_click(
                            cx.listener(|_, _, _, cx| cx.emit(UpdatePasswordEvent::Done)),
                        ),
                    ),
            );
        }
        let loading = self.chrome.loading();
        let strong = self.strong(cx);
        let matches = self.matches(cx);
        // Wrong as soon as what is typed stops being the start of the password.
        let mismatch = {
            let confirm = self.confirm.read(cx).value();
            !confirm.is_empty() && !self.password.read(cx).value().starts_with(confirm.as_ref())
        };
        let label =
            |text: &'static str| div().text_sm().font_weight(FontWeight::MEDIUM).child(text);
        card.child(
            v_flex()
                .gap_4()
                .child(
                    v_flex().gap_1p5().child(label("New password")).child(
                        PasswordInput::new(&self.password)
                            .show_strength(true)
                            .disabled(loading),
                    ),
                )
                .child(Fold::new(
                    "update-confirm",
                    strong,
                    v_flex()
                        .gap_1p5()
                        .child(label("Confirm password"))
                        .child(PasswordInput::new(&self.confirm).disabled(loading))
                        .child(
                            AuthError::new(
                                "update-mismatch",
                                mismatch.then(|| "Passwords do not match.".into()),
                            )
                            .gap(0.375),
                        ),
                ))
                .child(AuthError::new("update-error", self.chrome.error.clone()))
                .child(Fold::new(
                    "update-submit",
                    strong && matches,
                    submit("update-button", "Update password", loading)
                        .on_click(cx.listener(|this, _, _, cx| this.submit(cx))),
                )),
        )
    }
}

// ---------------------------------------------------------------------------

/// Where a one-time code was sent.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum CodeChannel {
    #[default]
    Email,
    Sms,
}

/// What a [`CodeAuthBlock`] asks of its host.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum CodeAuthEvent {
    /// Answer with `succeed` or `fail`.
    Verify(SharedString),
    /// Send the code again. The countdown has already restarted.
    Resend,
    Back,
}

/// A one-time code, verified as its last digit is typed.
pub struct CodeAuthBlock {
    chrome: Chrome,
    code: Entity<OtpState>,
    channel: CodeChannel,
    destination: Option<SharedString>,
    length: usize,
    auto_submit: bool,
    resend_seconds: u32,
    remaining: u32,
    countdown: Option<Task<()>>,
}

impl EventEmitter<CodeAuthEvent> for CodeAuthBlock {}
auth_block!(CodeAuthBlock);

impl CodeAuthBlock {
    /// A block for a code of `length` digits.
    pub fn new(length: usize, window: &mut Window, cx: &mut Context<Self>) -> Self {
        let code = cx.new(|cx| OtpState::new(length, window, cx));
        cx.subscribe(&code, |this, _, event: &OtpEvent, cx| match event {
            OtpEvent::Complete if this.auto_submit => this.verify(cx),
            OtpEvent::Change | OtpEvent::Complete => {
                this.chrome.error = None;
                cx.notify();
            }
            _ => {}
        })
        .detach();
        let mut block = Self {
            chrome: Chrome::new("Enter verification code", ""),
            code,
            channel: CodeChannel::Email,
            destination: None,
            length,
            auto_submit: true,
            resend_seconds: 30,
            remaining: 0,
            countdown: None,
        };
        block.restart_countdown(cx);
        block
    }

    pub fn channel(mut self, channel: CodeChannel) -> Self {
        self.channel = channel;
        self
    }

    /// Where the code went, already masked: "a•••@example.com".
    pub fn destination(mut self, destination: impl Into<SharedString>) -> Self {
        self.destination = Some(destination.into());
        self
    }

    /// Says where the next code went: the channel and the masked address.
    pub fn set_destination(
        &mut self,
        channel: CodeChannel,
        destination: Option<SharedString>,
        cx: &mut Context<Self>,
    ) {
        self.channel = channel;
        self.destination = destination;
        cx.notify();
    }

    /// Whether the last digit verifies the code. Off, a Verify button shows.
    pub fn auto_submit(mut self, auto_submit: bool) -> Self {
        self.auto_submit = auto_submit;
        self
    }

    /// How long the reader waits before asking for another code.
    pub fn resend_seconds(mut self, seconds: u32, cx: &mut Context<Self>) -> Self {
        self.resend_seconds = seconds;
        self.restart_countdown(cx);
        self
    }

    /// Seconds left before another code can be asked for.
    pub fn remaining(&self) -> u32 {
        self.remaining
    }

    /// The code field, to prefill or focus.
    pub fn code_input(&self) -> &Entity<OtpState> {
        &self.code
    }

    fn clear(&mut self, window: &mut Window, cx: &mut Context<Self>) {
        self.code
            .update(cx, |code, cx| code.set_value("", window, cx));
        self.restart_countdown(cx);
    }

    fn settle(&mut self) {}

    fn restart_countdown(&mut self, cx: &mut Context<Self>) {
        self.remaining = self.resend_seconds;
        self.countdown = Some(cx.spawn(async move |this, cx| {
            loop {
                cx.background_executor().timer(Duration::from_secs(1)).await;
                let running = this.update(cx, |this, cx| {
                    this.remaining = this.remaining.saturating_sub(1);
                    cx.notify();
                    this.remaining > 0
                });
                if !matches!(running, Ok(true)) {
                    break;
                }
            }
        }));
    }

    /// Sends the code if every digit is in.
    pub fn verify(&mut self, cx: &mut Context<Self>) {
        let code = self.code.read(cx).value().clone();
        if self.chrome.loading() || code.chars().count() != self.length {
            return;
        }
        self.chrome.begin();
        cx.emit(CodeAuthEvent::Verify(code));
        cx.notify();
    }
}

impl Render for CodeAuthBlock {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let (place, icon) = match self.channel {
            CodeChannel::Email => ("email", LucideIcon::Mail),
            CodeChannel::Sms => ("phone", LucideIcon::Smartphone),
        };
        let mut chrome = self.chrome.clone();
        if chrome.description.is_empty() {
            chrome.description = match &self.destination {
                Some(destination) => format!(
                    "We sent a {}-digit code to your {place}, {destination}",
                    self.length
                ),
                None => format!("We sent a {}-digit code to your {place}", self.length),
            }
            .into();
        }
        let card = chrome.card(window, cx);
        if self.chrome.status == AuthStatus::Success {
            return card.child(
                AuthSuccess::new("Verified").description("Your identity has been confirmed."),
            );
        }
        let loading = self.chrome.loading();
        let complete = self.code.read(cx).value().chars().count() == self.length;
        let remaining = self.remaining;
        let muted = cx.theme().muted_foreground;

        card.footer(
            Button::new("code-back")
                .ghost()
                .xsmall()
                .label("Use a different method")
                .on_click(cx.listener(|_, _, _, cx| cx.emit(CodeAuthEvent::Back))),
        )
        .child(
            v_flex()
                .gap_4()
                .items_center()
                .child(
                    h_flex()
                        .size_10()
                        .justify_center()
                        .rounded_full()
                        .bg(cx.theme().muted)
                        .text_color(muted)
                        .child(Icon::new(icon).small()),
                )
                .child(OtpInput::new(&self.code).disabled(loading))
                .child(AuthError::new("code-error", self.chrome.error.clone()))
                .when(!self.auto_submit, |this| {
                    this.child(
                        submit("code-verify", "Verify", loading)
                            .disabled(loading || !complete)
                            .on_click(cx.listener(|this, _, _, cx| this.verify(cx))),
                    )
                })
                .child(
                    h_flex()
                        .gap_1()
                        .text_sm()
                        .text_color(muted)
                        .child("Didn't get a code?")
                        .child(
                            Button::new("code-resend")
                                .ghost()
                                .xsmall()
                                .label(if remaining > 0 {
                                    format!("Resend in {remaining}s")
                                } else {
                                    "Resend code".to_string()
                                })
                                .disabled(loading || remaining > 0)
                                .on_click(cx.listener(|this, _, _, cx| {
                                    this.chrome.error = None;
                                    this.restart_countdown(cx);
                                    cx.emit(CodeAuthEvent::Resend);
                                    cx.notify();
                                })),
                        ),
                ),
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn an_email_needs_a_name_an_at_and_a_dotted_domain() {
        for good in ["ada@exegia.app", " grace.hopper@navy.mil ", "a@b.co"] {
            assert!(is_email(good), "{good}");
        }
        for bad in [
            "",
            "ada",
            "ada@",
            "@exegia.app",
            "ada@exegia",
            "ada@.app",
            "a da@b.co",
            "a@b@c.co",
            "a@b.",
        ] {
            assert!(!is_email(bad), "{bad}");
        }
    }
}
