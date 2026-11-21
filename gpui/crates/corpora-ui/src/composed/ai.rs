//! AI: `react/src/components/composed/ai`.

use std::rc::Rc;
use std::sync::Arc;
use std::time::{Duration, Instant};

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::base::motion::{Transition, transition};
use gpui_kit::component::button::{Button as StockButton, ButtonVariants as _};
use gpui_kit::component::{ActiveTheme as _, Icon, IconName, Sizable as _, StyledExt as _, h_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    Animation, AnimationExt as _, AnyElement, App, ElementId, IntoElement, ParentElement,
    RenderOnce, SharedString, Styled as _, Window, div, px, radians, rems,
};

use crate::assets::OWL_AVATAR;
use crate::atoms::{Avatar, AvatarUser, Badge, Bubble, BubbleVariant, Reference};
use crate::foundations::motion::{DURATION_FAST, DURATION_MEDIUM, EASE_SMOOTH_OUT};
use crate::foundations::{ActiveCorporaTheme as _, AtomSize, Radius};

/// `--stream-gap`: the pause between one streamed word and the next.
pub const STREAM_GAP: Duration = Duration::from_millis(60);
/// `--stream-fade`: how long a streamed word takes to appear.
const STREAM_FADE: Duration = DURATION_MEDIUM;
/// Period of the caret's blink.
const CARET_BLINK: Duration = Duration::from_millis(1000);

fn child_id(id: &ElementId, name: impl Into<SharedString>) -> ElementId {
    ElementId::NamedChild(Arc::new(id.clone()), name.into())
}

/// The agent's identity row: portrait, name and role.
///
/// ```ignore
/// AiIdentity::new()
/// ```
#[derive(IntoElement)]
pub struct AiIdentity {
    name: SharedString,
    role: SharedString,
}

impl AiIdentity {
    /// The Exegia agent.
    pub fn new() -> Self {
        Self {
            name: "Exegia".into(),
            role: "AI Scholar".into(),
        }
    }

    pub fn name(mut self, name: impl Into<SharedString>) -> Self {
        self.name = name.into();
        self
    }

    pub fn role(mut self, role: impl Into<SharedString>) -> Self {
        self.role = role.into();
        self
    }
}

impl Default for AiIdentity {
    fn default() -> Self {
        Self::new()
    }
}

impl RenderOnce for AiIdentity {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        h_flex()
            .gap_1p5()
            .child(
                Avatar::new()
                    .user(AvatarUser::default().avatar_url(OWL_AVATAR))
                    .with_atom_size(AtomSize::Md),
            )
            .child(div().text_sm().font_semibold().child(self.name))
            .child(Badge::new().with_atom_size(AtomSize::Xs).child(self.role))
    }
}

/// An agent's turn in a thread: its identity, then prose with no bubble
/// surface, then whatever the agent attached.
///
/// ```ignore
/// AiMessage::new("answer-7")
///     .child(StreamingText::from_text("answer-7-text", ["The longer reading…"]).streaming(true))
///     .attachment(sources)
/// ```
#[derive(IntoElement)]
pub struct AiMessage {
    id: ElementId,
    children: Vec<AnyElement>,
    attachment: Option<AnyElement>,
}

impl AiMessage {
    /// `id` must be stable and unique in the thread, such as the message id.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            children: Vec::new(),
            attachment: None,
        }
    }

    /// Content the agent attached to its answer, such as a chart or a list of
    /// suggestions. It sits under the prose at the full width of the turn.
    pub fn attachment(mut self, attachment: impl IntoElement) -> Self {
        self.attachment = Some(attachment.into_any_element());
        self
    }
}

impl ParentElement for AiMessage {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for AiMessage {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        Bubble::new(self.id, BubbleVariant::Ai)
            .header(AiIdentity::new())
            .message(
                div()
                    .flex()
                    .flex_col()
                    .gap_y_2()
                    .child(
                        div()
                            .flex()
                            .flex_col()
                            .gap_y_2()
                            .ml_3()
                            .children(self.children),
                    )
                    .children(self.attachment),
            )
    }
}

/// One piece of a streamed paragraph.
#[derive(Clone, Debug, PartialEq, Eq)]
pub enum StreamToken {
    Word(SharedString),
    /// An inline citation, drawn as a [`Reference`].
    Cite {
        label: SharedString,
        href: Option<SharedString>,
        /// The passage shown when the pointer rests on the citation.
        preview: Option<SharedString>,
    },
}

impl StreamToken {
    pub fn word(text: impl Into<SharedString>) -> Self {
        Self::Word(text.into())
    }

    pub fn cite(label: impl Into<SharedString>) -> Self {
        Self::Cite {
            label: label.into(),
            href: None,
            preview: None,
        }
    }

    /// Splits text into one word token per space-separated word.
    pub fn words(text: &str) -> Vec<Self> {
        text.split_whitespace()
            .map(|word| Self::Word(SharedString::from(word.to_string())))
            .collect()
    }
}

/// When the current reveal began, and for how many tokens.
struct Reveal {
    total: usize,
    started: Instant,
}

/// An answer that appears word by word, with a caret at the writing point.
///
/// ```ignore
/// StreamingText::from_text("answer-7-text", ["The longer reading appears in two witnesses."])
///     .streaming(self.is_streaming)
/// ```
///
/// The reveal restarts when the number of tokens changes. With `streaming`
/// off, or under reduced motion, the whole text shows at once.
#[derive(IntoElement)]
pub struct StreamingText {
    id: ElementId,
    paragraphs: Vec<Vec<StreamToken>>,
    streaming: bool,
    gap: Duration,
}

impl StreamingText {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>, paragraphs: Vec<Vec<StreamToken>>) -> Self {
        Self {
            id: id.into(),
            paragraphs,
            streaming: false,
            gap: STREAM_GAP,
        }
    }

    /// Paragraphs of plain text, each split into words.
    pub fn from_text<'a>(
        id: impl Into<ElementId>,
        paragraphs: impl IntoIterator<Item = &'a str>,
    ) -> Self {
        Self::new(id, paragraphs.into_iter().map(StreamToken::words).collect())
    }

    /// Reveals the words over time and shows the caret.
    pub fn streaming(mut self, streaming: bool) -> Self {
        self.streaming = streaming;
        self
    }

    /// The pause between words. [`STREAM_GAP`] by default.
    pub fn word_gap(mut self, gap: Duration) -> Self {
        self.gap = gap;
        self
    }
}

/// How far a word has faded in, from 0 to 1.
fn word_progress(elapsed: Duration, index: usize, gap: Duration) -> f32 {
    let begins = gap.saturating_mul(index as u32);
    let Some(since) = elapsed.checked_sub(begins) else {
        return 0.;
    };
    (since.as_secs_f32() / STREAM_FADE.as_secs_f32()).min(1.)
}

/// How many words have begun to appear.
fn words_shown(elapsed: Duration, total: usize, gap: Duration) -> usize {
    if gap.is_zero() {
        return total;
    }
    let begun = (elapsed.as_nanos() / gap.as_nanos()) as usize + 1;
    begun.min(total)
}

impl RenderOnce for StreamingText {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let total: usize = self.paragraphs.iter().map(Vec::len).sum();
        let reveal = window.use_keyed_state(child_id(&self.id, "reveal"), cx, |_, _| Reveal {
            total,
            started: Instant::now(),
        });
        let started = reveal.update(cx, |reveal, _| {
            if reveal.total != total {
                reveal.total = total;
                reveal.started = Instant::now();
            }
            reveal.started
        });

        let reduce_motion = cx.reduce_motion();
        let animate = self.streaming && !reduce_motion;
        let elapsed = started.elapsed();
        let gap = self.gap;
        let shown = if animate {
            words_shown(elapsed, total, gap)
        } else {
            total
        };
        let settled = !animate || total == 0 || word_progress(elapsed, total - 1, gap) >= 1.;
        if !settled {
            window.request_animation_frame();
        }

        let foreground = cx.theme().foreground;
        let ease = EASE_SMOOTH_OUT.easing();
        let mut cursor = 0;
        let paragraphs = self.paragraphs.into_iter().map(|paragraph| {
            let mut row = div()
                .flex()
                .flex_wrap()
                .items_center()
                .gap_x(rems(0.25))
                .min_h(rems(1.25));
            for token in paragraph {
                let index = cursor;
                cursor += 1;
                let opacity = if animate {
                    ease.sample(word_progress(elapsed, index, gap))
                } else {
                    1.
                };
                let word = match token {
                    StreamToken::Word(text) => div().child(text),
                    StreamToken::Cite {
                        label,
                        href,
                        preview,
                    } => div().child(
                        Reference::new(child_id(&self.id, format!("cite-{index}")), label)
                            .when_some(href, |this, href| this.href(href))
                            .when_some(preview, |this, preview| this.preview(preview)),
                    ),
                };
                row = row.child(word.opacity(opacity));

                let writing_here = self.streaming && shown < total && index + 1 == shown;
                if writing_here {
                    let caret = div().w(px(2.)).h(rems(0.875)).bg(foreground);
                    row = row.child(if reduce_motion {
                        caret.into_any_element()
                    } else {
                        caret
                            .with_animation(
                                "stream-caret",
                                Animation::new(CARET_BLINK).repeat(),
                                |caret, phase| {
                                    let wave = (phase * std::f32::consts::TAU).cos() * 0.5 + 0.5;
                                    caret.opacity(0.5 + 0.5 * wave)
                                },
                            )
                            .into_any_element()
                    });
                }
            }
            row
        });

        div()
            .flex()
            .flex_col()
            .w(rems(23.75))
            .max_w_full()
            .text_size(rems(0.8125))
            .line_height(rems(1.25))
            .text_color(foreground)
            .children(paragraphs)
    }
}

type SelectHandler = Rc<dyn Fn(&mut Window, &mut App)>;

/// One suggested prompt: a spark, the prompt, and a `+` marking that picking
/// it puts the prompt into the thread. The whole row is the control.
///
/// ```ignore
/// SuggestedPrompt::new("prompt-witnesses", "Which witnesses carry the longer reading?")
///     .on_select(cx.listener(|this, _, _, cx| this.send_prompt(0, cx)))
/// ```
#[derive(IntoElement)]
pub struct SuggestedPrompt {
    id: ElementId,
    prompt: SharedString,
    disabled: bool,
    on_select: Option<SelectHandler>,
}

impl SuggestedPrompt {
    /// `id` must be stable and unique among the prompts, not their position.
    pub fn new(id: impl Into<ElementId>, prompt: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            prompt: prompt.into(),
            disabled: false,
            on_select: None,
        }
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    pub fn on_select(mut self, handler: impl Fn(&mut Window, &mut App) + 'static) -> Self {
        self.on_select = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for SuggestedPrompt {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        use gpui_kit::component::Disableable as _;

        let theme = cx.theme();
        let agent = cx.palette().agent;
        StockButton::new(self.id)
            .ghost()
            .w_full()
            .h_7()
            .px_2()
            .rounded(gpui_kit::component::button::ButtonRounded::Size(
                Radius::Md.resolve(cx),
            ))
            .when(!self.disabled, |this| this.cursor_pointer())
            .disabled(self.disabled)
            .child(
                h_flex()
                    .flex_1()
                    .min_w_0()
                    .gap_2()
                    .text_sm()
                    .child(
                        Icon::new(LucideIcon::Sparkle)
                            .xsmall()
                            .flex_none()
                            .text_color(agent),
                    )
                    .child(
                        div()
                            .flex_1()
                            .min_w_0()
                            .truncate()
                            .text_color(theme.foreground.opacity(0.9))
                            .child(self.prompt),
                    )
                    .child(
                        Icon::new(IconName::Plus)
                            .xsmall()
                            .flex_none()
                            .text_color(theme.muted_foreground),
                    ),
            )
            .when_some(self.on_select, |this, handler| {
                this.on_click(move |_, window, cx| handler(window, cx))
            })
    }
}

type OpenHandler = Rc<dyn Fn(&bool, &mut Window, &mut App)>;

/// The "Suggestions (n)" disclosure: a header that folds a panel of
/// [`SuggestedPrompt`]s away.
///
/// ```ignore
/// SuggestedPrompts::new("suggestions").children(prompts)
/// ```
///
/// It keeps its own open state unless [`Self::open`] is set. With no prompts
/// it renders nothing.
#[derive(IntoElement)]
pub struct SuggestedPrompts {
    id: ElementId,
    prompts: Vec<SuggestedPrompt>,
    label: Option<SharedString>,
    default_open: bool,
    open: Option<bool>,
    on_open_change: Option<OpenHandler>,
}

impl SuggestedPrompts {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            prompts: Vec::new(),
            label: None,
            default_open: true,
            open: None,
            on_open_change: None,
        }
    }

    pub fn child(mut self, prompt: SuggestedPrompt) -> Self {
        self.prompts.push(prompt);
        self
    }

    pub fn children(mut self, prompts: impl IntoIterator<Item = SuggestedPrompt>) -> Self {
        self.prompts.extend(prompts);
        self
    }

    /// Names the disclosure. "Suggestions (n)" by default.
    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = Some(label.into());
        self
    }

    /// Whether the panel starts open when the component owns the state.
    pub fn default_open(mut self, open: bool) -> Self {
        self.default_open = open;
        self
    }

    /// Takes control of the open state. Update it from
    /// [`Self::on_open_change`].
    pub fn open(mut self, open: bool) -> Self {
        self.open = Some(open);
        self
    }

    pub fn on_open_change(
        mut self,
        handler: impl Fn(&bool, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_open_change = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for SuggestedPrompts {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        if self.prompts.is_empty() {
            return div().into_any_element();
        }

        let own_open =
            window.use_keyed_state(child_id(&self.id, "open"), cx, |_, _| self.default_open);
        let controlled = self.open.is_some();
        let open = self.open.unwrap_or_else(|| *own_open.read(cx));
        // The chevron points down when open and swings to the side when
        // folded.
        let turn = transition(
            (self.id.clone(), "chevron"),
            if open { 0.0_f32 } else { 1.0 },
            Transition::new(DURATION_FAST).easing(EASE_SMOOTH_OUT.easing()),
            window,
            cx,
        );

        let theme = cx.theme();
        let label = self
            .label
            .unwrap_or_else(|| format!("Suggestions ({})", self.prompts.len()).into());
        let on_open_change = self.on_open_change;

        let header = StockButton::new(child_id(&self.id, "trigger"))
            .ghost()
            .w_full()
            .h_6()
            .px_4()
            .cursor_pointer()
            .child(
                h_flex()
                    .flex_1()
                    .gap_2()
                    .text_xs()
                    .text_color(theme.muted_foreground)
                    .child(Icon::new(LucideIcon::Sparkles).xsmall().flex_none())
                    .child(div().flex_1().child(label))
                    .child(
                        Icon::new(IconName::ChevronDown)
                            .small()
                            .flex_none()
                            .rotate(radians(std::f32::consts::FRAC_PI_2 * turn)),
                    ),
            )
            .on_click(move |_, window, cx| {
                let next = !open;
                if !controlled {
                    own_open.update(cx, |open, cx| {
                        *open = next;
                        cx.notify();
                    });
                }
                if let Some(handler) = &on_open_change {
                    handler(&next, window, cx);
                }
            });

        div()
            .flex()
            .flex_col()
            .w_full()
            .child(header)
            .child(
                crate::atoms::Reveal::new(child_id(&self.id, "panel"), open).child(
                    // The gap above the panel is inside the reveal, so it
                    // closes with it.
                    div().pt_1().child(
                        div()
                            .flex()
                            .flex_col()
                            .gap_0p5()
                            .p_1p5()
                            .rounded(Radius::Md.resolve(cx))
                            .border_t_1()
                            .border_color(theme.border)
                            .bg(theme.secondary)
                            .children(self.prompts),
                    ),
                ),
            )
            .into_any_element()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn words_split_on_whitespace() {
        assert_eq!(
            StreamToken::words("two  witnesses"),
            vec![StreamToken::word("two"), StreamToken::word("witnesses")]
        );
    }

    #[test]
    fn words_appear_one_gap_apart() {
        let gap = Duration::from_millis(60);
        assert_eq!(words_shown(Duration::ZERO, 5, gap), 1);
        assert_eq!(words_shown(Duration::from_millis(130), 5, gap), 3);
        assert_eq!(words_shown(Duration::from_secs(9), 5, gap), 5);
        assert_eq!(words_shown(Duration::ZERO, 0, gap), 0);
    }

    #[test]
    fn a_word_fades_in_from_its_own_start() {
        let gap = Duration::from_millis(60);
        assert_eq!(word_progress(Duration::from_millis(100), 2, gap), 0.);
        let half = Duration::from_millis(120) + STREAM_FADE / 2;
        assert!((word_progress(half, 2, gap) - 0.5).abs() < 0.01);
        assert_eq!(word_progress(Duration::from_secs(9), 2, gap), 1.);
    }
}
