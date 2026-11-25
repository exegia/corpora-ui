//! FilterTable and RecordsTable: `react/src/components/composed/chat`.

use std::collections::BTreeSet;
use std::rc::Rc;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::component::checkbox::Checkbox;
use gpui_kit::component::{ActiveTheme as _, Icon, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    App, Div, ElementId, FontWeight, IntoElement, ParentElement as _, RenderOnce, SharedString,
    Styled as _, Window, div, rems,
};

use crate::atoms::{Button, Card, Dot, Tag, TagTone, Tone, subtle};
use crate::foundations::AtomSize;

/// A cell that shares the row with its neighbours and cuts long text short.
fn cell(weight: f32) -> Div {
    let mut cell = div().min_w_0().px_2().truncate();
    cell.style().flex_grow = Some(weight);
    cell.style().flex_shrink = Some(1.);
    cell.flex_basis(rems(0.))
}

/// A status rows can be filtered by.
#[derive(Clone, Debug, PartialEq)]
pub struct FilterStatus {
    pub id: SharedString,
    pub label: SharedString,
    pub tone: Tone,
}

impl FilterStatus {
    pub fn new(id: impl Into<SharedString>, label: impl Into<SharedString>, tone: Tone) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            tone,
        }
    }
}

/// A row of a [`FilterTable`]: its status and one cell per column.
#[derive(Clone, Debug, PartialEq)]
pub struct FilterRow {
    pub id: SharedString,
    /// The id of the row's [`FilterStatus`].
    pub status: SharedString,
    pub cells: Vec<SharedString>,
}

impl FilterRow {
    pub fn new(
        id: impl Into<SharedString>,
        status: impl Into<SharedString>,
        cells: impl IntoIterator<Item = impl Into<SharedString>>,
    ) -> Self {
        Self {
            id: id.into(),
            status: status.into(),
            cells: cells.into_iter().map(Into::into).collect(),
        }
    }
}

type FilterHandler = Rc<dyn Fn(Option<&SharedString>, &mut Window, &mut App)>;

/// The status picked in a [`FilterTable`]; `None` shows every row.
#[derive(Default)]
struct Filter(Option<SharedString>);

/// A compact table under a row of status filters with counts.
///
/// ```ignore
/// FilterTable::new("tasks")
///     .statuses([FilterStatus::new("done", "Done", Tone::Success)])
///     .columns(["Task", "Status", "Owner"])
///     .status_column(1)
///     .rows([FilterRow::new("t1", "done", ["Collate John 1", "", "Ada"])])
/// ```
///
/// The cell of the status column is drawn from the row's status, so its
/// text is ignored.
#[derive(IntoElement)]
pub struct FilterTable {
    id: ElementId,
    statuses: Vec<FilterStatus>,
    columns: Vec<SharedString>,
    status_column: Option<usize>,
    rows: Vec<FilterRow>,
    all_label: SharedString,
    on_filter_change: Option<FilterHandler>,
}

impl FilterTable {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            statuses: Vec::new(),
            columns: Vec::new(),
            status_column: None,
            rows: Vec::new(),
            all_label: "All".into(),
            on_filter_change: None,
        }
    }

    pub fn statuses(mut self, statuses: impl IntoIterator<Item = FilterStatus>) -> Self {
        self.statuses.extend(statuses);
        self
    }

    /// The column headers, in order.
    pub fn columns(mut self, columns: impl IntoIterator<Item = impl Into<SharedString>>) -> Self {
        self.columns.extend(columns.into_iter().map(Into::into));
        self
    }

    /// Which column shows the row's status, counted from 0.
    pub fn status_column(mut self, column: usize) -> Self {
        self.status_column = Some(column);
        self
    }

    pub fn rows(mut self, rows: impl IntoIterator<Item = FilterRow>) -> Self {
        self.rows.extend(rows);
        self
    }

    /// The label of the filter that shows every row.
    pub fn all_label(mut self, label: impl Into<SharedString>) -> Self {
        self.all_label = label.into();
        self
    }

    /// Called with the picked status id, or `None` for all rows.
    pub fn on_filter_change(
        mut self,
        handler: impl Fn(Option<&SharedString>, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_filter_change = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for FilterTable {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let child_id =
            |name: SharedString| ElementId::NamedChild(std::sync::Arc::new(self.id.clone()), name);
        let state = window.use_keyed_state(child_id("filter".into()), cx, |_, _| Filter::default());
        let current = state.read(cx).0.clone();

        let theme = cx.theme();
        let muted = theme.muted_foreground;
        let border = theme.border;

        let pill =
            |id: ElementId, target: Option<SharedString>, label: String, tone: Option<Tone>| {
                let active = current == target;
                let state = state.clone();
                let on_filter_change = self.on_filter_change.clone();
                Button::new(id)
                    .map(|this| {
                        if active {
                            this.secondary()
                        } else {
                            this.ghost()
                        }
                    })
                    .with_atom_size(AtomSize::Xs)
                    .pill(true)
                    .when_some(tone, |this, tone| this.start(Dot::new(tone).small()))
                    .label(label)
                    .on_click(move |_, window, cx| {
                        state.update(cx, |state, cx| {
                            state.0 = target.clone();
                            cx.notify();
                        });
                        if let Some(on_filter_change) = &on_filter_change {
                            on_filter_change(target.as_ref(), window, cx);
                        }
                    })
            };
        let filters = h_flex()
            .flex_wrap()
            .gap_1()
            .child(pill(
                child_id("all".into()),
                None,
                format!("{} {}", self.all_label, self.rows.len()),
                None,
            ))
            .children(self.statuses.iter().map(|status| {
                let count = self
                    .rows
                    .iter()
                    .filter(|row| row.status == status.id)
                    .count();
                pill(
                    child_id(format!("status-{}", status.id).into()),
                    Some(status.id.clone()),
                    format!("{} {count}", status.label),
                    Some(status.tone),
                )
            }));

        let visible: Vec<&FilterRow> = self
            .rows
            .iter()
            .filter(|row| {
                current
                    .as_ref()
                    .is_none_or(|current| &row.status == current)
            })
            .collect();
        let last = visible.len().saturating_sub(1);
        let header = h_flex()
            .px_1()
            .py_2p5()
            .border_b_1()
            .border_color(border)
            .text_xs()
            .font_weight(FontWeight::MEDIUM)
            .text_color(muted)
            .children(
                self.columns
                    .iter()
                    .map(|column| cell(1.).child(column.clone())),
            );
        let body = visible.iter().enumerate().map(|(index, row)| {
            h_flex()
                .px_1()
                .py_2p5()
                .text_sm()
                .when(index != last, |this| this.border_b_1().border_color(border))
                .children((0..self.columns.len()).map(|column| {
                    let status = (Some(column) == self.status_column)
                        .then(|| self.statuses.iter().find(|status| status.id == row.status))
                        .flatten();
                    match status {
                        Some(status) => cell(1.).child(
                            h_flex()
                                .gap_1p5()
                                .text_color(muted)
                                .child(Dot::new(status.tone).small())
                                .child(status.label.clone()),
                        ),
                        None => cell(1.).child(row.cells.get(column).cloned().unwrap_or_default()),
                    }
                }))
        });
        let empty = visible.is_empty().then(|| {
            div()
                .py_4()
                .text_center()
                .text_xs()
                .text_color(muted)
                .child("No rows")
        });

        v_flex().w_full().gap_2p5().child(filters).child(
            Card::new()
                .overflow_hidden()
                .child(header)
                .children(body)
                .children(empty),
        )
    }
}

/// A sortable column of a [`RecordsTable`].
#[derive(Clone, Copy, Debug, PartialEq, Eq, Hash)]
pub enum RecordColumn {
    Tags,
    LastInteraction,
    Strength,
}

/// A row of a [`RecordsTable`].
#[derive(Clone, Debug, Default, PartialEq)]
pub struct RecordRow {
    pub id: SharedString,
    pub name: SharedString,
    /// The letter in the row's avatar. The first letter of the name if unset.
    pub initial: Option<SharedString>,
    pub tags: Vec<(SharedString, TagTone)>,
    pub last_interaction: SharedString,
    pub strength: SharedString,
}

type SelectionHandler = Rc<dyn Fn(&BTreeSet<SharedString>, &mut Window, &mut App)>;
type SortHandler = Rc<dyn Fn(RecordColumn, &mut Window, &mut App)>;

/// The row ids selected in a [`RecordsTable`] that keeps its own selection.
#[derive(Default)]
struct Selection(BTreeSet<SharedString>);

/// A selectable table of records: a checkbox and index, an avatar and name,
/// tags with an overflow count, and two plain columns with sort buttons.
///
/// ```ignore
/// RecordsTable::new("witnesses")
///     .rows(rows)
///     .on_selection_change(cx.listener(|this, selected: &BTreeSet<SharedString>, _, cx| { /* … */ }))
///     .on_sort(cx.listener(|this, column: &RecordColumn, _, cx| { /* … */ }))
/// ```
///
/// Without [`Self::selected`] the table keeps its own selection. Sorting is
/// the owner's: the buttons only report which column was asked for.
#[derive(IntoElement)]
pub struct RecordsTable {
    id: ElementId,
    rows: Vec<RecordRow>,
    headers: [SharedString; 4],
    max_tags: usize,
    selected: Option<BTreeSet<SharedString>>,
    on_selection_change: Option<SelectionHandler>,
    on_sort: Option<SortHandler>,
}

impl RecordsTable {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            rows: Vec::new(),
            headers: [
                "Company".into(),
                "Categories".into(),
                "Last interaction".into(),
                "Connection".into(),
            ],
            max_tags: 2,
            selected: None,
            on_selection_change: None,
            on_sort: None,
        }
    }

    pub fn rows(mut self, rows: impl IntoIterator<Item = RecordRow>) -> Self {
        self.rows.extend(rows);
        self
    }

    /// The headers of the name, tags, last-interaction and strength columns.
    pub fn headers(mut self, headers: [impl Into<SharedString>; 4]) -> Self {
        self.headers = headers.map(Into::into);
        self
    }

    /// How many tags a row shows before the rest fold into "+N".
    pub fn max_tags(mut self, max_tags: usize) -> Self {
        self.max_tags = max_tags;
        self
    }

    /// Sets the selected row ids from outside.
    pub fn selected(mut self, selected: BTreeSet<SharedString>) -> Self {
        self.selected = Some(selected);
        self
    }

    pub fn on_selection_change(
        mut self,
        handler: impl Fn(&BTreeSet<SharedString>, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_selection_change = Some(Rc::new(handler));
        self
    }

    /// Called when a column's sort button is pressed.
    pub fn on_sort(
        mut self,
        handler: impl Fn(&RecordColumn, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_sort = Some(Rc::new(move |column, window, cx| {
            handler(&column, window, cx)
        }));
        self
    }
}

impl RenderOnce for RecordsTable {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let child_id =
            |name: SharedString| ElementId::NamedChild(std::sync::Arc::new(self.id.clone()), name);
        let state = window.use_keyed_state(child_id("selection".into()), cx, |_, _| {
            Selection::default()
        });
        let current = self
            .selected
            .clone()
            .unwrap_or_else(|| state.read(cx).0.clone());

        let theme = cx.theme();
        let muted = theme.muted_foreground;
        let border = theme.border;
        let selected_fill = theme.primary.opacity(0.08);
        let avatar_fill = subtle(cx);

        let update = {
            let state = state.clone();
            let on_selection_change = self.on_selection_change.clone();
            Rc::new(
                move |next: BTreeSet<SharedString>, window: &mut Window, cx: &mut App| {
                    state.update(cx, |state, cx| {
                        state.0 = next.clone();
                        cx.notify();
                    });
                    if let Some(on_selection_change) = &on_selection_change {
                        on_selection_change(&next, window, cx);
                    }
                },
            )
        };

        let all_ids: BTreeSet<SharedString> = self.rows.iter().map(|row| row.id.clone()).collect();
        let all = !all_ids.is_empty() && all_ids.iter().all(|id| current.contains(id));
        let some = !all && all_ids.iter().any(|id| current.contains(id));
        let lead = || div().flex_none().w(rems(3.5)).pl_3();
        // The label lines up with the cells under it; the button follows it.
        let sort = |column: RecordColumn, name: &'static str, label: SharedString| {
            let on_sort = self.on_sort.clone();
            h_flex()
                .gap_0p5()
                .child(div().truncate().child(label.clone()))
                .child(
                    Button::new(child_id(name.into()))
                        .ghost()
                        .with_atom_size(AtomSize::Xs)
                        .icon(Icon::new(LucideIcon::ChevronsUpDown))
                        .tooltip(format!("Sort by {}", label.to_lowercase()))
                        .on_click(move |_, window, cx| {
                            if let Some(on_sort) = &on_sort {
                                on_sort(column, window, cx);
                            }
                        }),
                )
        };
        let [name, tags, last_interaction, strength] = self.headers.clone();
        let toggle_all = update.clone();
        let header = h_flex()
            .py_1()
            .pr_1()
            .border_b_1()
            .border_color(border)
            .text_xs()
            .font_weight(FontWeight::MEDIUM)
            .text_color(muted)
            .child(
                lead().child(
                    Checkbox::new(child_id("all".into()))
                        .checked(all)
                        .indeterminate(some)
                        .tooltip("Select all")
                        .on_click(move |_, window, cx| {
                            let next = if all {
                                BTreeSet::new()
                            } else {
                                all_ids.clone()
                            };
                            toggle_all(next, window, cx);
                        }),
                ),
            )
            .child(cell(1.4).child(name))
            .child(cell(1.6).child(sort(RecordColumn::Tags, "sort-tags", tags)))
            .child(cell(1.).child(sort(
                RecordColumn::LastInteraction,
                "sort-last",
                last_interaction,
            )))
            .child(cell(1.).child(sort(RecordColumn::Strength, "sort-strength", strength)));

        let last = self.rows.len().saturating_sub(1);
        let max_tags = self.max_tags;
        let body = self.rows.into_iter().enumerate().map(|(index, row)| {
            let checked = current.contains(&row.id);
            let initial = row.initial.clone().unwrap_or_else(|| {
                row.name
                    .chars()
                    .next()
                    .map(|first| first.to_uppercase().to_string())
                    .unwrap_or_default()
                    .into()
            });
            let extra = row.tags.len().saturating_sub(max_tags);
            let toggle = update.clone();
            let toggled = {
                let mut next = current.clone();
                if !next.remove(&row.id) {
                    next.insert(row.id.clone());
                }
                next
            };
            h_flex()
                .py_2()
                .pr_1()
                .when(checked, |this| this.bg(selected_fill))
                .when(index != last, |this| this.border_b_1().border_color(border))
                .child(
                    lead().child(
                        h_flex()
                            .gap_2()
                            .child(
                                div()
                                    .w_3()
                                    .text_xs()
                                    .text_color(muted)
                                    .child((index + 1).to_string()),
                            )
                            .child(
                                Checkbox::new(child_id(format!("row-{}", row.id).into()))
                                    .checked(checked)
                                    .on_click(move |_, window, cx| {
                                        toggle(toggled.clone(), window, cx)
                                    }),
                            ),
                    ),
                )
                .child(
                    cell(1.4).child(
                        h_flex()
                            .gap_2()
                            .child(
                                h_flex()
                                    .flex_none()
                                    .justify_center()
                                    .size_5()
                                    .rounded_full()
                                    .bg(avatar_fill)
                                    .text_size(rems(0.5625))
                                    .font_weight(FontWeight::SEMIBOLD)
                                    .text_color(muted)
                                    .child(initial),
                            )
                            .child(
                                div()
                                    .truncate()
                                    .text_sm()
                                    .font_weight(FontWeight::MEDIUM)
                                    .child(row.name),
                            ),
                    ),
                )
                .child(
                    cell(1.6).child(
                        h_flex()
                            .gap_1()
                            .children(
                                row.tags
                                    .into_iter()
                                    .take(max_tags)
                                    .map(|(label, tone)| Tag::new(label).tone(tone)),
                            )
                            .when(extra > 0, |this| {
                                this.child(
                                    div().text_xs().text_color(muted).child(format!("+{extra}")),
                                )
                            }),
                    ),
                )
                .child(
                    cell(1.)
                        .text_sm()
                        .text_color(muted)
                        .child(row.last_interaction),
                )
                .child(cell(1.).text_sm().text_color(muted).child(row.strength))
        });

        Card::new().overflow_hidden().child(header).children(body)
    }
}
