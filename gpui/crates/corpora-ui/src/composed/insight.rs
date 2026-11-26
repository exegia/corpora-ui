//! InsightCards: `react/src/components/composed/chat/insight-cards.tsx`.

use std::rc::Rc;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::component::{ActiveTheme as _, Icon, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    Animation, AnimationExt as _, App, ElementId, FontWeight, InteractiveElement as _, IntoElement,
    ParentElement as _, RenderOnce, SharedString, StatefulInteractiveElement as _, Styled as _,
    Window, div, px, rems,
};

use crate::atoms::{Button, Card, Dot, Stat, Tone, subtle};
use crate::foundations::AtomSize;
use crate::foundations::Radius;
use crate::foundations::motion::{DURATION_FAST, DURATION_MEDIUM};

/// How far a card travels when the page turns.
const PAGE_TRAVEL: f32 = 24.;

/// One share of an [`InsightAllocation`].
#[derive(Clone, Debug, PartialEq)]
pub struct InsightSegment {
    pub key: SharedString,
    pub label: SharedString,
    pub value: f32,
    pub tone: Tone,
    /// The heading of the detail panel. The label if unset.
    pub title: Option<SharedString>,
    pub description: Option<SharedString>,
}

impl InsightSegment {
    pub fn new(key: impl Into<SharedString>, label: impl Into<SharedString>, value: f32) -> Self {
        Self {
            key: key.into(),
            label: label.into(),
            value,
            tone: Tone::Series(1),
            title: None,
            description: None,
        }
    }

    pub fn tone(mut self, tone: Tone) -> Self {
        self.tone = tone;
        self
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }
}

/// How a whole divides into shares.
#[derive(Clone, Debug, PartialEq)]
pub struct InsightAllocation {
    pub label: SharedString,
    /// The whole, as it should read: "1,204 witnesses".
    pub value: SharedString,
    pub segments: Vec<InsightSegment>,
}

/// One page of [`InsightCards`].
#[derive(Clone, Default)]
pub struct Insight {
    pub summary: SharedString,
    pub stats: Vec<Stat>,
    pub allocation: Option<InsightAllocation>,
    /// A question to ask next.
    pub follow_up: Option<SharedString>,
}

/// A share of a total as a percentage with at most one decimal.
fn share(value: f32, total: f32) -> String {
    let tenths = (value / total * 1000.).round() / 10.;
    if tenths.fract() == 0. {
        format!("{tenths:.0}%")
    } else {
        format!("{tenths:.1}%")
    }
}

/// The segment picked in an allocation.
#[derive(Default)]
struct Picked(Option<SharedString>);

fn allocation(
    id: &ElementId,
    allocation: InsightAllocation,
    window: &mut Window,
    cx: &mut App,
) -> impl IntoElement + use<> {
    let child_id =
        |name: SharedString| ElementId::NamedChild(std::sync::Arc::new(id.clone()), name);
    let state = window.use_keyed_state(child_id("picked".into()), cx, |_, _| Picked::default());
    let picked = state.read(cx).0.clone();
    let segments = allocation.segments;
    let active = segments
        .iter()
        .position(|segment| Some(&segment.key) == picked.as_ref())
        .or((!segments.is_empty()).then_some(0));
    let total = match segments.iter().map(|segment| segment.value).sum::<f32>() {
        total if total > 0. => total,
        _ => 1.,
    };

    let theme = cx.theme();
    let muted = theme.muted_foreground;
    let foreground = theme.foreground;
    let quiet = subtle(cx);
    let reduce_motion = cx.reduce_motion();
    let initial: SharedString = allocation
        .label
        .chars()
        .next()
        .map(|first| first.to_uppercase().to_string())
        .unwrap_or_default()
        .into();
    let lead_tone = segments.first().map(|segment| segment.tone);

    let pick = |key: &SharedString| {
        let state = state.clone();
        let key = key.clone();
        move |_: &gpui_kit::ClickEvent, _: &mut Window, cx: &mut App| {
            state.update(cx, |state, cx| {
                state.0 = Some(key.clone());
                cx.notify();
            });
        }
    };

    let bar = h_flex()
        .h_6()
        .gap_1()
        .children(segments.iter().enumerate().map(|(index, segment)| {
            let is_active = Some(index) == active;
            let mut part = div()
                .id(child_id(format!("bar-{}", segment.key).into()))
                .h_full()
                .min_w_1p5()
                .rounded_full()
                .cursor_pointer()
                .bg(if is_active {
                    segment.tone.color(cx)
                } else {
                    quiet
                })
                .when(!is_active, |this| this.hover(|this| this.opacity(0.8)))
                .on_click(pick(&segment.key));
            part.style().flex_grow = Some(segment.value.max(0.));
            part.flex_basis(px(0.))
        }));

    let legend = h_flex()
        .flex_wrap()
        .gap_1p5()
        .children(segments.iter().enumerate().map(|(index, segment)| {
            let is_active = Some(index) == active;
            h_flex()
                .id(child_id(format!("legend-{}", segment.key).into()))
                .h_5()
                .px_2()
                .gap_1p5()
                .rounded_full()
                .cursor_pointer()
                .text_xs()
                .font_weight(FontWeight::MEDIUM)
                .map(|this| {
                    if is_active {
                        this.bg(quiet).text_color(foreground)
                    } else {
                        this.text_color(muted)
                            .hover(move |this| this.text_color(foreground))
                    }
                })
                .child(
                    Dot::new(if is_active {
                        segment.tone
                    } else {
                        Tone::Neutral
                    })
                    .small(),
                )
                .child(format!("{} {}", segment.label, share(segment.value, total)))
                .on_click(pick(&segment.key))
        }));

    let detail = active
        .and_then(|active| segments.get(active))
        .map(|segment| {
            let tone = segment.tone.color(cx);
            v_flex()
                .relative()
                .gap_1()
                .px_3()
                .py_2p5()
                .rounded(Radius::Md.resolve(cx))
                .bg(quiet)
                .text_xs()
                .child(
                    div()
                        .font_weight(FontWeight::SEMIBOLD)
                        .text_color(tone)
                        .child(
                            segment
                                .title
                                .clone()
                                .unwrap_or_else(|| segment.label.clone()),
                        ),
                )
                .when_some(segment.description.clone(), |this, description| {
                    this.child(div().text_color(muted).child(description))
                })
                .with_animation(
                    child_id(format!("detail-{}", segment.key).into()),
                    Animation::new(DURATION_FAST),
                    move |detail, delta| {
                        // Nothing to swap from until a segment has been picked.
                        if reduce_motion || picked.is_none() {
                            return detail;
                        }
                        let progress = 1. - (1. - delta).powi(3);
                        detail.opacity(progress).top(px(4. * (1. - progress)))
                    },
                )
        });

    v_flex()
        .gap_3()
        .p_3()
        .child(
            h_flex()
                .gap_2()
                .text_sm()
                .text_color(muted)
                .child(
                    h_flex()
                        .flex_none()
                        .justify_center()
                        .size_5()
                        .rounded_full()
                        .bg(lead_tone.unwrap_or_default().color(cx))
                        .text_size(rems(0.5625))
                        .font_weight(FontWeight::SEMIBOLD)
                        .text_color(theme.background)
                        .child(initial),
                )
                .child(allocation.label),
        )
        .child(
            div()
                .text_2xl()
                .font_weight(FontWeight::SEMIBOLD)
                .child(allocation.value),
        )
        .child(bar)
        .child(legend)
        .children(detail)
}

type FollowUpHandler = Rc<dyn Fn(&SharedString, &mut Window, &mut App)>;
type IndexHandler = Rc<dyn Fn(usize, &mut Window, &mut App)>;

/// Which insight is showing, and which way the last turn went.
#[derive(Default)]
struct Paging {
    index: usize,
    /// 1 after "next", -1 after "previous", 0 before any turn.
    direction: i8,
}

/// Insights one at a time: a header with their count and previous and next
/// buttons, then the insight's summary, figures, share breakdown and a
/// follow-up question.
///
/// ```ignore
/// InsightCards::new("insights")
///     .insights(insights)
///     .on_follow_up(cx.listener(|this, question: &SharedString, _, cx| this.ask(question, cx)))
/// ```
#[derive(IntoElement)]
pub struct InsightCards {
    id: ElementId,
    header: SharedString,
    insights: Vec<Insight>,
    on_follow_up: Option<FollowUpHandler>,
    on_index_change: Option<IndexHandler>,
}

impl InsightCards {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            header: "Insights".into(),
            insights: Vec::new(),
            on_follow_up: None,
            on_index_change: None,
        }
    }

    pub fn header(mut self, header: impl Into<SharedString>) -> Self {
        self.header = header.into();
        self
    }

    pub fn insights(mut self, insights: impl IntoIterator<Item = Insight>) -> Self {
        self.insights.extend(insights);
        self
    }

    /// Called with the question when an insight's follow-up is pressed.
    pub fn on_follow_up(
        mut self,
        handler: impl Fn(&SharedString, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_follow_up = Some(Rc::new(handler));
        self
    }

    /// Called with the new index when the page turns.
    pub fn on_index_change(
        mut self,
        handler: impl Fn(&usize, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_index_change = Some(Rc::new(move |index, window, cx| {
            handler(&index, window, cx)
        }));
        self
    }
}

impl RenderOnce for InsightCards {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let id = self.id;
        let child_id =
            |name: SharedString| ElementId::NamedChild(std::sync::Arc::new(id.clone()), name);
        let state = window.use_keyed_state(child_id("paging".into()), cx, |_, _| Paging::default());
        let count = self.insights.len();
        let (index, direction) = {
            let state = state.read(cx);
            (state.index.min(count.saturating_sub(1)), state.direction)
        };
        let muted = cx.theme().muted_foreground;
        let reduce_motion = cx.reduce_motion();

        let turn = |name: &'static str, tooltip: &'static str, icon, target: Option<usize>| {
            let state = state.clone();
            let on_index_change = self.on_index_change.clone();
            Button::new(child_id(name.into()))
                .ghost()
                .with_atom_size(AtomSize::Xs)
                .icon(Icon::new(icon))
                .tooltip(tooltip)
                .disabled(target.is_none())
                .on_click(move |_, window, cx| {
                    let Some(target) = target else { return };
                    state.update(cx, |state, cx| {
                        state.direction = if target > state.index { 1 } else { -1 };
                        state.index = target;
                        cx.notify();
                    });
                    if let Some(on_index_change) = &on_index_change {
                        on_index_change(target, window, cx);
                    }
                })
        };
        let header = h_flex()
            .gap_1p5()
            .child(
                div()
                    .text_sm()
                    .font_weight(FontWeight::SEMIBOLD)
                    .child(self.header),
            )
            .child(div().text_sm().text_color(muted).child(count.to_string()))
            .child(div().flex_1())
            .child(turn(
                "previous",
                "Previous insight",
                LucideIcon::ChevronUp,
                index.checked_sub(1),
            ))
            .child(turn(
                "next",
                "Next insight",
                LucideIcon::ChevronDown,
                (index + 1 < count).then_some(index + 1),
            ));

        let page = self.insights.into_iter().nth(index).map(|insight| {
            let page_id = child_id(format!("insight-{index}").into());
            let has_figures = !insight.stats.is_empty() || insight.allocation.is_some();
            let border = cx.theme().border;
            let has_allocation = insight.allocation.is_some();
            let breakdown = insight
                .allocation
                .map(|shares| allocation(&page_id, shares, window, cx).into_any_element());
            let on_follow_up = self.on_follow_up.clone();
            let follow_up = insight.follow_up.map(|question| {
                let asked = question.clone();
                div().flex().child(
                    Button::new(child_id(format!("follow-up-{index}").into()))
                        .outline()
                        .with_atom_size(AtomSize::Sm)
                        .pill(true)
                        .icon(Icon::new(LucideIcon::CornerDownLeft))
                        .label(question)
                        .on_click(move |_, window, cx| {
                            if let Some(on_follow_up) = &on_follow_up {
                                on_follow_up(&asked, window, cx);
                            }
                        }),
                )
            });
            v_flex()
                .relative()
                .gap_2p5()
                .child(div().text_sm().text_color(muted).child(insight.summary))
                .when(has_figures, |this| {
                    this.child(
                        Card::new()
                            .when(!insight.stats.is_empty(), |this| {
                                this.child(
                                    h_flex()
                                        .items_start()
                                        .gap_4()
                                        .p_4()
                                        .when(has_allocation, |this| {
                                            this.border_b_1().border_color(border)
                                        })
                                        .children(insight.stats),
                                )
                            })
                            .children(breakdown),
                    )
                })
                .children(follow_up)
                .with_animation(
                    page_id,
                    Animation::new(DURATION_MEDIUM),
                    move |page, delta| {
                        if reduce_motion || direction == 0 {
                            return page;
                        }
                        // Next pulls the new page up from below, previous from above.
                        let progress = 1. - (1. - delta).powi(3);
                        page.opacity(progress)
                            .top(px(PAGE_TRAVEL * f32::from(direction) * (1. - progress)))
                    },
                )
        });

        v_flex().w_full().gap_2p5().child(header).children(page)
    }
}

#[cfg(test)]
mod tests {
    use super::share;

    #[test]
    fn a_share_reads_as_a_percentage_with_at_most_one_decimal() {
        assert_eq!(share(1., 4.), "25%");
        assert_eq!(share(1., 3.), "33.3%");
        assert_eq!(share(2., 3.), "66.7%");
        assert_eq!(share(0., 5.), "0%");
    }
}
