//! InputField: `react/src/components/atoms/field.tsx`.

use gpui_kit::base::FocusableExt;
use gpui_kit::component::input::{Input, InputState};
use gpui_kit::component::label::Label;
use gpui_kit::component::{ActiveTheme as _, Sizable, Size, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    App, Entity, InteractiveElement as _, IntoElement, ParentElement as _, RenderOnce,
    SharedString, Styled as _, Window, div,
};

use crate::foundations::AtomSize;

/// A labelled text input with its help or error line.
///
/// The input's text lives in an [`InputState`] the caller owns:
///
/// ```ignore
/// // in `new`: let email = cx.new(|cx| InputState::new(window, cx).placeholder("you@example.com"));
/// InputField::new(&self.email)
///     .label("Email")
///     .description("Used for sign-in only.")
///     .error("Enter a valid email address.")
///     .invalid(!self.email_is_valid)
/// ```
///
/// The error replaces the description while the field is invalid. Sizes run
/// small, medium and large; the larger atom tiers read as large.
#[derive(IntoElement)]
pub struct InputField {
    state: Entity<InputState>,
    label: Option<SharedString>,
    description: Option<SharedString>,
    error: Option<SharedString>,
    invalid: bool,
    disabled: bool,
    size: AtomSize,
}

impl InputField {
    pub fn new(state: &Entity<InputState>) -> Self {
        Self {
            state: state.clone(),
            label: None,
            description: None,
            error: None,
            invalid: false,
            disabled: false,
            size: AtomSize::Md,
        }
    }

    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = Some(label.into());
        self
    }

    /// Help shown under the input while the field is valid.
    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }

    /// What is wrong and how to fix it. Shown only while [`Self::invalid`].
    pub fn error(mut self, error: impl Into<SharedString>) -> Self {
        self.error = Some(error.into());
        self
    }

    pub fn invalid(mut self, invalid: bool) -> Self {
        self.invalid = invalid;
        self
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    pub fn with_atom_size(mut self, size: AtomSize) -> Self {
        self.size = size;
        self
    }
}

impl Sizable for InputField {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = size.into().into();
        self
    }
}

impl RenderOnce for InputField {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let error = self.error.filter(|_| self.invalid);
        let description = self.description.filter(|_| error.is_none());
        let focused = !self.disabled && self.state.read(cx).has_selection_focus(window, cx);

        v_flex()
            // Namespaces the stock label and input, whose own ids repeat
            // from one field to the next.
            .id(("input-field", self.state.entity_id()))
            .gap_1()
            // `w-64` / `w-full` / `w-96`
            .map(|this| match self.size {
                AtomSize::Xs | AtomSize::Sm => this.w_64(),
                AtomSize::Md => this.w_full(),
                AtomSize::Lg | AtomSize::Xl | AtomSize::Xxl => this.w_96(),
            })
            .when_some(self.label, |this, label| {
                this.child(Label::new(label).map(|label| match self.size {
                    AtomSize::Xs | AtomSize::Sm => label.text_xs(),
                    AtomSize::Md => label.text_xs().ml_2p5(),
                    AtomSize::Lg | AtomSize::Xl | AtomSize::Xxl => label.text_sm(),
                }))
            })
            .child(
                Input::new(&self.state)
                    .cleanable(true)
                    // The stock ring is off: focus shows on the border alone.
                    .focus_ring(false)
                    .with_size(Size::from(self.size))
                    .disabled(self.disabled)
                    .when(focused, |input| input.border_color(theme.primary))
                    // An invalid field stays red while it is being fixed.
                    .when(error.is_some(), |input| input.border_color(theme.danger)),
            )
            .when_some(error, |this, error| {
                this.child(div().text_sm().text_color(theme.danger).child(error))
            })
            .when_some(description, |this, description| {
                this.child(
                    div()
                        .text_sm()
                        .text_color(theme.muted_foreground)
                        .child(description),
                )
            })
    }
}
