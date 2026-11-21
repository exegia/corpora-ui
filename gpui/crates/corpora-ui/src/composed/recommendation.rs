//! Recommendation: `react/src/components/composed/chat/recommendation`.

use std::cell::Cell;
use std::rc::Rc;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::component::{ActiveTheme as _, Icon, Sizable as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    Animation, AnimationExt as _, AnyElement, App, ClickEvent, ElementId, FontWeight,
    InteractiveElement as _, IntoElement, ParentElement, RenderOnce, SharedString,
    StatefulInteractiveElement as _, Styled as _, Window, div, px, rems,
};

use crate::atoms::{
    Button, Card, FRAME_TINT, IconName, Loader, Reference, Reveal, Signal, SignalLevel, Tag,
    TagTone, subtle,
};
use crate::foundations::motion::DURATION_FAST;
use crate::foundations::{AtomSize, Radius};

/// Where a proposal stands.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum RecommendationState {
    /// Waiting for a decision.
    #[default]
    Pending,
    /// Approved, and the agent is working on it.
    Running,
    Accepted,
    Rejected,
}

/// Another way the proposal could go.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct RecommendationOption {
    pub label: SharedString,
    /// A short note at the trailing edge, such as "2 witnesses".
    pub status: Option<SharedString>,
    pub signal: SignalLevel,
}

type ClickHandler = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App)>;
type OptionHandler = Rc<dyn Fn(&usize, &mut Window, &mut App)>;

/// What the card remembers between frames.
struct Memory {
    open: bool,
    /// The state last drawn, to tell a change from the first frame.
    last: Cell<RecommendationState>,
    changed: Cell<bool>,
}

/// The mark at the head of the card: a sparkle while it waits, a spinner
/// while the agent works, then a check or a cross.
fn mark(state: RecommendationState, cx: &App) -> AnyElement {
    let theme = cx.theme();
    let badge = |color, icon: Icon| {
        h_flex()
            .justify_center()
            .size(rems(1.125))
            .rounded_full()
            .bg(color)
            .text_color(theme.background)
            .child(icon.xsmall())
            .into_any_element()
    };
    match state {
        RecommendationState::Pending => Icon::new(LucideIcon::Sparkle)
            .small()
            .text_color(theme.primary)
            .into_any_element(),
        RecommendationState::Running => Loader::new()
            .with_atom_size(AtomSize::Sm)
            .color(theme.muted_foreground)
            .into_any_element(),
        RecommendationState::Accepted => badge(theme.success, Icon::new(IconName::Check)),
        RecommendationState::Rejected => badge(theme.danger, Icon::new(IconName::Close)),
    }
}

/// A proposal waiting for a person's decision: what the agent suggests, why,
/// the other ways it could go, how sure it is, and Accept or decline.
///
/// ```ignore
/// Recommendation::new("rec-base", "Use Codex Bezae as the base text")
///     .description("It carries the longer reading in its first hand.")
///     .confidence(SignalLevel::Medium)
///     .state(self.state)
///     .on_accept(cx.listener(|this, _, _, cx| this.accept(cx)))
///     .on_reject(cx.listener(|this, _, _, cx| this.skip(cx)))
///     .on_undo(cx.listener(|this, _, _, cx| this.reopen(cx)))
/// ```
///
/// The owner holds the state: each handler should move it on. The heading
/// folds the body away; stack several cards in a column for a list.
#[derive(IntoElement)]
pub struct Recommendation {
    id: ElementId,
    title: SharedString,
    description: Option<SharedString>,
    entity: Option<(SharedString, SharedString)>,
    lead_time: Option<SharedString>,
    reference: Option<Reference>,
    options: Vec<RecommendationOption>,
    options_label: SharedString,
    confidence: SignalLevel,
    confidence_label: Option<SharedString>,
    accept_label: SharedString,
    reject_label: SharedString,
    state: RecommendationState,
    default_open: bool,
    on_accept: Option<ClickHandler>,
    on_reject: Option<ClickHandler>,
    on_undo: Option<ClickHandler>,
    on_select_option: Option<OptionHandler>,
    children: Vec<AnyElement>,
}

impl Recommendation {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            title: title.into(),
            description: None,
            entity: None,
            lead_time: None,
            reference: None,
            options: Vec::new(),
            options_label: "Other options".into(),
            confidence: SignalLevel::High,
            confidence_label: None,
            accept_label: "Accept".into(),
            reject_label: "Alternatives".into(),
            state: RecommendationState::Pending,
            default_open: true,
            on_accept: None,
            on_reject: None,
            on_undo: None,
            on_select_option: None,
            children: Vec::new(),
        }
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }

    /// Who or what the proposal concerns, as a pill with initials.
    pub fn entity(
        mut self,
        name: impl Into<SharedString>,
        initials: impl Into<SharedString>,
    ) -> Self {
        self.entity = Some((name.into(), initials.into()));
        self
    }

    /// How long it will take, as a pill: "2 min".
    pub fn lead_time(mut self, lead_time: impl Into<SharedString>) -> Self {
        self.lead_time = Some(lead_time.into());
        self
    }

    /// The source the proposal rests on.
    pub fn reference(mut self, reference: Reference) -> Self {
        self.reference = Some(reference);
        self
    }

    pub fn options(mut self, options: impl IntoIterator<Item = RecommendationOption>) -> Self {
        self.options.extend(options);
        self
    }

    /// The heading over the options. "Other options" by default.
    pub fn options_label(mut self, label: impl Into<SharedString>) -> Self {
        self.options_label = label.into();
        self
    }

    pub fn confidence(mut self, confidence: SignalLevel) -> Self {
        self.confidence = confidence;
        self
    }

    /// Replaces "High confidence" and its siblings.
    pub fn confidence_label(mut self, label: impl Into<SharedString>) -> Self {
        self.confidence_label = Some(label.into());
        self
    }

    pub fn accept_label(mut self, label: impl Into<SharedString>) -> Self {
        self.accept_label = label.into();
        self
    }

    /// The label of the declining button. "Alternatives" by default.
    pub fn reject_label(mut self, label: impl Into<SharedString>) -> Self {
        self.reject_label = label.into();
        self
    }

    pub fn state(mut self, state: RecommendationState) -> Self {
        self.state = state;
        self
    }

    /// Starts the card folded. It starts open, as Accept is in the body.
    pub fn collapsed(mut self) -> Self {
        self.default_open = false;
        self
    }

    pub fn on_accept(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_accept = Some(Rc::new(handler));
        self
    }

    /// Called when the proposal is declined or alternatives are asked for.
    pub fn on_reject(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_reject = Some(Rc::new(handler));
        self
    }

    /// Adds "Undo" to a decided card, to take it back to pending.
    pub fn on_undo(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_undo = Some(Rc::new(handler));
        self
    }

    /// Called with the option's index when one is picked.
    pub fn on_select_option(
        mut self,
        handler: impl Fn(&usize, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_select_option = Some(Rc::new(handler));
        self
    }
}

impl ParentElement for Recommendation {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for Recommendation {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let child_id =
            |name: SharedString| ElementId::NamedChild(std::sync::Arc::new(self.id.clone()), name);
        let state = self.state;
        let default_open = self.default_open;
        let memory = window.use_keyed_state(child_id("memory".into()), cx, |_, _| Memory {
            open: default_open,
            last: Cell::new(state),
            changed: Cell::new(false),
        });
        let (open, changed) = {
            let memory = memory.read(cx);
            if memory.last.replace(state) != state {
                memory.changed.set(true);
            }
            (memory.open, memory.changed.get())
        };
        let reduce_motion = cx.reduce_motion();
        let animate = changed && !reduce_motion;

        let theme = cx.theme();
        let muted = theme.muted_foreground;
        let border = theme.border;
        let foreground = theme.foreground;
        let hover = subtle(cx);
        let declined = state == RecommendationState::Rejected;

        let outcome = match state {
            RecommendationState::Accepted => Some(Tag::new("DONE").tone(TagTone::Green)),
            RecommendationState::Rejected => Some(Tag::new("SKIPPED").tone(TagTone::Amber)),
            _ => None,
        };
        let toggled = memory.clone();
        let heading = h_flex()
            .id(child_id("heading".into()))
            .gap_3()
            .px_3()
            .py_2p5()
            .cursor_pointer()
            .hover(move |this| this.bg(hover))
            .on_click(move |_, _, cx| {
                toggled.update(cx, |memory, cx| {
                    memory.open = !memory.open;
                    cx.notify();
                });
            })
            .child(
                h_flex()
                    .flex_none()
                    .justify_center()
                    .size(rems(1.125))
                    .child(mark(state, cx))
                    .with_animation(
                        child_id(format!("mark-{state:?}").into()),
                        Animation::new(DURATION_FAST),
                        move |mark, delta| {
                            if animate { mark.opacity(delta) } else { mark }
                        },
                    ),
            )
            .child(
                div()
                    .flex_1()
                    .min_w_0()
                    .text_sm()
                    .map(|this| {
                        if declined {
                            this.line_through().text_color(muted)
                        } else {
                            this.font_weight(FontWeight::SEMIBOLD)
                        }
                    })
                    .child(self.title),
            )
            .children(outcome)
            .child(
                Icon::new(if open {
                    IconName::ChevronUp
                } else {
                    IconName::ChevronDown
                })
                .small()
                .flex_none()
                .text_color(muted),
            );

        let has_summary =
            self.description.is_some() || self.entity.is_some() || self.lead_time.is_some();
        let summary = has_summary.then(|| {
            h_flex()
                .flex_wrap()
                .gap_1p5()
                .px_3()
                .pb_3()
                .text_sm()
                .text_color(muted)
                .when(declined, |this| this.line_through().opacity(0.5))
                .children(self.description)
                .when_some(self.entity, |this, (name, initials)| {
                    this.child(
                        h_flex()
                            .h(rems(1.375))
                            .gap_1p5()
                            .pl_0p5()
                            .pr_2()
                            .rounded_full()
                            .bg(hover)
                            .text_xs()
                            .font_weight(FontWeight::MEDIUM)
                            .text_color(foreground)
                            .child(
                                h_flex()
                                    .flex_none()
                                    .justify_center()
                                    .size_4()
                                    .rounded_full()
                                    .bg(theme.primary)
                                    .text_size(rems(0.5))
                                    .text_color(theme.primary_foreground)
                                    .child(initials),
                            )
                            .child(name),
                    )
                })
                .when_some(self.lead_time, |this, lead_time| {
                    this.child(Tag::new(lead_time).tone(TagTone::Green))
                })
        });

        let on_select_option = self.on_select_option;
        let options = (!self.options.is_empty()).then(|| {
            Card::new().mx_3().child(
                v_flex()
                    .gap_1()
                    .px_3p5()
                    .py_2p5()
                    .child(
                        div()
                            .pb_1()
                            .text_xs()
                            .text_color(muted)
                            .child(self.options_label),
                    )
                    .children(self.options.into_iter().enumerate().map(|(index, option)| {
                        let on_select_option = on_select_option.clone();
                        h_flex()
                            .id(child_id(format!("option-{index}").into()))
                            .h_6()
                            .mx(-px(8.))
                            .px_2()
                            .gap_2p5()
                            .rounded(Radius::Sm.resolve(cx))
                            .text_sm()
                            .cursor_pointer()
                            .hover(move |this| this.bg(hover))
                            .child(Signal::new(option.signal))
                            .child(div().flex_1().min_w_0().truncate().child(option.label))
                            .when_some(option.status, |this, status| {
                                this.child(div().text_xs().text_color(muted).child(status))
                            })
                            .on_click(move |_, window, cx| {
                                if let Some(on_select_option) = &on_select_option {
                                    on_select_option(&index, window, cx);
                                }
                            })
                    })),
            )
        });

        let click = |handler: Option<ClickHandler>| {
            move |event: &ClickEvent, window: &mut Window, cx: &mut App| {
                if let Some(handler) = &handler {
                    handler(event, window, cx);
                }
            }
        };
        let actions = match state {
            RecommendationState::Running => h_flex(),
            RecommendationState::Pending => h_flex()
                .gap_2()
                .child(
                    Button::new(child_id("reject".into()))
                        .outline()
                        .with_atom_size(AtomSize::Xs)
                        .pill(true)
                        .icon(Icon::new(IconName::Close))
                        .label(self.reject_label)
                        .on_click(click(self.on_reject)),
                )
                .child(
                    Button::new(child_id("accept".into()))
                        .primary()
                        .with_atom_size(AtomSize::Xs)
                        .icon(Icon::new(IconName::Check))
                        .label(self.accept_label)
                        .on_click(click(self.on_accept)),
                ),
            _ => h_flex().when_some(self.on_undo, |this, on_undo| {
                this.child(
                    Button::new(child_id("undo".into()))
                        .ghost()
                        .with_atom_size(AtomSize::Xs)
                        .icon(Icon::new(IconName::Undo2))
                        .label("Undo")
                        .on_click(click(Some(on_undo))),
                )
            }),
        };
        let confidence = self.confidence_label.unwrap_or_else(|| {
            match self.confidence {
                SignalLevel::High => "High confidence",
                SignalLevel::Medium => "Medium confidence",
                SignalLevel::Low => "Low confidence",
            }
            .into()
        });
        let footer = h_flex()
            .gap_2()
            .px_4()
            .py_3()
            .child(Signal::new(self.confidence))
            .child(div().flex_1().text_sm().child(confidence))
            .child(actions.relative().with_animation(
                child_id(format!("actions-{state:?}").into()),
                Animation::new(DURATION_FAST),
                move |actions, delta| {
                    if animate {
                        actions.opacity(delta).top(px(4. * (1. - delta)))
                    } else {
                        actions
                    }
                },
            ));

        let body = v_flex()
            .w_full()
            .children(summary)
            .when_some(self.reference, |this, reference| {
                this.child(
                    div()
                        .flex()
                        .px_2()
                        .pb_1p5()
                        .when(declined, |this| this.opacity(0.5))
                        .child(reference),
                )
            })
            .when(!self.children.is_empty(), |this| {
                this.child(div().px_3().py_2().children(self.children))
            })
            .children(options)
            .child(footer);

        v_flex()
            .w_full()
            .overflow_hidden()
            .rounded(Radius::Md.resolve(cx))
            .border_1()
            .border_color(border)
            .bg(theme.muted.opacity(FRAME_TINT))
            .child(heading)
            .child(Reveal::new(child_id("body".into()), open).child(body))
    }
}
