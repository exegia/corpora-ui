//! ActionBar: `react/src/components/composed/action-bar`.

use std::rc::Rc;
use std::sync::Arc;

use gpui_kit::component::button::{Button as StockButton, ButtonVariants as _};
use gpui_kit::component::popover::Popover;
use gpui_kit::component::{ActiveTheme as _, Icon, IconName, Sizable as _, h_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    App, ClickEvent, ElementId, Entity, IntoElement, ParentElement as _, RenderOnce, SharedString,
    Styled as _, Window, div, rems,
};

use crate::atoms::{Button, Emoji, EmojiPicker, EmojiPickerState, PICKER_WIDTH, Reveal};
use crate::foundations::{ActiveCorporaTheme as _, AtomSize, Radius};

type ClickHandler = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App)>;

/// What an action shows.
enum Glyph {
    Icon(Box<Icon>),
    Emoji(SharedString),
}

struct Action {
    id: SharedString,
    glyph: Glyph,
    tooltip: SharedString,
    on_click: ClickHandler,
}

/// A row of icon commands for one object, such as a message or a selection.
///
/// ```ignore
/// ActionBar::new("message-42-actions")
///     .action("copy", IconName::Copy, "Copy message", |_, _, cx| { /* … */ })
///     .separator()
///     .action("delete", IconName::Delete, "Delete message", |_, _, cx| { /* … */ })
/// ```
///
/// Every action needs a tooltip: it is the command's name, on hover and for
/// assistive technology. Separators split the bar into groups; one at either
/// end, or two together, is dropped.
///
/// The bar has no surface of its own, as it usually sits inside a popover.
/// [`Self::surface`] gives it one for standing alone.
#[derive(IntoElement)]
pub struct ActionBar {
    id: ElementId,
    /// The commands in order; `None` is a separator.
    items: Vec<Option<Action>>,
    surface: bool,
}

impl ActionBar {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            items: Vec::new(),
            surface: false,
        }
    }

    /// Adds an icon command. `id` must be unique in the bar.
    pub fn action(
        mut self,
        id: impl Into<SharedString>,
        icon: impl Into<Icon>,
        tooltip: impl Into<SharedString>,
        on_click: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.items.push(Some(Action {
            id: id.into(),
            glyph: Glyph::Icon(Box::new(icon.into())),
            tooltip: tooltip.into(),
            on_click: Rc::new(on_click),
        }));
        self
    }

    /// Adds a command shown as an emoji. `label` names it, such as
    /// "thumbs up"; it is also the command's identity in the bar.
    pub fn emoji(
        mut self,
        emoji: impl Into<SharedString>,
        label: impl Into<SharedString>,
        on_click: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        let label = label.into();
        self.items.push(Some(Action {
            id: label.clone(),
            glyph: Glyph::Emoji(emoji.into()),
            tooltip: label,
            on_click: Rc::new(on_click),
        }));
        self
    }

    /// Starts a new group.
    pub fn separator(mut self) -> Self {
        self.items.push(None);
        self
    }

    /// Draws the bar on its own card surface.
    pub fn surface(mut self, surface: bool) -> Self {
        self.surface = surface;
        self
    }
}

/// Splits items into groups at each separator, dropping the empty ones.
fn group<T>(items: impl IntoIterator<Item = Option<T>>) -> Vec<Vec<T>> {
    let mut groups = vec![Vec::new()];
    for item in items {
        match item {
            Some(action) => groups.last_mut().expect("starts non-empty").push(action),
            None => groups.push(Vec::new()),
        }
    }
    groups.retain(|group| !group.is_empty());
    groups
}

impl RenderOnce for ActionBar {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let bar_id = Arc::new(self.id);
        let groups = group(self.items.into_iter().map(|item| {
            item.map(|action| {
                let on_click = action.on_click;
                let button = Button::new(ElementId::NamedChild(bar_id.clone(), action.id))
                    .ghost()
                    .tooltip(action.tooltip)
                    .on_click(move |event, window, cx| on_click(event, window, cx));
                match action.glyph {
                    Glyph::Icon(icon) => button.with_atom_size(AtomSize::Sm).icon(*icon),
                    Glyph::Emoji(emoji) => button.start(div().text_base().child(emoji)),
                }
            })
        }));

        let count = groups.len();
        let mut bar = h_flex().flex_none().gap_2();
        for (index, actions) in groups.into_iter().enumerate() {
            bar = bar.child(h_flex().gap_1().children(actions));
            if index + 1 < count {
                bar = bar.child(div().flex_none().w_px().h_4().bg(theme.border));
            }
        }

        bar.when(self.surface, |this| {
            this.p_1()
                .rounded(Radius::Xl.resolve(cx))
                .border_1()
                .border_color(theme.border)
                .bg(cx.palette().card)
        })
    }
}

/// The reactions an [`EmojiActionBar`] offers by default.
pub fn quick_reactions() -> Vec<Emoji> {
    [
        ("❤️", "heart"),
        ("👍", "thumbs up"),
        ("😊", "smiling face"),
        ("😂", "face with tears of joy"),
        ("🎉", "party popper"),
        ("🙏", "folded hands"),
    ]
    .into_iter()
    .map(|(emoji, label)| Emoji::new(emoji, label))
    .collect()
}

type EmojiHandler = Rc<dyn Fn(&Emoji, &mut Window, &mut App)>;

/// A compact reaction picker: a row of quick emoji, then "More emoji", which
/// swaps the row for the full [`EmojiPicker`].
///
/// ```ignore
/// // in `new`: let picker = cx.new(|cx| EmojiPickerState::new(window, cx));
/// EmojiActionBar::new("message-42-reactions")
///     .picker(&self.picker)
///     .on_select(cx.listener(|this, emoji, _, cx| this.react(emoji.clone(), cx)))
/// ```
///
/// Without [`Self::picker`] the bar is the quick row alone.
#[derive(IntoElement)]
pub struct EmojiActionBar {
    id: ElementId,
    reactions: Vec<Emoji>,
    picker: Option<Entity<EmojiPickerState>>,
    on_select: Option<EmojiHandler>,
    surface: bool,
}

impl EmojiActionBar {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            reactions: quick_reactions(),
            picker: None,
            on_select: None,
            surface: false,
        }
    }

    /// Replaces the quick row.
    pub fn reactions(mut self, reactions: impl IntoIterator<Item = Emoji>) -> Self {
        self.reactions = reactions.into_iter().collect();
        self
    }

    /// Adds the "More emoji" command, backed by this picker state.
    pub fn picker(mut self, picker: &Entity<EmojiPickerState>) -> Self {
        self.picker = Some(picker.clone());
        self
    }

    /// Draws the bar, and the picker it opens, on a card surface. Leave it
    /// off inside a popover, which has its own.
    pub fn surface(mut self, surface: bool) -> Self {
        self.surface = surface;
        self
    }

    /// Called for a quick reaction and for a pick from the full picker.
    pub fn on_select(mut self, handler: impl Fn(&Emoji, &mut Window, &mut App) + 'static) -> Self {
        self.on_select = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for EmojiActionBar {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let expanded = self
            .picker
            .as_ref()
            .is_some_and(|picker| picker.read(cx).is_expanded());
        let bar_id = ElementId::NamedChild(Arc::new(self.id.clone()), "bar".into());
        let reveal_id = ElementId::NamedChild(Arc::new(self.id.clone()), "picker".into());
        let row_id = ElementId::NamedChild(Arc::new(self.id.clone()), "row".into());
        let close_id = ElementId::NamedChild(Arc::new(self.id), "close".into());

        let mut bar = ActionBar::new(bar_id);
        for reaction in self.reactions {
            let on_select = self.on_select.clone();
            let picked = reaction.clone();
            bar = bar.emoji(reaction.emoji, reaction.label, move |_, window, cx| {
                if let Some(on_select) = &on_select {
                    on_select(&picked, window, cx);
                }
            });
        }
        if let Some(picker) = self.picker.clone() {
            bar = bar.separator().action(
                "more",
                IconName::Ellipsis,
                "More emoji",
                move |_, _, cx| {
                    picker.update(cx, |picker, cx| picker.set_expanded(true, cx));
                },
            );
        }

        let has_picker = self.picker.is_some();
        let full = self.picker.map(|picker| {
            let close = picker.clone();
            EmojiPicker::new(&picker)
                .action(
                    Button::new(close_id)
                        .ghost()
                        .with_atom_size(AtomSize::Sm)
                        .icon(IconName::Close)
                        .tooltip("Back to quick reactions")
                        .on_click(move |_, _, cx| {
                            close.update(cx, |picker, cx| picker.set_expanded(false, cx));
                        }),
                )
                .when_some(self.on_select, |this, on_select| {
                    this.on_select(move |emoji, window, cx| on_select(emoji, window, cx))
                })
        });

        // The row gives way to the picker: each folds as the other opens.
        // With a picker the bar keeps the picker's width in both states, so
        // only its height changes.
        div()
            .when(self.surface, |this| {
                this.p_1()
                    .rounded(Radius::Xl.resolve(cx))
                    .border_1()
                    .border_color(cx.theme().border)
                    .bg(cx.palette().card)
            })
            .child(
                div()
                    .flex()
                    .flex_col()
                    .when(has_picker, |this| this.w(rems(PICKER_WIDTH)))
                    .child(Reveal::new(row_id, !expanded).child(bar))
                    .children(full.map(|full| Reveal::new(reveal_id, expanded).child(full))),
            )
    }
}

type PickHandler = Rc<dyn Fn(&Emoji, &mut Window, &mut App)>;

/// The "Add reaction" button of a message: it opens an [`EmojiActionBar`] in
/// a popover and closes it once an emoji is picked.
///
/// ```ignore
/// Bubble::new("message-42", BubbleVariant::Recipient)
///     .message("…")
///     .add_reaction(
///         ReactionPicker::new("message-42-react", &self.picker)
///             .on_select(cx.listener(|this, emoji, _, cx| this.react(42, emoji.clone(), cx))),
///     )
/// ```
#[derive(IntoElement)]
pub struct ReactionPicker {
    id: ElementId,
    picker: Entity<EmojiPickerState>,
    on_select: Option<PickHandler>,
}

impl ReactionPicker {
    /// `id` must be stable and unique among siblings, such as one derived
    /// from the message id.
    pub fn new(id: impl Into<ElementId>, picker: &Entity<EmojiPickerState>) -> Self {
        Self {
            id: id.into(),
            picker: picker.clone(),
            on_select: None,
        }
    }

    pub fn on_select(mut self, handler: impl Fn(&Emoji, &mut Window, &mut App) + 'static) -> Self {
        self.on_select = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for ReactionPicker {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let id = Arc::new(self.id);
        let bar_id = ElementId::NamedChild(id.clone(), "bar".into());
        let picker = self.picker;
        let on_select = self.on_select;
        let reset = picker.clone();

        Popover::new(ElementId::NamedChild(id.clone(), "popover".into()))
            .trigger(
                StockButton::new(ElementId::NamedChild(id, "trigger".into()))
                    .ghost()
                    .xsmall()
                    .icon(IconName::Plus)
                    .tooltip("Add reaction")
                    .cursor_pointer(),
            )
            .on_open_change(move |open, window, cx| {
                // Each opening starts from the quick row with no search.
                if *open {
                    reset.update(cx, |picker, cx| picker.reset(window, cx));
                }
            })
            .content(move |_, _, cx| {
                let popover = cx.entity();
                let on_select = on_select.clone();
                EmojiActionBar::new(bar_id.clone())
                    .picker(&picker)
                    .on_select(move |emoji, window, cx| {
                        if let Some(on_select) = &on_select {
                            on_select(emoji, window, cx);
                        }
                        popover.update(cx, |popover, cx| popover.dismiss(window, cx));
                    })
            })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn separators_split_groups_and_empty_groups_are_dropped() {
        let items = [None, Some(1), Some(2), None, None, Some(3), None];
        assert_eq!(group(items), vec![vec![1, 2], vec![3]]);
        assert_eq!(group([None::<u8>, None]), Vec::<Vec<u8>>::new());
    }
}
