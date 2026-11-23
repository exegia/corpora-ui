//! Badge: `react/src/components/ui/badge.tsx`.

use gpui_kit::component::{ActiveTheme as _, Sizable, Size, StyledExt as _, h_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    AnyElement, App, Hsla, IntoElement, ParentElement, Rems, RenderOnce, StyleRefinement, Styled,
    Window, rems,
};

use crate::foundations::{ActiveCorporaTheme as _, AtomSize, Radius};

/// The semantic role a [`Badge`] is colored by.
///
/// Keep most badges [`Self::Secondary`] or [`Self::Outline`]; reserve the
/// status roles for states that carry that meaning.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum BadgeVariant {
    #[default]
    Primary,
    Secondary,
    /// A neutral hairline badge with no fill.
    Outline,
    Info,
    Success,
    Warning,
    Destructive,
    Invert,
}

/// How strongly a [`Badge`] presents its role.
///
/// [`BadgeVariant::Secondary`] and [`BadgeVariant::Outline`] have a single
/// presentation and ignore this.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum BadgeAppearance {
    /// A solid fill: `default`, `info`, `success`, … in React.
    #[default]
    Solid,
    /// A tinted fill with role-colored text: the `*-light` variants.
    Light,
    /// A neutral surface with role-colored text: the `*-outline` variants.
    Outline,
}

/// The resolved inks of a badge.
#[derive(Clone, Copy, Debug, PartialEq)]
struct BadgeColors {
    background: Hsla,
    foreground: Hsla,
    border: Hsla,
}

impl BadgeVariant {
    /// The role's fill and the text that sits on it.
    fn solid(self, cx: &App) -> (Hsla, Hsla) {
        let theme = cx.theme();
        let palette = cx.palette();
        match self {
            Self::Primary => (theme.primary, theme.primary_foreground),
            Self::Secondary | Self::Outline => (theme.secondary, theme.secondary_foreground),
            Self::Info => (palette.info, palette.on_status),
            Self::Success => (palette.success, palette.on_status),
            Self::Warning => (palette.warning, palette.on_status),
            Self::Destructive => (palette.destructive, palette.on_status),
            Self::Invert => (palette.invert, palette.invert_foreground),
        }
    }

    /// The role's text shade on a neutral or tinted surface.
    fn text(self, cx: &App) -> Hsla {
        let theme = cx.theme();
        let palette = cx.palette();
        match self {
            Self::Primary if theme.is_dark() => {
                theme.primary.blend(theme.primary_foreground.opacity(0.6))
            }
            Self::Primary => theme.primary,
            Self::Secondary | Self::Outline => theme.foreground,
            Self::Info => palette.info_foreground,
            Self::Success => palette.success_foreground,
            Self::Warning => palette.warning_foreground,
            Self::Destructive => palette.destructive_foreground,
            // `text-invert-foreground` in React, which is near-white on the
            // light page and unreadable; the page foreground carries the
            // same neutral role there.
            Self::Invert if theme.is_dark() => palette.invert_foreground,
            Self::Invert => theme.foreground,
        }
    }

    fn colors(self, appearance: BadgeAppearance, cx: &App) -> BadgeColors {
        let theme = cx.theme();
        let is_dark = theme.is_dark();
        let (fill, on_fill) = self.solid(cx);
        // `dark:bg-input/30`: outlined badges lift slightly off a dark page.
        let neutral_surface = if is_dark {
            theme.input.opacity(0.3)
        } else {
            theme.background
        };

        match (self, appearance) {
            (Self::Outline, _) => BadgeColors {
                background: if is_dark {
                    theme.input.opacity(0.32)
                } else {
                    theme.transparent
                },
                foreground: theme.foreground,
                border: theme.border,
            },
            (Self::Secondary, _) | (_, BadgeAppearance::Solid) => BadgeColors {
                background: fill,
                foreground: on_fill,
                border: theme.transparent,
            },
            (Self::Invert, BadgeAppearance::Light) => BadgeColors {
                background: fill.opacity(if is_dark { 0.35 } else { 0.10 }),
                foreground: if is_dark { on_fill } else { theme.foreground },
                border: fill.opacity(if is_dark { 0.45 } else { 0.15 }),
            },
            (variant, BadgeAppearance::Light) => BadgeColors {
                background: fill.opacity(if is_dark { 0.15 } else { 0.10 }),
                // Status fills are bright enough on dark tints; Primary needs
                // its lighter text shade rather than its dark solid fill.
                foreground: if is_dark && variant != Self::Primary {
                    fill
                } else {
                    variant.text(cx)
                },
                border: fill.opacity(match (is_dark, variant) {
                    (true, _) => 0.25,
                    (false, Self::Primary) => 0.10,
                    (false, _) => 0.15,
                }),
            },
            (variant, BadgeAppearance::Outline) => BadgeColors {
                background: neutral_surface,
                foreground: variant.text(cx),
                border: theme.border,
            },
        }
    }
}

/// The geometry of one badge size, in rems so it follows interface zoom.
struct BadgeMetrics {
    height: Rems,
    padding_x: Rems,
    gap: Rems,
    text: Rems,
}

impl BadgeMetrics {
    fn of(size: AtomSize) -> Self {
        match size {
            AtomSize::Xs => Self {
                height: rems(1.),
                padding_x: rems(0.25),
                gap: rems(0.25),
                text: rems(0.6),
            },
            AtomSize::Sm => Self {
                height: rems(1.125),
                padding_x: rems(0.25),
                gap: rems(0.25),
                text: rems(0.625),
            },
            AtomSize::Md => Self {
                height: rems(1.25),
                padding_x: rems(0.3125),
                gap: rems(0.25),
                text: rems(0.75),
            },
            AtomSize::Lg => Self {
                height: rems(1.375),
                padding_x: rems(0.375),
                gap: rems(0.25),
                text: rems(0.75),
            },
            AtomSize::Xl | AtomSize::Xxl => Self {
                height: rems(1.5),
                padding_x: rems(0.5),
                gap: rems(0.375),
                text: rems(0.875),
            },
        }
    }
}

/// A short state, count or classification, sized for rapid scanning.
///
/// This is the label badge of the React library. GPUI Component's own
/// `badge::Badge` is a different thing: a count or dot overlaid on another
/// element.
///
/// ```ignore
/// Badge::new().child("New")
/// Badge::success().light().child("Synced")
/// Badge::new().with_variant(BadgeVariant::Outline).pill().child("12")
/// ```
#[derive(IntoElement)]
pub struct Badge {
    style: StyleRefinement,
    variant: BadgeVariant,
    appearance: BadgeAppearance,
    size: AtomSize,
    pill: bool,
    children: Vec<AnyElement>,
}

impl Badge {
    /// A solid primary badge.
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            variant: BadgeVariant::default(),
            appearance: BadgeAppearance::default(),
            size: AtomSize::default(),
            pill: false,
            children: Vec::new(),
        }
    }

    pub fn secondary() -> Self {
        Self::new().with_variant(BadgeVariant::Secondary)
    }

    pub fn info() -> Self {
        Self::new().with_variant(BadgeVariant::Info)
    }

    pub fn success() -> Self {
        Self::new().with_variant(BadgeVariant::Success)
    }

    pub fn warning() -> Self {
        Self::new().with_variant(BadgeVariant::Warning)
    }

    pub fn destructive() -> Self {
        Self::new().with_variant(BadgeVariant::Destructive)
    }

    pub fn invert() -> Self {
        Self::new().with_variant(BadgeVariant::Invert)
    }

    pub fn with_variant(mut self, variant: BadgeVariant) -> Self {
        self.variant = variant;
        self
    }

    pub fn with_appearance(mut self, appearance: BadgeAppearance) -> Self {
        self.appearance = appearance;
        self
    }

    /// A tinted fill with role-colored text.
    pub fn light(self) -> Self {
        self.with_appearance(BadgeAppearance::Light)
    }

    /// A neutral surface with role-colored text.
    pub fn outline(self) -> Self {
        self.with_appearance(BadgeAppearance::Outline)
    }

    /// Sets the size from the full atom scale, which reaches past
    /// [`Sizable`]'s four tiers.
    pub fn with_atom_size(mut self, size: AtomSize) -> Self {
        self.size = size;
        self
    }

    /// Rounds the badge into a pill: `radius="full"` in React.
    pub fn pill(mut self) -> Self {
        self.pill = true;
        self
    }
}

impl Default for Badge {
    fn default() -> Self {
        Self::new()
    }
}

impl Sizable for Badge {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = size.into().into();
        self
    }
}

impl ParentElement for Badge {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for Badge {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Badge {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let colors = self.variant.colors(self.appearance, cx);
        let metrics = BadgeMetrics::of(self.size);
        let radius = if self.pill { Radius::Full } else { Radius::Sm };

        h_flex()
            .flex_shrink_0()
            .justify_center()
            .h(metrics.height)
            .min_w(metrics.height)
            .px(metrics.padding_x)
            .gap(metrics.gap)
            .border_1()
            .border_color(colors.border)
            .bg(colors.background)
            .text_color(colors.foreground)
            .text_size(metrics.text)
            .font_medium()
            .whitespace_nowrap()
            .rounded(radius.resolve(cx))
            .when(self.size <= AtomSize::Sm, |this| this.line_height(rems(1.)))
            .refine_style(&self.style)
            .children(self.children)
    }
}
