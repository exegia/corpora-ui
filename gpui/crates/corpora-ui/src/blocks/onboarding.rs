//! Profile onboarding: `react/src/components/blocks/auth/onboarding-block.tsx`.

use std::collections::HashMap;
use std::rc::Rc;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::component::button::{Button as StockButton, ButtonRounded};
use gpui_kit::component::checkbox::Checkbox;
use gpui_kit::component::input::{InputEvent, InputState, Textarea, TextareaState};
use gpui_kit::component::label::Label;
use gpui_kit::component::menu::{DropdownMenu as _, PopupMenuItem};
use gpui_kit::component::{ActiveTheme as _, Disableable as _, Icon, Sizable as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    AnyElement, App, AppContext as _, Context, Empty, Entity, EventEmitter, IntoElement,
    ParentElement as _, Render, SharedString, Styled as _, WeakEntity, Window, div, px,
};

use super::auth::{AuthCard, AuthError, AuthStatus, AuthSuccess, LogoBuilder, submit, text_input};
use crate::atoms::{Button, InputField};
use crate::foundations::Radius;

type Validator = Rc<dyn Fn(&str) -> Option<SharedString>>;

/// What a field holds: text, or a ticked box.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum OnboardingValue {
    Text(SharedString),
    Flag(bool),
}

impl OnboardingValue {
    pub fn as_text(&self) -> Option<&str> {
        match self {
            Self::Text(text) => Some(text),
            Self::Flag(_) => None,
        }
    }

    pub fn as_flag(&self) -> Option<bool> {
        match self {
            Self::Flag(flag) => Some(*flag),
            Self::Text(_) => None,
        }
    }
}

/// Field names with what they hold, in the order the fields were declared.
pub type OnboardingValues = Vec<(SharedString, OnboardingValue)>;

/// The control a field is drawn as.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum OnboardingFieldKind {
    Text,
    Textarea,
    /// Text that has to parse as a URL with a scheme.
    Url,
    Checkbox,
    /// One of the listed `(value, label)` options.
    Select(Vec<(SharedString, SharedString)>),
}

/// One declared field of an onboarding step.
#[derive(Clone)]
pub struct OnboardingField {
    name: SharedString,
    label: SharedString,
    kind: OnboardingFieldKind,
    placeholder: Option<SharedString>,
    required: bool,
    validate: Option<Validator>,
}

impl OnboardingField {
    fn new(
        name: impl Into<SharedString>,
        label: impl Into<SharedString>,
        kind: OnboardingFieldKind,
    ) -> Self {
        Self {
            name: name.into(),
            label: label.into(),
            kind,
            placeholder: None,
            required: false,
            validate: None,
        }
    }

    pub fn text(name: impl Into<SharedString>, label: impl Into<SharedString>) -> Self {
        Self::new(name, label, OnboardingFieldKind::Text)
    }

    pub fn textarea(name: impl Into<SharedString>, label: impl Into<SharedString>) -> Self {
        Self::new(name, label, OnboardingFieldKind::Textarea)
    }

    pub fn url(name: impl Into<SharedString>, label: impl Into<SharedString>) -> Self {
        Self::new(name, label, OnboardingFieldKind::Url)
    }

    pub fn checkbox(name: impl Into<SharedString>, label: impl Into<SharedString>) -> Self {
        Self::new(name, label, OnboardingFieldKind::Checkbox)
    }

    /// A choice among `(value, label)` options.
    pub fn select<V: Into<SharedString>, L: Into<SharedString>>(
        name: impl Into<SharedString>,
        label: impl Into<SharedString>,
        options: impl IntoIterator<Item = (V, L)>,
    ) -> Self {
        let options = options
            .into_iter()
            .map(|(value, label)| (value.into(), label.into()))
            .collect();
        Self::new(name, label, OnboardingFieldKind::Select(options))
    }

    pub fn placeholder(mut self, placeholder: impl Into<SharedString>) -> Self {
        self.placeholder = Some(placeholder.into());
        self
    }

    /// The step does not submit while this field is empty or unticked.
    pub fn required(mut self) -> Self {
        self.required = true;
        self
    }

    /// A further check on the trimmed text, run after the built-in ones.
    /// Return what is wrong, or `None`.
    pub fn validate(mut self, validate: impl Fn(&str) -> Option<SharedString> + 'static) -> Self {
        self.validate = Some(Rc::new(validate));
        self
    }

    pub fn name(&self) -> &SharedString {
        &self.name
    }

    pub fn kind(&self) -> &OnboardingFieldKind {
        &self.kind
    }
}

/// One screen of the flow: a title over its fields.
#[derive(Clone)]
pub struct OnboardingStep {
    id: SharedString,
    title: SharedString,
    description: Option<SharedString>,
    fields: Vec<OnboardingField>,
}

impl OnboardingStep {
    pub fn new(id: impl Into<SharedString>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            title: title.into(),
            description: None,
            fields: Vec::new(),
        }
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }

    pub fn field(mut self, field: OnboardingField) -> Self {
        self.fields.push(field);
        self
    }

    pub fn id(&self) -> &SharedString {
        &self.id
    }
}

/// A loose check that text parses as a URL: a scheme, a colon, and
/// something after it, with no spaces.
fn is_url(text: &str) -> bool {
    let Some((scheme, rest)) = text.split_once(':') else {
        return false;
    };
    scheme.starts_with(|first: char| first.is_ascii_alphabetic())
        && scheme
            .chars()
            .all(|c| c.is_ascii_alphanumeric() || matches!(c, '+' | '-' | '.'))
        && !rest.trim_start_matches('/').is_empty()
        && !text.contains(char::is_whitespace)
}

/// What is wrong with `value` for `field`, if anything.
fn validate_field(field: &OnboardingField, value: &OnboardingValue) -> Option<SharedString> {
    let missing = || Some(format!("{} is required", field.label).into());
    let text = match value {
        OnboardingValue::Flag(ticked) => {
            return if field.required && !ticked {
                missing()
            } else {
                None
            };
        }
        OnboardingValue::Text(text) => text.trim(),
    };
    if text.is_empty() {
        return if field.required { missing() } else { None };
    }
    match &field.kind {
        OnboardingFieldKind::Url if !is_url(text) => return Some("Enter a valid URL".into()),
        OnboardingFieldKind::Select(options)
            if !options.iter().any(|(value, _)| value.as_ref() == text) =>
        {
            return Some(format!("Choose a valid option for {}", field.label).into());
        }
        _ => {}
    }
    field.validate.as_ref().and_then(|validate| validate(text))
}

/// The live state behind one field.
enum Control {
    Text(Entity<InputState>),
    Area(Entity<TextareaState>),
    Flag(bool),
    Choice(Option<SharedString>),
}

/// What an [`OnboardingBlock`] asks of its host.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum OnboardingEvent {
    /// A step passed its checks. Answer with `advance` or `fail`.
    Step {
        id: SharedString,
        values: OnboardingValues,
    },
    /// The last step was saved. Carries every step's values.
    Complete(OnboardingValues),
}

/// Profile onboarding in declared steps, picked up once the account exists.
///
/// Each step validates its own fields, emits them, and waits for the host.
/// A reader can go back to any step already reached; what they typed there
/// is still in the fields.
///
/// ```ignore
/// let onboarding = cx.new(|cx| {
///     OnboardingBlock::new(
///         [OnboardingStep::new("profile", "Your profile")
///             .field(OnboardingField::text("display_name", "Display name").required())],
///         window,
///         cx,
///     )
/// });
/// cx.subscribe(&onboarding, |this, onboarding, event, cx| match event {
///     OnboardingEvent::Step { id, values } => this.save(onboarding, id, values, cx),
///     OnboardingEvent::Complete(profile) => this.enter(profile, cx),
/// })
/// .detach();
/// ```
pub struct OnboardingBlock {
    steps: Vec<OnboardingStep>,
    controls: Vec<Vec<Control>>,
    logo: Option<LogoBuilder>,
    index: usize,
    furthest: usize,
    values: OnboardingValues,
    errors: HashMap<SharedString, SharedString>,
    status: AuthStatus,
    error: Option<SharedString>,
    show_complete: bool,
    focus_pending: bool,
}

impl EventEmitter<OnboardingEvent> for OnboardingBlock {}

impl OnboardingBlock {
    /// A flow over `steps`. With none, it asks for a display name.
    pub fn new(
        steps: impl IntoIterator<Item = OnboardingStep>,
        window: &mut Window,
        cx: &mut Context<Self>,
    ) -> Self {
        let mut steps: Vec<OnboardingStep> = steps.into_iter().collect();
        if steps.is_empty() {
            steps = Self::default_steps();
        }
        let controls = steps
            .iter()
            .map(|step| {
                step.fields
                    .iter()
                    .map(|field| Self::control(field, window, cx))
                    .collect()
            })
            .collect();
        Self {
            steps,
            controls,
            logo: None,
            index: 0,
            furthest: 0,
            values: Vec::new(),
            errors: HashMap::new(),
            status: AuthStatus::Idle,
            error: None,
            show_complete: true,
            focus_pending: false,
        }
    }

    /// The flow the block ships with: one step asking for a display name.
    pub fn default_steps() -> Vec<OnboardingStep> {
        vec![
            OnboardingStep::new("profile", "Your profile")
                .field(OnboardingField::text("display_name", "Display name").required()),
        ]
    }

    fn control(field: &OnboardingField, window: &mut Window, cx: &mut Context<Self>) -> Control {
        let name = field.name.clone();
        let placeholder = field.placeholder.clone().unwrap_or_default();
        match &field.kind {
            OnboardingFieldKind::Text | OnboardingFieldKind::Url => {
                let input = text_input("", false, window, cx);
                input.update(cx, |input, cx| {
                    input.set_placeholder(placeholder, window, cx)
                });
                cx.subscribe(&input, move |this, _, event: &InputEvent, cx| match event {
                    InputEvent::PressEnter { .. } => this.submit(cx),
                    InputEvent::Change => this.edited(&name, cx),
                    _ => {}
                })
                .detach();
                Control::Text(input)
            }
            OnboardingFieldKind::Textarea => {
                let area = cx.new(|cx| {
                    TextareaState::new(window, cx)
                        .auto_grow(3, 8)
                        .placeholder(placeholder)
                });
                cx.subscribe(&area, move |this, _, event: &InputEvent, cx| {
                    if matches!(event, InputEvent::Change) {
                        this.edited(&name, cx);
                    }
                })
                .detach();
                Control::Area(area)
            }
            OnboardingFieldKind::Checkbox => Control::Flag(false),
            OnboardingFieldKind::Select(_) => Control::Choice(None),
        }
    }

    /// Drawn above the title.
    pub fn logo<E: IntoElement>(
        mut self,
        logo: impl Fn(&mut Window, &mut App) -> E + 'static,
    ) -> Self {
        self.logo = Some(Rc::new(move |window, cx| {
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
        self.logo = Some(Rc::new(move |window, cx| {
            logo(window, cx).into_any_element()
        }));
        cx.notify();
    }

    /// Whether the block shows its own closing screen. Off, it draws nothing
    /// once the last step is saved.
    pub fn show_complete_screen(mut self, show: bool) -> Self {
        self.show_complete = show;
        self
    }

    pub fn status(&self) -> AuthStatus {
        self.status
    }

    pub fn error(&self) -> Option<&SharedString> {
        self.error.as_ref()
    }

    /// The step on screen, counted from zero.
    pub fn step_index(&self) -> usize {
        self.index
    }

    /// Whether the step on screen is the one that ends the flow.
    pub fn is_last_step(&self) -> bool {
        self.index + 1 >= self.steps.len()
    }

    /// The last step the reader may jump to.
    pub fn furthest_index(&self) -> usize {
        self.furthest
    }

    /// The step on screen.
    pub fn step(&self) -> &OnboardingStep {
        &self.steps[self.index]
    }

    /// What `field` says is wrong, after a submit that did not pass.
    pub fn field_error(&self, field: &str) -> Option<&SharedString> {
        self.errors.get(field)
    }

    /// Everything saved so far, across the steps the host accepted.
    pub fn values(&self) -> &OnboardingValues {
        &self.values
    }

    fn position(&self, name: &str) -> Option<(usize, usize)> {
        self.steps.iter().enumerate().find_map(|(step, declared)| {
            let field = declared
                .fields
                .iter()
                .position(|field| field.name.as_ref() == name)?;
            Some((step, field))
        })
    }

    /// The input behind a text or URL field, to prefill or focus.
    pub fn text_input(&self, field: &str) -> Option<Entity<InputState>> {
        let (step, field) = self.position(field)?;
        match &self.controls[step][field] {
            Control::Text(input) => Some(input.clone()),
            _ => None,
        }
    }

    /// The input behind a textarea field, to prefill or focus.
    pub fn textarea(&self, field: &str) -> Option<Entity<TextareaState>> {
        let (step, field) = self.position(field)?;
        match &self.controls[step][field] {
            Control::Area(area) => Some(area.clone()),
            _ => None,
        }
    }

    /// Ticks or clears a checkbox field.
    pub fn set_flag(&mut self, field: &str, ticked: bool, cx: &mut Context<Self>) {
        if let Some((step, index)) = self.position(field)
            && let Control::Flag(flag) = &mut self.controls[step][index]
        {
            *flag = ticked;
            self.edited(field, cx);
        }
    }

    /// Picks an option of a select field by its value. `None` clears it.
    pub fn choose(&mut self, field: &str, value: Option<SharedString>, cx: &mut Context<Self>) {
        if let Some((step, index)) = self.position(field)
            && let Control::Choice(choice) = &mut self.controls[step][index]
        {
            *choice = value;
            self.edited(field, cx);
        }
    }

    /// A field's error clears as soon as the field is touched; the next
    /// submit checks it again.
    fn edited(&mut self, field: &str, cx: &mut Context<Self>) {
        self.errors.remove(field);
        cx.notify();
    }

    fn read(&self, step: usize, cx: &App) -> OnboardingValues {
        self.steps[step]
            .fields
            .iter()
            .zip(&self.controls[step])
            .map(|(field, control)| {
                let value = match control {
                    Control::Text(input) => {
                        OnboardingValue::Text(input.read(cx).value().trim().to_string().into())
                    }
                    Control::Area(area) => {
                        OnboardingValue::Text(area.read(cx).value().trim().to_string().into())
                    }
                    Control::Flag(flag) => OnboardingValue::Flag(*flag),
                    Control::Choice(choice) => {
                        OnboardingValue::Text(choice.clone().unwrap_or_default())
                    }
                };
                (field.name.clone(), value)
            })
            .collect()
    }

    fn loading(&self) -> bool {
        self.status == AuthStatus::Loading
    }

    /// Shows a step already reached. Further ones stay out of reach until
    /// the steps before them are saved.
    pub fn go_to(&mut self, index: usize, cx: &mut Context<Self>) {
        if self.status != AuthStatus::Idle || index > self.furthest || index == self.index {
            return;
        }
        self.index = index;
        self.error = None;
        self.errors.clear();
        self.focus_pending = true;
        cx.notify();
    }

    /// Shows the step before this one.
    pub fn back(&mut self, cx: &mut Context<Self>) {
        if let Some(index) = self.index.checked_sub(1) {
            self.go_to(index, cx);
        }
    }

    /// Checks the step on screen and, if it passes, sends it. Enter in a
    /// text field does the same.
    pub fn submit(&mut self, cx: &mut Context<Self>) {
        if self.status != AuthStatus::Idle {
            return;
        }
        let values = self.read(self.index, cx);
        self.errors = self.steps[self.index]
            .fields
            .iter()
            .zip(&values)
            .filter_map(|(field, (name, value))| {
                Some((name.clone(), validate_field(field, value)?))
            })
            .collect();
        if self.errors.is_empty() {
            self.error = None;
            self.status = AuthStatus::Loading;
            cx.emit(OnboardingEvent::Step {
                id: self.steps[self.index].id.clone(),
                values,
            });
        }
        cx.notify();
    }

    /// The host's answer to a step: it is saved. Moves to the next step, or
    /// ends the flow after the last.
    pub fn advance(&mut self, cx: &mut Context<Self>) {
        if !self.loading() {
            return;
        }
        for (name, value) in self.read(self.index, cx) {
            match self.values.iter_mut().find(|(saved, _)| *saved == name) {
                Some(saved) => saved.1 = value,
                None => self.values.push((name, value)),
            }
        }
        if self.index + 1 >= self.steps.len() {
            self.status = AuthStatus::Success;
            cx.emit(OnboardingEvent::Complete(self.values.clone()));
        } else {
            self.status = AuthStatus::Idle;
            self.index += 1;
            self.furthest = self.furthest.max(self.index);
            self.focus_pending = true;
        }
        cx.notify();
    }

    /// The host's answer to a step: it was not saved. The step unlocks and
    /// shows `message`.
    pub fn fail(&mut self, message: impl Into<SharedString>, cx: &mut Context<Self>) {
        self.error = Some(message.into());
        self.status = AuthStatus::Idle;
        cx.notify();
    }

    /// Empties every field and returns to the first step.
    pub fn reset(&mut self, window: &mut Window, cx: &mut Context<Self>) {
        for control in self.controls.iter_mut().flatten() {
            match control {
                Control::Text(input) => {
                    input.update(cx, |input, cx| input.set_value("", window, cx))
                }
                Control::Area(area) => area.update(cx, |area, cx| area.set_value("", window, cx)),
                Control::Flag(flag) => *flag = false,
                Control::Choice(choice) => *choice = None,
            }
        }
        self.index = 0;
        self.furthest = 0;
        self.values.clear();
        self.errors.clear();
        self.error = None;
        self.status = AuthStatus::Idle;
        cx.notify();
    }

    /// Puts the caret in the step's first text field after a move.
    fn focus_first(&mut self, window: &mut Window, cx: &mut Context<Self>) {
        match self.controls[self.index]
            .iter()
            .find(|control| matches!(control, Control::Text(_) | Control::Area(_)))
        {
            Some(Control::Text(input)) => input.update(cx, |input, cx| input.focus(window, cx)),
            Some(Control::Area(area)) => area.update(cx, |area, cx| area.focus(window, cx)),
            _ => {}
        }
    }

    /// A button that opens a menu, drawn where a native select would sit.
    fn picker(
        id: SharedString,
        label: SharedString,
        placeholder: bool,
        disabled: bool,
        cx: &App,
    ) -> StockButton {
        let muted = cx.theme().muted_foreground;
        StockButton::new(id)
            .outline()
            .rounded(ButtonRounded::Size(Radius::Lg.resolve(cx)))
            .w_full()
            .justify_between()
            .cursor_pointer()
            .disabled(disabled)
            .child(
                div()
                    .flex_1()
                    .min_w_0()
                    .truncate()
                    .text_left()
                    .when(placeholder, |this| this.text_color(muted))
                    .child(label),
            )
            .child(
                div()
                    .flex_none()
                    .text_color(muted)
                    .child(Icon::new(LucideIcon::ChevronDown).xsmall()),
            )
    }

    fn render_field(
        &self,
        field: &OnboardingField,
        control: &Control,
        busy: bool,
        this: &WeakEntity<Self>,
        cx: &mut Context<Self>,
    ) -> AnyElement {
        let danger = cx.theme().danger;
        let error = self.errors.get(&field.name).cloned();
        let complaint = |error: Option<SharedString>| {
            error.map(|error| div().text_sm().text_color(danger).child(error))
        };
        let id: SharedString =
            format!("onboarding-{}-{}", self.steps[self.index].id, field.name).into();
        match control {
            Control::Text(input) => InputField::new(input)
                .label(field.label.clone())
                .disabled(busy)
                .invalid(error.is_some())
                .when_some(error, |this, error| this.error(error))
                .into_any_element(),
            Control::Area(area) => v_flex()
                .gap_2()
                .child(Label::new(field.label.clone()))
                .child(
                    Textarea::new(area)
                        .disabled(busy)
                        .when(error.is_some(), |this| this.border_color(danger)),
                )
                .children(complaint(error))
                .into_any_element(),
            Control::Flag(ticked) => {
                let name = field.name.clone();
                v_flex()
                    .gap_1p5()
                    .child(
                        Checkbox::new(id)
                            .label(field.label.clone())
                            .checked(*ticked)
                            .disabled(busy)
                            .on_click(cx.listener(move |this, ticked: &bool, _, cx| {
                                this.set_flag(&name, *ticked, cx);
                            })),
                    )
                    .children(complaint(error))
                    .into_any_element()
            }
            Control::Choice(choice) => {
                let OnboardingFieldKind::Select(options) = &field.kind else {
                    return Empty.into_any_element();
                };
                let chosen = options
                    .iter()
                    .find(|(value, _)| Some(value) == choice.as_ref())
                    .map(|(_, label)| label.clone());
                let label = chosen.clone().unwrap_or_else(|| {
                    field
                        .placeholder
                        .clone()
                        .unwrap_or_else(|| "Choose an option".into())
                });
                let options = options.clone();
                let choice = choice.clone();
                let name = field.name.clone();
                let this = this.clone();
                v_flex()
                    .gap_2()
                    .child(Label::new(field.label.clone()))
                    .child(
                        Self::picker(id, label, chosen.is_none(), busy, cx)
                            .when(error.is_some(), |this| this.border_color(danger))
                            .dropdown_menu(move |mut menu, _, _| {
                                menu = menu.min_w(px(176.));
                                for (value, label) in &options {
                                    let this = this.clone();
                                    let name = name.clone();
                                    let picked = value.clone();
                                    menu = menu.item(
                                        PopupMenuItem::new(label.clone())
                                            .checked(Some(value) == choice.as_ref())
                                            .on_click(move |_, _, cx| {
                                                this.update(cx, |this, cx| {
                                                    this.choose(&name, Some(picked.clone()), cx)
                                                })
                                                .ok();
                                            }),
                                    );
                                }
                                menu
                            }),
                    )
                    .children(complaint(error))
                    .into_any_element()
            }
        }
    }
}

impl Render for OnboardingBlock {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let done = self.status == AuthStatus::Success;
        if done && !self.show_complete {
            return Empty.into_any_element();
        }
        if std::mem::take(&mut self.focus_pending) {
            self.focus_first(window, cx);
        }
        let step = &self.steps[self.index];
        let mut card = AuthCard::new(if done {
            SharedString::from("You're all set")
        } else {
            step.title.clone()
        });
        if let Some(description) = step.description.clone().filter(|_| !done) {
            card = card.description(description);
        }
        if let Some(logo) = &self.logo {
            card = card.logo(logo(window, cx));
        }
        if done {
            return card
                .child(
                    AuthSuccess::new("Profile saved")
                        .description("Your account is ready and your profile has been saved."),
                )
                .into_any_element();
        }

        let busy = self.loading();
        let last = self.index + 1 >= self.steps.len();
        let this = cx.entity().downgrade();
        let fields: Vec<AnyElement> = step
            .fields
            .iter()
            .zip(&self.controls[self.index])
            .map(|(field, control)| self.render_field(field, control, busy, &this, cx))
            .collect();

        // One step has nowhere to jump to, so it gets no step menu.
        let steps = (self.steps.len() > 1).then(|| {
            let titles: Vec<SharedString> =
                self.steps.iter().map(|step| step.title.clone()).collect();
            let (index, furthest) = (self.index, self.furthest);
            let label: SharedString =
                format!("{} of {}: {}", index + 1, titles.len(), step.title).into();
            Self::picker("onboarding-step".into(), label, false, busy, cx).dropdown_menu(
                move |mut menu, _, _| {
                    menu = menu.min_w(px(176.));
                    for (position, title) in titles.iter().enumerate() {
                        let this = this.clone();
                        menu = menu.item(
                            PopupMenuItem::new(title.clone())
                                .checked(position == index)
                                .disabled(position > furthest)
                                .on_click(move |_, _, cx| {
                                    this.update(cx, |this, cx| this.go_to(position, cx)).ok();
                                }),
                        );
                    }
                    menu
                },
            )
        });

        card.child(
            v_flex()
                .gap_4()
                .children(steps)
                .child(AuthError::new("onboarding-error", self.error.clone()))
                .children(fields)
                .child(
                    h_flex()
                        .w_full()
                        .gap_2()
                        .when(self.index > 0, |this| {
                            this.child(
                                Button::new("onboarding-back")
                                    .outline()
                                    .label("Back")
                                    .disabled(busy)
                                    .on_click(cx.listener(|this, _, _, cx| this.back(cx))),
                            )
                        })
                        .child(
                            div().flex_1().min_w_0().child(
                                submit(
                                    "onboarding-submit",
                                    if last { "Finish" } else { "Continue" },
                                    busy,
                                )
                                .on_click(cx.listener(|this, _, _, cx| this.submit(cx))),
                            ),
                        ),
                ),
        )
        .into_any_element()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn text(value: &str) -> OnboardingValue {
        OnboardingValue::Text(value.to_string().into())
    }

    #[test]
    fn a_required_field_has_to_hold_something() {
        let name = OnboardingField::text("name", "Display name").required();
        assert_eq!(
            validate_field(&name, &text("  ")).as_deref(),
            Some("Display name is required")
        );
        assert_eq!(validate_field(&name, &text("Ada")), None);

        let terms = OnboardingField::checkbox("terms", "Terms").required();
        assert!(validate_field(&terms, &OnboardingValue::Flag(false)).is_some());
        assert_eq!(validate_field(&terms, &OnboardingValue::Flag(true)), None);

        let optional = OnboardingField::url("site", "Website");
        assert_eq!(validate_field(&optional, &text("")), None);
    }

    #[test]
    fn a_url_needs_a_scheme_and_a_rest() {
        let site = OnboardingField::url("site", "Website");
        for good in ["https://exegia.app", "mailto:ada@exegia.app", "http://a"] {
            assert_eq!(validate_field(&site, &text(good)), None, "{good}");
        }
        for bad in ["exegia.app", "https://", "ht tp://a.b", "://a.b", "1x:abc"] {
            assert_eq!(
                validate_field(&site, &text(bad)).as_deref(),
                Some("Enter a valid URL"),
                "{bad}"
            );
        }
    }

    #[test]
    fn a_select_takes_only_its_options_and_then_the_custom_check() {
        let role = OnboardingField::select("role", "Role", [("scholar", "Scholar")]);
        assert_eq!(validate_field(&role, &text("scholar")), None);
        assert_eq!(
            validate_field(&role, &text("pirate")).as_deref(),
            Some("Choose a valid option for Role")
        );

        let short = OnboardingField::text("handle", "Handle")
            .validate(|text| (text.len() < 3).then(|| "Too short".into()));
        assert_eq!(
            validate_field(&short, &text("ab")).as_deref(),
            Some("Too short")
        );
        assert_eq!(validate_field(&short, &text("abc")), None);
    }
}
