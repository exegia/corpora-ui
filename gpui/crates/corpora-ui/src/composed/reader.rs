//! Reader: `react/src/components/composed/reader`.

use std::rc::Rc;

use gpui_kit::component::kbd::Kbd;
use gpui_kit::component::{ActiveTheme as _, Icon, Sizable as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    Animation, AnimationExt as _, AnyElement, App, ClickEvent, ElementId, IntoElement, Keystroke,
    ParentElement, RenderOnce, SharedString, Styled as _, Window, div, px, rems,
};

use crate::atoms::{Button, IconName};
use crate::foundations::motion::DURATION_MEDIUM;
use crate::foundations::{AtomSize, Radius};

type ClickHandler = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App)>;

/// Marks the text a person has selected in the reader.
///
/// ```ignore
/// SelectionHighlight::new().child("the Word was with God")
/// ```
#[derive(IntoElement, Default)]
pub struct SelectionHighlight {
    children: Vec<AnyElement>,
}

impl SelectionHighlight {
    pub fn new() -> Self {
        Self::default()
    }
}

impl ParentElement for SelectionHighlight {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for SelectionHighlight {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let accent = cx.theme().accent;
        div()
            .rounded(Radius::Sm.resolve(cx))
            .bg(accent.opacity(0.25))
            .border_1()
            .border_color(accent.opacity(0.45))
            .children(self.children)
    }
}

/// Marks text an applied change has touched: an underline and a diamond in
/// the margin.
///
/// ```ignore
/// AppliedMark::new().child("and the Word was God")
/// ```
#[derive(IntoElement, Default)]
pub struct AppliedMark {
    children: Vec<AnyElement>,
}

impl AppliedMark {
    pub fn new() -> Self {
        Self::default()
    }
}

impl ParentElement for AppliedMark {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for AppliedMark {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let warning = cx.theme().warning;
        div()
            .relative()
            .border_b_2()
            .border_color(warning.opacity(0.7))
            .child(
                div()
                    .absolute()
                    .left(-rems(1.))
                    .top_0()
                    .bottom_0()
                    .flex()
                    .items_center()
                    .text_xs()
                    .text_color(warning)
                    .child("◆"),
            )
            .children(self.children)
    }
}

/// Confirms an applied change at the foot of the reader, with a way back.
///
/// ```ignore
/// ApplyToast::new("apply-toast").on_undo(cx.listener(|this, _, _, cx| this.undo(cx)))
/// ```
///
/// It rises into place when it first appears. Show it only while the change
/// can still be undone.
#[derive(IntoElement)]
pub struct ApplyToast {
    id: ElementId,
    message: SharedString,
    on_undo: Option<ClickHandler>,
}

impl ApplyToast {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            message: "Change applied and recorded in version history.".into(),
            on_undo: None,
        }
    }

    pub fn message(mut self, message: impl Into<SharedString>) -> Self {
        self.message = message.into();
        self
    }

    /// Adds an "Undo" button.
    pub fn on_undo(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_undo = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for ApplyToast {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let success = theme.success;
        let reduce_motion = cx.reduce_motion();
        let undo_id = ElementId::NamedChild(std::sync::Arc::new(self.id.clone()), "undo".into());

        h_flex()
            .relative()
            .w_full()
            .gap_3()
            .px_3()
            .py_2p5()
            .rounded(Radius::Sm.resolve(cx))
            .border_1()
            .border_color(success.opacity(0.32))
            .bg(theme.popover)
            .shadow_lg()
            .text_xs()
            .text_color(theme.popover_foreground)
            .child(Icon::new(IconName::Check).small().text_color(success))
            .child(div().flex_1().child(self.message))
            .when_some(self.on_undo, |this, on_undo| {
                this.child(
                    Button::new(undo_id)
                        .ghost()
                        .with_atom_size(AtomSize::Xs)
                        .label("Undo")
                        .on_click(move |event, window, cx| on_undo(event, window, cx)),
                )
            })
            .with_animation(
                self.id,
                Animation::new(DURATION_MEDIUM),
                move |toast, delta| {
                    if reduce_motion {
                        return toast;
                    }
                    // Ease out: fast off the mark, settling into place.
                    let progress = 1. - (1. - delta).powi(3);
                    toast.opacity(progress).top(px(24. * (1. - progress)))
                },
            )
    }
}

/// One selected word of the reader.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct WordSelection {
    /// The word's dictionary form.
    pub lemma: SharedString,
    pub part_of_speech: Option<SharedString>,
    /// How often the lemma occurs in the corpus.
    pub frequency: Option<u32>,
}

/// A selected run of reader nodes, such as a range of verses.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct NodeSelection {
    /// The run as a reference, such as "John 1:1–3".
    pub range: SharedString,
    pub node_ids: Vec<SharedString>,
    pub word_count: usize,
}

/// What a [`SelectionCard`] describes.
#[derive(Clone, Debug, PartialEq)]
pub enum ReaderSelection {
    Word(WordSelection),
    Node(NodeSelection),
}

/// The second line of the card: what is known about the selection.
fn summary(selection: &ReaderSelection) -> String {
    match selection {
        ReaderSelection::Word(word) => [
            word.part_of_speech.as_ref().map(|part| part.to_string()),
            word.frequency.map(|frequency| format!("{frequency}×")),
        ]
        .into_iter()
        .flatten()
        .collect::<Vec<_>>()
        .join(" · "),
        ReaderSelection::Node(node) => {
            let nodes = node.node_ids.len();
            format!(
                "{nodes} node{} · {} word{}",
                if nodes == 1 { "" } else { "s" },
                node.word_count,
                if node.word_count == 1 { "" } else { "s" },
            )
        }
    }
}

/// What can be done with a reader selection: its summary, then "View
/// details" for a word and "Add to chat" for anything.
///
/// It has no surface of its own. Put it in a popover, such as the one
/// [`crate::atoms::TextSelection`] or a [`crate::composed::Verse`] span opens:
///
/// ```ignore
/// Verse::new("john-1-1").span("the Word", move |_, _| {
///     SelectionCard::new("logos", ReaderSelection::Word(word.clone()))
///         .on_add_to_chat(|_, _, cx| { /* … */ })
///         .into_any_element()
/// })
/// ```
#[derive(IntoElement)]
pub struct SelectionCard {
    id: ElementId,
    selection: ReaderSelection,
    on_view_details: Option<ClickHandler>,
    on_add_to_chat: Option<ClickHandler>,
    on_close: Option<ClickHandler>,
}

impl SelectionCard {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>, selection: ReaderSelection) -> Self {
        Self {
            id: id.into(),
            selection,
            on_view_details: None,
            on_add_to_chat: None,
            on_close: None,
        }
    }

    /// Adds "View details". Shown for a word only.
    pub fn on_view_details(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_view_details = Some(Rc::new(handler));
        self
    }

    /// Adds "Add to chat".
    pub fn on_add_to_chat(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_add_to_chat = Some(Rc::new(handler));
        self
    }

    /// Adds a close button beside the summary.
    pub fn on_close(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_close = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for SelectionCard {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let muted = theme.muted_foreground;
        let child_id = |name: &'static str| {
            ElementId::NamedChild(std::sync::Arc::new(self.id.clone()), name.into())
        };
        let title = match &self.selection {
            ReaderSelection::Word(word) => word.lemma.clone(),
            ReaderSelection::Node(node) => node.range.clone(),
        };
        let summary = summary(&self.selection);
        let nodes = match &self.selection {
            ReaderSelection::Node(node) if !node.node_ids.is_empty() => Some(
                node.node_ids
                    .iter()
                    .map(|id| id.as_ref())
                    .collect::<Vec<_>>()
                    .join(" · "),
            ),
            _ => None,
        };
        let is_word = matches!(self.selection, ReaderSelection::Word(_));

        v_flex()
            .w_full()
            .gap_2()
            .child(
                h_flex()
                    .items_start()
                    .justify_between()
                    .gap_3()
                    .child(
                        v_flex()
                            .min_w_0()
                            .child(
                                div()
                                    .truncate()
                                    .font_weight(gpui_kit::FontWeight::MEDIUM)
                                    .child(title),
                            )
                            .when(!summary.is_empty(), |this| {
                                this.child(div().text_xs().text_color(muted).child(summary))
                            })
                            .when_some(nodes, |this, nodes| {
                                this.child(
                                    div()
                                        .mt_1()
                                        .truncate()
                                        .text_xs()
                                        .text_color(muted.opacity(0.7))
                                        .child(nodes),
                                )
                            }),
                    )
                    .when_some(self.on_close, |this, on_close| {
                        this.child(
                            Button::new(child_id("close"))
                                .ghost()
                                .with_atom_size(AtomSize::Xs)
                                .icon(IconName::Close)
                                .tooltip("Close selection actions")
                                .on_click(move |event, window, cx| on_close(event, window, cx)),
                        )
                    }),
            )
            .when_some(self.on_view_details.filter(|_| is_word), |this, on_view| {
                this.child(
                    Button::new(child_id("details"))
                        .ghost()
                        .with_atom_size(AtomSize::Sm)
                        .full_width(true)
                        .label("View details")
                        .on_click(move |event, window, cx| on_view(event, window, cx)),
                )
            })
            .when_some(self.on_add_to_chat, |this, on_add| {
                this.child(
                    h_flex()
                        .gap_2()
                        .pt_2()
                        .border_t_1()
                        .border_color(theme.border)
                        .child(
                            div().flex_1().child(
                                Button::new(child_id("add-to-chat"))
                                    .ghost()
                                    .with_atom_size(AtomSize::Sm)
                                    .full_width(true)
                                    .icon(Icon::new(gpui_kit::assets::IconName::Sparkles))
                                    .label("Add to chat")
                                    .on_click(move |event, window, cx| on_add(event, window, cx)),
                            ),
                        )
                        .children(Keystroke::parse("cmd-j").ok().map(Kbd::new)),
                )
            })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_word_is_summed_up_by_what_is_known_of_it() {
        let word = |part: Option<&'static str>, frequency| {
            ReaderSelection::Word(WordSelection {
                lemma: "λόγος".into(),
                part_of_speech: part.map(Into::into),
                frequency,
            })
        };
        assert_eq!(summary(&word(Some("noun"), Some(330))), "noun · 330×");
        assert_eq!(summary(&word(Some("noun"), None)), "noun");
        assert_eq!(summary(&word(None, None)), "");
    }

    #[test]
    fn a_node_run_counts_nodes_and_words_in_the_singular_and_plural() {
        let node = |ids: &[&'static str], word_count| {
            ReaderSelection::Node(NodeSelection {
                range: "John 1:1".into(),
                node_ids: ids.iter().map(|id| (*id).into()).collect(),
                word_count,
            })
        };
        assert_eq!(summary(&node(&["v1"], 1)), "1 node · 1 word");
        assert_eq!(summary(&node(&["v1", "v2"], 31)), "2 nodes · 31 words");
    }
}
