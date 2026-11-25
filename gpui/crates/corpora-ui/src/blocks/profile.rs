//! The account card: `react/src/components/blocks/profile`.

use std::rc::Rc;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::base::motion::{Transition, transition};
use gpui_kit::component::button::{Button as StockButton, ButtonRounded, ButtonVariants as _};
use gpui_kit::component::menu::{DropdownMenu as _, PopupMenuItem};
use gpui_kit::component::{ActiveTheme as _, Disableable as _, Icon, Sizable as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    Anchor, App, ElementId, FontWeight, IntoElement, ParentElement as _, RenderOnce, SharedString,
    Styled as _, Window, div, px, rems,
};

use crate::atoms::{Avatar, AvatarUser, Loader};
use crate::foundations::motion::{DURATION_FAST, EASE_SMOOTH_OUT};
use crate::foundations::{AtomSize, Radius};

type SelectHandler = Rc<dyn Fn(&mut Window, &mut App)>;

/// The widest the name and handle grow before they truncate.
const IDENTITY_WIDTH: f32 = 224.;

/// A command in the account menu.
#[derive(Clone)]
pub struct ProfileAction {
    id: SharedString,
    label: SharedString,
    icon: Option<LucideIcon>,
    shortcut: Option<SharedString>,
    disabled: bool,
    destructive: bool,
    on_select: Option<SelectHandler>,
}

impl ProfileAction {
    pub fn new(id: impl Into<SharedString>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            icon: None,
            shortcut: None,
            disabled: false,
            destructive: false,
            on_select: None,
        }
    }

    pub fn icon(mut self, icon: LucideIcon) -> Self {
        self.icon = Some(icon);
        self
    }

    /// A hint at the row's trailing edge, such as "⌘K". It binds no key.
    pub fn shortcut(mut self, shortcut: impl Into<SharedString>) -> Self {
        self.shortcut = Some(shortcut.into());
        self
    }

    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }

    /// Draws the row in the danger color, for signing out or deleting.
    pub fn destructive(mut self) -> Self {
        self.destructive = true;
        self
    }

    pub fn on_select(mut self, handler: impl Fn(&mut Window, &mut App) + 'static) -> Self {
        self.on_select = Some(Rc::new(handler));
        self
    }

    pub fn id(&self) -> &SharedString {
        &self.id
    }
}

/// One entry of the account menu, authored as a flat list.
#[derive(Clone)]
pub enum ProfileItem {
    Action(ProfileAction),
    /// A heading over the rows that follow it.
    Label(SharedString),
    Separator,
}

impl From<ProfileAction> for ProfileItem {
    fn from(action: ProfileAction) -> Self {
        Self::Action(action)
    }
}

/// An avatar card that opens the account menu.
///
/// Folded with [`ProfileCard::collapsed`], it keeps only the avatar, for the
/// foot of an icon rail.
///
/// ```ignore
/// ProfileCard::new("account", AvatarUser::named("Ada", "Lovelace"))
///     .username("ada@exegia.app")
///     .items(ProfileCard::default_items())
/// ```
#[derive(IntoElement)]
pub struct ProfileCard {
    id: ElementId,
    user: AvatarUser,
    name: SharedString,
    username: Option<SharedString>,
    items: Vec<ProfileItem>,
    collapsed: bool,
    loading: bool,
    anchor: Anchor,
}

impl ProfileCard {
    pub fn new(id: impl Into<ElementId>, user: AvatarUser) -> Self {
        let name = [&user.first_name, &user.last_name]
            .into_iter()
            .flatten()
            .map(SharedString::as_ref)
            .collect::<Vec<&str>>()
            .join(" ")
            .into();
        Self {
            id: id.into(),
            user,
            name,
            username: None,
            items: Self::default_items(),
            collapsed: false,
            loading: false,
            anchor: Anchor::TopLeft,
        }
    }

    /// The line under the name: a handle, an email address, a role.
    pub fn username(mut self, username: impl Into<SharedString>) -> Self {
        self.username = Some(username.into());
        self
    }

    /// The whole menu. Defaults to [`ProfileCard::default_items`].
    pub fn items(mut self, items: impl IntoIterator<Item = ProfileItem>) -> Self {
        self.items = items.into_iter().collect();
        self
    }

    /// Folds the card to its avatar.
    pub fn collapsed(mut self, collapsed: bool) -> Self {
        self.collapsed = collapsed;
        self
    }

    /// Disables the card and shows a spinner while a command is under way.
    pub fn loading(mut self, loading: bool) -> Self {
        self.loading = loading;
        self
    }

    /// The corner of the menu that meets the card. `Anchor::BottomLeft` opens
    /// it upward, for a card at the foot of a sidebar.
    pub fn anchor(mut self, anchor: impl Into<Anchor>) -> Self {
        self.anchor = anchor.into();
        self
    }

    /// The menu the card ships with, with no handlers attached.
    pub fn default_items() -> Vec<ProfileItem> {
        vec![
            ProfileItem::Label("Management".into()),
            ProfileAction::new("profile", "Profile")
                .icon(LucideIcon::User)
                .into(),
            ProfileAction::new("settings", "Settings")
                .icon(LucideIcon::Settings)
                .into(),
            ProfileItem::Separator,
            ProfileAction::new("teams", "Teams")
                .icon(LucideIcon::Users)
                .into(),
            ProfileAction::new("invite", "Invite")
                .icon(LucideIcon::UserPlus)
                .into(),
            ProfileItem::Separator,
            ProfileAction::new("sign-out", "Log out")
                .icon(LucideIcon::LogOut)
                .destructive()
                .into(),
        ]
    }
}

/// Drops the separators and labels that would head nothing.
fn tidy(items: Vec<ProfileItem>) -> Vec<ProfileItem> {
    let mut groups: Vec<Vec<ProfileItem>> = vec![Vec::new()];
    for item in items {
        match item {
            ProfileItem::Separator => groups.push(Vec::new()),
            item => groups.last_mut().expect("one group").push(item),
        }
    }
    let mut tidy = Vec::new();
    for group in groups.into_iter().filter(|group| !group.is_empty()) {
        if !tidy.is_empty() {
            tidy.push(ProfileItem::Separator);
        }
        tidy.extend(group);
    }
    tidy
}

fn menu_item(action: &ProfileAction) -> PopupMenuItem {
    let plain = action.shortcut.is_none() && !action.destructive;
    let mut item = if plain {
        PopupMenuItem::new(action.label.clone())
    } else {
        let label = action.label.clone();
        let shortcut = action.shortcut.clone();
        let destructive = action.destructive;
        PopupMenuItem::element(move |_, cx| {
            let muted = cx.theme().muted_foreground;
            let danger = cx.theme().danger;
            h_flex()
                .w_full()
                .justify_between()
                .gap_4()
                .when(destructive, |this| this.text_color(danger))
                .child(label.clone())
                .when_some(shortcut.clone(), |this, shortcut| {
                    this.child(div().text_xs().text_color(muted).child(shortcut))
                })
        })
    };
    if let Some(icon) = action.icon {
        item = item.icon(Icon::new(icon));
    }
    if let Some(on_select) = action.on_select.clone() {
        item = item.on_click(move |_, window, cx| on_select(window, cx));
    }
    item.disabled(action.disabled)
}

impl RenderOnce for ProfileCard {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let muted = cx.theme().muted_foreground;
        let open = transition(
            (self.id.clone(), "fold"),
            if self.collapsed { 0. } else { 1. },
            Transition::new(DURATION_FAST).easing(EASE_SMOOTH_OUT.easing()),
            window,
            cx,
        );
        let folded = open <= 0.;
        let identity = match &self.username {
            Some(username) => format!("{} {username}", self.name),
            None => self.name.to_string(),
        };

        let trigger = StockButton::new(self.id)
            .ghost()
            .rounded(ButtonRounded::Size(Radius::Lg.resolve(cx)))
            .w_full()
            // One height folded or not, so a rail's foot does not jump.
            .h(rems(2.75))
            .py_0()
            .cursor_pointer()
            .disabled(self.loading)
            .when(folded, |this| {
                this.px_0().justify_center().tooltip(identity.clone())
            })
            .when(!folded, |this| this.pl_1p5().pr_2().justify_between())
            .child(
                h_flex()
                    .min_w_0()
                    .when(!folded, |this| this.flex_1())
                    .gap(rems(0.5 * open))
                    .child(Avatar::new().user(self.user).with_atom_size(AtomSize::Md))
                    .when(!folded, |this| {
                        this.child(
                            v_flex()
                                .min_w_0()
                                .max_w(px(IDENTITY_WIDTH * open))
                                .overflow_hidden()
                                .opacity(open)
                                .items_start()
                                .whitespace_nowrap()
                                .child(
                                    div()
                                        .max_w_full()
                                        .truncate()
                                        .text_sm()
                                        .font_weight(FontWeight::MEDIUM)
                                        .child(self.name),
                                )
                                .when_some(self.username, |this, username| {
                                    this.child(
                                        div()
                                            .max_w_full()
                                            .truncate()
                                            .text_xs()
                                            .text_color(muted)
                                            .child(username),
                                    )
                                }),
                        )
                    }),
            )
            .when(!folded, |this| {
                this.child(
                    div()
                        .flex_none()
                        .opacity(open)
                        .text_color(muted)
                        .map(|this| {
                            if self.loading {
                                this.child(Loader::new().with_atom_size(AtomSize::Xs))
                            } else {
                                this.child(Icon::new(LucideIcon::ChevronsUpDown).xsmall())
                            }
                        }),
                )
            });

        let items = tidy(self.items);
        trigger.dropdown_menu_with_anchor(self.anchor, move |mut menu, _, _| {
            menu = menu.min_w(px(176.));
            for item in &items {
                menu = match item {
                    ProfileItem::Separator => menu.separator(),
                    ProfileItem::Label(label) => menu.label(label.clone()),
                    ProfileItem::Action(action) => menu.item(menu_item(action)),
                };
            }
            menu
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn shape(items: &[ProfileItem]) -> String {
        items
            .iter()
            .map(|item| match item {
                ProfileItem::Action(_) => 'a',
                ProfileItem::Label(_) => 'l',
                ProfileItem::Separator => '-',
            })
            .collect()
    }

    #[test]
    fn default_menu_keeps_its_three_groups() {
        assert_eq!(shape(&tidy(ProfileCard::default_items())), "laa-aa-a");
    }

    #[test]
    fn stray_separators_are_dropped() {
        let action = || ProfileItem::from(ProfileAction::new("a", "A"));
        let items = vec![
            ProfileItem::Separator,
            action(),
            ProfileItem::Separator,
            ProfileItem::Separator,
            action(),
            ProfileItem::Separator,
        ];
        assert_eq!(shape(&tidy(items)), "a-a");
    }
}
