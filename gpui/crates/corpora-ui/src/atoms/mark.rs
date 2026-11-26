//! Marks: the small status and data pieces of `react/src/components/ui/chat`.

use std::rc::Rc;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::component::{ActiveTheme as _, Icon, Sizable as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    App, ClickEvent, ElementId, FontWeight, Hsla, InteractiveElement as _, IntoElement,
    ParentElement as _, RenderOnce, SharedString, StatefulInteractiveElement as _, Styled as _,
    Window, div, px, rems,
};

use crate::foundations::{ActiveCorporaTheme as _, Radius};

/// The quiet fill behind pills, toggles and hovered rows: `surface-subtle`.
pub(crate) fn subtle(cx: &App) -> Hsla {
    let theme = cx.theme();
    theme
        .foreground
        .opacity(if theme.is_dark() { 0.08 } else { 0.06 })
}

/// What a mark's color says.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum Tone {
    Success,
    Warning,
    Info,
    Danger,
    #[default]
    Neutral,
    Accent,
    /// One of the five chart series, counted from 1.
    Series(u8),
}

impl Tone {
    /// The tone's color in the active theme.
    pub fn color(self, cx: &App) -> Hsla {
        let theme = cx.theme();
        match self {
            Self::Success => theme.success,
            Self::Warning => theme.warning,
            Self::Info => theme.info,
            Self::Danger => theme.danger,
            Self::Neutral => theme.muted_foreground,
            Self::Accent => theme.primary,
            Self::Series(1) => theme.chart_1,
            Self::Series(2) => theme.chart_2,
            Self::Series(3) => theme.chart_3,
            Self::Series(4) => theme.chart_4,
            Self::Series(_) => theme.chart_5,
        }
    }
}

/// A status or series marker.
///
/// ```ignore
/// Dot::new(Tone::Success)
/// Dot::new(Tone::Series(2)).small()
/// ```
#[derive(IntoElement, Clone)]
pub struct Dot {
    tone: Tone,
    small: bool,
}

impl Dot {
    pub fn new(tone: Tone) -> Self {
        Self { tone, small: false }
    }

    /// The smaller dot, for dense rows.
    pub fn small(mut self) -> Self {
        self.small = true;
        self
    }
}

impl RenderOnce for Dot {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        div()
            .flex_none()
            .rounded_full()
            .bg(self.tone.color(cx))
            .map(|this| {
                if self.small {
                    this.size_1p5()
                } else {
                    this.size_2()
                }
            })
    }
}

/// A neutral pill for counts and kinds.
///
/// ```ignore
/// Pill::new("12")
/// ```
#[derive(IntoElement, Clone)]
pub struct Pill {
    label: SharedString,
}

impl Pill {
    pub fn new(label: impl Into<SharedString>) -> Self {
        Self {
            label: label.into(),
        }
    }
}

impl RenderOnce for Pill {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        h_flex()
            .flex_none()
            .h_5()
            .px_2p5()
            .rounded_full()
            .bg(subtle(cx))
            .text_xs()
            .font_weight(FontWeight::MEDIUM)
            .text_color(cx.theme().muted_foreground)
            .child(self.label)
    }
}

/// The color of a [`Tag`].
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum TagTone {
    Amber,
    Purple,
    #[default]
    Blue,
    Green,
}

/// A tinted label with a hairline border, for categories.
///
/// ```ignore
/// Tag::new("Manuscript").tone(TagTone::Amber)
/// ```
#[derive(IntoElement, Clone)]
pub struct Tag {
    label: SharedString,
    tone: TagTone,
}

impl Tag {
    pub fn new(label: impl Into<SharedString>) -> Self {
        Self {
            label: label.into(),
            tone: TagTone::default(),
        }
    }

    pub fn tone(mut self, tone: TagTone) -> Self {
        self.tone = tone;
        self
    }
}

impl RenderOnce for Tag {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let color = if theme.is_dark() {
            match self.tone {
                TagTone::Amber => cx.palette().warning_foreground,
                TagTone::Purple => cx.palette().base_magenta,
                TagTone::Blue => cx.palette().info_foreground,
                TagTone::Green => cx.palette().success_foreground,
            }
        } else {
            match self.tone {
                TagTone::Amber => theme.warning,
                TagTone::Purple => theme.chart_4,
                TagTone::Blue => theme.info,
                TagTone::Green => theme.success,
            }
        };
        h_flex()
            .flex_none()
            .h(rems(1.375))
            .px_2()
            .rounded(Radius::Md.resolve(cx))
            .border_1()
            .border_color(color.opacity(if theme.is_dark() { 0.55 } else { 0.35 }))
            .bg(color.opacity(0.15))
            .text_xs()
            .font_weight(FontWeight::MEDIUM)
            .text_color(color)
            .child(self.label)
    }
}

/// How strong a [`Signal`] is.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum SignalLevel {
    #[default]
    High,
    Medium,
    Low,
}

/// A three-bar meter of confidence or strength.
///
/// ```ignore
/// Signal::new(SignalLevel::Medium)
/// ```
///
/// The bars alone do not say what they measure: put a label beside them.
#[derive(IntoElement, Clone)]
pub struct Signal {
    level: SignalLevel,
}

impl Signal {
    pub fn new(level: SignalLevel) -> Self {
        Self { level }
    }
}

impl RenderOnce for Signal {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let (lit, color) = match self.level {
            SignalLevel::High => (3, theme.success),
            SignalLevel::Medium => (2, theme.warning),
            SignalLevel::Low => (1, theme.muted_foreground),
        };
        let unlit = subtle(cx);
        h_flex().flex_none().items_end().h_2p5().gap_0p5().children(
            [px(6.), px(8.), px(10.)]
                .into_iter()
                .enumerate()
                .map(move |(index, height)| {
                    div().w_1().h(height).rounded(px(1.)).bg(if index < lit {
                        color
                    } else {
                        unlit
                    })
                }),
        )
    }
}

/// A file format in capitals: "PDF", "CSV".
///
/// ```ignore
/// FileTypeBadge::new("pdf")
/// ```
#[derive(IntoElement, Clone)]
pub struct FileTypeBadge {
    kind: SharedString,
}

impl FileTypeBadge {
    pub fn new(kind: impl Into<SharedString>) -> Self {
        Self { kind: kind.into() }
    }
}

impl RenderOnce for FileTypeBadge {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        h_flex()
            .flex_none()
            .justify_center()
            .h_3p5()
            .min_w_7()
            .px_1()
            .rounded(px(4.))
            .bg(subtle(cx))
            .text_size(rems(0.5625))
            .font_weight(FontWeight::BOLD)
            .text_color(cx.theme().muted_foreground)
            .child(SharedString::from(self.kind.to_uppercase()))
    }
}

/// One figure of a summary: what it measures, its value, and how it moved.
///
/// ```ignore
/// Stat::new("Attested", "1,204").tone(Tone::Series(1)).delta("+38 this week")
/// Stat::new("Disputed", "17").negative().delta("+4")
/// ```
#[derive(IntoElement, Clone)]
pub struct Stat {
    tone: Tone,
    label: SharedString,
    value: SharedString,
    delta: Option<SharedString>,
    negative: bool,
}

impl Stat {
    pub fn new(label: impl Into<SharedString>, value: impl Into<SharedString>) -> Self {
        Self {
            tone: Tone::Series(1),
            label: label.into(),
            value: value.into(),
            delta: None,
            negative: false,
        }
    }

    /// The color of the dot beside the label.
    pub fn tone(mut self, tone: Tone) -> Self {
        self.tone = tone;
        self
    }

    /// A second line under the value, such as the change since last time.
    pub fn delta(mut self, delta: impl Into<SharedString>) -> Self {
        self.delta = Some(delta.into());
        self
    }

    /// Marks the figure as a change for the worse.
    pub fn negative(mut self) -> Self {
        self.negative = true;
        self
    }
}

impl RenderOnce for Stat {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let color = if self.negative {
            theme.danger
        } else {
            theme.success
        };
        let mono = theme.mono_font_family.clone();
        v_flex()
            .w(rems(9.5))
            .gap_1()
            .child(
                h_flex()
                    .gap_2()
                    .text_xs()
                    .text_color(theme.muted_foreground)
                    .child(Dot::new(self.tone))
                    .child(div().truncate().child(self.label)),
            )
            .child(
                div()
                    .text_lg()
                    .font_weight(FontWeight::SEMIBOLD)
                    .text_color(color)
                    .child(self.value),
            )
            .when_some(self.delta, |this, delta| {
                this.child(
                    div()
                        .font_family(mono)
                        .text_xs()
                        .text_color(color)
                        .child(delta),
                )
            })
    }
}

type ClickHandler = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App)>;

/// A follow-up prompt on a full-width row with a hairline under it.
///
/// ```ignore
/// FollowUpRow::new("follow-up-age", "How old is the oldest witness?")
///     .on_click(cx.listener(|this, _, _, cx| this.ask(cx)))
/// ```
#[derive(IntoElement)]
pub struct FollowUpRow {
    id: ElementId,
    label: SharedString,
    on_click: Option<ClickHandler>,
}

impl FollowUpRow {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            on_click: None,
        }
    }

    pub fn on_click(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_click = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for FollowUpRow {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let hover = subtle(cx);
        h_flex()
            .id(self.id)
            .w_full()
            .h_8()
            .px_1()
            .gap_2p5()
            .border_b_1()
            .border_color(theme.border)
            .text_sm()
            .text_color(theme.foreground)
            .cursor_pointer()
            .hover(move |this| this.bg(hover))
            .child(
                Icon::new(LucideIcon::CornerDownLeft)
                    .small()
                    .flex_none()
                    .text_color(theme.muted_foreground),
            )
            .child(div().truncate().child(self.label))
            .when_some(self.on_click, |this, on_click| {
                this.on_click(move |event, window, cx| on_click(event, window, cx))
            })
    }
}
