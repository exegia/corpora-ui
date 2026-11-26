//! Motion tokens: the `@theme` motion scale in `theme.css` and the springs in
//! `react/src/lib/ease.ts`.
//!
//! Durations, curves and springs are policy, not geometry: they stay fixed
//! under interface zoom. Distances are in rems so they scale with it.

use std::time::Duration;

use gpui_kit::base::{Easing, Spring};
use gpui_kit::{Rems, rems};

/// `--duration-stagger`: the gap between items entering in sequence.
pub const DURATION_STAGGER: Duration = Duration::from_millis(40);
/// `--duration-micro`
pub const DURATION_MICRO: Duration = Duration::from_millis(80);
/// `--duration-quick`: hover and press feedback.
pub const DURATION_QUICK: Duration = Duration::from_millis(150);
/// `--duration-fast`
pub const DURATION_FAST: Duration = Duration::from_millis(250);
/// `--duration-medium`
pub const DURATION_MEDIUM: Duration = Duration::from_millis(350);
/// `--duration-slow`
pub const DURATION_SLOW: Duration = Duration::from_millis(400);
/// `--duration-very-slow`
pub const DURATION_VERY_SLOW: Duration = Duration::from_millis(500);

/// `--distance-micro` (4px at the default base).
pub const DISTANCE_MICRO: Rems = rems(0.25);
/// `--distance-small` (6px).
pub const DISTANCE_SMALL: Rems = rems(0.375);
/// `--distance-base` (8px).
pub const DISTANCE_BASE: Rems = rems(0.5);
/// `--distance-medium` (12px).
pub const DISTANCE_MEDIUM: Rems = rems(0.75);
/// `--distance-large` (30px).
pub const DISTANCE_LARGE: Rems = rems(1.875);

/// `--scale-large`: the scale a large surface enters from.
pub const SCALE_LARGE: f32 = 0.96;
/// `--scale-medium`
pub const SCALE_MEDIUM: f32 = 0.97;
/// `--scale-small`
pub const SCALE_SMALL: f32 = 0.98;
/// `--scale-tiny`: press feedback (`active:scale-99`).
pub const SCALE_TINY: f32 = 0.99;

/// A cubic Bézier timing curve, `cubic-bezier(x1, y1, x2, y2)` in CSS.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct Curve {
    pub x1: f32,
    pub y1: f32,
    pub x2: f32,
    pub y2: f32,
}

impl Curve {
    pub const fn new(x1: f32, y1: f32, x2: f32, y2: f32) -> Self {
        Self { x1, y1, x2, y2 }
    }

    /// This curve as a GPUI Base easing, for `Transition::easing`.
    pub fn easing(self) -> Easing {
        Easing::CubicBezier {
            x1: self.x1,
            y1: self.y1,
            x2: self.x2,
            y2: self.y2,
        }
    }
}

/// `--ease-smooth-out`: the default curve for control transitions.
pub const EASE_SMOOTH_OUT: Curve = Curve::new(0.22, 1., 0.36, 1.);
/// `--ease-bounce`: a slight overshoot.
pub const EASE_BOUNCE: Curve = Curve::new(0.34, 1.36, 0.64, 1.);
/// `--ease-bounce-strong`
pub const EASE_BOUNCE_STRONG: Curve = Curve::new(0.34, 3.85, 0.64, 1.);
/// `EASE_OUT` in `ease.ts`: icon and label swaps.
pub const EASE_OUT: Curve = Curve::new(0.16, 1., 0.3, 1.);
/// `EASE_OUT_STRONG`: pop-ins, row entrances and panel expands.
pub const EASE_OUT_STRONG: Curve = Curve::new(0.23, 1., 0.32, 1.);
/// `EASE_IN_OUT`
pub const EASE_IN_OUT: Curve = Curve::new(0.77, 0., 0.175, 1.);
/// `EASE_DRAWER`: sheets and drawers.
pub const EASE_DRAWER: Curve = Curve::new(0.32, 0.72, 0., 1.);

/// A spring in the stiffness / damping / mass form `motion/react` uses.
///
/// GPUI Base describes a spring by its response period and damping ratio
/// instead; [`Self::spring`] converts.
#[derive(Clone, Copy, Debug, PartialEq)]
pub struct SpringSpec {
    pub stiffness: f32,
    pub damping: f32,
    pub mass: f32,
}

impl SpringSpec {
    pub const fn new(stiffness: f32, damping: f32, mass: f32) -> Self {
        Self {
            stiffness,
            damping,
            mass,
        }
    }

    /// The period of one undamped oscillation, `2π / √(k/m)`.
    pub fn response(self) -> Duration {
        let angular_frequency = (self.stiffness / self.mass).sqrt();
        Duration::from_secs_f32(std::f32::consts::TAU / angular_frequency)
    }

    /// The damping ratio ζ, `c / (2√(km))`. Below 1 the spring overshoots.
    pub fn damping_ratio(self) -> f32 {
        self.damping / (2. * (self.stiffness * self.mass).sqrt())
    }

    /// This spring as a GPUI Base spring.
    pub fn spring(self) -> Spring {
        Spring::new(self.response()).with_damping(self.damping_ratio())
    }
}

/// Press feedback on buttons and other tappable surfaces.
pub const SPRING_PRESS: SpringSpec = SpringSpec::new(500., 30., 0.6);
/// Content swaps: label and icon slots trading places inside a control.
pub const SPRING_SWAP: SpringSpec = SpringSpec::new(460., 30., 0.55);
/// Overlay panel entrances: modals and sheets summoned by pointer.
pub const SPRING_PANEL: SpringSpec = SpringSpec::new(420., 40., 0.5);
/// Shared-layout glides: pills and indicators moving between positions.
pub const SPRING_LAYOUT: SpringSpec = SpringSpec::new(360., 32., 0.6);
/// Dragged handles and fills. Critically damped, so it never rebounds.
pub const SPRING_GLIDE: SpringSpec = SpringSpec::new(700., 50., 0.5);
/// Cursor-follow physics for decorative pointer tracking.
pub const SPRING_MOUSE: SpringSpec = SpringSpec::new(200., 15., 0.3);

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn curves_are_valid_css_easings() {
        for curve in [
            EASE_SMOOTH_OUT,
            EASE_BOUNCE,
            EASE_BOUNCE_STRONG,
            EASE_OUT,
            EASE_OUT_STRONG,
            EASE_IN_OUT,
            EASE_DRAWER,
        ] {
            assert!(Easing::cubic_bezier(curve.x1, curve.y1, curve.x2, curve.y2).is_ok());
        }
    }

    #[test]
    fn springs_convert_to_response_and_ratio() {
        // k = 500, c = 30, m = 0.6: ω₀ ≈ 28.87 rad/s, ζ ≈ 0.866.
        let response = SPRING_PRESS.response().as_secs_f32();
        assert!((response - 0.2177).abs() < 0.001);
        assert!((SPRING_PRESS.damping_ratio() - 0.866).abs() < 0.001);
        // Every spring must be accepted by GPUI Base.
        for spec in [
            SPRING_PRESS,
            SPRING_SWAP,
            SPRING_PANEL,
            SPRING_LAYOUT,
            SPRING_GLIDE,
            SPRING_MOUSE,
        ] {
            let _ = spec.spring();
        }
    }

    #[test]
    fn glide_does_not_overshoot() {
        assert!(SPRING_GLIDE.damping_ratio() >= 1.);
    }
}
