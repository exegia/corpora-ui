//! The AI panel and its parts: `react/src/components/blocks/chat`.

use std::rc::Rc;
use std::sync::Arc;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::component::tooltip::Tooltip;
use gpui_kit::component::{ActiveTheme as _, Icon, Sizable as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    AnyElement, App, ClickEvent, ElementId, Entity, FontWeight, Hsla, InteractiveElement as _,
    IntoElement, ParentElement as _, RenderOnce, SharedString, StatefulInteractiveElement as _,
    Styled as _, Window, div, rems,
};

use crate::atoms::{Button, IconName, Texture, TextureVariant};
use crate::composed::{Composer, Recommendation};
use crate::foundations::Radius;

type ClickHandler = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App)>;
type PromptHandler = Rc<dyn Fn(&SharedString, &mut Window, &mut App)>;

/// What a thread is about.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum AiScopeKind {
    Word,
    #[default]
    Passage,
    Articulus,
    Quaestio,
    Corpus,
}

impl AiScopeKind {
    fn name(self) -> &'static str {
        match self {
            Self::Word => "word",
            Self::Passage => "passage",
            Self::Articulus => "articulus",
            Self::Quaestio => "quaestio",
            Self::Corpus => "corpus",
        }
    }
}

/// The part of the corpus a thread reads from.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct AiScope {
    pub kind: AiScopeKind,
    pub label: SharedString,
    /// Where the reader is, shown after a word or node scope.
    pub location: Option<SharedString>,
    pub range: Option<SharedString>,
    /// The thread stays on its passage as the reader moves on.
    pub pinned: bool,
}

impl AiScope {
    pub fn new(kind: AiScopeKind, label: impl Into<SharedString>) -> Self {
        Self {
            kind,
            label: label.into(),
            ..Self::default()
        }
    }

    /// The scope as one line: "John 3:16 · passage", "PINNED · John 3:16".
    pub fn label(&self) -> String {
        let range = self.range.as_ref().map(|range| format!(" {range}"));
        if self.pinned {
            return format!("PINNED · {}{}", self.label, range.unwrap_or_default());
        }
        match (range, self.kind) {
            (Some(range), AiScopeKind::Passage) => format!("{}{range} · passage", self.label),
            _ => {
                let location = self
                    .location
                    .as_ref()
                    .map(|location| format!(" · {location}"))
                    .unwrap_or_default();
                format!("{} · {}{location}", self.label, self.kind.name())
            }
        }
    }
}

/// The panel's top row: its title, a lock on a published corpus, and the
/// new-thread button.
#[derive(IntoElement)]
pub struct AiPanelHeader {
    id: ElementId,
    title: SharedString,
    locked: bool,
    on_new_thread: Option<ClickHandler>,
}

impl AiPanelHeader {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            title: title.into(),
            locked: false,
            on_new_thread: None,
        }
    }

    /// Marks the corpus as published: answers only, no edits.
    pub fn locked(mut self, locked: bool) -> Self {
        self.locked = locked;
        self
    }

    /// Adds the new-thread button.
    pub fn on_new_thread(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_new_thread = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for AiPanelHeader {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let id = Arc::new(self.id);
        let child_id = |name: &'static str| ElementId::NamedChild(id.clone(), name.into());
        let theme = cx.theme();
        h_flex()
            .flex_none()
            .gap_2()
            .p_3p5()
            .border_b_1()
            .border_color(theme.border)
            .bg(theme.sidebar)
            .child(
                h_flex()
                    .flex_1()
                    .min_w_0()
                    .gap_1p5()
                    .child(
                        div()
                            .truncate()
                            .text_sm()
                            .font_weight(FontWeight::SEMIBOLD)
                            .child(self.title),
                    )
                    .when(self.locked, |this| {
                        this.child(
                            div()
                                .id(child_id("lock"))
                                .flex_none()
                                .text_color(theme.muted_foreground)
                                .child(Icon::new(LucideIcon::Lock).xsmall())
                                .tooltip(|window, cx| {
                                    Tooltip::new(
                                        "Published corpus. Editing is disabled; answers only.",
                                    )
                                    .build(window, cx)
                                }),
                        )
                    }),
            )
            .when_some(self.on_new_thread, |this, handler| {
                this.child(
                    Button::new(child_id("new-thread"))
                        .ghost()
                        .xsmall()
                        .icon(IconName::Plus)
                        .tooltip("New thread")
                        .on_click(move |event, window, cx| handler(event, window, cx)),
                )
            })
    }
}

/// The questions offered in an empty thread, one to a row.
///
/// The composed [`crate::composed::SuggestedPrompts`] is the folding list
/// inside a message; this is the plain one a new thread opens on.
#[derive(IntoElement)]
pub struct PromptList {
    id: ElementId,
    prompts: Vec<SharedString>,
    empty_label: SharedString,
    on_select: Option<PromptHandler>,
}

impl PromptList {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            prompts: Vec::new(),
            empty_label: "Ask about this selection or validate it against the schema.".into(),
            on_select: None,
        }
    }

    pub fn prompts(mut self, prompts: impl IntoIterator<Item = impl Into<SharedString>>) -> Self {
        self.prompts.extend(prompts.into_iter().map(Into::into));
        self
    }

    /// The line shown when there are no prompts.
    pub fn empty_label(mut self, label: impl Into<SharedString>) -> Self {
        self.empty_label = label.into();
        self
    }

    /// Called with the prompt that was picked.
    pub fn on_select(
        mut self,
        handler: impl Fn(&SharedString, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_select = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for PromptList {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let muted = theme.muted_foreground;
        if self.prompts.is_empty() {
            return h_flex()
                .gap_1p5()
                .px_1()
                .py_3()
                .text_xs()
                .text_color(muted)
                .child(Icon::new(LucideIcon::Sparkles).xsmall().flex_none())
                .child(self.empty_label)
                .into_any_element();
        }
        let id = Arc::new(self.id);
        let (border, fill, foreground, accent) = (
            theme.border,
            theme.muted.opacity(0.3),
            theme.foreground,
            theme.primary.opacity(0.4),
        );
        let radius = Radius::Md.resolve(cx);
        let on_select = self.on_select;
        v_flex()
            .gap_1p5()
            .children(self.prompts.into_iter().map(|prompt| {
                let on_select = on_select.clone();
                let picked = prompt.clone();
                div()
                    .id(ElementId::NamedChild(id.clone(), prompt.clone()))
                    .px_3()
                    .py_2()
                    .rounded(radius)
                    .border_1()
                    .border_color(border)
                    .bg(fill)
                    .text_xs()
                    .text_color(muted)
                    .cursor_pointer()
                    .hover(move |this| this.border_color(accent).text_color(foreground))
                    .on_click(move |_, window, cx| {
                        if let Some(on_select) = &on_select {
                            on_select(&picked, window, cx);
                        }
                    })
                    .child(prompt)
            }))
            .into_any_element()
    }
}

/// A run of recommendations fused into one bordered stack: neighbours share
/// an edge and only the outer corners are round.
#[derive(IntoElement, Default)]
pub struct RecommendationStack {
    cards: Vec<Recommendation>,
}

impl RecommendationStack {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn child(mut self, card: Recommendation) -> Self {
        self.cards.push(card);
        self
    }

    pub fn children(mut self, cards: impl IntoIterator<Item = Recommendation>) -> Self {
        self.cards.extend(cards);
        self
    }
}

impl RenderOnce for RecommendationStack {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let last = self.cards.len().saturating_sub(1);
        v_flex()
            .w_full()
            .mt_3()
            .children(self.cards.into_iter().enumerate().map(|(index, mut card)| {
                card.joined = (index > 0, index < last);
                card
            }))
    }
}

/// A quiet strip of status above a thread.
fn banner(tint: Option<Hsla>, cx: &App) -> gpui_kit::Div {
    let theme = cx.theme();
    h_flex()
        .w_full()
        .gap_3()
        .px_3()
        .py_2()
        .rounded(Radius::Sm.resolve(cx))
        .border_1()
        .border_color(tint.map_or(theme.border, |tint| tint.opacity(0.4)))
        .bg(tint.map_or(theme.muted.opacity(0.4), |tint| tint.opacity(0.08)))
        .text_xs()
}

/// Says the corpus is published and cannot be edited from here.
#[derive(IntoElement)]
pub struct LockedBanner {
    message: SharedString,
}

impl LockedBanner {
    pub fn new() -> Self {
        Self {
            message: "This published corpus is locked. Ask questions here, or continue in a \
                      working draft to make changes."
                .into(),
        }
    }

    pub fn message(mut self, message: impl Into<SharedString>) -> Self {
        self.message = message.into();
        self
    }
}

impl Default for LockedBanner {
    fn default() -> Self {
        Self::new()
    }
}

impl RenderOnce for LockedBanner {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        banner(None, cx)
            .items_start()
            .gap_2()
            .child(
                Icon::new(LucideIcon::Lock)
                    .xsmall()
                    .flex_none()
                    .mt_0p5()
                    .text_color(cx.theme().muted_foreground),
            )
            .child(div().flex_1().min_w_0().child(self.message))
    }
}

/// Says the thread stays on its passage as the reader moves on.
#[derive(IntoElement, Default)]
pub struct PinnedThreadBanner;

impl PinnedThreadBanner {
    pub fn new() -> Self {
        Self
    }
}

impl RenderOnce for PinnedThreadBanner {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        banner(None, cx).child("Thread follows its passage, not your view.")
    }
}

/// Says the model cannot answer, with a way to try again.
#[derive(IntoElement)]
pub struct DegradedBanner {
    id: ElementId,
    reason: SharedString,
    on_retry: Option<ClickHandler>,
}

impl DegradedBanner {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            reason: "The model is unavailable right now.".into(),
            on_retry: None,
        }
    }

    pub fn reason(mut self, reason: impl Into<SharedString>) -> Self {
        self.reason = reason.into();
        self
    }

    /// Adds the Retry button.
    pub fn on_retry(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_retry = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for DegradedBanner {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let id = ElementId::NamedChild(Arc::new(self.id), "retry".into());
        banner(Some(cx.theme().warning), cx)
            .child(div().flex_1().min_w_0().child(self.reason))
            .when_some(self.on_retry, |this, handler| {
                this.child(
                    Button::new(id)
                        .outline()
                        .xsmall()
                        .label("Retry")
                        .on_click(move |event, window, cx| handler(event, window, cx)),
                )
            })
    }
}

/// One applied answer in a node's history.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct VersionHistoryEntry {
    pub response_id: SharedString,
    pub applying_user: Option<SharedString>,
    pub node_id: SharedString,
    pub previous_value: SharedString,
    /// When it was applied, already formatted for the reader.
    pub timestamp: SharedString,
    pub version: SharedString,
}

/// A line of a node's history: which answer changed it, who applied it, and
/// what it replaced.
#[derive(IntoElement)]
pub struct VersionHistoryRecord {
    entry: VersionHistoryEntry,
}

impl VersionHistoryRecord {
    pub fn new(entry: VersionHistoryEntry) -> Self {
        Self { entry }
    }
}

impl RenderOnce for VersionHistoryRecord {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let muted = theme.muted_foreground;
        let entry = self.entry;
        v_flex()
            .pl_3()
            .border_l_1()
            .border_color(theme.border)
            .text_xs()
            .child(
                h_flex()
                    .flex_wrap()
                    .gap_1()
                    .child(
                        div()
                            .font_weight(FontWeight::MEDIUM)
                            .text_color(theme.primary)
                            .child(format!("resp=\"{}\"", entry.response_id)),
                    )
                    .when_some(entry.applying_user, |this, user| {
                        this.child(format!("· {user}"))
                    }),
            )
            .child(div().mt_1().text_color(muted).child(format!(
                "Node {} · v{} · {}",
                entry.node_id, entry.version, entry.timestamp
            )))
            .child(
                h_flex()
                    .flex_wrap()
                    .mt_2()
                    .gap_1()
                    .text_color(muted)
                    .child("Previous value:")
                    .child(div().line_through().child(entry.previous_value)),
            )
    }
}

/// The full-height AI rail: a header, the thread, and the composer pinned
/// under it.
///
/// ```ignore
/// AiPanel::new("ai", &self.composer)
///     .title("Curation")
///     .on_new_thread(cx.listener(|this, _, _, cx| this.clear(cx)))
///     .prompts(["Summarise this passage", "List the variants"])
///     .on_prompt_select(cx.listener(|this, prompt: &SharedString, window, cx| {
///         this.ask(prompt.clone(), window, cx)
///     }))
///     .thread(messages)
/// ```
///
/// It brings no surface or close button: set it in the host's side panel
/// and give that a height. The host owns the composer, the thread, and
/// everything they do; an empty thread shows the prompts instead.
#[derive(IntoElement)]
pub struct AiPanel {
    id: ElementId,
    composer: Entity<Composer>,
    title: SharedString,
    locked: bool,
    on_new_thread: Option<ClickHandler>,
    thread: Option<AnyElement>,
    toast: Option<AnyElement>,
    prompts: Vec<SharedString>,
    on_prompt_select: Option<PromptHandler>,
}

impl AiPanel {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>, composer: &Entity<Composer>) -> Self {
        Self {
            id: id.into(),
            composer: composer.clone(),
            title: "AI panel".into(),
            locked: false,
            on_new_thread: None,
            thread: None,
            toast: None,
            prompts: Vec::new(),
            on_prompt_select: None,
        }
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = title.into();
        self
    }

    /// Marks the corpus as published. The header shows a lock and the
    /// composer is disabled while this holds.
    pub fn locked(mut self, locked: bool) -> Self {
        self.locked = locked;
        self
    }

    pub fn on_new_thread(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_new_thread = Some(Rc::new(handler));
        self
    }

    /// The conversation so far. Without it the prompts show.
    pub fn thread(mut self, thread: impl IntoElement) -> Self {
        self.thread = Some(thread.into_any_element());
        self
    }

    /// A passing confirmation, such as an [`crate::composed::ApplyToast`],
    /// held at the foot of the thread.
    pub fn toast(mut self, toast: impl IntoElement) -> Self {
        self.toast = Some(toast.into_any_element());
        self
    }

    pub fn prompts(mut self, prompts: impl IntoIterator<Item = impl Into<SharedString>>) -> Self {
        self.prompts.extend(prompts.into_iter().map(Into::into));
        self
    }

    /// Called with the prompt picked from an empty thread.
    pub fn on_prompt_select(
        mut self,
        handler: impl Fn(&SharedString, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_prompt_select = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for AiPanel {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let id = Arc::new(self.id);
        let child_id = |name: &'static str| ElementId::NamedChild(id.clone(), name.into());

        // The lock reaches the composer when it changes, so the host stays
        // free to disable the composer for its own reasons in between.
        let applied = window.use_keyed_state(child_id("lock"), cx, |_, _| false);
        if *applied.read(cx) != self.locked {
            let locked = self.locked;
            applied.update(cx, |applied, _| *applied = locked);
            self.composer
                .update(cx, |composer, cx| composer.set_disabled(locked, cx));
        }

        let header = AiPanelHeader::new(child_id("header"), self.title)
            .locked(self.locked)
            .when_some(self.on_new_thread, |header, handler| {
                header.on_new_thread(move |event, window, cx| handler(event, window, cx))
            });
        let thread = match self.thread {
            Some(thread) => div().w_full().child(thread),
            None => {
                let on_select = self.on_prompt_select;
                v_flex().size_full().min_h(rems(11.)).justify_end().child(
                    PromptList::new(child_id("prompts"))
                        .prompts(self.prompts)
                        .when_some(on_select, |list, handler| {
                            list.on_select(move |prompt, window, cx| handler(prompt, window, cx))
                        }),
                )
            }
        };

        div()
            .relative()
            .size_full()
            .bg(cx.theme().background)
            .child(
                div()
                    .absolute()
                    .inset_0()
                    .child(Texture::new().with_variant(TextureVariant::Paper)),
            )
            .child(
                v_flex()
                    .relative()
                    .size_full()
                    .child(header)
                    .child(
                        div()
                            .relative()
                            .flex_1()
                            .min_h_0()
                            .child(
                                v_flex()
                                    .id(child_id("thread"))
                                    .size_full()
                                    .overflow_y_scroll()
                                    .px_5()
                                    .py_3()
                                    .child(thread),
                            )
                            .when_some(self.toast, |this, toast| {
                                this.child(
                                    h_flex()
                                        .absolute()
                                        .bottom_2()
                                        .left_0()
                                        .right_0()
                                        .justify_center()
                                        .px_8()
                                        .child(toast),
                                )
                            }),
                    )
                    .child(div().flex_none().px_5().pb_3p5().child(self.composer)),
            )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn a_scope_reads_as_one_line() {
        let mut scope = AiScope::new(AiScopeKind::Passage, "John");
        assert_eq!(scope.label(), "John · passage");
        scope.range = Some("3:16".into());
        assert_eq!(scope.label(), "John 3:16 · passage");
        scope.pinned = true;
        assert_eq!(scope.label(), "PINNED · John 3:16");

        let mut word = AiScope::new(AiScopeKind::Word, "λόγος");
        word.location = Some("John 1:1".into());
        assert_eq!(word.label(), "λόγος · word · John 1:1");
        // A range only reads as one on a passage.
        word.range = Some("1:1".into());
        assert_eq!(word.label(), "λόγος · word · John 1:1");
    }
}
