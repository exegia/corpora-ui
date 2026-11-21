//! Text: `react/src/components/atoms/text`.

use gpui_kit::component::{ActiveTheme as _, StyledExt as _};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    App, IntoElement, ParentElement, RenderOnce, SharedString, StyleRefinement, Styled, Window,
    div, rems,
};

use crate::foundations::ActiveCorporaTheme as _;

/// The role a run of [`Text`] plays in the page hierarchy.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum TextVariant {
    /// Body text at the surrounding size.
    #[default]
    Default,
    /// A section title in the heading font.
    Heading,
    /// Running prose with a reading line height.
    Paragraph,
    /// Small supporting text.
    Subscript,
}

/// A named step of the type scale.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum TextSize {
    Small,
    #[default]
    Medium,
    Large,
}

/// A run of text in one of the Corpora text roles.
///
/// For a size off the named scale, use the `Styled` builders:
/// `Text::new("…").text_size(rems(2.))`. For a URL or an email address use
/// GPUI Component's `link::Link`; React's `type="link"` has no counterpart
/// here because an in-app destination is a `Button`, not a link.
///
/// ```ignore
/// Text::heading("Members")
/// Text::paragraph("People with access to this corpus.")
/// Text::new("Updated 2 minutes ago").muted().small()
/// ```
#[derive(IntoElement)]
pub struct Text {
    style: StyleRefinement,
    text: SharedString,
    variant: TextVariant,
    size: Option<TextSize>,
    muted: bool,
}

impl Text {
    pub fn new(text: impl Into<SharedString>) -> Self {
        Self {
            style: StyleRefinement::default(),
            text: text.into(),
            variant: TextVariant::default(),
            size: None,
            muted: false,
        }
    }

    pub fn heading(text: impl Into<SharedString>) -> Self {
        Self::new(text).with_variant(TextVariant::Heading)
    }

    pub fn paragraph(text: impl Into<SharedString>) -> Self {
        Self::new(text).with_variant(TextVariant::Paragraph)
    }

    pub fn subscript(text: impl Into<SharedString>) -> Self {
        Self::new(text).with_variant(TextVariant::Subscript)
    }

    pub fn with_variant(mut self, variant: TextVariant) -> Self {
        self.variant = variant;
        self
    }

    /// Overrides the size the variant would pick.
    pub fn with_text_size(mut self, size: TextSize) -> Self {
        self.size = Some(size);
        self
    }

    pub fn small(self) -> Self {
        self.with_text_size(TextSize::Small)
    }

    pub fn large(self) -> Self {
        self.with_text_size(TextSize::Large)
    }

    /// Lowers the emphasis to the muted foreground, for secondary metadata.
    pub fn muted(mut self) -> Self {
        self.muted = true;
        self
    }
}

impl Styled for Text {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Text {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let is_muted = self.muted || self.variant == TextVariant::Subscript;
        let heading_font = (self.variant == TextVariant::Heading)
            .then(|| cx.corpora_theme().fonts().heading())
            .flatten();

        div()
            .text_color(if is_muted {
                theme.muted_foreground
            } else {
                theme.foreground
            })
            .map(|this| match self.variant {
                TextVariant::Default => this,
                TextVariant::Heading => this.text_2xl().font_semibold(),
                // `leading-7`
                TextVariant::Paragraph => this.line_height(rems(1.75)),
                TextVariant::Subscript => this.text_xs(),
            })
            .when_some(self.size, |this, size| match size {
                TextSize::Small => this.text_sm(),
                TextSize::Medium => this.text_base(),
                TextSize::Large => this.text_lg(),
            })
            .when_some(heading_font, |this, family| this.font_family(family))
            .refine_style(&self.style)
            .child(self.text)
    }
}
