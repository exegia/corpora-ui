//! The whole sign-in journey on one surface: `auth-flow-block.tsx`,
//! `auth-flow-atom.ts` and `auth-session-atom.ts`.

use std::rc::Rc;

use gpui_kit::component::v_flex;
use gpui_kit::{
    AnyElement, App, AppContext as _, Context, Entity, EventEmitter, IntoElement,
    ParentElement as _, Render, SharedString, Styled as _, Subscription, Window, div,
};

use super::super::onboarding::{
    OnboardingBlock, OnboardingEvent, OnboardingStep, OnboardingValues,
};
use super::{
    AuthAccent, AuthCard, AuthSuccess, CodeAuthBlock, CodeAuthEvent, CodeChannel,
    ForgotPasswordBlock, ForgotPasswordEvent, LoginBlock, LoginEvent, LogoBuilder, SignupBlock,
    SignupEvent, UpdatePasswordBlock, UpdatePasswordEvent,
};
use crate::atoms::{AvatarUser, Reveal};
use crate::composed::SocialProvider;

/// Which screen an [`AuthFlow`] is showing.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum AuthStep {
    #[default]
    Login,
    Signup,
    VerifyCode,
    ForgotPassword,
    UpdatePassword,
    Onboarding,
    Success,
}

/// An identifier with its middle hidden: "a•••@exegia.app" for an email
/// address, "•••1234" for anything else.
pub fn mask_identifier(identifier: &str) -> String {
    match identifier.find('@') {
        Some(at) if at > 0 => {
            let first: String = identifier.chars().take(1).collect();
            format!("{first}•••{}", &identifier[at..])
        }
        _ => {
            let count = identifier.chars().count();
            if count <= 4 {
                "•••".to_string()
            } else {
                let tail: String = identifier.chars().skip(count - 4).collect();
                format!("•••{tail}")
            }
        }
    }
}

/// The signed-in reader, kept for the whole session.
#[derive(Clone, Debug, Default, PartialEq, Eq)]
pub struct AuthUser {
    pub id: SharedString,
    pub name: SharedString,
    /// The line under the name: a handle, an email address, a role.
    pub username: Option<SharedString>,
    pub email: Option<SharedString>,
    /// An image URL or a file path.
    pub avatar: Option<SharedString>,
}

impl AuthUser {
    pub fn new(id: impl Into<SharedString>, name: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            ..Self::default()
        }
    }

    pub fn username(mut self, username: impl Into<SharedString>) -> Self {
        self.username = Some(username.into());
        self
    }

    pub fn email(mut self, email: impl Into<SharedString>) -> Self {
        self.email = Some(email.into());
        self
    }

    pub fn avatar(mut self, avatar: impl Into<SharedString>) -> Self {
        self.avatar = Some(avatar.into());
        self
    }

    /// The reader as an avatar takes them, for a
    /// [`ProfileCard`](crate::blocks::ProfileCard). The name splits at its
    /// first space.
    pub fn avatar_user(&self) -> AvatarUser {
        let (first, last) = match self.name.trim().split_once(char::is_whitespace) {
            Some((first, last)) => (first, Some(last.trim())),
            None => (self.name.trim(), None),
        };
        AvatarUser {
            first_name: Some(first.to_string().into()),
            last_name: last.map(|last| last.to_string().into()),
            avatar_url: self.avatar.clone(),
            ..AvatarUser::default()
        }
    }
}

/// Whether anyone is signed in. `Unknown` until the app restores or rejects
/// a session at boot.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum SessionStatus {
    #[default]
    Unknown,
    Unauthenticated,
    Authenticated,
}

/// What an [`AuthSession`] tells whoever watches it.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum AuthSessionEvent {
    SignedIn(AuthUser),
    SignedOut,
}

/// Who is signed in, held in one entity the app shares.
///
/// ```ignore
/// let session = cx.new(|_| AuthSession::new());
/// let flow = cx.new(|cx| AuthFlow::new(window, cx).session(&session, cx));
/// ```
#[derive(Default)]
pub struct AuthSession {
    status: SessionStatus,
    user: Option<AuthUser>,
}

impl EventEmitter<AuthSessionEvent> for AuthSession {}

impl AuthSession {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn status(&self) -> SessionStatus {
        self.status
    }

    pub fn user(&self) -> Option<&AuthUser> {
        self.user.as_ref()
    }

    pub fn is_authenticated(&self) -> bool {
        self.status == SessionStatus::Authenticated
    }

    pub fn sign_in(&mut self, user: AuthUser, cx: &mut Context<Self>) {
        self.user = Some(user.clone());
        self.status = SessionStatus::Authenticated;
        cx.emit(AuthSessionEvent::SignedIn(user));
        cx.notify();
    }

    /// Changes the signed-in reader in place. Does nothing signed out.
    pub fn update_user(&mut self, change: impl FnOnce(&mut AuthUser), cx: &mut Context<Self>) {
        if let Some(user) = &mut self.user {
            change(user);
            cx.notify();
        }
    }

    /// What an app calls at boot when no session could be restored.
    pub fn mark_unauthenticated(&mut self, cx: &mut Context<Self>) {
        self.user = None;
        self.status = SessionStatus::Unauthenticated;
        cx.notify();
    }

    /// Signs out. An [`AuthFlow`] attached to this session returns to its
    /// login step.
    pub fn sign_out(&mut self, cx: &mut Context<Self>) {
        self.user = None;
        self.status = SessionStatus::Unauthenticated;
        cx.emit(AuthSessionEvent::SignedOut);
        cx.notify();
    }
}

/// What an [`AuthFlow`] asks of its host.
///
/// Every attempt is answered with one of the flow's directives:
/// [`AuthFlow::complete`], [`AuthFlow::begin_verification`],
/// [`AuthFlow::go_to_step`], [`AuthFlow::succeed`] or [`AuthFlow::fail`].
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum AuthFlowEvent {
    Login {
        email: SharedString,
        password: SharedString,
        remember: bool,
    },
    Signup {
        name: SharedString,
        email: SharedString,
        password: SharedString,
    },
    /// An identity provider chosen on the login or signup step.
    Provider(SocialProvider),
    RequestReset {
        email: SharedString,
    },
    VerifyCode(SharedString),
    /// Send the code again. Needs no answer.
    ResendCode,
    UpdatePassword {
        password: SharedString,
    },
    /// The last onboarding step passed its checks. Carries every step's
    /// values.
    OnboardingComplete(OnboardingValues),
    /// The reader asked to see the terms. Needs no answer.
    Terms,
    /// The flow moved to this step. Needs no answer.
    Step(AuthStep),
}

/// Shows the right auth block for the step the journey is on, with the
/// links between them wired up: login to signup and back, forgot password,
/// back from the code.
///
/// The flow owns the six blocks. Passwords, codes and half-typed fields
/// stay in them; a block is emptied each time the flow arrives at it.
///
/// ```ignore
/// cx.subscribe(&flow, |this, flow, event, cx| match event {
///     AuthFlowEvent::Login { email, password, .. } => {
///         let outcome = this.api.sign_in(email, password);
///         flow.update(cx, |flow, cx| match outcome {
///             Ok(SignIn::NeedsCode) => flow.begin_verification(email.clone(), CodeChannel::Email, cx),
///             Ok(SignIn::Done(user)) => flow.complete(Some(user), cx),
///             Err(error) => flow.fail(error.to_string(), cx),
///         })
///     }
///     _ => {}
/// })
/// .detach();
/// ```
pub struct AuthFlow {
    step: AuthStep,
    identifier: Option<SharedString>,
    channel: CodeChannel,
    login: Entity<LoginBlock>,
    signup: Entity<SignupBlock>,
    code: Entity<CodeAuthBlock>,
    forgot_password: Entity<ForgotPasswordBlock>,
    update_password: Entity<UpdatePasswordBlock>,
    onboarding: Entity<OnboardingBlock>,
    session: Option<Entity<AuthSession>>,
    logo: Option<LogoBuilder>,
    success_title: SharedString,
    success_description: Option<SharedString>,
    /// The step was just arrived at, and its block still holds what the
    /// last visit left in it.
    entered: bool,
    _session: Option<Subscription>,
}

impl EventEmitter<AuthFlowEvent> for AuthFlow {}

impl AuthFlow {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let login = cx.new(|cx| LoginBlock::new(window, cx));
        cx.subscribe(&login, |this, _, event: &LoginEvent, cx| match event {
            LoginEvent::Submit {
                email,
                password,
                remember,
            } => cx.emit(AuthFlowEvent::Login {
                email: email.clone(),
                password: password.clone(),
                remember: *remember,
            }),
            LoginEvent::Provider(provider) => cx.emit(AuthFlowEvent::Provider(*provider)),
            LoginEvent::ForgotPassword => this.go_to_step(AuthStep::ForgotPassword, cx),
            LoginEvent::Signup => this.go_to_step(AuthStep::Signup, cx),
        })
        .detach();

        let signup = cx.new(|cx| SignupBlock::new(window, cx));
        cx.subscribe(&signup, |this, _, event: &SignupEvent, cx| match event {
            SignupEvent::Submit {
                name,
                email,
                password,
            } => cx.emit(AuthFlowEvent::Signup {
                name: name.clone(),
                email: email.clone(),
                password: password.clone(),
            }),
            SignupEvent::Provider(provider) => cx.emit(AuthFlowEvent::Provider(*provider)),
            SignupEvent::Login => this.go_to_step(AuthStep::Login, cx),
            SignupEvent::Terms => cx.emit(AuthFlowEvent::Terms),
        })
        .detach();

        let code = cx.new(|cx| CodeAuthBlock::new(6, window, cx));
        cx.subscribe(&code, |this, _, event: &CodeAuthEvent, cx| match event {
            CodeAuthEvent::Verify(code) => cx.emit(AuthFlowEvent::VerifyCode(code.clone())),
            CodeAuthEvent::Resend => cx.emit(AuthFlowEvent::ResendCode),
            CodeAuthEvent::Back => this.go_to_step(AuthStep::Login, cx),
        })
        .detach();

        let forgot_password = cx.new(|cx| ForgotPasswordBlock::new(window, cx));
        cx.subscribe(
            &forgot_password,
            |this, _, event: &ForgotPasswordEvent, cx| match event {
                ForgotPasswordEvent::Submit { email } => cx.emit(AuthFlowEvent::RequestReset {
                    email: email.clone(),
                }),
                ForgotPasswordEvent::BackToLogin => this.go_to_step(AuthStep::Login, cx),
            },
        )
        .detach();

        let update_password = cx.new(|cx| UpdatePasswordBlock::new(window, cx));
        cx.subscribe(
            &update_password,
            |this, _, event: &UpdatePasswordEvent, cx| match event {
                UpdatePasswordEvent::Submit { password } => {
                    cx.emit(AuthFlowEvent::UpdatePassword {
                        password: password.clone(),
                    })
                }
                UpdatePasswordEvent::Done => this.go_to_step(AuthStep::Login, cx),
            },
        )
        .detach();

        let onboarding = Self::mount_onboarding(Vec::new(), window, cx);

        Self {
            step: AuthStep::Login,
            identifier: None,
            channel: CodeChannel::Email,
            login,
            signup,
            code,
            forgot_password,
            update_password,
            onboarding,
            session: None,
            logo: None,
            success_title: "Welcome".into(),
            success_description: None,
            entered: false,
            _session: None,
        }
    }

    fn mount_onboarding(
        steps: Vec<OnboardingStep>,
        window: &mut Window,
        cx: &mut Context<Self>,
    ) -> Entity<OnboardingBlock> {
        // The flow's success step is the closing screen. The block's own
        // would stack a second check on it.
        let onboarding =
            cx.new(|cx| OnboardingBlock::new(steps, window, cx).show_complete_screen(false));
        cx.subscribe(&onboarding, |_, onboarding, event: &OnboardingEvent, cx| {
            let OnboardingEvent::Step { values, .. } = event else {
                return;
            };
            // Steps before the last save themselves; the last one waits
            // for the host with the whole profile.
            if !onboarding.read(cx).is_last_step() {
                onboarding.update(cx, |onboarding, cx| onboarding.advance(cx));
                return;
            }
            let mut profile = onboarding.read(cx).values().clone();
            for (name, value) in values {
                match profile.iter_mut().find(|(saved, _)| saved == name) {
                    Some(saved) => saved.1 = value.clone(),
                    None => profile.push((name.clone(), value.clone())),
                }
            }
            cx.emit(AuthFlowEvent::OnboardingComplete(profile));
        })
        .detach();
        onboarding
    }

    /// The session a completed attempt signs in. Signing that session out
    /// returns the flow to its login step.
    pub fn session(mut self, session: &Entity<AuthSession>, cx: &mut Context<Self>) -> Self {
        self._session = Some(
            cx.subscribe(session, |this, _, event: &AuthSessionEvent, cx| {
                if matches!(event, AuthSessionEvent::SignedOut) {
                    this.reset(cx);
                }
            }),
        );
        self.session = Some(session.clone());
        self
    }

    /// The identity providers offered on the login and signup steps.
    pub fn providers(
        self,
        providers: impl IntoIterator<Item = SocialProvider>,
        cx: &mut Context<Self>,
    ) -> Self {
        let providers: Vec<SocialProvider> = providers.into_iter().collect();
        self.login
            .update(cx, |login, cx| login.set_providers(providers.clone(), cx));
        self.signup
            .update(cx, |signup, cx| signup.set_providers(providers, cx));
        self
    }

    /// Paints every form's submit button in a brand accent.
    pub fn accent(self, accent: AuthAccent, cx: &mut Context<Self>) -> Self {
        self.set_accent(Some(accent), cx);
        self
    }

    /// Changes the accent of every form's submit button. `None` returns
    /// them to the theme's primary.
    pub fn set_accent(&self, accent: Option<AuthAccent>, cx: &mut Context<Self>) {
        self.login
            .update(cx, |block, cx| block.set_accent(accent, cx));
        self.signup
            .update(cx, |block, cx| block.set_accent(accent, cx));
        self.code
            .update(cx, |block, cx| block.set_accent(accent, cx));
        self.forgot_password
            .update(cx, |block, cx| block.set_accent(accent, cx));
        self.update_password
            .update(cx, |block, cx| block.set_accent(accent, cx));
    }

    /// The brand mark drawn above every step's title.
    pub fn logo<E: IntoElement>(
        mut self,
        logo: impl Fn(&mut Window, &mut App) -> E + 'static,
        cx: &mut Context<Self>,
    ) -> Self {
        let logo: LogoBuilder = Rc::new(move |window, cx| logo(window, cx).into_any_element());
        macro_rules! share {
            ($($block:ident),*) => {$(
                let shared = logo.clone();
                self.$block.update(cx, |block, cx| {
                    block.set_logo(move |window, cx| shared(window, cx), cx)
                });
            )*};
        }
        share!(
            login,
            signup,
            code,
            forgot_password,
            update_password,
            onboarding
        );
        self.logo = Some(logo);
        self
    }

    /// The steps of the onboarding screen. Without any, it asks for a
    /// display name.
    pub fn onboarding_steps(
        mut self,
        steps: impl IntoIterator<Item = OnboardingStep>,
        window: &mut Window,
        cx: &mut Context<Self>,
    ) -> Self {
        self.onboarding = Self::mount_onboarding(steps.into_iter().collect(), window, cx);
        if let Some(logo) = self.logo.clone() {
            self.onboarding.update(cx, |block, cx| {
                block.set_logo(move |window, cx| logo(window, cx), cx)
            });
        }
        self
    }

    /// The title of the closing screen. Defaults to "Welcome".
    pub fn success_title(mut self, title: impl Into<SharedString>) -> Self {
        self.success_title = title.into();
        self
    }

    /// The line under "You're signed in" on the closing screen.
    pub fn success_description(mut self, description: impl Into<SharedString>) -> Self {
        self.success_description = Some(description.into());
        self
    }

    pub fn step(&self) -> AuthStep {
        self.step
    }

    /// The email address or phone number a code was sent to.
    pub fn identifier(&self) -> Option<&SharedString> {
        self.identifier.as_ref()
    }

    /// [`Self::identifier`] with its middle hidden, as the code step shows it.
    pub fn masked_identifier(&self) -> Option<String> {
        self.identifier.as_deref().map(mask_identifier)
    }

    pub fn channel(&self) -> CodeChannel {
        self.channel
    }

    /// The login block, to configure or prefill.
    pub fn login(&self) -> &Entity<LoginBlock> {
        &self.login
    }

    /// The signup block, to configure or prefill.
    pub fn signup(&self) -> &Entity<SignupBlock> {
        &self.signup
    }

    /// The code block, to configure or prefill.
    pub fn code(&self) -> &Entity<CodeAuthBlock> {
        &self.code
    }

    /// The forgot-password block, to configure or prefill.
    pub fn forgot_password(&self) -> &Entity<ForgotPasswordBlock> {
        &self.forgot_password
    }

    /// The update-password block, to configure or prefill.
    pub fn update_password(&self) -> &Entity<UpdatePasswordBlock> {
        &self.update_password
    }

    /// The onboarding block, to configure or prefill.
    pub fn onboarding(&self) -> &Entity<OnboardingBlock> {
        &self.onboarding
    }

    /// Shows a step, with its block emptied. The identifier is kept.
    pub fn go_to_step(&mut self, step: AuthStep, cx: &mut Context<Self>) {
        if self.step != step {
            self.step = step;
            self.entered = true;
            cx.emit(AuthFlowEvent::Step(step));
            cx.notify();
        }
    }

    /// A directive: a code went out. Records where to, and moves to the
    /// code step.
    pub fn begin_verification(
        &mut self,
        identifier: impl Into<SharedString>,
        channel: CodeChannel,
        cx: &mut Context<Self>,
    ) {
        let identifier = identifier.into();
        let masked = mask_identifier(&identifier);
        self.identifier = Some(identifier);
        self.channel = channel;
        self.code.update(cx, |code, cx| {
            code.set_destination(channel, Some(masked.into()), cx)
        });
        if self.step == AuthStep::VerifyCode {
            // Already there: empty the field for the new code.
            self.entered = true;
            cx.notify();
        } else {
            self.go_to_step(AuthStep::VerifyCode, cx);
        }
    }

    /// A directive: the attempt signed someone in. Moves to the closing
    /// screen and, given a user, signs the attached session in.
    pub fn complete(&mut self, user: Option<AuthUser>, cx: &mut Context<Self>) {
        if let (Some(session), Some(user)) = (&self.session, user) {
            session.update(cx, |session, cx| session.sign_in(user, cx));
        }
        self.go_to_step(AuthStep::Success, cx);
    }

    /// A directive: the attempt went through and the flow stays where it
    /// is. The step's block shows its own success, or its next screen.
    pub fn succeed(&mut self, cx: &mut Context<Self>) {
        match self.step {
            AuthStep::Login => self.login.update(cx, |block, cx| block.succeed(cx)),
            AuthStep::Signup => self.signup.update(cx, |block, cx| block.succeed(cx)),
            AuthStep::VerifyCode => self.code.update(cx, |block, cx| block.succeed(cx)),
            AuthStep::ForgotPassword => self
                .forgot_password
                .update(cx, |block, cx| block.succeed(cx)),
            AuthStep::UpdatePassword => self
                .update_password
                .update(cx, |block, cx| block.succeed(cx)),
            AuthStep::Onboarding => self.onboarding.update(cx, |block, cx| block.advance(cx)),
            AuthStep::Success => {}
        }
    }

    /// A directive: the attempt failed. The step's block unlocks and shows
    /// `message`.
    pub fn fail(&mut self, message: impl Into<SharedString>, cx: &mut Context<Self>) {
        let message = message.into();
        match self.step {
            AuthStep::Login => self.login.update(cx, |block, cx| block.fail(message, cx)),
            AuthStep::Signup => self.signup.update(cx, |block, cx| block.fail(message, cx)),
            AuthStep::VerifyCode => self.code.update(cx, |block, cx| block.fail(message, cx)),
            AuthStep::ForgotPassword => self
                .forgot_password
                .update(cx, |block, cx| block.fail(message, cx)),
            AuthStep::UpdatePassword => self
                .update_password
                .update(cx, |block, cx| block.fail(message, cx)),
            AuthStep::Onboarding => self
                .onboarding
                .update(cx, |block, cx| block.fail(message, cx)),
            AuthStep::Success => {}
        }
    }

    /// Back to the login step, with the identifier forgotten.
    pub fn reset(&mut self, cx: &mut Context<Self>) {
        self.identifier = None;
        self.channel = CodeChannel::Email;
        self.code.update(cx, |code, cx| {
            code.set_destination(CodeChannel::Email, None, cx)
        });
        self.entered = true;
        if self.step == AuthStep::Login {
            cx.notify();
        } else {
            self.go_to_step(AuthStep::Login, cx);
        }
    }

    /// Empties the block of the step just arrived at.
    fn freshen(&mut self, window: &mut Window, cx: &mut Context<Self>) {
        match self.step {
            AuthStep::Login => self.login.update(cx, |block, cx| block.reset(window, cx)),
            AuthStep::Signup => self.signup.update(cx, |block, cx| block.reset(window, cx)),
            AuthStep::VerifyCode => self.code.update(cx, |block, cx| block.reset(window, cx)),
            AuthStep::ForgotPassword => self
                .forgot_password
                .update(cx, |block, cx| block.reset(window, cx)),
            AuthStep::UpdatePassword => self
                .update_password
                .update(cx, |block, cx| block.reset(window, cx)),
            AuthStep::Onboarding => self
                .onboarding
                .update(cx, |block, cx| block.reset(window, cx)),
            AuthStep::Success => {}
        }
    }
}

impl Render for AuthFlow {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        if std::mem::take(&mut self.entered) {
            self.freshen(window, cx);
        }
        let mut success = AuthCard::new(self.success_title.clone());
        if let Some(logo) = &self.logo {
            success = success.logo(logo(window, cx));
        }
        let mut signed_in = AuthSuccess::new("You're signed in");
        if let Some(description) = self.success_description.clone() {
            signed_in = signed_in.description(description);
        }
        let screens: [(AuthStep, &'static str, AnyElement); 7] = [
            (
                AuthStep::Login,
                "auth-flow-login",
                self.login.clone().into_any_element(),
            ),
            (
                AuthStep::Signup,
                "auth-flow-signup",
                self.signup.clone().into_any_element(),
            ),
            (
                AuthStep::VerifyCode,
                "auth-flow-code",
                self.code.clone().into_any_element(),
            ),
            (
                AuthStep::ForgotPassword,
                "auth-flow-forgot",
                self.forgot_password.clone().into_any_element(),
            ),
            (
                AuthStep::UpdatePassword,
                "auth-flow-update",
                self.update_password.clone().into_any_element(),
            ),
            (
                AuthStep::Onboarding,
                "auth-flow-onboarding",
                self.onboarding.clone().into_any_element(),
            ),
            (
                AuthStep::Success,
                "auth-flow-success",
                success.child(signed_in).into_any_element(),
            ),
        ];
        // One screen folds away as the next opens, so the card changes
        // height in one move.
        v_flex()
            .w_full()
            .children(screens.into_iter().map(|(step, id, screen)| {
                Reveal::new(id, step == self.step)
                    .child(div().w_full().flex().justify_center().child(screen))
            }))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn an_identifier_keeps_only_its_ends() {
        assert_eq!(mask_identifier("ada@exegia.app"), "a•••@exegia.app");
        assert_eq!(mask_identifier("+44 7700 900123"), "•••0123");
        assert_eq!(mask_identifier("1234"), "•••");
        assert_eq!(mask_identifier("@exegia.app"), "•••.app");
        assert_eq!(mask_identifier("élan@exegia.app"), "é•••@exegia.app");
    }

    #[test]
    fn a_user_splits_into_the_two_names_an_avatar_takes() {
        let user = AuthUser::new("1", "Ada King Lovelace").avatar_user();
        assert_eq!(user.first_name.as_deref(), Some("Ada"));
        assert_eq!(user.last_name.as_deref(), Some("King Lovelace"));
        assert_eq!(AuthUser::new("2", "Hypatia").avatar_user().last_name, None);
    }
}
