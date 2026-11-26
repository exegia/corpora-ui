//! ContextCards: `react/src/components/composed/chat/context-cards.tsx`.

use std::rc::Rc;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::component::{ActiveTheme as _, Icon, Sizable as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    App, ElementId, FontWeight, IntoElement, ParentElement as _, RenderOnce, SharedString,
    Styled as _, Window, div,
};

use crate::atoms::{Button, Card, FileTypeBadge, Pill};
use crate::foundations::AtomSize;

/// One retrieved chunk of a source.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct ContextCard {
    /// Stable identity of the chunk.
    pub id: SharedString,
    pub title: SharedString,
    /// A short measure beside the title, such as "290 characters".
    pub meta: Option<SharedString>,
    pub snippet: SharedString,
    /// The file the chunk came from: its name and its format.
    pub file: Option<(SharedString, SharedString)>,
}

type OpenHandler = Rc<dyn Fn(&ContextCard, &mut Window, &mut App)>;

/// The chunks an answer drew on: a header with their count, then a card per
/// chunk with its title, snippet and source file.
///
/// ```ignore
/// ContextCards::new("chunks")
///     .cards(chunks)
///     .on_open(cx.listener(|this, card: &ContextCard, _, cx| this.open(card, cx)))
/// ```
#[derive(IntoElement)]
pub struct ContextCards {
    id: ElementId,
    header: SharedString,
    cards: Vec<ContextCard>,
    on_open: Option<OpenHandler>,
}

impl ContextCards {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            header: "All chunks".into(),
            cards: Vec::new(),
            on_open: None,
        }
    }

    pub fn header(mut self, header: impl Into<SharedString>) -> Self {
        self.header = header.into();
        self
    }

    pub fn cards(mut self, cards: impl IntoIterator<Item = ContextCard>) -> Self {
        self.cards.extend(cards);
        self
    }

    /// Called when a chunk's file is opened.
    pub fn on_open(
        mut self,
        handler: impl Fn(&ContextCard, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_open = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for ContextCards {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let muted = theme.muted_foreground;
        let count = self.cards.len().to_string();
        let id = self.id;
        let on_open = self.on_open;

        v_flex()
            .w_full()
            .gap_2()
            .child(
                h_flex()
                    .gap_2p5()
                    .px_0p5()
                    .child(
                        div()
                            .text_sm()
                            .font_weight(FontWeight::SEMIBOLD)
                            .child(self.header),
                    )
                    .child(Pill::new(count)),
            )
            .children(self.cards.into_iter().enumerate().map(|(index, card)| {
                let icon = if index % 2 == 0 {
                    LucideIcon::FileText
                } else {
                    LucideIcon::TextAlignStart
                };
                let file = card.file.clone().map(|(name, kind)| {
                    let open_id = ElementId::NamedChild(
                        std::sync::Arc::new(id.clone()),
                        format!("open-{}", card.id).into(),
                    );
                    let on_open = on_open.clone();
                    let opened = card.clone();
                    div().flex().child(
                        Button::new(open_id)
                            .secondary()
                            .with_atom_size(AtomSize::Xs)
                            .content_padding(gpui_kit::px(4.), gpui_kit::px(2.))
                            .start(FileTypeBadge::new(kind))
                            .label(name)
                            .trailing_icon(Icon::new(LucideIcon::ExternalLink))
                            .tooltip("Open file")
                            .on_click(move |_, window, cx| {
                                if let Some(on_open) = &on_open {
                                    on_open(&opened, window, cx);
                                }
                            }),
                    )
                });
                Card::new().child(
                    v_flex()
                        .gap_2()
                        .p_3()
                        .child(
                            h_flex()
                                .gap_1p5()
                                .child(Icon::new(icon).xsmall().flex_none().text_color(muted))
                                .child(
                                    div()
                                        .flex_1()
                                        .min_w_0()
                                        .truncate()
                                        .text_sm()
                                        .font_weight(FontWeight::SEMIBOLD)
                                        .child(card.title),
                                )
                                .when_some(card.meta, |this, meta| {
                                    this.child(div().text_xs().text_color(muted).child(meta))
                                }),
                        )
                        .child(
                            div()
                                .text_xs()
                                .text_color(muted)
                                .line_clamp(2)
                                .text_ellipsis()
                                .child(card.snippet),
                        )
                        .children(file),
                )
            }))
    }
}
