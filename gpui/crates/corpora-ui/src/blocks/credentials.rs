//! The ways into an account, managed after sign-in:
//! `linked-accounts-block.tsx`, `passkey-manager-block.tsx` and
//! `passkey-sign-in-block.tsx` in `react/src/components/blocks/auth`.
//!
//! Like the sign-in screens, each block emits what the reader asked for and
//! waits. The host answers with `settle` or `fail`, and hands over the new
//! list when it has one.

use std::time::Duration;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::component::input::{InputEvent, InputState};
use gpui_kit::component::{ActiveTheme as _, Icon, Sizable as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    AnyElement, App, Context, Empty, Entity, EventEmitter, FontWeight, IntoElement,
    ParentElement as _, Render, SharedString, Styled as _, Task, Window, div,
};

use super::auth::{AuthError, Fold, text_input};
use crate::atoms::{Button, Card, CardHeader, InputField, Loader};
use crate::composed::SocialProvider;
use crate::foundations::{ActiveCorporaTheme as _, AtomSize, Radius};

/// The longest name a passkey takes, in characters.
pub const PASSKEY_NAME_MAX: usize = 120;

/// How long a row takes to fold away before it is dropped.
const LEAVE: Duration = Duration::from_millis(300);
/// One frame drawn closed, so an arriving row has somewhere to open from.
const ARRIVE: Duration = Duration::from_millis(16);
/// The gap between rows, in rems: `gap_2`.
const ROW_GAP: f32 = 0.5;
/// The gap between the parts of a panel, in rems: `gap_3`.
const PANEL_GAP: f32 = 0.75;

#[derive(Clone, Copy, PartialEq, Eq)]
enum Phase {
    Entering,
    Present,
    Leaving,
}

/// A list whose rows fold in when they arrive and out when they go.
struct Roster<T> {
    rows: Vec<(T, Phase)>,
}

impl<T> Roster<T> {
    fn new(items: Vec<T>) -> Self {
        Self {
            rows: items
                .into_iter()
                .map(|item| (item, Phase::Present))
                .collect(),
        }
    }

    /// The rows the host last handed over, without the ones folding away.
    fn items(&self) -> impl Iterator<Item = &T> {
        self.rows
            .iter()
            .filter(|(_, phase)| *phase != Phase::Leaving)
            .map(|(item, _)| item)
    }

    fn len(&self) -> usize {
        self.items().count()
    }

    /// Takes a new list. Returns whether any row has to move.
    fn set(&mut self, items: Vec<T>, key: impl Fn(&T) -> &SharedString) -> bool {
        let old = std::mem::take(&mut self.rows);
        self.rows = items
            .into_iter()
            .map(|item| {
                let stays = old
                    .iter()
                    .any(|(known, phase)| *phase != Phase::Leaving && key(known) == key(&item));
                (
                    item,
                    if stays {
                        Phase::Present
                    } else {
                        Phase::Entering
                    },
                )
            })
            .collect();
        for (index, (item, _)) in old.into_iter().enumerate() {
            if !self.rows.iter().any(|(kept, _)| key(kept) == key(&item)) {
                let at = index.min(self.rows.len());
                self.rows.insert(at, (item, Phase::Leaving));
            }
        }
        self.rows.iter().any(|(_, phase)| *phase != Phase::Present)
    }

    fn arrive(&mut self) {
        for (_, phase) in &mut self.rows {
            if *phase == Phase::Entering {
                *phase = Phase::Present;
            }
        }
    }

    fn sweep(&mut self) {
        self.rows.retain(|(_, phase)| *phase != Phase::Leaving);
    }
}

/// The spinner row a panel shows while its list is on the way.
fn loading_row(label: &'static str, cx: &App) -> AnyElement {
    h_flex()
        .gap_2()
        .text_sm()
        .text_color(cx.theme().muted_foreground)
        .child(Loader::new().with_atom_size(AtomSize::Xs))
        .child(label)
        .into_any_element()
}

fn note(text: impl Into<SharedString>, cx: &App) -> gpui_kit::Div {
    div()
        .text_sm()
        .text_color(cx.theme().muted_foreground)
        .child(text.into())
}

// ---------------------------------------------------------------------------

/// What a [`PasskeySignInBlock`] asks of its host.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum PasskeySignInEvent {
    /// Answer with `settle` or `fail`.
    SignIn,
}

/// The passkey way in: one button and its error, sized to sit in a login
/// card beside the password form. It draws nothing while passkeys are not
/// available.
pub struct PasskeySignInBlock {
    available: bool,
    label: SharedString,
    fallback_hint: Option<SharedString>,
    loading: bool,
    error: Option<SharedString>,
}

impl EventEmitter<PasskeySignInEvent> for PasskeySignInBlock {}

impl Default for PasskeySignInBlock {
    fn default() -> Self {
        Self::new()
    }
}

impl PasskeySignInBlock {
    pub fn new() -> Self {
        Self {
            available: true,
            label: "Sign in with a passkey".into(),
            fallback_hint: Some("You can still sign in with your other methods below.".into()),
            loading: false,
            error: None,
        }
    }

    /// Whether this device can use a passkey at all.
    pub fn available(mut self, available: bool) -> Self {
        self.available = available;
        self
    }

    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = label.into();
        self
    }

    /// The line under an error that points at the other ways in. `None`
    /// drops it.
    pub fn fallback_hint(mut self, hint: Option<SharedString>) -> Self {
        self.fallback_hint = hint;
        self
    }

    pub fn set_available(&mut self, available: bool, cx: &mut Context<Self>) {
        self.available = available;
        cx.notify();
    }

    pub fn is_loading(&self) -> bool {
        self.loading
    }

    pub fn error(&self) -> Option<&SharedString> {
        self.error.as_ref()
    }

    /// Asks the host for a passkey sign-in. The button does the same.
    pub fn sign_in(&mut self, cx: &mut Context<Self>) {
        if self.loading || !self.available {
            return;
        }
        self.error = None;
        self.loading = true;
        cx.emit(PasskeySignInEvent::SignIn);
        cx.notify();
    }

    /// The host's answer: the attempt is over, signed in or dismissed.
    pub fn settle(&mut self, cx: &mut Context<Self>) {
        self.loading = false;
        cx.notify();
    }

    /// The host's answer: the attempt failed. Shows `message`.
    pub fn fail(&mut self, message: impl Into<SharedString>, cx: &mut Context<Self>) {
        self.error = Some(message.into());
        self.loading = false;
        cx.notify();
    }
}

impl Render for PasskeySignInBlock {
    fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        if !self.available {
            return Empty.into_any_element();
        }
        let hint = self.fallback_hint.clone().filter(|_| self.error.is_some());
        v_flex()
            .w_full()
            .gap_2()
            .child(
                Button::new("passkey-sign-in")
                    .outline()
                    .full_width(true)
                    .icon(Icon::new(LucideIcon::FingerprintPattern))
                    .label(self.label.clone())
                    .loading(self.loading)
                    .disabled(self.loading)
                    .on_click(cx.listener(|this, _, _, cx| this.sign_in(cx))),
            )
            .child(AuthError::new("passkey-sign-in-error", self.error.clone()).gap(ROW_GAP))
            .child(
                Fold::new(
                    "passkey-sign-in-hint",
                    hint.is_some(),
                    div()
                        .text_xs()
                        .text_color(cx.theme().muted_foreground)
                        .child(self.fallback_hint.clone().unwrap_or_default()),
                )
                .gap(ROW_GAP),
            )
            .into_any_element()
    }
}

// ---------------------------------------------------------------------------

/// A sign-in identity attached to an account.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct LinkedIdentity {
    pub id: SharedString,
    pub provider: SocialProvider,
    /// The address the provider knows the reader by.
    pub email: Option<SharedString>,
}

impl LinkedIdentity {
    pub fn new(id: impl Into<SharedString>, provider: SocialProvider) -> Self {
        Self {
            id: id.into(),
            provider,
            email: None,
        }
    }

    pub fn email(mut self, email: impl Into<SharedString>) -> Self {
        self.email = Some(email.into());
        self
    }
}

/// What a [`LinkedAccountsBlock`] asks of its host.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum LinkedAccountsEvent {
    /// Connect this provider. Answer with `settle` or `fail`.
    Link(SocialProvider),
    /// Disconnect the identity with this id. Answer with `settle` or `fail`.
    Unlink(SharedString),
}

/// The identities a reader can sign in with: the connected ones, a button
/// for each of the rest, and a guard on the last way in.
///
/// The last identity cannot be disconnected unless the account has another
/// method, such as a password. Its button is disabled and a line says why,
/// so the reader is never told no after the fact.
pub struct LinkedAccountsBlock {
    title: SharedString,
    description: SharedString,
    identities: Roster<LinkedIdentity>,
    providers: Vec<SocialProvider>,
    loading: bool,
    other_methods: bool,
    error: Option<SharedString>,
    linking: Option<SocialProvider>,
    unlinking: Option<SharedString>,
    motion: Option<Task<()>>,
}

impl EventEmitter<LinkedAccountsEvent> for LinkedAccountsBlock {}

impl Default for LinkedAccountsBlock {
    fn default() -> Self {
        Self::new()
    }
}

impl LinkedAccountsBlock {
    pub fn new() -> Self {
        Self {
            title: "Connected accounts".into(),
            description: "Manage the accounts you can use to sign in.".into(),
            identities: Roster::new(Vec::new()),
            providers: vec![
                SocialProvider::Google,
                SocialProvider::Apple,
                SocialProvider::Github,
            ],
            loading: false,
            other_methods: false,
            error: None,
            linking: None,
            unlinking: None,
            motion: None,
        }
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = title.into();
        self
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = description.into();
        self
    }

    /// The identities connected when the block opens.
    pub fn identities(mut self, identities: impl IntoIterator<Item = LinkedIdentity>) -> Self {
        self.identities = Roster::new(identities.into_iter().collect());
        self
    }

    /// The providers that can be connected. Ones already connected get no
    /// button.
    pub fn providers(mut self, providers: impl IntoIterator<Item = SocialProvider>) -> Self {
        self.providers = providers.into_iter().collect();
        self
    }

    /// Shows a spinner row in place of the list.
    pub fn loading(mut self, loading: bool) -> Self {
        self.loading = loading;
        self
    }

    /// Whether the account has a way in that is not listed here, such as a
    /// password. It lifts the guard on the last identity.
    pub fn has_other_sign_in_methods(mut self, other: bool) -> Self {
        self.other_methods = other;
        self
    }

    /// Replaces the list. Rows that are new fold in; rows that are gone
    /// fold out.
    pub fn set_identities(
        &mut self,
        identities: impl IntoIterator<Item = LinkedIdentity>,
        cx: &mut Context<Self>,
    ) {
        if self
            .identities
            .set(identities.into_iter().collect(), |identity| &identity.id)
        {
            self.motion = Some(cx.spawn(async move |this, cx| {
                cx.background_executor().timer(ARRIVE).await;
                let _ = this.update(cx, |this, cx| {
                    this.identities.arrive();
                    cx.notify();
                });
                cx.background_executor().timer(LEAVE).await;
                let _ = this.update(cx, |this, cx| {
                    this.identities.sweep();
                    cx.notify();
                });
            }));
        }
        cx.notify();
    }

    pub fn set_loading(&mut self, loading: bool, cx: &mut Context<Self>) {
        self.loading = loading;
        cx.notify();
    }

    pub fn set_has_other_sign_in_methods(&mut self, other: bool, cx: &mut Context<Self>) {
        self.other_methods = other;
        cx.notify();
    }

    /// The connected identities, as last handed over.
    pub fn linked(&self) -> impl Iterator<Item = &LinkedIdentity> {
        self.identities.items()
    }

    pub fn error(&self) -> Option<&SharedString> {
        self.error.as_ref()
    }

    /// Whether a connect or a disconnect is waiting on the host.
    pub fn is_busy(&self) -> bool {
        self.linking.is_some() || self.unlinking.is_some()
    }

    /// Whether disconnecting would leave the account with no way in.
    pub fn is_last_method(&self) -> bool {
        !self.other_methods && self.identities.len() <= 1
    }

    /// Asks the host to connect `provider`.
    pub fn link(&mut self, provider: SocialProvider, cx: &mut Context<Self>) {
        if self.is_busy() {
            return;
        }
        self.error = None;
        self.linking = Some(provider);
        cx.emit(LinkedAccountsEvent::Link(provider));
        cx.notify();
    }

    /// Asks the host to disconnect an identity, unless it is the last way in.
    pub fn unlink(&mut self, id: impl Into<SharedString>, cx: &mut Context<Self>) {
        if self.is_busy() || self.is_last_method() {
            return;
        }
        let id = id.into();
        self.error = None;
        self.unlinking = Some(id.clone());
        cx.emit(LinkedAccountsEvent::Unlink(id));
        cx.notify();
    }

    /// The host's answer: the request is over. Follow it with
    /// `set_identities` if the list changed.
    pub fn settle(&mut self, cx: &mut Context<Self>) {
        self.linking = None;
        self.unlinking = None;
        cx.notify();
    }

    /// The host's answer: the request failed. Shows `message`.
    pub fn fail(&mut self, message: impl Into<SharedString>, cx: &mut Context<Self>) {
        self.error = Some(message.into());
        self.settle(cx);
    }
}

impl Render for LinkedAccountsBlock {
    fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let header = CardHeader::new(self.title.clone())
            .icon(Icon::new(LucideIcon::Users))
            .description(self.description.clone());
        if self.loading {
            return Card::new()
                .header(header)
                .content(loading_row("Loading connected accounts…", cx));
        }
        let busy = self.is_busy();
        let last = self.is_last_method();
        let muted = cx.theme().muted_foreground;
        let border = cx.theme().border;
        let radius = Radius::Md.resolve(cx);

        let rows: Vec<AnyElement> = self
            .identities
            .rows
            .iter()
            .map(|(identity, phase)| {
                let label = identity.provider.label();
                let id = identity.id.clone();
                let row = h_flex()
                    .w_full()
                    .justify_between()
                    .gap_3()
                    .px_3()
                    .py_2()
                    .rounded(radius)
                    .border_1()
                    .border_color(border)
                    .child(
                        h_flex()
                            .min_w_0()
                            .gap_2p5()
                            .child(identity.provider.mark())
                            .child(
                                v_flex()
                                    .min_w_0()
                                    .child(
                                        div()
                                            .text_sm()
                                            .font_weight(FontWeight::MEDIUM)
                                            .child(label),
                                    )
                                    .when_some(identity.email.clone(), |this, email| {
                                        this.child(
                                            div()
                                                .max_w_full()
                                                .truncate()
                                                .text_xs()
                                                .text_color(muted)
                                                .child(email),
                                        )
                                    }),
                            ),
                    )
                    .child(
                        div().flex_none().child(
                            Button::new(SharedString::from(format!("linked-unlink-{id}")))
                                .destructive_outline()
                                .small()
                                .label("Disconnect")
                                .tooltip(format!("Disconnect {label}"))
                                .loading(self.unlinking.as_ref() == Some(&id))
                                .disabled(busy || last || *phase == Phase::Leaving)
                                .on_click(cx.listener(move |this, _, _, cx| {
                                    this.unlink(id.clone(), cx);
                                })),
                        ),
                    );
                Fold::new(
                    format!("linked-{}", identity.id),
                    *phase == Phase::Present,
                    row,
                )
                .gap(ROW_GAP)
                .into_any_element()
            })
            .collect();
        let empty = self.identities.len() == 0;

        let connect: Vec<AnyElement> = self
            .providers
            .iter()
            .copied()
            .filter(|provider| {
                !self
                    .identities
                    .items()
                    .any(|identity| identity.provider == *provider)
            })
            .map(|provider| {
                Button::new(SharedString::from(format!(
                    "linked-connect-{}",
                    provider.slug()
                )))
                .outline()
                .full_width(true)
                .start(provider.mark())
                .label(format!("Connect {}", provider.label()))
                .loading(self.linking == Some(provider))
                .disabled(busy)
                .on_click(cx.listener(move |this, _, _, cx| this.link(provider, cx)))
                .into_any_element()
            })
            .collect();

        Card::new().header(header).content(
            v_flex()
                .gap_3()
                .child(AuthError::new("linked-error", self.error.clone()).gap(PANEL_GAP))
                .child(v_flex().gap_2().children(rows))
                .child(
                    Fold::new(
                        "linked-empty",
                        empty,
                        note("No sign-in methods connected yet.", cx),
                    )
                    .gap(PANEL_GAP),
                )
                .child(
                    Fold::new(
                        "linked-last",
                        last && !empty,
                        div().text_xs().text_color(muted).child(
                            "This is your only way to sign in, so it can't be disconnected.",
                        ),
                    )
                    .gap(PANEL_GAP),
                )
                .children(connect),
        )
    }
}

// ---------------------------------------------------------------------------

/// A passkey registered on an account.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Passkey {
    pub id: SharedString,
    /// What the reader called it. Unnamed, it reads "Passkey".
    pub name: Option<SharedString>,
    /// When it was added, already written out for the reader.
    pub created: Option<SharedString>,
    /// When it last signed in, already written out for the reader.
    pub last_used: Option<SharedString>,
}

impl Passkey {
    pub fn new(id: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            name: None,
            created: None,
            last_used: None,
        }
    }

    pub fn name(mut self, name: impl Into<SharedString>) -> Self {
        self.name = Some(name.into());
        self
    }

    pub fn created(mut self, created: impl Into<SharedString>) -> Self {
        self.created = Some(created.into());
        self
    }

    pub fn last_used(mut self, last_used: impl Into<SharedString>) -> Self {
        self.last_used = Some(last_used.into());
        self
    }

    fn display_name(&self) -> SharedString {
        self.name.clone().unwrap_or_else(|| "Passkey".into())
    }

    /// "Added 3 May" and "Last used 9 June", whichever are known.
    fn history(&self) -> Vec<SharedString> {
        [("Added", &self.created), ("Last used", &self.last_used)]
            .into_iter()
            .filter_map(|(verb, when)| Some(format!("{verb} {}", when.as_ref()?).into()))
            .collect()
    }
}

/// What is wrong with a passkey name, if anything.
fn passkey_name_error(name: &str) -> Option<SharedString> {
    let length = name.trim().chars().count();
    (length == 0 || length > PASSKEY_NAME_MAX)
        .then(|| format!("Name must be between 1 and {PASSKEY_NAME_MAX} characters.").into())
}

/// What a [`PasskeyManagerBlock`] asks of its host.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum PasskeyManagerEvent {
    /// Register a passkey on this device. Answer with `settle`, also when
    /// the reader dismissed the system prompt, or with `fail`.
    Register,
    /// Answer with `settle` or `fail`.
    Rename {
        id: SharedString,
        name: SharedString,
    },
    /// The reader confirmed. Answer with `settle` or `fail`.
    Delete(SharedString),
}

#[derive(Clone, PartialEq, Eq)]
enum Pending {
    Register,
    Rename(SharedString),
    Delete(SharedString),
}

/// The passkeys on an account: add one, rename one in place, delete one
/// behind a confirmation.
///
/// Deleting the last passkey is allowed, since it takes away the passkey
/// method and not the account's only way in. The confirmation says so
/// instead of refusing.
pub struct PasskeyManagerBlock {
    title: SharedString,
    description: SharedString,
    passkeys: Roster<Passkey>,
    available: bool,
    loading: bool,
    error: Option<SharedString>,
    pending: Option<Pending>,
    renaming: Option<SharedString>,
    rename: Entity<InputState>,
    rename_error: Option<SharedString>,
    confirming: Option<SharedString>,
    motion: Option<Task<()>>,
}

impl EventEmitter<PasskeyManagerEvent> for PasskeyManagerBlock {}

impl PasskeyManagerBlock {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let rename = text_input("Passkey name", false, window, cx);
        cx.subscribe(&rename, |this, _, event: &InputEvent, cx| match event {
            InputEvent::PressEnter { .. } => this.submit_rename(cx),
            InputEvent::Change => {
                this.rename_error = None;
                cx.notify();
            }
            _ => {}
        })
        .detach();
        Self {
            title: "Passkeys".into(),
            description:
                "Sign in without a password using your device's biometrics or security key.".into(),
            passkeys: Roster::new(Vec::new()),
            available: true,
            loading: false,
            error: None,
            pending: None,
            renaming: None,
            rename,
            rename_error: None,
            confirming: None,
            motion: None,
        }
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = title.into();
        self
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = description.into();
        self
    }

    /// The passkeys registered when the block opens, newest first.
    pub fn passkeys(mut self, passkeys: impl IntoIterator<Item = Passkey>) -> Self {
        self.passkeys = Roster::new(passkeys.into_iter().collect());
        self
    }

    /// Whether this device can register a passkey at all.
    pub fn available(mut self, available: bool) -> Self {
        self.available = available;
        self
    }

    /// Shows a spinner row in place of the list.
    pub fn loading(mut self, loading: bool) -> Self {
        self.loading = loading;
        self
    }

    /// Replaces the list. Rows that are new fold in; rows that are gone
    /// fold out.
    pub fn set_passkeys(
        &mut self,
        passkeys: impl IntoIterator<Item = Passkey>,
        cx: &mut Context<Self>,
    ) {
        if self
            .passkeys
            .set(passkeys.into_iter().collect(), |passkey| &passkey.id)
        {
            self.motion = Some(cx.spawn(async move |this, cx| {
                cx.background_executor().timer(ARRIVE).await;
                let _ = this.update(cx, |this, cx| {
                    this.passkeys.arrive();
                    cx.notify();
                });
                cx.background_executor().timer(LEAVE).await;
                let _ = this.update(cx, |this, cx| {
                    this.passkeys.sweep();
                    cx.notify();
                });
            }));
        }
        cx.notify();
    }

    pub fn set_available(&mut self, available: bool, cx: &mut Context<Self>) {
        self.available = available;
        cx.notify();
    }

    pub fn set_loading(&mut self, loading: bool, cx: &mut Context<Self>) {
        self.loading = loading;
        cx.notify();
    }

    /// The registered passkeys, as last handed over.
    pub fn registered(&self) -> impl Iterator<Item = &Passkey> {
        self.passkeys.items()
    }

    pub fn error(&self) -> Option<&SharedString> {
        self.error.as_ref()
    }

    /// What is wrong with the name being typed, after a save that did not
    /// pass.
    pub fn rename_error(&self) -> Option<&SharedString> {
        self.rename_error.as_ref()
    }

    /// Whether a request is waiting on the host.
    pub fn is_busy(&self) -> bool {
        self.pending.is_some()
    }

    /// The id of the passkey whose name is open for editing.
    pub fn renaming(&self) -> Option<&SharedString> {
        self.renaming.as_ref()
    }

    /// The id of the passkey whose deletion is waiting to be confirmed.
    pub fn confirming(&self) -> Option<&SharedString> {
        self.confirming.as_ref()
    }

    /// The name field, to read or fill.
    pub fn rename_input(&self) -> &Entity<InputState> {
        &self.rename
    }

    fn begin(&mut self, pending: Pending) {
        self.error = None;
        self.pending = Some(pending);
    }

    /// Asks the host to register a passkey.
    pub fn register(&mut self, cx: &mut Context<Self>) {
        if self.is_busy() || !self.available {
            return;
        }
        self.begin(Pending::Register);
        cx.emit(PasskeyManagerEvent::Register);
        cx.notify();
    }

    /// Opens a passkey's name for editing, with the caret in it.
    pub fn start_rename(
        &mut self,
        id: impl Into<SharedString>,
        window: &mut Window,
        cx: &mut Context<Self>,
    ) {
        let id = id.into();
        if self.is_busy() {
            return;
        }
        let Some(name) = self
            .passkeys
            .items()
            .find(|passkey| passkey.id == id)
            .map(|passkey| passkey.name.clone().unwrap_or_default())
        else {
            return;
        };
        self.confirming = None;
        self.renaming = Some(id);
        self.rename_error = None;
        self.rename.update(cx, |input, cx| {
            input.set_value(name, window, cx);
            input.focus(window, cx);
        });
        cx.notify();
    }

    /// Closes the name being edited without saving it.
    pub fn cancel_rename(&mut self, cx: &mut Context<Self>) {
        if !self.is_busy() {
            self.renaming = None;
            self.rename_error = None;
            cx.notify();
        }
    }

    /// Checks the name and, if it passes, sends it. Enter in the field does
    /// the same.
    pub fn submit_rename(&mut self, cx: &mut Context<Self>) {
        let Some(id) = self.renaming.clone().filter(|_| !self.is_busy()) else {
            return;
        };
        let name = self.rename.read(cx).value();
        self.rename_error = passkey_name_error(&name);
        if self.rename_error.is_none() {
            self.begin(Pending::Rename(id.clone()));
            cx.emit(PasskeyManagerEvent::Rename {
                id,
                name: name.trim().to_string().into(),
            });
        }
        cx.notify();
    }

    /// Asks the reader to confirm deleting a passkey.
    pub fn ask_delete(&mut self, id: impl Into<SharedString>, cx: &mut Context<Self>) {
        if !self.is_busy() {
            self.renaming = None;
            self.confirming = Some(id.into());
            cx.notify();
        }
    }

    /// Closes the confirmation and keeps the passkey.
    pub fn cancel_delete(&mut self, cx: &mut Context<Self>) {
        if !self.is_busy() {
            self.confirming = None;
            cx.notify();
        }
    }

    /// Sends the deletion the reader was asked about.
    pub fn confirm_delete(&mut self, cx: &mut Context<Self>) {
        let Some(id) = self.confirming.clone().filter(|_| !self.is_busy()) else {
            return;
        };
        self.begin(Pending::Delete(id.clone()));
        cx.emit(PasskeyManagerEvent::Delete(id));
        cx.notify();
    }

    /// The host's answer: the request is over. Follow it with
    /// `set_passkeys` if the list changed.
    pub fn settle(&mut self, cx: &mut Context<Self>) {
        match self.pending.take() {
            Some(Pending::Rename(_)) => {
                self.renaming = None;
                self.rename_error = None;
            }
            Some(Pending::Delete(id)) => {
                self.confirming = None;
                if self.renaming.as_ref() == Some(&id) {
                    self.renaming = None;
                }
            }
            Some(Pending::Register) | None => {}
        }
        cx.notify();
    }

    /// The host's answer: the request failed. Shows `message`. A name being
    /// edited stays open; a confirmation closes.
    pub fn fail(&mut self, message: impl Into<SharedString>, cx: &mut Context<Self>) {
        if matches!(self.pending.take(), Some(Pending::Delete(_))) {
            self.confirming = None;
        }
        self.error = Some(message.into());
        cx.notify();
    }

    fn render_row(&self, passkey: &Passkey, phase: Phase, cx: &mut Context<Self>) -> AnyElement {
        let muted = cx.theme().muted_foreground;
        let radius = Radius::Md.resolve(cx);
        let busy = self.is_busy();
        let name = passkey.display_name();
        let id = passkey.id.clone();
        let renaming = self.renaming.as_ref() == Some(&id);
        let confirming = self.confirming.as_ref() == Some(&id);
        let saving = self.pending == Some(Pending::Rename(id.clone()));
        let deleting = self.pending == Some(Pending::Delete(id.clone()));
        let last = self.passkeys.len() == 1;
        let leaving = phase == Phase::Leaving;
        let key = |part: &str| SharedString::from(format!("passkey-{part}-{id}"));

        let summary = h_flex()
            .justify_between()
            .gap_3()
            .child(
                h_flex()
                    .min_w_0()
                    .gap_2p5()
                    .child(
                        h_flex()
                            .size_8()
                            .flex_none()
                            .justify_center()
                            .rounded(radius)
                            .bg(cx.theme().muted)
                            .text_color(muted)
                            .child(Icon::new(LucideIcon::KeyRound).small()),
                    )
                    .child(
                        v_flex()
                            .min_w_0()
                            .child(
                                div()
                                    .max_w_full()
                                    .truncate()
                                    .text_sm()
                                    .font_weight(FontWeight::MEDIUM)
                                    .child(name.clone()),
                            )
                            // Wraps between the two dates, never inside one.
                            .child(
                                h_flex()
                                    .flex_wrap()
                                    .gap_x_2()
                                    .text_xs()
                                    .text_color(muted)
                                    .children(
                                        passkey
                                            .history()
                                            .into_iter()
                                            .map(|part| div().whitespace_nowrap().child(part)),
                                    ),
                            ),
                    ),
            )
            .child(
                h_flex()
                    .flex_none()
                    .gap_2()
                    .child(
                        Button::new(key("rename"))
                            .outline()
                            .small()
                            .label("Rename")
                            .tooltip(format!("Rename {name}"))
                            .disabled(busy || leaving)
                            .on_click(cx.listener({
                                let id = id.clone();
                                move |this, _, window, cx| {
                                    this.start_rename(id.clone(), window, cx);
                                }
                            })),
                    )
                    .child(
                        Button::new(key("delete"))
                            .destructive_outline()
                            .small()
                            .label("Delete")
                            .tooltip(format!("Delete {name}"))
                            .disabled(busy || leaving)
                            .on_click(cx.listener({
                                let id = id.clone();
                                move |this, _, _, cx| this.ask_delete(id.clone(), cx)
                            })),
                    ),
            );

        let rename = h_flex()
            .w_full()
            .items_start()
            .gap_2()
            .pt_1()
            .child(
                div().flex_1().min_w_0().child(
                    InputField::new(&self.rename)
                        .disabled(busy)
                        .invalid(self.rename_error.is_some())
                        .when_some(self.rename_error.clone(), |this, error| this.error(error)),
                ),
            )
            .child(
                Button::new(key("save"))
                    .primary()
                    .small()
                    .label("Save")
                    .loading(saving)
                    .disabled(busy)
                    .on_click(cx.listener(|this, _, _, cx| this.submit_rename(cx))),
            )
            .child(
                Button::new(key("cancel"))
                    .ghost()
                    .small()
                    .label("Cancel")
                    .disabled(busy)
                    .on_click(cx.listener(|this, _, _, cx| this.cancel_rename(cx))),
            );

        let confirm = v_flex()
            .w_full()
            .gap_2()
            .p_2()
            .rounded(radius)
            .bg(cx.theme().muted.opacity(0.5))
            .child(div().text_sm().child(format!(
                "Delete “{name}”? It can no longer be used to sign in."
            )))
            .when(last, |this| {
                this.child(
                    div()
                        .text_xs()
                        .text_color(cx.palette().destructive_foreground)
                        .child(
                            "This is your last passkey. After deleting it you won't be able \
                             to sign in with a passkey until you register a new one.",
                        ),
                )
            })
            .child(
                h_flex()
                    .gap_2()
                    .child(
                        Button::new(key("confirm"))
                            .destructive()
                            .small()
                            .label("Delete passkey")
                            .loading(deleting)
                            .disabled(busy)
                            .on_click(cx.listener(|this, _, _, cx| this.confirm_delete(cx))),
                    )
                    .child(
                        Button::new(key("keep"))
                            .ghost()
                            .small()
                            .label("Keep it")
                            .disabled(busy)
                            .on_click(cx.listener(|this, _, _, cx| this.cancel_delete(cx))),
                    ),
            );

        let row = v_flex()
            .w_full()
            .gap_2()
            .px_3()
            .py_2()
            .rounded(radius)
            .border_1()
            .border_color(cx.theme().border)
            .child(summary)
            .child(Fold::new(key("rename-form"), renaming && !leaving, rename).gap(ROW_GAP))
            .child(Fold::new(key("confirm-panel"), confirming && !leaving, confirm).gap(ROW_GAP));
        Fold::new(key("row"), phase == Phase::Present, row)
            .gap(ROW_GAP)
            .into_any_element()
    }
}

impl Render for PasskeyManagerBlock {
    fn render(&mut self, _: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let header = CardHeader::new(self.title.clone())
            .icon(Icon::new(LucideIcon::FingerprintPattern))
            .description(self.description.clone());
        if !self.available {
            return Card::new().header(header).content(note(
                "Passkeys aren't available on this device. You can manage them from a \
                 device that supports passkeys.",
                cx,
            ));
        }
        if self.loading {
            return Card::new()
                .header(header)
                .content(loading_row("Loading passkeys…", cx));
        }
        let busy = self.is_busy();
        let empty = self.passkeys.len() == 0;
        let rows: Vec<AnyElement> = self
            .passkeys
            .rows
            .iter()
            .map(|(passkey, phase)| self.render_row(passkey, *phase, cx))
            .collect();

        Card::new().header(header).content(
            v_flex()
                .gap_3()
                .child(AuthError::new("passkey-error", self.error.clone()).gap(PANEL_GAP))
                .child(v_flex().gap_2().children(rows))
                .child(
                    Fold::new(
                        "passkey-empty",
                        empty,
                        note(
                            "No passkeys registered yet. Add one to sign in without a password.",
                            cx,
                        ),
                    )
                    .gap(PANEL_GAP),
                )
                .child(
                    Button::new("passkey-register")
                        .ghost()
                        .full_width(true)
                        .icon(Icon::new(LucideIcon::Plus))
                        .label("Add passkey")
                        .loading(self.pending == Some(Pending::Register))
                        .disabled(busy)
                        .on_click(cx.listener(|this, _, _, cx| this.register(cx))),
                ),
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ids(roster: &Roster<SharedString>) -> String {
        roster
            .rows
            .iter()
            .map(|(id, phase)| {
                let mark = match phase {
                    Phase::Entering => "+",
                    Phase::Present => "",
                    Phase::Leaving => "-",
                };
                format!("{id}{mark}")
            })
            .collect::<Vec<_>>()
            .join(" ")
    }

    fn list(ids: &[&'static str]) -> Vec<SharedString> {
        ids.iter().copied().map(SharedString::from).collect()
    }

    #[test]
    fn a_roster_keeps_leaving_rows_where_they_stood() {
        let mut roster = Roster::new(list(&["a", "b", "c"]));
        assert!(!roster.set(list(&["a", "b", "c"]), |id| id));

        assert!(roster.set(list(&["a", "c", "d"]), |id| id));
        assert_eq!(ids(&roster), "a b- c d+");
        assert_eq!(roster.len(), 3);

        roster.arrive();
        assert_eq!(ids(&roster), "a b- c d");
        roster.sweep();
        assert_eq!(ids(&roster), "a c d");
    }

    #[test]
    fn a_row_that_returns_while_leaving_comes_back_in() {
        let mut roster = Roster::new(list(&["a", "b"]));
        roster.set(list(&["a"]), |id| id);
        roster.set(list(&["a", "b"]), |id| id);
        assert_eq!(ids(&roster), "a b+");
    }

    #[test]
    fn a_passkey_name_runs_from_one_to_the_limit() {
        assert!(passkey_name_error("  ").is_some());
        assert!(passkey_name_error("MacBook").is_none());
        assert!(passkey_name_error(&"é".repeat(PASSKEY_NAME_MAX)).is_none());
        assert!(passkey_name_error(&"é".repeat(PASSKEY_NAME_MAX + 1)).is_some());
    }

    #[test]
    fn a_passkey_tells_what_it_knows_of_its_history() {
        assert!(Passkey::new("1").history().is_empty());
        assert_eq!(
            Passkey::new("1").last_used("9 June").history(),
            ["Last used 9 June"]
        );
        assert_eq!(
            Passkey::new("1")
                .created("3 May")
                .last_used("9 June")
                .history(),
            ["Added 3 May", "Last used 9 June"]
        );
    }
}
