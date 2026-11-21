//! Card: `react/src/components/ui/card.tsx`.

use gpui_kit::component::{ActiveTheme as _, StyledExt as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    AnyElement, App, IntoElement, ParentElement, RenderOnce, SharedString, StyleRefinement, Styled,
    Window, div, relative,
};

use crate::foundations::shadow::shadow_xs;
use crate::foundations::{ActiveCorporaTheme as _, Radius};

/// The title row of a [`Card`]: a title, an optional description beneath it,
/// and an optional trailing action.
///
/// `CardHeader`, `CardTitle`, `CardDescription` and `CardAction` in React.
#[derive(IntoElement)]
pub struct CardHeader {
    title: SharedString,
    description: Option<SharedString>,
    action: Option<AnyElement>,
    /// Set by [`Card`]: tightens the bottom inset when content follows.
    followed_by_content: bool,
}

impl CardHeader {
    pub fn new(title: impl Into<SharedString>) -> Self {
        Self {
            title: title.into(),
            description: None,
            action: None,
            followed_by_content: false,
        }
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }

    /// A control pinned to the trailing edge, aligned with the title.
    pub fn action(mut self, action: impl IntoElement) -> Self {
        self.action = Some(action.into_any_element());
        self
    }
}

impl RenderOnce for CardHeader {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let heading_font = cx.corpora_theme().fonts().heading();

        h_flex()
            .items_start()
            .gap_4()
            .p_6()
            .when(self.followed_by_content, |this| this.pb_4())
            .child(
                v_flex()
                    .flex_1()
                    .min_w_0()
                    .gap_1p5()
                    .child(
                        div()
                            .text_lg()
                            .font_semibold()
                            .line_height(relative(1.))
                            .when_some(heading_font, |this, family| this.font_family(family))
                            .child(self.title),
                    )
                    .when_some(self.description, |this, description| {
                        this.child(
                            div()
                                .text_sm()
                                .text_color(cx.theme().muted_foreground)
                                .child(description),
                        )
                    }),
            )
            .when_some(self.action, |this, action| {
                this.child(div().flex_shrink_0().child(action))
            })
    }
}

/// A bordered surface that groups related content.
///
/// The card owns its insets, so its parts never need to know about each
/// other: content sits flush under a header and above a footer, and keeps a
/// full inset on any side that has neither.
///
/// ```ignore
/// Card::new()
///     .header(CardHeader::new("Members").description("People with access"))
///     .content(member_list)
///     .footer(Button::new("invite").label("Invite…"))
/// ```
///
/// Children added with `.child(…)` are placed after the content with no inset
/// of their own, for edge-to-edge content such as a table or an image.
#[derive(IntoElement)]
pub struct Card {
    style: StyleRefinement,
    header: Option<CardHeader>,
    content: Option<AnyElement>,
    footer: Option<AnyElement>,
    children: Vec<AnyElement>,
}

impl Card {
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            header: None,
            content: None,
            footer: None,
            children: Vec::new(),
        }
    }

    pub fn header(mut self, header: CardHeader) -> Self {
        self.header = Some(header);
        self
    }

    /// The padded body of the card: `CardPanel` / `CardContent` in React.
    pub fn content(mut self, content: impl IntoElement) -> Self {
        self.content = Some(content.into_any_element());
        self
    }

    /// A padded row at the bottom, usually the card's actions.
    pub fn footer(mut self, footer: impl IntoElement) -> Self {
        self.footer = Some(footer.into_any_element());
        self
    }
}

impl Default for Card {
    fn default() -> Self {
        Self::new()
    }
}

impl ParentElement for Card {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl Styled for Card {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Card {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let palette = *cx.palette();
        let has_header = self.header.is_some();
        let has_content = self.content.is_some();
        let has_footer = self.footer.is_some();

        v_flex()
            .bg(palette.card)
            .text_color(palette.card_foreground)
            .border_1()
            .border_color(cx.theme().border)
            .rounded(Radius::Md.resolve(cx))
            .shadow(shadow_xs(cx))
            .refine_style(&self.style)
            .when_some(self.header, |this, mut header| {
                header.followed_by_content = has_content;
                this.child(header)
            })
            .when_some(self.content, |this, content| {
                this.child(
                    div()
                        .flex_1()
                        .min_h_0()
                        .p_6()
                        .when(has_header, |this| this.pt_0())
                        .when(has_footer, |this| this.pb_0())
                        .child(content),
                )
            })
            .children(self.children)
            .when_some(self.footer, |this, footer| {
                this.child(
                    h_flex()
                        .p_6()
                        .when(has_content, |this| this.pt_4())
                        .child(footer),
                )
            })
    }
}
