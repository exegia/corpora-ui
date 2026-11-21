//! ActionBar: `react/src/components/composed/action-bar`.

use std::rc::Rc;
use std::sync::Arc;

use gpui_kit::component::{ActiveTheme as _, Icon, IconName, h_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    App, ClickEvent, ElementId, IntoElement, ParentElement as _, RenderOnce, SharedString,
    Styled as _, Window, div,
};

use crate::atoms::Button;
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

/// A compact reaction picker: a row of quick emoji and, when
/// [`Self::on_more`] is set, a "More emoji" command after them.
///
/// ```ignore
/// EmojiActionBar::new("message-42-reactions")
///     .on_select(cx.listener(|this, emoji, _, cx| this.react(emoji.clone(), cx)))
/// ```
#[derive(IntoElement)]
pub struct EmojiActionBar {
    id: ElementId,
    reactions: Vec<Emoji>,
    on_select: Option<EmojiHandler>,
    on_more: Option<ClickHandler>,
}

impl EmojiActionBar {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            reactions: quick_reactions(),
            on_select: None,
            on_more: None,
        }
    }

    /// Replaces the quick row.
    pub fn reactions(mut self, reactions: impl IntoIterator<Item = Emoji>) -> Self {
        self.reactions = reactions.into_iter().collect();
        self
    }

    pub fn on_select(mut self, handler: impl Fn(&Emoji, &mut Window, &mut App) + 'static) -> Self {
        self.on_select = Some(Rc::new(handler));
        self
    }

    /// Adds the "More emoji" command. Open a full picker from the handler.
    pub fn on_more(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_more = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for EmojiActionBar {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let mut bar = ActionBar::new(self.id);
        for reaction in self.reactions {
            let on_select = self.on_select.clone();
            let picked = reaction.clone();
            bar = bar.emoji(reaction.emoji, reaction.label, move |_, window, cx| {
                if let Some(on_select) = &on_select {
                    on_select(&picked, window, cx);
                }
            });
        }
        bar.when_some(self.on_more, |bar, on_more| {
            bar.separator().action(
                "more",
                IconName::Ellipsis,
                "More emoji",
                move |event, window, cx| on_more(event, window, cx),
            )
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
