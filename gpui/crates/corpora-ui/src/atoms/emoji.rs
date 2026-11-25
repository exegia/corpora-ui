//! EmojiPicker: `react/src/components/ui/emoji-picker.tsx`.

use std::cell::Cell;
use std::collections::HashSet;
use std::ops::Range;
use std::rc::Rc;
use std::time::Duration;

use gpui_kit::component::input::{Input, InputEvent, InputState};
use gpui_kit::component::{ActiveTheme as _, Icon, IconName, Sizable as _, StyledExt as _, h_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    AnyElement, App, AppContext as _, Context, Entity, Hsla, InteractiveElement as _, IntoElement,
    ParentElement as _, RenderOnce, SharedString, StatefulInteractiveElement as _, Styled as _,
    Subscription, Task, TextRun, UniformListScrollHandle, Window, div, point, px, rems,
    uniform_list,
};

use super::{Button, GlassSpec, GlassSurfaceExt as _};
use crate::foundations::{AtomSize, Radius};

/// Emoji per row of the grid.
const COLUMNS: usize = 9;
/// Side of one emoji cell, and the height of every row, in rems.
const CELL: f32 = 2.;
/// Rows of the list the floating header covers: the search field and the
/// group filters.
const HEADER_ROWS: usize = 2;
/// Frames a jump to a group takes.
const SCROLL_FRAMES: u32 = 14;
/// Height of the whole picker, in rems.
const HEIGHT: f32 = 20.375;
/// Width of the whole picker, in rems: the grid and its side insets.
pub(crate) const WIDTH: f32 = CELL * COLUMNS as f32 + 1.;

/// The newest Emoji version every supported system font draws, as (major,
/// minor). A later emoji is listed only once the text system shows it has a
/// glyph for it, so the picker never offers an empty box.
const BASELINE_VERSION: (u32, u32) = (15, 1);

/// The emoji this machine cannot draw.
type Missing = HashSet<&'static str>;

/// An emoji and its name.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct Emoji {
    pub emoji: SharedString,
    /// The emoji's name, such as "thumbs up". Names it to assistive
    /// technology.
    pub label: SharedString,
}

impl Emoji {
    pub fn new(emoji: impl Into<SharedString>, label: impl Into<SharedString>) -> Self {
        Self {
            emoji: emoji.into(),
            label: label.into(),
        }
    }
}

impl From<&'static emojis::Emoji> for Emoji {
    fn from(emoji: &'static emojis::Emoji) -> Self {
        Self::new(emoji.as_str(), emoji.name())
    }
}

fn group_label(group: emojis::Group) -> &'static str {
    match group {
        emojis::Group::SmileysAndEmotion => "Smileys & emotion",
        emojis::Group::PeopleAndBody => "People & body",
        emojis::Group::AnimalsAndNature => "Animals & nature",
        emojis::Group::FoodAndDrink => "Food & drink",
        emojis::Group::TravelAndPlaces => "Travel & places",
        emojis::Group::Activities => "Activities",
        emojis::Group::Objects => "Objects",
        emojis::Group::Symbols => "Symbols",
        emojis::Group::Flags => "Flags",
    }
}

/// The emoji that stands for a group on its filter.
fn group_icon(group: emojis::Group) -> &'static str {
    match group {
        emojis::Group::SmileysAndEmotion => "😀",
        emojis::Group::PeopleAndBody => "👋",
        emojis::Group::AnimalsAndNature => "🐻",
        emojis::Group::FoodAndDrink => "🍔",
        emojis::Group::TravelAndPlaces => "🚗",
        emojis::Group::Activities => "⚽",
        emojis::Group::Objects => "💡",
        emojis::Group::Symbols => "🔣",
        emojis::Group::Flags => "🏁",
    }
}

/// One line of the picker's list. Every line is the same height, so the list
/// can skip the ones out of view.
#[derive(Clone, Debug, PartialEq)]
enum Row {
    Header(emojis::Group),
    Emojis(Vec<&'static emojis::Emoji>),
}

/// Whether an emoji is newer than every system font can be trusted to draw.
fn is_recent(emoji: &emojis::Emoji) -> bool {
    let version = emoji.emoji_version();
    (version.major(), version.minor()) > BASELINE_VERSION
}

/// The recent emoji the text system has no glyph for. A font that knows an
/// emoji shapes it to a single color glyph; one that does not falls back to
/// a placeholder or to the sequence's separate parts.
fn missing(window: &Window) -> Missing {
    let font = window.text_style().font();
    let size = window.rem_size();
    emojis::iter()
        .filter(|emoji| is_recent(emoji))
        .filter(|emoji| {
            let text = emoji.as_str();
            let run = TextRun {
                len: text.len(),
                font: font.clone(),
                color: Hsla::default(),
                background_color: None,
                underline: None,
                strikethrough: None,
            };
            let line = window
                .text_system()
                .shape_line(text.into(), size, &[run], None);
            let mut glyphs = line.runs.iter().flat_map(|run| &run.glyphs);
            !matches!((glyphs.next(), glyphs.next()), (Some(glyph), None) if glyph.is_emoji)
        })
        .map(|emoji| emoji.as_str())
        .collect()
}

/// Whether an emoji answers a search: every word of the query must appear in
/// its name or one of its shortcodes.
fn matches(emoji: &emojis::Emoji, query: &str) -> bool {
    query.split_whitespace().all(|word| {
        emoji.name().contains(word) || emoji.shortcodes().any(|code| code.contains(word))
    })
}

/// The list for a query: each group's header, then its emoji in rows.
/// Groups with no match are left out.
fn rows(query: &str, missing: &Missing) -> Vec<Row> {
    let query = query.trim().to_lowercase();
    let mut rows = Vec::new();
    for group in emojis::Group::iter() {
        let found: Vec<_> = group
            .emojis()
            .filter(|emoji| !missing.contains(emoji.as_str()) && matches(emoji, &query))
            .collect();
        if found.is_empty() {
            continue;
        }
        rows.push(Row::Header(group));
        rows.extend(
            found
                .chunks(COLUMNS)
                .map(|chunk| Row::Emojis(chunk.to_vec())),
        );
    }
    rows
}

/// The state of an [`EmojiPicker`]: its search text, the list that search
/// leaves, and the emoji under the pointer.
///
/// Create it once and keep it in the view that shows the picker:
///
/// ```ignore
/// let picker = cx.new(|cx| EmojiPickerState::new(window, cx));
/// ```
pub struct EmojiPickerState {
    search: Entity<InputState>,
    rows: Rc<Vec<Row>>,
    missing: Rc<Missing>,
    active: Option<Emoji>,
    scroll: UniformListScrollHandle,
    /// The jump to a group in progress.
    scrolling: Option<Task<()>>,
    /// Whether an [`crate::composed::EmojiActionBar`] bound to this state
    /// shows the full picker in place of its quick row.
    expanded: bool,
    /// The width of a bound action bar's quick row, in rems, with the
    /// number of commands it was measured for. The bar grows from this
    /// width to the picker's.
    pub(crate) row_width: Rc<Cell<Option<(usize, f32)>>>,
    _search_changed: Subscription,
}

impl EmojiPickerState {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let search = cx.new(|cx| InputState::new(window, cx).placeholder("Search emoji"));
        let search_changed = cx.subscribe(&search, |this, search, event: &InputEvent, cx| {
            if matches!(event, InputEvent::Change) {
                this.rows = Rc::new(rows(&search.read(cx).value(), &this.missing));
                this.active = None;
                this.scroll_to_top();
                cx.notify();
            }
        });
        let missing = Rc::new(missing(window));
        Self {
            search,
            rows: Rc::new(rows("", &missing)),
            missing,
            active: None,
            scroll: UniformListScrollHandle::new(),
            scrolling: None,
            expanded: false,
            row_width: Rc::default(),
            _search_changed: search_changed,
        }
    }

    /// Whether a bound action bar shows the full picker.
    pub fn is_expanded(&self) -> bool {
        self.expanded
    }

    /// Swaps a bound action bar between its quick row and the full picker.
    pub fn set_expanded(&mut self, expanded: bool, cx: &mut Context<Self>) {
        if self.expanded != expanded {
            self.expanded = expanded;
            cx.notify();
        }
    }

    /// Clears the search and folds a bound action bar back to its quick row,
    /// ready for the next time the picker opens.
    pub fn reset(&mut self, window: &mut Window, cx: &mut Context<Self>) {
        self.search
            .update(cx, |search, cx| search.set_value("", window, cx));
        self.rows = Rc::new(rows("", &self.missing));
        self.active = None;
        self.expanded = false;
        self.scroll_to_top();
        cx.notify();
    }

    fn scroll_to_top(&mut self) {
        self.scrolling = None;
        self.scroll
            .0
            .borrow()
            .base_handle
            .set_offset(point(px(0.), px(0.)));
    }

    /// Scrolls the list until a group's label sits just under the header.
    /// Does nothing if the search has left the group out.
    pub fn scroll_to_group(
        &mut self,
        group: emojis::Group,
        window: &Window,
        cx: &mut Context<Self>,
    ) {
        let Some(row) = self.rows.iter().position(|row| *row == Row::Header(group)) else {
            return;
        };
        let list = self.scroll.0.borrow().base_handle.clone();
        let from = list.offset().y;
        // The list opens with one blank row per header row, so the row that
        // follows them is at rest with no scroll at all.
        let to = (-(window.rem_size() * CELL * row as f32)).max(-list.max_offset().y);
        self.scrolling = Some(cx.spawn(async move |this, cx| {
            for frame in 1..=SCROLL_FRAMES {
                cx.background_executor()
                    .timer(Duration::from_millis(16))
                    .await;
                let progress = frame as f32 / SCROLL_FRAMES as f32;
                let eased = 1. - (1. - progress).powi(3);
                list.set_offset(point(px(0.), from + (to - from) * eased));
                if this.update(cx, |_, cx| cx.notify()).is_err() {
                    break;
                }
            }
        }));
    }

    fn set_active(&mut self, active: Option<Emoji>, cx: &mut Context<Self>) {
        if self.active != active {
            self.active = active;
            cx.notify();
        }
    }
}

type SelectHandler = Rc<dyn Fn(&Emoji, &mut Window, &mut App)>;

/// The full emoji picker: a search field, every emoji by group, and a footer
/// naming the one under the pointer.
///
/// ```ignore
/// EmojiPicker::new(&self.picker)
///     .on_select(cx.listener(|this, emoji, _, cx| this.react(emoji.clone(), cx)))
/// ```
#[derive(IntoElement)]
pub struct EmojiPicker {
    state: Entity<EmojiPickerState>,
    on_select: Option<SelectHandler>,
    action: Option<AnyElement>,
}

impl EmojiPicker {
    pub fn new(state: &Entity<EmojiPickerState>) -> Self {
        Self {
            state: state.clone(),
            on_select: None,
            action: None,
        }
    }

    pub fn on_select(mut self, handler: impl Fn(&Emoji, &mut Window, &mut App) + 'static) -> Self {
        self.on_select = Some(Rc::new(handler));
        self
    }

    /// A control beside the search field, such as a button that closes the
    /// picker.
    pub fn action(mut self, action: impl IntoElement) -> Self {
        self.action = Some(action.into_any_element());
        self
    }
}

impl RenderOnce for EmojiPicker {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let (search, rows, active, scroll) = {
            let state = self.state.read(cx);
            (
                state.search.clone(),
                state.rows.clone(),
                state.active.clone(),
                state.scroll.clone(),
            )
        };
        let accent = theme.accent;
        let muted = theme.muted_foreground;
        let header_ink = theme.secondary_foreground;
        let border = theme.border;
        // Over the frosted header the accent fill is too faint to read.
        let marker = theme.foreground.opacity(0.12);
        let radius = Radius::Sm.resolve(cx);

        // The group at the top of the list, just under the header.
        let scrolled = -scroll.0.borrow().base_handle.offset().y / (window.rem_size() * CELL);
        let top_row = scrolled.round().max(0.) as usize;
        let current = rows
            .iter()
            .take(top_row + 1)
            .rev()
            .find_map(|row| match row {
                Row::Header(group) => Some(*group),
                Row::Emojis(_) => None,
            });

        let filters =
            h_flex()
                .h(rems(CELL))
                .px_2()
                .children(emojis::Group::iter().enumerate().map(|(index, group)| {
                    let state = self.state.clone();
                    // Marks the group in view.
                    let marked = current == Some(group);
                    div()
                        .flex()
                        .flex_none()
                        .items_center()
                        .justify_center()
                        .size(rems(CELL))
                        .rounded(radius)
                        .when(marked, |this| this.bg(marker))
                        .child(
                            Button::new(("emoji-group", index))
                                .ghost()
                                .with_atom_size(AtomSize::Xs)
                                .start(div().text_sm().child(group_icon(group)))
                                .tooltip(group_label(group))
                                .disabled(!rows.contains(&Row::Header(group)))
                                .on_click(move |_, window, cx| {
                                    state.update(cx, |state, cx| {
                                        state.scroll_to_group(group, window, cx);
                                    });
                                }),
                        )
                }));

        // The header floats over the list, which scrolls underneath it and
        // shows through, blurred.
        let header = div()
            .absolute()
            .top_0()
            .left_0()
            .right_0()
            .h(rems(CELL * HEADER_ROWS as f32))
            .flex()
            .flex_col()
            .rounded_t(Radius::Lg.resolve(cx))
            .border_b_1()
            .border_color(border)
            // Rows under the header take no clicks, but the wheel still
            // reaches the list.
            .block_mouse_except_scroll()
            .child(
                h_flex()
                    .h(rems(CELL))
                    .flex_none()
                    .gap_1()
                    .px_1()
                    .child(
                        div().flex_1().min_w_0().child(
                            Input::new(&search)
                                .appearance(false)
                                .prefix(Icon::new(IconName::Search).small().text_color(muted)),
                        ),
                    )
                    .children(self.action),
            )
            .child(filters)
            .glass_with(GlassSpec::scrim(cx));

        let list = if rows.is_empty() {
            div()
                .flex_1()
                .flex()
                .items_center()
                .justify_center()
                .pt(rems(CELL * HEADER_ROWS as f32))
                .text_sm()
                .text_color(muted)
                .child("No emoji found.")
                .into_any_element()
        } else {
            let state = self.state.clone();
            let on_select = self.on_select.clone();
            uniform_list(
                "emoji-picker-rows",
                rows.len() + HEADER_ROWS,
                move |range: Range<usize>, _, _| {
                    range
                        .map(|index| {
                            // The first rows are blank: they lie under the
                            // header while the list is at rest.
                            let row = index.checked_sub(HEADER_ROWS).map(|index| &rows[index]);
                            match row {
                                None => div().h(rems(CELL)),
                                Some(Row::Header(group)) => h_flex()
                                    .h(rems(CELL))
                                    .px_1()
                                    .text_xs()
                                    .font_medium()
                                    .text_color(header_ink)
                                    .child(group_label(*group)),
                                Some(Row::Emojis(emojis)) => {
                                    h_flex().h(rems(CELL)).children(emojis.iter().map(|&emoji| {
                                        let state = state.clone();
                                        let on_select = on_select.clone();
                                        let hovered = state.clone();
                                        div()
                                            .id(emoji.as_str())
                                            .flex()
                                            .flex_none()
                                            .items_center()
                                            .justify_center()
                                            .size(rems(CELL))
                                            .rounded(radius)
                                            .cursor_pointer()
                                            .text_xl()
                                            .hover(move |style| style.bg(accent))
                                            .child(emoji.as_str())
                                            .on_hover(move |is_hovered, _, cx| {
                                                let active = is_hovered.then(|| Emoji::from(emoji));
                                                hovered.update(cx, |state, cx| {
                                                    // Leaving one cell must not
                                                    // clear the cell just entered.
                                                    if active.is_some()
                                                        || state.active.as_ref()
                                                            == Some(&Emoji::from(emoji))
                                                    {
                                                        state.set_active(active, cx);
                                                    }
                                                });
                                            })
                                            .on_click(move |_, window, cx| {
                                                if let Some(on_select) = &on_select {
                                                    on_select(&Emoji::from(emoji), window, cx);
                                                }
                                                state.update(cx, |state, cx| {
                                                    state.reset(window, cx)
                                                });
                                            })
                                    }))
                                }
                            }
                        })
                        .collect::<Vec<_>>()
                },
            )
            .track_scroll(&scroll)
            .flex_1()
            .into_any_element()
        };

        let footer = match active {
            Some(emoji) => h_flex()
                .gap_1()
                .child(
                    div()
                        .flex()
                        .flex_none()
                        .items_center()
                        .justify_center()
                        .size_7()
                        .text_lg()
                        .child(emoji.emoji),
                )
                .child(
                    div()
                        .truncate()
                        .text_xs()
                        .text_color(header_ink)
                        .child(emoji.label),
                ),
            None => h_flex()
                .h_7()
                .ml_1p5()
                .text_xs()
                .text_color(muted)
                .child("Select an emoji…"),
        };

        div()
            .relative()
            .flex()
            .flex_col()
            .w(rems(WIDTH))
            .h(rems(HEIGHT))
            .text_color(cx.theme().popover_foreground)
            // The wheel scrolls the list, not whatever the picker floats over.
            .occlude()
            .child(
                div()
                    .flex_1()
                    .min_h_0()
                    .flex()
                    .flex_col()
                    .px_2()
                    .child(list),
            )
            .child(div().p_2().border_t_1().border_color(border).child(footer))
            .child(header)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn count(rows: &[Row]) -> usize {
        rows.iter()
            .map(|row| match row {
                Row::Header(_) => 0,
                Row::Emojis(emojis) => emojis.len(),
            })
            .sum()
    }

    #[test]
    fn an_empty_query_lists_every_group_under_its_header() {
        let rows = rows("", &Missing::new());
        assert_eq!(rows[0], Row::Header(emojis::Group::SmileysAndEmotion));
        let headers = rows
            .iter()
            .filter(|row| matches!(row, Row::Header(_)))
            .count();
        assert_eq!(headers, 9);
        assert_eq!(count(&rows), emojis::iter().count());
        assert!(count(&rows) > 1500);
        assert!(rows.iter().all(|row| match row {
            Row::Header(_) => true,
            Row::Emojis(emojis) => !emojis.is_empty() && emojis.len() <= COLUMNS,
        }));
    }

    #[test]
    fn a_query_matches_names_and_shortcodes_and_drops_empty_groups() {
        let all = Missing::new();
        let found = rows("  Thumbs UP ", &all);
        assert!(count(&found) >= 1);
        assert_eq!(found[0], Row::Header(emojis::Group::PeopleAndBody));
        // "tada" is only a shortcode of the party popper.
        assert!(count(&rows("tada", &all)) >= 1);
        assert!(rows("no such emoji at all", &all).is_empty());
    }

    #[test]
    fn an_emoji_the_machine_cannot_draw_is_left_out() {
        let grinning = emojis::get_by_shortcode("grinning").unwrap();
        let missing = Missing::from([grinning.as_str()]);
        assert_eq!(count(&rows("", &missing)), emojis::iter().count() - 1);
        assert!(rows("grinning face", &missing).iter().all(|row| match row {
            Row::Header(_) => true,
            Row::Emojis(emojis) => !emojis.contains(&grinning),
        }));
    }
}
