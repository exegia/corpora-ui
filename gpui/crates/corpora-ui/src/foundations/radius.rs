//! The radius scale: `--radius-sm` … `--radius-4xl` in `theme.css`.

use gpui_kit::component::ActiveTheme as _;
use gpui_kit::{App, IsZero as _, Pixels, px};

/// `--radius`: 0.875rem at the default 16px base. Every step derives from it.
pub const RADIUS_BASE_PX: f32 = 14.;

/// One step of the radius scale, as a share of the base radius (`--radius`).
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum Radius {
    /// `rounded-sm`: badges, skeletons.
    Sm,
    /// `rounded-md`: buttons, inputs, cards.
    Md,
    /// `rounded-lg`: the base radius itself.
    Lg,
    Xl,
    Xl2,
    Xl3,
    Xl4,
    /// A circle or a pill.
    Full,
}

impl Radius {
    /// The multiplier `theme.css` applies to `--radius` for this step.
    pub const fn factor(self) -> f32 {
        match self {
            Self::Sm => 0.6,
            Self::Md => 0.8,
            Self::Lg | Self::Full => 1.0,
            Self::Xl => 1.4,
            Self::Xl2 => 1.8,
            Self::Xl3 => 2.2,
            Self::Xl4 => 2.6,
        }
    }

    /// Resolves this step against the active theme.
    ///
    /// The base is the theme's large radius, which [`super::theme::init`] sets
    /// to `--radius`. A theme squared off with a zero radius squares every
    /// step, [`Self::Full`] included, so one setting governs the whole UI.
    pub fn resolve(self, cx: &App) -> Pixels {
        let theme = cx.theme();
        if theme.radius.is_zero() {
            return px(0.);
        }
        match self {
            Self::Full => theme.radius_full(),
            step => theme.radius_lg * step.factor(),
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn steps_ascend() {
        let steps = [
            Radius::Sm,
            Radius::Md,
            Radius::Lg,
            Radius::Xl,
            Radius::Xl2,
            Radius::Xl3,
            Radius::Xl4,
        ];
        assert!(
            steps
                .windows(2)
                .all(|pair| pair[0].factor() < pair[1].factor())
        );
    }
}
