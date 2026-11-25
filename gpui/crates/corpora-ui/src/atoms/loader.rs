//! Loader: `react/src/components/atoms/loader.tsx`.

use std::time::Duration;

use gpui_kit::component::spinner::Spinner;
use gpui_kit::component::{ActiveTheme as _, Sizable as _, Size, ThemeStyled as _, h_flex};
use gpui_kit::{
    Animation, AnimationExt as _, App, Hsla, IntoElement, ParentElement, Rems, RenderOnce, Styled,
    Window, div, rems,
};

use crate::foundations::AtomSize;

/// How a [`Loader`] shows that work is in progress.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum LoaderKind {
    #[default]
    Spinner,
    /// Three dots bouncing in sequence, for conversational waits.
    Dots,
}

/// One full bounce of a dot: Tailwind's `animate-bounce`.
const BOUNCE_PERIOD: Duration = Duration::from_secs(1);
/// How far each dot trails the one before it, as a share of the period.
const DOT_PHASE_STEP: f32 = 0.15;
/// How high a dot rises, as a share of its own diameter.
const BOUNCE_HEIGHT: f32 = 0.25;
const DOT_COUNT: usize = 3;

/// An indeterminate progress indicator.
///
/// It stands still when the system asks for reduced motion.
///
/// ```ignore
/// Loader::new()
/// Loader::dots().with_atom_size(AtomSize::Sm)
/// ```
#[derive(IntoElement)]
pub struct Loader {
    kind: LoaderKind,
    size: AtomSize,
    color: Option<Hsla>,
}

impl Loader {
    /// A spinner.
    pub fn new() -> Self {
        Self {
            kind: LoaderKind::default(),
            size: AtomSize::default(),
            color: None,
        }
    }

    pub fn dots() -> Self {
        Self::new().with_kind(LoaderKind::Dots)
    }

    pub fn with_kind(mut self, kind: LoaderKind) -> Self {
        self.kind = kind;
        self
    }

    pub fn with_atom_size(mut self, size: AtomSize) -> Self {
        self.size = size;
        self
    }

    /// Overrides the ink, which is the theme foreground by default.
    pub fn color(mut self, color: Hsla) -> Self {
        self.color = Some(color);
        self
    }
}

impl Default for Loader {
    fn default() -> Self {
        Self::new()
    }
}

/// Dot diameter per size: `sizeMap` in `loader.tsx`.
fn dot_diameter(size: AtomSize) -> Rems {
    rems(match size {
        AtomSize::Xs => 0.125,
        AtomSize::Sm => 0.25,
        AtomSize::Md => 0.5,
        AtomSize::Lg => 0.75,
        AtomSize::Xl => 1.,
        AtomSize::Xxl => 1.25,
    })
}

/// Height of a bouncing dot above its rest position at `phase` of the cycle,
/// as a share of the bounce height: up at 0 and 1, resting at 0.5.
fn bounce(phase: f32) -> f32 {
    (std::f32::consts::TAU * phase).cos() * 0.5 + 0.5
}

impl RenderOnce for Loader {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let color = self.color.unwrap_or(cx.theme().foreground);

        match self.kind {
            LoaderKind::Spinner => Spinner::new()
                .with_size(Size::from(self.size))
                .color(color)
                .into_any_element(),
            LoaderKind::Dots => {
                let diameter = dot_diameter(self.size);
                let reduce_motion = cx.reduce_motion();

                h_flex()
                    .justify_center()
                    .gap_1()
                    .children((0..DOT_COUNT).map(|ix| {
                        let dot = div()
                            .relative()
                            .size(diameter)
                            .bg(color)
                            .rounded_full_style(cx);
                        if reduce_motion {
                            return dot.into_any_element();
                        }
                        let lag = ix as f32 * DOT_PHASE_STEP;
                        dot.with_animation(
                            ("loader-dot", ix),
                            Animation::new(BOUNCE_PERIOD).repeat(),
                            move |dot, delta| {
                                let phase = (delta - lag).rem_euclid(1.);
                                dot.top(diameter * -(BOUNCE_HEIGHT * bounce(phase)))
                            },
                        )
                        .into_any_element()
                    }))
                    .into_any_element()
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn bounce_peaks_at_the_ends_and_rests_in_the_middle() {
        assert!((bounce(0.) - 1.).abs() < 1e-6);
        assert!(bounce(0.5).abs() < 1e-6);
        assert!((bounce(1.) - 1.).abs() < 1e-6);
    }

    #[test]
    fn dots_grow_with_size() {
        let sizes = [
            AtomSize::Xs,
            AtomSize::Sm,
            AtomSize::Md,
            AtomSize::Lg,
            AtomSize::Xl,
            AtomSize::Xxl,
        ];
        assert!(
            sizes
                .windows(2)
                .all(|pair| dot_diameter(pair[0]).0 < dot_diameter(pair[1]).0)
        );
    }
}
