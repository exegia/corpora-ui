//! User: `react/src/components/composed/user`.

use std::rc::Rc;

use gpui_kit::component::{ActiveTheme as _, StyledExt as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    AnyElement, App, ClickEvent, ElementId, IntoElement, ParentElement as _, RenderOnce,
    SharedString, Styled, Window, div, px,
};

use crate::atoms::{
    Avatar, AvatarAudio, AvatarUser, Badge, Bubble, BubbleReaction, BubbleVariant, Button,
};
use crate::foundations::AtomSize;

/// The name a person is shown by: whichever halves of it are known.
fn display_name(user: &AvatarUser) -> SharedString {
    [&user.first_name, &user.last_name]
        .into_iter()
        .flatten()
        .filter(|name| !name.is_empty())
        .map(|name| name.as_ref())
        .collect::<Vec<_>>()
        .join(" ")
        .into()
}

/// A person's avatar, name and role on one line, with an optional second
/// line. Heads a chat bubble or a sidebar profile.
///
/// ```ignore
/// UserInfo::new(AvatarUser::named("Ada", "Lovelace").role("Editor")).description("2 min ago")
/// ```
#[derive(IntoElement)]
pub struct UserInfo {
    user: AvatarUser,
    description: Option<SharedString>,
    outgoing: bool,
    audio: Option<AvatarAudio>,
    size: AtomSize,
}

impl UserInfo {
    pub fn new(user: AvatarUser) -> Self {
        Self {
            user,
            description: None,
            outgoing: false,
            audio: None,
            size: AtomSize::Md,
        }
    }

    /// A second line under the name, such as a time or a status.
    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }

    /// Lays the row out from the trailing edge, for the current user's own
    /// messages.
    pub fn outgoing(mut self, outgoing: bool) -> Self {
        self.outgoing = outgoing;
        self
    }

    pub fn audio(mut self, audio: AvatarAudio) -> Self {
        self.audio = Some(audio);
        self
    }

    /// The avatar's size. The text does not change with it.
    pub fn with_atom_size(mut self, size: AtomSize) -> Self {
        self.size = size;
        self
    }
}

impl RenderOnce for UserInfo {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let muted = cx.theme().muted_foreground;
        let name = display_name(&self.user);
        let role = self.user.role.clone();
        let outgoing = self.outgoing;

        let avatar = Avatar::new()
            .user(self.user)
            .with_atom_size(self.size)
            .when_some(self.audio, |this, audio| this.audio(audio));

        h_flex()
            .gap_1p5()
            .items_center()
            .when(outgoing, |this| this.flex_row_reverse())
            .child(avatar)
            .child(
                v_flex()
                    .when(outgoing, |this| this.items_end())
                    .gap_0()
                    .justify_center()
                    .child(
                        h_flex()
                            .gap_1p5()
                            .when(outgoing, |this| this.flex_row_reverse())
                            .child(
                                div()
                                    .text_sm()
                                    .font_semibold()
                                    .line_height(px(18.))
                                    .child(name),
                            )
                            .when_some(role, |this, role| {
                                this.child(Badge::invert().with_atom_size(AtomSize::Xs).child(role))
                            }),
                    )
                    .when_some(self.description, |this, description| {
                        this.child(
                            div()
                                .text_xs()
                                .text_color(muted)
                                .line_height(px(12.))
                                .child(description),
                        )
                    }),
            )
    }
}

type ClickHandler = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App)>;

/// A person as a compact pill: avatar and `@name`. For mentions and
/// participant lists.
///
/// ```ignore
/// UserPill::new("mention-ada", AvatarUser::named("Ada", "Lovelace"))
/// ```
#[derive(IntoElement)]
pub struct UserPill {
    id: ElementId,
    user: AvatarUser,
    on_click: Option<ClickHandler>,
}

impl UserPill {
    /// `id` must be stable and unique among the pill's siblings, such as the
    /// person's id.
    pub fn new(id: impl Into<ElementId>, user: AvatarUser) -> Self {
        Self {
            id: id.into(),
            user,
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

impl RenderOnce for UserPill {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let handle = self
            .user
            .first_name
            .clone()
            .filter(|name| !name.is_empty())
            .map(|name| SharedString::from(format!("@{name}")));

        Button::new(self.id)
            .primary()
            .pill(true)
            .start(Avatar::new().user(self.user).with_atom_size(AtomSize::Sm))
            .when_some(handle, |this, handle| this.label(handle))
            .when_some(self.on_click, |this, handler| {
                this.on_click(move |event, window, cx| handler(event, window, cx))
            })
    }
}

type ToggleHandler = Rc<dyn Fn(&BubbleReaction, &mut Window, &mut App)>;

/// A person's message in a thread: a [`Bubble`] headed by their
/// [`UserInfo`].
///
/// ```ignore
/// UserMessage::new("message-42", "Where does this reading come from?")
///     .user(AvatarUser::named("Grace", "Hopper"))
///     .description("2 min ago")
/// ```
///
/// A `continued` message drops the header, as it follows one from the same
/// person.
#[derive(IntoElement)]
pub struct UserMessage {
    id: ElementId,
    message: AnyElement,
    user: Option<AvatarUser>,
    description: Option<SharedString>,
    audio: Option<AvatarAudio>,
    size: AtomSize,
    outgoing: bool,
    continued: bool,
    tail: bool,
    reactions: Vec<BubbleReaction>,
    on_toggle_reaction: Option<ToggleHandler>,
    on_add_reaction: Option<ClickHandler>,
    actions: Option<AnyElement>,
}

impl UserMessage {
    /// `id` must be stable and unique in the thread, such as the message id.
    pub fn new(id: impl Into<ElementId>, message: impl IntoElement) -> Self {
        Self {
            id: id.into(),
            message: message.into_any_element(),
            user: None,
            description: None,
            audio: None,
            size: AtomSize::Md,
            outgoing: false,
            continued: false,
            tail: true,
            reactions: Vec::new(),
            on_toggle_reaction: None,
            on_add_reaction: None,
            actions: None,
        }
    }

    /// Who wrote the message. Without it the bubble has no header.
    pub fn user(mut self, user: AvatarUser) -> Self {
        self.user = Some(user);
        self
    }

    /// The line under the author's name.
    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }

    pub fn audio(mut self, audio: AvatarAudio) -> Self {
        self.audio = Some(audio);
        self
    }

    /// The avatar's size.
    pub fn with_atom_size(mut self, size: AtomSize) -> Self {
        self.size = size;
        self
    }

    /// Whether the current user wrote the message. Theirs sit at the
    /// trailing edge on the accent surface.
    pub fn outgoing(mut self, outgoing: bool) -> Self {
        self.outgoing = outgoing;
        self
    }

    /// See [`Bubble::continued`].
    pub fn continued(mut self, continued: bool) -> Self {
        self.continued = continued;
        self
    }

    /// See [`Bubble::tail`].
    pub fn tail(mut self, tail: bool) -> Self {
        self.tail = tail;
        self
    }

    pub fn reactions(mut self, reactions: impl IntoIterator<Item = BubbleReaction>) -> Self {
        self.reactions.extend(reactions);
        self
    }

    pub fn on_toggle_reaction(
        mut self,
        handler: impl Fn(&BubbleReaction, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_toggle_reaction = Some(Rc::new(handler));
        self
    }

    /// See [`Bubble::on_add_reaction`].
    pub fn on_add_reaction(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_add_reaction = Some(Rc::new(handler));
        self
    }

    /// See [`Bubble::actions`].
    pub fn actions(mut self, actions: impl IntoElement) -> Self {
        self.actions = Some(actions.into_any_element());
        self
    }
}

impl RenderOnce for UserMessage {
    fn render(self, _: &mut Window, _: &mut App) -> impl IntoElement {
        let variant = if self.outgoing {
            BubbleVariant::Sender
        } else {
            BubbleVariant::Recipient
        };
        let header = self.user.filter(|_| !self.continued).map(|user| {
            UserInfo::new(user)
                .outgoing(self.outgoing)
                .with_atom_size(self.size)
                .when_some(self.description, |this, description| {
                    this.description(description)
                })
                .when_some(self.audio, |this, audio| this.audio(audio))
        });

        Bubble::new(self.id, variant)
            .continued(self.continued)
            .tail(self.tail)
            .when_some(header, |this, header| this.header(header))
            .message(self.message)
            .reactions(self.reactions)
            .when_some(self.on_toggle_reaction, |this, handler| {
                this.on_toggle_reaction(move |reaction, window, cx| handler(reaction, window, cx))
            })
            .when_some(self.on_add_reaction, |this, handler| {
                this.on_add_reaction(move |event, window, cx| handler(event, window, cx))
            })
            .when_some(self.actions, |this, actions| this.actions(actions))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn display_name_uses_the_halves_it_has() {
        assert_eq!(
            display_name(&AvatarUser::named("Ada", "Lovelace")),
            "Ada Lovelace"
        );
        let first_only = AvatarUser {
            first_name: Some("Ada".into()),
            ..AvatarUser::default()
        };
        assert_eq!(display_name(&first_only), "Ada");
        assert_eq!(display_name(&AvatarUser::default()), "");
    }
}
