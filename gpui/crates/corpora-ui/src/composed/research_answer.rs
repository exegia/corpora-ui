//! Research answer: `react/src/components/composed/ai/research-answer.tsx`.

use std::rc::Rc;
use std::sync::Arc;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::component::{ActiveTheme as _, Icon, Sizable as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    AnyElement, App, ClickEvent, ElementId, FontWeight, IntoElement, ParentElement, RenderOnce,
    SharedString, Styled as _, Window, div, rems,
};

use crate::atoms::{Button, Card, FRAME_TINT, IconName};
use crate::foundations::Radius;

type ClickHandler = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App)>;

/// An answer drawn from the corpus, with where it came from and what to do
/// with it: a heading, the answer, source, date and author rows, and copy,
/// share and add-to-list commands.
///
/// ```ignore
/// ResearchAnswer::new("wrath")
///     .detail("Answered from 3 passages · 0.8 s")
///     .child("The poem opens on the wrath of Achilles, not on the war.")
///     .source(Reference::new("iliad", "Iliad · Homer corpus").preview("μῆνιν ἄειδε, θεά"))
///     .date("8th century BCE")
///     .authors("Homer")
///     .on_copy(cx.listener(|this, _, _, cx| this.copy_citation(cx)))
/// ```
///
/// A row shows only when it has a value, and a command only when it has a
/// handler.
#[derive(IntoElement)]
pub struct ResearchAnswer {
    id: ElementId,
    title: SharedString,
    detail: Option<SharedString>,
    children: Vec<AnyElement>,
    source: Option<AnyElement>,
    date: Option<AnyElement>,
    authors: Option<AnyElement>,
    on_copy: Option<ClickHandler>,
    on_share: Option<ClickHandler>,
    on_add_to_list: Option<ClickHandler>,
    bare: bool,
}

impl ResearchAnswer {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            title: "Research answer".into(),
            detail: None,
            children: Vec::new(),
            source: None,
            date: None,
            authors: None,
            on_copy: None,
            on_share: None,
            on_add_to_list: None,
            bare: false,
        }
    }

    /// The heading. "Research answer" by default.
    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = title.into();
        self
    }

    /// The line under the heading: "Answered from 3 passages · 0.8 s".
    pub fn detail(mut self, detail: impl Into<SharedString>) -> Self {
        self.detail = Some(detail.into());
        self
    }

    /// Where the answer came from: text, or a [`crate::atoms::Reference`]
    /// chip to make it something the reader can open.
    pub fn source(mut self, source: impl IntoElement) -> Self {
        self.source = Some(source.into_any_element());
        self
    }

    pub fn date(mut self, date: impl IntoElement) -> Self {
        self.date = Some(date.into_any_element());
        self
    }

    pub fn authors(mut self, authors: impl IntoElement) -> Self {
        self.authors = Some(authors.into_any_element());
        self
    }

    /// Adds the Copy command. Copying the citation is the caller's.
    pub fn on_copy(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_copy = Some(Rc::new(handler));
        self
    }

    /// Adds the Share command.
    pub fn on_share(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_share = Some(Rc::new(handler));
        self
    }

    /// Adds the Add to list command.
    pub fn on_add_to_list(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_add_to_list = Some(Rc::new(handler));
        self
    }

    /// Drops the frame's border, for an answer set inside a message.
    pub fn bare(mut self, bare: bool) -> Self {
        self.bare = bare;
        self
    }
}

impl ParentElement for ResearchAnswer {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for ResearchAnswer {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let muted = theme.muted_foreground;
        let border = theme.border;
        let id = Arc::new(self.id);
        let child_id = |name: &'static str| ElementId::NamedChild(id.clone(), name.into());

        let heading = h_flex()
            .items_start()
            .gap_2()
            .px_3p5()
            .py_3()
            .child(
                h_flex()
                    .flex_none()
                    .justify_center()
                    .size_7()
                    .rounded(Radius::Sm.resolve(cx))
                    .border_1()
                    .border_color(border)
                    .bg(theme.background)
                    .text_color(muted)
                    .child(Icon::new(LucideIcon::BookOpen).small()),
            )
            .child(
                v_flex()
                    .flex_1()
                    .min_w_0()
                    .gap_0p5()
                    .child(
                        div()
                            .text_sm()
                            .font_weight(FontWeight::SEMIBOLD)
                            .child(self.title),
                    )
                    .when_some(self.detail, |this, detail| {
                        this.child(div().text_xs().text_color(muted).child(detail))
                    }),
            );

        let rows: Vec<AnyElement> = [
            (LucideIcon::BookOpen, "Source", self.source),
            (LucideIcon::Calendar, "Date", self.date),
            (LucideIcon::Users, "Author(s)", self.authors),
        ]
        .into_iter()
        .filter_map(|(icon, label, value)| {
            let value = value?;
            Some(
                h_flex()
                    .items_start()
                    .gap_3()
                    .child(
                        h_flex()
                            .flex_none()
                            .w(rems(5.5))
                            .gap_1()
                            .text_xs()
                            .text_color(muted)
                            .child(Icon::new(icon).xsmall())
                            .child(label),
                    )
                    // A row, so a chip keeps its own width.
                    .child(h_flex().flex_1().min_w_0().text_xs().child(value))
                    .into_any_element(),
            )
        })
        .collect();

        let commands: Vec<AnyElement> = [
            ("copy", "Copy", Icon::new(IconName::Copy), self.on_copy),
            (
                "share",
                "Share",
                Icon::new(LucideIcon::Share2),
                self.on_share,
            ),
            (
                "add-to-list",
                "Add to list",
                Icon::new(LucideIcon::ListPlus),
                self.on_add_to_list,
            ),
        ]
        .into_iter()
        .filter_map(|(name, label, icon, handler)| {
            let handler = handler?;
            Some(
                Button::new(child_id(name))
                    .ghost()
                    .xsmall()
                    .icon(icon)
                    .label(label)
                    .on_click(move |event, window, cx| handler(event, window, cx))
                    .into_any_element(),
            )
        })
        .collect();

        let card = Card::new()
            .mx_1()
            .child(div().px_3p5().py_3p5().text_sm().children(self.children))
            .when(!rows.is_empty(), |card| {
                card.child(div().mx_3p5().h_px().bg(border))
                    .child(v_flex().gap_1p5().px_3p5().py_3().children(rows))
            });
        let closed = commands.is_empty();

        v_flex()
            .w(rems(23.75))
            .max_w_full()
            .rounded(Radius::Md.resolve(cx))
            .border_1()
            .border_color(if self.bare {
                border.opacity(0.)
            } else {
                border
            })
            .bg(theme.muted.opacity(FRAME_TINT))
            .child(heading)
            .child(card)
            .map(|this| {
                if closed {
                    this.pb_1()
                } else {
                    this.child(h_flex().gap_0p5().p_2().children(commands))
                }
            })
    }
}
