//! The atom size scale: `TAtomSize` in `react/src/components/atoms/types.ts`.

use gpui_kit::component::Size;

/// The size tiers Corpora atoms come in.
///
/// GPUI Component's [`Size`] has four tiers; this adds the two larger ones the
/// React atoms use. It converts into [`Size`] for stock components, clamping
/// at large.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, PartialOrd, Ord, Hash)]
pub enum AtomSize {
    Xs,
    Sm,
    #[default]
    Md,
    Lg,
    Xl,
    Xxl,
}

impl From<AtomSize> for Size {
    /// Stock controls stop at [`Size::Large`], so the two larger atom tiers
    /// clamp to it. (`Size::Size` is not a fifth tier: a `Button` reads it as
    /// padding only and leaves the height unset.)
    fn from(size: AtomSize) -> Self {
        match size {
            AtomSize::Xs => Size::XSmall,
            AtomSize::Sm => Size::Small,
            AtomSize::Md => Size::Medium,
            AtomSize::Lg | AtomSize::Xl | AtomSize::Xxl => Size::Large,
        }
    }
}

impl From<Size> for AtomSize {
    fn from(size: Size) -> Self {
        match size {
            Size::XSmall => Self::Xs,
            Size::Small => Self::Sm,
            Size::Medium | Size::Size(_) => Self::Md,
            Size::Large => Self::Lg,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn shared_tiers_round_trip_and_larger_ones_clamp() {
        for size in [AtomSize::Xs, AtomSize::Sm, AtomSize::Md, AtomSize::Lg] {
            assert_eq!(AtomSize::from(Size::from(size)), size);
        }
        assert_eq!(Size::from(AtomSize::Xl), Size::Large);
        assert_eq!(Size::from(AtomSize::Xxl), Size::Large);
    }
}
