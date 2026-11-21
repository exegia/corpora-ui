//! PasswordInput: `react/src/components/composed/password-input.tsx`.

use gpui_kit::base::motion::{Transition, transition};
use gpui_kit::component::input::{Input, InputState};
use gpui_kit::component::{ActiveTheme as _, Icon, IconName, Sizable as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    App, Entity, IntoElement, ParentElement as _, RenderOnce, Styled as _, Window, div, relative,
};

use crate::foundations::ActiveCorporaTheme as _;
use crate::foundations::motion::{DURATION_SLOW, EASE_SMOOTH_OUT};

/// One rule a new password is checked against.
#[derive(Clone, Copy, Debug)]
pub struct PasswordRequirement {
    /// The rule as shown to the user.
    pub text: &'static str,
    met: fn(&str) -> bool,
}

impl PasswordRequirement {
    pub fn is_met(&self, password: &str) -> bool {
        (self.met)(password)
    }
}

/// The rules the strength meter counts, in display order.
pub const PASSWORD_REQUIREMENTS: [PasswordRequirement; 4] = [
    PasswordRequirement {
        text: "At least 8 characters",
        met: |password| password.chars().count() >= 8,
    },
    PasswordRequirement {
        text: "At least 1 number",
        met: |password| password.chars().any(|c| c.is_ascii_digit()),
    },
    PasswordRequirement {
        text: "At least 1 lowercase letter",
        met: |password| password.chars().any(|c| c.is_ascii_lowercase()),
    },
    PasswordRequirement {
        text: "At least 1 uppercase letter",
        met: |password| password.chars().any(|c| c.is_ascii_uppercase()),
    },
];

/// How many of [`PASSWORD_REQUIREMENTS`] a password meets, 0 to 4.
pub fn password_strength(password: &str) -> usize {
    PASSWORD_REQUIREMENTS
        .iter()
        .filter(|requirement| requirement.is_met(password))
        .count()
}

/// A password field with a show/hide toggle and an optional strength meter
/// with its checklist.
///
/// The text lives in an [`InputState`] the caller owns. Create it masked:
///
/// ```ignore
/// // in `new`:
/// let password = cx.new(|cx| {
///     InputState::new(window, cx).masked(true).placeholder("Enter your password")
/// });
/// PasswordInput::new(&self.password).show_strength(true)
/// ```
#[derive(IntoElement)]
pub struct PasswordInput {
    state: Entity<InputState>,
    visibility_toggle: bool,
    show_strength: bool,
    disabled: bool,
}

impl PasswordInput {
    pub fn new(state: &Entity<InputState>) -> Self {
        Self {
            state: state.clone(),
            visibility_toggle: true,
            show_strength: false,
            disabled: false,
        }
    }

    /// Whether the field has the show/hide button. On by default.
    pub fn visibility_toggle(mut self, visibility_toggle: bool) -> Self {
        self.visibility_toggle = visibility_toggle;
        self
    }

    /// Shows the strength meter and the requirement checklist. Use it where a
    /// password is being chosen, not where one is being entered.
    pub fn show_strength(mut self, show_strength: bool) -> Self {
        self.show_strength = show_strength;
        self
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }
}

impl RenderOnce for PasswordInput {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let password = self.state.read(cx).value();
        let score = password_strength(&password);
        let fill = transition(
            (("password-strength", self.state.entity_id()), "fill"),
            score as f32 / PASSWORD_REQUIREMENTS.len() as f32,
            Transition::new(DURATION_SLOW).easing(EASE_SMOOTH_OUT.easing()),
            window,
            cx,
        );

        let theme = cx.theme();
        let palette = *cx.palette();
        let input = Input::new(&self.state)
            .when(self.visibility_toggle, |this| this.mask_toggle())
            .disabled(self.disabled);

        v_flex()
            .w_full()
            .gap_3()
            .child(input)
            .when(self.show_strength, |this| {
                let meter = div()
                    .h_1()
                    .w_full()
                    .rounded_full()
                    .overflow_hidden()
                    .bg(theme.border)
                    .when(score > 0, |this| {
                        this.child(
                            div()
                                .h_full()
                                .w(relative(fill))
                                .rounded_full()
                                .bg(palette.strength[score - 1]),
                        )
                    });
                let checklist =
                    v_flex()
                        .gap_1()
                        .children(PASSWORD_REQUIREMENTS.iter().map(|requirement| {
                            let met = requirement.is_met(&password);
                            let (icon, icon_ink, text_ink) = if met {
                                (IconName::Check, palette.success, palette.success_foreground)
                            } else {
                                (
                                    IconName::Close,
                                    theme.muted_foreground.opacity(0.8),
                                    theme.muted_foreground,
                                )
                            };
                            h_flex()
                                .gap_2()
                                .text_xs()
                                .child(Icon::new(icon).xsmall().text_color(icon_ink))
                                .child(div().text_color(text_ink).child(requirement.text))
                        }));
                this.child(v_flex().gap_2().child(meter).child(checklist))
            })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn strength_counts_the_requirements_met() {
        assert_eq!(password_strength(""), 0);
        assert_eq!(password_strength("abc"), 1);
        assert_eq!(password_strength("abc1"), 2);
        assert_eq!(password_strength("abcdefg1"), 3);
        assert_eq!(password_strength("Abcdefg1"), 4);
    }

    #[test]
    fn length_counts_characters_not_bytes() {
        // Seven characters, fourteen bytes.
        assert!(!PASSWORD_REQUIREMENTS[0].is_met("ééééééé"));
        assert!(PASSWORD_REQUIREMENTS[0].is_met("éééééééé"));
    }
}
