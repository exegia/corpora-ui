//! Chart: `react/src/components/composed/chat/chart`.

use std::rc::Rc;
use std::sync::Arc;

use crate::atoms::{GlassSpec, GlassSurfaceExt as _};
use gpui_kit::component::chart::{AreaChart, BarChart, LineChart, PieChart};
use gpui_kit::component::plot::tooltip::{CrossLine, Dot as PlotDot, Tooltip};
use gpui_kit::component::plot::{Plot, PlotAppear, PlotElement, PlotHover, TooltipState};
use gpui_kit::component::{ActiveTheme as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    AnyElement, App, ElementId, FontWeight, InteractiveElement as _, IntoElement,
    ParentElement as _, Pixels, RenderOnce, SharedString, StatefulInteractiveElement as _,
    Styled as _, Window, div, px,
};
use gpui_kit::{Bounds, Hsla, Point};

use crate::atoms::{Card, CardFrame, CardFrameHeader, Dot, Pill, Tone};

/// How a [`Chart`] draws its data.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum ChartKind {
    /// One slice per row, sized by the first series.
    Pie,
    /// A pie with a hole, which [`Chart::center`] can fill.
    Donut,
    #[default]
    Area,
    Line,
    /// One bar per row, for one series at a time.
    Bar,
}

impl ChartKind {
    fn label(self) -> &'static str {
        match self {
            Self::Pie | Self::Donut => "Pie",
            Self::Area => "Area",
            Self::Line => "Line",
            Self::Bar => "Bar",
        }
    }

    fn is_round(self) -> bool {
        matches!(self, Self::Pie | Self::Donut)
    }
}

/// One point along the chart: a label and a value for each series, in the
/// series' order.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct ChartRow {
    pub label: SharedString,
    pub values: Vec<f64>,
}

impl ChartRow {
    pub fn new(label: impl Into<SharedString>, values: impl IntoIterator<Item = f64>) -> Self {
        Self {
            label: label.into(),
            values: values.into_iter().collect(),
        }
    }

    fn value(&self, series: usize) -> f64 {
        self.values.get(series).copied().unwrap_or(0.)
    }
}

/// The value range the line and area charts share. It always holds zero, so
/// positive data keeps its baseline and data below zero is not cut off.
fn value_domain(rows: &[ChartRow]) -> (f64, f64) {
    let values = || rows.iter().flat_map(|row| row.values.iter().copied());
    let low = values().fold(0_f64, f64::min);
    let high = values().fold(0_f64, f64::max);
    // The stock charts draw nothing over an empty range.
    if low == high {
        (low, low + 1.)
    } else {
        (low, high)
    }
}

/// One measure plotted across the rows.
#[derive(Clone, Debug, PartialEq)]
pub struct ChartSeries {
    pub key: SharedString,
    pub label: SharedString,
    /// Its color. The series colors in turn when unset.
    pub tone: Option<Tone>,
}

impl ChartSeries {
    pub fn new(key: impl Into<SharedString>, label: impl Into<SharedString>) -> Self {
        Self {
            key: key.into(),
            label: label.into(),
            tone: None,
        }
    }

    pub fn tone(mut self, tone: Tone) -> Self {
        self.tone = Some(tone);
        self
    }
}

/// The tone a series or slice takes by its position.
fn tone_at(index: usize) -> Tone {
    Tone::Series((index % 5) as u8 + 1)
}

/// A value as the legend prints it: grouped thousands, one decimal at most.
fn format_value(value: f64) -> String {
    let rounded = (value * 10.).round() / 10.;
    let whole = rounded.trunc().abs() as u64;
    let digits = whole.to_string();
    let mut grouped = String::new();
    for (index, digit) in digits.chars().enumerate() {
        if index > 0 && (digits.len() - index).is_multiple_of(3) {
            grouped.push(',');
        }
        grouped.push(digit);
    }
    let tenths = (rounded.fract().abs() * 10.).round() as u64;
    let sign = if rounded < 0. { "-" } else { "" };
    if tenths == 0 {
        format!("{sign}{grouped}")
    } else {
        format!("{sign}{grouped}.{tenths}")
    }
}

type SelectionHandler = Rc<dyn Fn(Option<&SharedString>, &mut Window, &mut App)>;

/// A small chart in a framed card: title, plot and a legend that picks one
/// series or slice out.
///
/// ```ignore
/// Chart::new("witnesses", ChartKind::Line)
///     .title("Witnesses by century")
///     .series([ChartSeries::new("greek", "Greek"), ChartSeries::new("latin", "Latin")])
///     .rows([
///         ChartRow::new("IV", [12., 3.]),
///         ChartRow::new("V", [18., 7.]),
///     ])
/// ```
///
/// It fills the width it is given. It keeps its own selection unless
/// [`Self::selected`] is set.
#[derive(IntoElement)]
pub struct Chart {
    id: ElementId,
    kind: ChartKind,
    title: Option<SharedString>,
    subtitle: Option<SharedString>,
    badge: Option<SharedString>,
    rows: Vec<ChartRow>,
    series: Vec<ChartSeries>,
    center: Option<(SharedString, Option<SharedString>)>,
    headerless: bool,
    plot_height: Option<Pixels>,
    legend: bool,
    interactive: bool,
    appear: bool,
    selected: Option<Option<SharedString>>,
    on_selection_change: Option<SelectionHandler>,
    empty: SharedString,
}

impl Chart {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>, kind: ChartKind) -> Self {
        Self {
            id: id.into(),
            kind,
            title: None,
            subtitle: None,
            badge: None,
            rows: Vec::new(),
            series: Vec::new(),
            center: None,
            headerless: false,
            plot_height: None,
            legend: true,
            interactive: true,
            appear: true,
            selected: None,
            on_selection_change: None,
            empty: "No data".into(),
        }
    }

    pub fn title(mut self, title: impl Into<SharedString>) -> Self {
        self.title = Some(title.into());
        self
    }

    pub fn subtitle(mut self, subtitle: impl Into<SharedString>) -> Self {
        self.subtitle = Some(subtitle.into());
        self
    }

    /// The pill in the header. The kind's name when unset.
    pub fn badge(mut self, badge: impl Into<SharedString>) -> Self {
        self.badge = Some(badge.into());
        self
    }

    pub fn rows(mut self, rows: impl IntoIterator<Item = ChartRow>) -> Self {
        self.rows.extend(rows);
        self
    }

    pub fn series(mut self, series: impl IntoIterator<Item = ChartSeries>) -> Self {
        self.series.extend(series);
        self
    }

    /// A figure and a caption in the hole of a donut.
    pub fn center(mut self, value: impl Into<SharedString>) -> Self {
        self.center = Some((value.into(), None));
        self
    }

    /// The caption under [`Self::center`]'s figure.
    pub fn center_label(mut self, label: impl Into<SharedString>) -> Self {
        if let Some(center) = &mut self.center {
            center.1 = Some(label.into());
        }
        self
    }

    /// Drops the frame and header, leaving the plot and legend.
    pub fn headerless(mut self) -> Self {
        self.headerless = true;
        self
    }

    /// The height of the plot. 150px, or 140px for a pie.
    pub fn plot_height(mut self, height: Pixels) -> Self {
        self.plot_height = Some(height);
        self
    }

    pub fn legend(mut self, legend: bool) -> Self {
        self.legend = legend;
        self
    }

    /// Whether the legend selects and the plot answers the pointer. On by
    /// default.
    pub fn interactive(mut self, interactive: bool) -> Self {
        self.interactive = interactive;
        self
    }

    /// Whether the data draws in the first time the chart is painted. On by
    /// default; the system's reduced-motion setting skips it anyway.
    pub fn appear(mut self, appear: bool) -> Self {
        self.appear = appear;
        self
    }

    /// Sets the selected series key or slice label, making the owner
    /// responsible for it.
    pub fn selected(mut self, selected: Option<SharedString>) -> Self {
        self.selected = Some(selected);
        self
    }

    /// Called with the new selection, or `None` when it is cleared.
    pub fn on_selection_change(
        mut self,
        handler: impl Fn(Option<&SharedString>, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_selection_change = Some(Rc::new(handler));
        self
    }

    /// What shows in place of the plot when there are no rows or series.
    pub fn empty(mut self, empty: impl Into<SharedString>) -> Self {
        self.empty = empty.into();
        self
    }
}

/// Keep stock hit testing, animation and marker motion, replacing only the
/// opaque tooltip surface with the gallery's backdrop blur material.
struct GlassPlot<P> {
    plot: P,
    rows: Vec<ChartRow>,
    label: SharedString,
    value_index: usize,
    color: Hsla,
    round: bool,
}
impl<P: Plot + 'static> IntoElement for GlassPlot<P> {
    type Element = PlotElement<Self>;
    fn into_element(self) -> Self::Element {
        PlotElement::new(self)
    }
}
impl<P: Plot + 'static> Plot for GlassPlot<P> {
    fn prepaint(&mut self, b: Bounds<Pixels>, w: &mut Window, cx: &mut App) -> Vec<AnyElement> {
        self.plot.prepaint(b, w, cx)
    }
    fn paint(&mut self, b: Bounds<Pixels>, w: &mut Window, cx: &mut App) {
        self.plot.paint(b, w, cx);
    }
    fn id(&self) -> Option<ElementId> {
        self.plot.id()
    }
    fn interactive(&self) -> bool {
        self.plot.interactive()
    }
    fn appear(&mut self, a: PlotAppear, w: &mut Window, cx: &mut App) {
        self.plot.appear(a, w, cx);
    }
    fn appear_generation(&self) -> Option<u64> {
        self.plot.appear_generation()
    }
    fn tooltip_state(&self, p: Point<Pixels>, b: Bounds<Pixels>, cx: &App) -> Option<TooltipState> {
        self.plot.tooltip_state(p, b, cx)
    }
    fn hover(&mut self, h: Option<&PlotHover>, w: &mut Window, cx: &mut App) {
        self.plot.hover(h, w, cx);
    }
    fn tooltip(
        &self,
        state: &TooltipState,
        cursor: Point<Pixels>,
        bounds: Bounds<Pixels>,
        _: &mut Window,
        cx: &mut App,
    ) -> Option<AnyElement> {
        let row = self.rows.get(state.index)?;
        let color = if self.round {
            tone_at(state.index).color(cx)
        } else {
            self.color
        };
        let spec = GlassSpec {
            blur_radius: px(18.),
            tint: Some(cx.theme().popover.opacity(0.25)),
            ..GlassSpec::blur()
        };
        let content = v_flex()
            .min_w(px(150.))
            .p_2()
            .gap_1()
            .rounded_lg()
            .text_color(cx.theme().popover_foreground)
            .child(
                div()
                    .font_weight(FontWeight::SEMIBOLD)
                    .child(row.label.clone()),
            )
            .child(
                h_flex()
                    .gap_2()
                    .child(div().size_2().rounded_full().bg(color))
                    .child(div().flex_1().child(self.label.clone()))
                    .child(format_value(row.value(self.value_index))),
            )
            .glass_with(spec);
        let positioned = div()
            .absolute()
            .child(content)
            .map(|d| {
                if cursor.x < bounds.size.width * 0.5 {
                    d.left(cursor.x + px(8.))
                } else {
                    d.right(bounds.size.width - cursor.x + px(8.))
                }
            })
            .map(|d| {
                if cursor.y < bounds.size.height * 0.5 {
                    d.top(cursor.y + px(8.))
                } else {
                    d.bottom(bounds.size.height - cursor.y + px(8.))
                }
            });
        Some(
            Tooltip::new(cursor, bounds.size)
                .appearance(false)
                .when(!self.round, |t| {
                    t.cross_line(CrossLine::new(state.cross_line))
                })
                .dots(state.dots.iter().map(|point| {
                    PlotDot::new(*point)
                        .size(px(8.))
                        .halo(px(20.))
                        .stroke(cx.theme().background)
                        .fill(color)
                }))
                .child(positioned)
                .into_any_element(),
        )
    }
}

impl RenderOnce for Chart {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let id = Arc::new(self.id);
        let child_id = |name: String| ElementId::NamedChild(id.clone(), name.into());
        let memory =
            window.use_keyed_state(
                child_id("selection".into()),
                cx,
                |_, _| None::<SharedString>,
            );
        let selected = match self.selected.clone() {
            Some(selected) => selected,
            None => memory.read(cx).clone(),
        };

        let theme = cx.theme();
        let muted = theme.muted_foreground;
        let kind = self.kind;
        let round = kind.is_round();
        let empty = self.rows.is_empty() || self.series.is_empty();
        let height = self
            .plot_height
            .unwrap_or(if round { px(140.) } else { px(150.) });
        let colors: Vec<_> = self
            .series
            .iter()
            .enumerate()
            .map(|(index, series)| series.tone.unwrap_or_else(|| tone_at(index)).color(cx))
            .collect();
        let slice_colors: Vec<_> = (0..self.rows.len())
            .map(|index| tone_at(index).color(cx))
            .collect();
        // A series or slice steps back when another is picked out.
        let dim = |key: &SharedString| selected.as_ref().is_some_and(|picked| picked != key);
        let top = self
            .series
            .iter()
            .position(|series| selected.as_ref() == Some(&series.key))
            .unwrap_or(0);
        let (low, high) = value_domain(&self.rows);
        let interactive = self.interactive;
        let appear = self.appear;

        let plot: AnyElement = if empty {
            h_flex()
                .h(height)
                .justify_center()
                .text_xs()
                .text_color(muted)
                .child(self.empty)
                .into_any_element()
        } else if round {
            let picked = selected.clone();
            let slices: Vec<(usize, ChartRow)> = self.rows.iter().cloned().enumerate().collect();
            let pie = PieChart::new(slices)
                .id(child_id("pie".into()))
                .interactive(interactive)
                .appear(appear)
                .value(|(_, row): &(usize, ChartRow)| row.value(0) as f32)
                .color(move |(index, row): &(usize, ChartRow)| {
                    let color = slice_colors[*index];
                    if picked.as_ref().is_some_and(|picked| picked != &row.label) {
                        color.opacity(0.35)
                    } else {
                        color
                    }
                })
                .tooltip_name(|(_, row): &(usize, ChartRow)| row.label.clone())
                .when(kind == ChartKind::Donut, |this| {
                    this.inner_radius_ratio(0.62)
                });
            div()
                .relative()
                .flex_none()
                .size(height)
                .child(GlassPlot {
                    plot: pie,
                    rows: self.rows.clone(),
                    label: self.series[0].label.clone(),
                    value_index: 0,
                    color: colors[0],
                    round: true,
                })
                .when_some(self.center, |this, (value, label)| {
                    this.child(
                        v_flex()
                            .absolute()
                            .inset_0()
                            .items_center()
                            .justify_center()
                            .child(
                                div()
                                    .text_lg()
                                    .font_weight(FontWeight::SEMIBOLD)
                                    .child(value),
                            )
                            .when_some(label, |this, label| {
                                this.child(div().text_xs().text_color(muted).child(label))
                            }),
                    )
                })
                .into_any_element()
        } else if kind == ChartKind::Bar {
            let color = colors[top];
            div()
                .w_full()
                .h(height)
                .child(
                    BarChart::new(self.rows.clone())
                        .id(child_id("bars".into()))
                        .interactive(interactive)
                        .appear(appear)
                        .name(self.series[top].label.clone())
                        .band(|row: &ChartRow| row.label.clone())
                        .value(move |row: &ChartRow| row.value(top))
                        .fill(move |_, _, _, _| color)
                        .map(|plot| GlassPlot {
                            plot,
                            rows: self.rows.clone(),
                            label: self.series[top].label.clone(),
                            value_index: top,
                            color,
                            round: false,
                        }),
                )
                .into_any_element()
        } else {
            // One stock chart per series, laid over each other on a shared
            // scale, with the selected one last so it draws on top.
            let order = (0..self.series.len())
                .filter(|index| *index != top)
                .chain([top]);
            div()
                .relative()
                .w_full()
                .h(height)
                .children(order.enumerate().map(|(layer, index)| {
                    let series = &self.series[index];
                    let color = if dim(&series.key) {
                        colors[index].opacity(0.35)
                    } else {
                        colors[index]
                    };
                    let plot_id = child_id(format!("plot-{}", series.key));
                    let on_top = index == top;
                    let layer_plot: AnyElement = if kind == ChartKind::Area {
                        AreaChart::new(self.rows.clone())
                            .id(plot_id)
                            .interactive(interactive && on_top)
                            .appear(appear)
                            .name(series.label.clone())
                            .x(|row: &ChartRow| row.label.clone())
                            .y(move |row: &ChartRow| row.value(index))
                            .y_domain(low, high)
                            .natural()
                            .grid(layer == 0)
                            .stroke(color)
                            .fill(color.opacity(0.18 * color.a))
                            .map(|plot| GlassPlot {
                                plot,
                                rows: self.rows.clone(),
                                label: series.label.clone(),
                                value_index: index,
                                color,
                                round: false,
                            })
                            .into_any_element()
                    } else {
                        LineChart::new(self.rows.clone())
                            .id(plot_id)
                            .interactive(interactive && on_top)
                            .appear(appear)
                            .name(series.label.clone())
                            .x(|row: &ChartRow| row.label.clone())
                            .y(move |row: &ChartRow| row.value(index))
                            .y_domain(low, high)
                            .natural()
                            .grid(layer == 0)
                            .stroke(color)
                            .map(|plot| GlassPlot {
                                plot,
                                rows: self.rows.clone(),
                                label: series.label.clone(),
                                value_index: index,
                                color,
                                round: false,
                            })
                            .into_any_element()
                    };
                    div().absolute().inset_0().child(layer_plot)
                }))
                .into_any_element()
        };

        // A pie lists its slices with their values; the rest list series.
        let entries: Vec<(SharedString, SharedString, Option<String>, Tone)> = if round {
            self.rows
                .iter()
                .enumerate()
                .map(|(index, row)| {
                    (
                        row.label.clone(),
                        row.label.clone(),
                        Some(format_value(row.value(0))),
                        tone_at(index),
                    )
                })
                .collect()
        } else {
            self.series
                .iter()
                .enumerate()
                .map(|(index, series)| {
                    (
                        series.key.clone(),
                        series.label.clone(),
                        None,
                        series.tone.unwrap_or_else(|| tone_at(index)),
                    )
                })
                .collect()
        };
        let controlled = self.selected.is_some();
        let on_selection_change = self.on_selection_change;
        let legend = (self.legend && !empty).then(|| {
            div()
                .flex()
                .flex_wrap()
                .gap_x_3()
                .gap_y_1p5()
                .when(round, |this| this.flex_col().flex_1().min_w_24())
                .children(entries.into_iter().map(|(key, label, value, tone)| {
                    let dimmed = dim(&key);
                    let next = (selected.as_ref() != Some(&key)).then(|| key.clone());
                    let memory = memory.clone();
                    let on_selection_change = on_selection_change.clone();
                    h_flex()
                        .id(child_id(format!("legend-{key}")))
                        .gap_1p5()
                        .text_xs()
                        .when(dimmed, |this| this.opacity(0.4))
                        .child(Dot::new(tone).small())
                        .child(div().text_color(muted).child(label))
                        .when_some(value, |this, value| {
                            this.child(div().ml_auto().font_weight(FontWeight::MEDIUM).child(value))
                        })
                        .when(interactive, |this| {
                            this.cursor_pointer().on_click(move |_, window, cx| {
                                if !controlled {
                                    memory.update(cx, |memory, cx| {
                                        *memory = next.clone();
                                        cx.notify();
                                    });
                                }
                                if let Some(on_selection_change) = &on_selection_change {
                                    on_selection_change(next.as_ref(), window, cx);
                                }
                            })
                        })
                }))
        });

        let body = if round {
            h_flex()
                .flex_wrap()
                .items_center()
                .justify_center()
                .gap_6()
                .child(plot)
                .children(legend)
        } else {
            v_flex().gap_3().child(plot).children(legend)
        };

        if self.headerless {
            return div().w_full().child(body).into_any_element();
        }
        let badge = self.badge.unwrap_or_else(|| kind.label().into());
        div()
            .w_full()
            .child(
                CardFrame::new()
                    .header(
                        CardFrameHeader::new(self.title.unwrap_or_default())
                            .when_some(self.subtitle, |this, subtitle| this.description(subtitle))
                            .action(Pill::new(badge)),
                    )
                    .card(Card::new().child(div().p_3p5().child(body))),
            )
            .into_any_element()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn format_value_groups_thousands_and_keeps_one_decimal() {
        assert_eq!(format_value(1204.), "1,204");
        assert_eq!(format_value(63.94), "63.9");
        assert_eq!(format_value(1_000_000.), "1,000,000");
        assert_eq!(format_value(-12.5), "-12.5");
        assert_eq!(format_value(0.), "0");
    }

    #[test]
    fn the_shared_domain_holds_zero_and_every_value() {
        let row = |values: &[f64]| ChartRow::new("row", values.iter().copied());
        // Positive data keeps its zero baseline.
        assert_eq!(value_domain(&[row(&[12., 3.]), row(&[48., 7.])]), (0., 48.));
        assert_eq!(value_domain(&[row(&[-5., 3.])]), (-5., 3.));
        // All below zero: the range still reaches up to it.
        assert_eq!(value_domain(&[row(&[-5.]), row(&[-2.])]), (-5., 0.));
        // The stock charts draw nothing over an empty range.
        assert_eq!(value_domain(&[row(&[0., 0.])]), (0., 1.));
        assert_eq!(value_domain(&[]), (0., 1.));
    }

    #[test]
    fn tones_come_round_after_five() {
        assert_eq!(tone_at(0), Tone::Series(1));
        assert_eq!(tone_at(5), Tone::Series(1));
        assert_eq!(tone_at(7), Tone::Series(3));
    }
}
