//! Card: `react/src/components/ui/card.tsx`.

use gpui_kit::component::{ActiveTheme as _, StyledExt as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    AnyElement, App, IntoElement, ParentElement, RenderOnce, SharedString, StyleRefinement, Styled,
    Window, div, relative,
};

/// Opacity of the muted tint behind a frame's header and footer.
const FRAME_TINT: f32 = 0.72;

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
    /// Set by [`Card`]: rules the header off from what follows.
    divided: bool,
}

impl CardHeader {
    pub fn new(title: impl Into<SharedString>) -> Self {
        Self {
            title: title.into(),
            description: None,
            action: None,
            followed_by_content: false,
            divided: false,
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
            .when(self.followed_by_content && !self.divided, |this| {
                this.pb_4()
            })
            .when(self.divided, |this| {
                this.border_b_1().border_color(cx.theme().border)
            })
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
///
/// [`Self::divided`] rules the header and footer off from the content. For a
/// header or footer on a tinted band outside the surface, wrap the card in a
/// [`CardFrame`].
#[derive(IntoElement)]
pub struct Card {
    style: StyleRefinement,
    divided: bool,
    /// Set by [`CardFrame`]: where the card sits among the frame's cards.
    framed: Option<Framed>,
    header: Option<CardHeader>,
    content: Option<AnyElement>,
    footer: Option<AnyElement>,
    children: Vec<AnyElement>,
}

impl Card {
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            divided: false,
            framed: None,
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

    /// Draws a rule under the header and above the footer, and gives the
    /// content a full inset between them. `border-b` / `border-t` on the
    /// React parts.
    pub fn divided(mut self, divided: bool) -> Self {
        self.divided = divided;
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
        let divided = self.divided;
        let border = cx.theme().border;

        v_flex()
            .bg(palette.card)
            .text_color(palette.card_foreground)
            .border_1()
            .border_color(border)
            .rounded(Radius::Md.resolve(cx))
            .map(|this| match self.framed {
                None => this.shadow(shadow_xs(cx)),
                // Inside a frame the card lies over the frame's own border,
                // so the two read as one line, and neighbours share an edge.
                Some(framed) => this
                    .mx_neg_px()
                    .mt_neg_px()
                    .when(framed.last, |this| this.mb_neg_px()),
            })
            .refine_style(&self.style)
            .when_some(self.header, |this, mut header| {
                header.followed_by_content = has_content;
                header.divided = divided;
                this.child(header)
            })
            .when_some(self.content, |this, content| {
                this.child(
                    div()
                        .flex_1()
                        .min_h_0()
                        .p_6()
                        .when(has_header && !divided, |this| this.pt_0())
                        .when(has_footer && !divided, |this| this.pb_0())
                        .child(content),
                )
            })
            .children(self.children)
            .when_some(self.footer, |this, footer| {
                this.child(
                    h_flex()
                        .p_6()
                        .when(has_content && !divided, |this| this.pt_4())
                        .when(divided, |this| {
                            this.py_4().border_t_1().border_color(border)
                        })
                        .child(footer),
                )
            })
    }
}

/// Where a [`Card`] sits inside a [`CardFrame`].
#[derive(Clone, Copy)]
struct Framed {
    /// Nothing follows the card, so it also covers the frame's bottom edge.
    last: bool,
}

/// The title row of a [`CardFrame`] or a [`Frame`]: a small title, an
/// optional description, and an optional trailing action.
///
/// `CardFrameHeader`, `CardFrameTitle`, `CardFrameDescription` and
/// `CardFrameAction` in React, and their `Frame*` twins.
#[derive(IntoElement)]
pub struct CardFrameHeader {
    title: SharedString,
    description: Option<SharedString>,
    action: Option<AnyElement>,
}

impl CardFrameHeader {
    pub fn new(title: impl Into<SharedString>) -> Self {
        Self {
            title: title.into(),
            description: None,
            action: None,
        }
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }

    /// A control pinned to the trailing edge, centred on the text.
    pub fn action(mut self, action: impl IntoElement) -> Self {
        self.action = Some(action.into_any_element());
        self
    }
}

impl RenderOnce for CardFrameHeader {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        h_flex()
            .gap_4()
            .child(
                v_flex()
                    .flex_1()
                    .min_w_0()
                    .child(div().text_sm().font_semibold().child(self.title))
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

/// A tinted surface holding one or more [`Card`]s, with a header above them,
/// a footer below, or both. The cards lose their shadow and share the
/// frame's border, so the whole reads as one object.
///
/// ```ignore
/// CardFrame::new()
///     .header(CardFrameHeader::new("Create project").description("Deploy in one click."))
///     .card(Card::new().content(form))
///     .footer("This takes a few seconds.")
/// ```
#[derive(IntoElement)]
pub struct CardFrame {
    style: StyleRefinement,
    header: Option<CardFrameHeader>,
    cards: Vec<Card>,
    footer: Option<AnyElement>,
}

impl CardFrame {
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            header: None,
            cards: Vec::new(),
            footer: None,
        }
    }

    pub fn header(mut self, header: CardFrameHeader) -> Self {
        self.header = Some(header);
        self
    }

    /// Adds a card. Several stack with a shared edge between them.
    pub fn card(mut self, card: Card) -> Self {
        self.cards.push(card);
        self
    }

    /// Content on the tinted band under the cards, such as a note or a link.
    pub fn footer(mut self, footer: impl IntoElement) -> Self {
        self.footer = Some(footer.into_any_element());
        self
    }
}

impl Default for CardFrame {
    fn default() -> Self {
        Self::new()
    }
}

impl Styled for CardFrame {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for CardFrame {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let has_footer = self.footer.is_some();
        let count = self.cards.len();

        v_flex()
            .bg(theme.muted.opacity(FRAME_TINT))
            .text_color(cx.palette().card_foreground)
            .border_1()
            .border_color(theme.border)
            .rounded(Radius::Md.resolve(cx))
            .shadow(shadow_xs(cx))
            .refine_style(&self.style)
            .when_some(self.header, |this, header| {
                this.child(div().px_6().py_4().child(header))
            })
            .children(self.cards.into_iter().enumerate().map(|(ix, mut card)| {
                card.framed = Some(Framed {
                    last: ix + 1 == count && !has_footer,
                });
                card
            }))
            .when_some(self.footer, |this, footer| {
                this.child(div().px_6().py_4().child(footer))
            })
    }
}

/// A tinted tray of separate panels, each its own bordered surface, with an
/// optional header and footer on the tray. `Frame` and `FramePanel` in React.
///
/// ```ignore
/// Frame::new()
///     .header(CardFrameHeader::new("Witnesses").description("Sources for this reading"))
///     .panel(greek_witnesses)
///     .panel(latin_witnesses)
/// ```
#[derive(IntoElement)]
pub struct Frame {
    style: StyleRefinement,
    header: Option<CardFrameHeader>,
    panels: Vec<AnyElement>,
    footer: Option<AnyElement>,
}

impl Frame {
    pub fn new() -> Self {
        Self {
            style: StyleRefinement::default(),
            header: None,
            panels: Vec::new(),
            footer: None,
        }
    }

    pub fn header(mut self, header: CardFrameHeader) -> Self {
        self.header = Some(header);
        self
    }

    /// Adds a padded panel.
    pub fn panel(mut self, panel: impl IntoElement) -> Self {
        self.panels.push(panel.into_any_element());
        self
    }

    pub fn footer(mut self, footer: impl IntoElement) -> Self {
        self.footer = Some(footer.into_any_element());
        self
    }
}

impl Default for Frame {
    fn default() -> Self {
        Self::new()
    }
}

impl Styled for Frame {
    fn style(&mut self) -> &mut StyleRefinement {
        &mut self.style
    }
}

impl RenderOnce for Frame {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let border = theme.border;
        let background = theme.background;
        let radius = Radius::Md.resolve(cx);
        let shadow = shadow_xs(cx);

        v_flex()
            .gap_1()
            .p_1()
            .bg(theme.muted.opacity(FRAME_TINT))
            // Concentric with the panels: their radius plus the tray's inset.
            .rounded(radius + gpui_kit::rems(0.25).to_pixels(gpui_kit::px(16.)))
            .refine_style(&self.style)
            .when_some(self.header, |this, header| {
                this.child(div().px_5().py_4().child(header))
            })
            .children(self.panels.into_iter().map(|panel| {
                div()
                    .p_5()
                    .bg(background)
                    .border_1()
                    .border_color(border)
                    .rounded(radius)
                    .shadow(shadow.clone())
                    .child(panel)
            }))
            .when_some(self.footer, |this, footer| {
                this.child(div().px_5().py_4().child(footer))
            })
    }
}
