//! Bubble: `react/src/components/atoms/bubble`.

use std::rc::Rc;

use gpui_kit::base::motion::{Transition, transition};
use gpui_kit::component::{ActiveTheme as _, StyledExt as _, h_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    AnyElement, App, ClickEvent, ElementId, InteractiveElement as _, IntoElement,
    ParentElement as _, RenderOnce, SharedString, StatefulInteractiveElement as _, Styled as _,
    Window, div, px, relative, rems,
};

use super::scaled::Scaled;
use super::{Button, GlassEdge, GlassEdges, GlassSpec, GlassSurfaceExt as _, IconName};
use crate::foundations::motion::{DURATION_FAST, EASE_SMOOTH_OUT};
use crate::foundations::shadow::{shadow_bubble, shadow_pill};
use crate::foundations::{ActiveCorporaTheme as _, AtomSize, Radius};

/// Hover group a bubble forms so its actions can appear with the pointer.
const BUBBLE_GROUP: &str = "corpora-bubble";
/// Radius of the pinched tail corner.
const TAIL_RADIUS: f32 = 8.;

/// Who a [`Bubble`] belongs to.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum BubbleVariant {
    /// Generated output: leading-aligned prose with no bubble surface, so it
    /// never passes for a person's message.
    Ai,
    /// The current user's outgoing message: trailing-aligned, accent surface.
    Sender,
    /// An incoming message from another person: leading-aligned, neutral.
    #[default]
    Recipient,
}

/// One emoji reaction on a message.
#[derive(Clone, Debug, PartialEq, Eq)]
pub struct BubbleReaction {
    /// Stable identity, such as the emoji's shortcode.
    pub id: SharedString,
    pub emoji: SharedString,
    pub count: u32,
    /// Whether the current user has this reaction.
    pub reacted: bool,
    /// Accessible name, such as "thumbs up".
    pub label: SharedString,
}

impl BubbleReaction {
    pub fn new(
        id: impl Into<SharedString>,
        emoji: impl Into<SharedString>,
        label: impl Into<SharedString>,
    ) -> Self {
        Self {
            id: id.into(),
            emoji: emoji.into(),
            count: 0,
            reacted: false,
            label: label.into(),
        }
    }

    pub fn count(mut self, count: u32) -> Self {
        self.count = count;
        self
    }

    pub fn reacted(mut self, reacted: bool) -> Self {
        self.reacted = reacted;
        self
    }
}

/// How far the emoji of a reaction swells as its count turns over.
const REACTION_PULSE: f32 = 0.35;

/// The emoji and count of one reaction. When the count changes the emoji
/// swells and settles, and the number rolls to its new value like an
/// odometer: up for one more, down for one fewer.
#[derive(IntoElement)]
struct ReactionMark {
    id: ElementId,
    emoji: SharedString,
    count: u32,
}

impl RenderOnce for ReactionMark {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        // The count as it travels from the last value to this one.
        let value = transition(
            (self.id, "count"),
            self.count as f32,
            Transition::new(DURATION_FAST).easing(EASE_SMOOTH_OUT.easing()),
            window,
            cx,
        );
        let low = value.floor();
        // How far the number has turned from `low` toward the next one.
        let turn = value - low;
        let digits = |count: f32| SharedString::from((count as u32).to_string());

        let pulse = 1. + REACTION_PULSE * (turn * std::f32::consts::PI).sin();
        let number = div().relative().h(rems(1.)).line_height(rems(1.));
        let number = if turn == 0. {
            number.child(digits(low))
        } else {
            number
                .overflow_hidden()
                // Holds the width while the two numbers pass.
                .child(div().opacity(0.).child(digits(self.count as f32)))
                .child(
                    div()
                        .absolute()
                        .left_0()
                        .top(rems(-turn))
                        .opacity(1. - turn)
                        .child(digits(low)),
                )
                .child(
                    div()
                        .absolute()
                        .left_0()
                        .top(rems(1. - turn))
                        .opacity(turn)
                        .child(digits(low + 1.)),
                )
        };

        h_flex()
            .gap_1()
            .child(Scaled::new(pulse, div().child(self.emoji)))
            .when(self.count > 0 || turn > 0., |this| this.child(number))
    }
}

type ToggleHandler = Rc<dyn Fn(&BubbleReaction, &mut Window, &mut App)>;
type ClickHandler = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App)>;

/// One message in a thread.
///
/// ```ignore
/// Bubble::new("message-42", BubbleVariant::Sender)
///     .header(Avatar::new().user(me))
///     .header("You")
///     .message("Where does this reading come from?")
///     .reaction(BubbleReaction::new("thumbs-up", "👍", "thumbs up").count(2))
///     .on_toggle_reaction(|reaction, _, cx| { /* … */ })
///     .actions(Button::new("copy").ghost().xsmall().icon(IconName::Copy).tooltip("Copy"))
/// ```
///
/// In a run of messages from one author, give the header to the first only,
/// mark the others `continued`, and clear `tail` on all but the last.
#[derive(IntoElement)]
pub struct Bubble {
    id: ElementId,
    variant: BubbleVariant,
    continued: bool,
    tail: bool,
    unstyled: bool,
    header: Vec<AnyElement>,
    message: Option<AnyElement>,
    actions: Option<AnyElement>,
    reactions: Vec<BubbleReaction>,
    on_toggle_reaction: Option<ToggleHandler>,
    on_add_reaction: Option<ClickHandler>,
    add_reaction: Option<AnyElement>,
}

impl Bubble {
    /// `id` must be stable and unique in the thread, such as the message id.
    pub fn new(id: impl Into<ElementId>, variant: BubbleVariant) -> Self {
        Self {
            id: id.into(),
            variant,
            continued: false,
            tail: true,
            unstyled: false,
            header: Vec::new(),
            message: None,
            actions: None,
            reactions: Vec::new(),
            on_toggle_reaction: None,
            on_add_reaction: None,
            add_reaction: None,
        }
    }

    /// A follow-up in a run from the same author: tucks under the previous
    /// bubble.
    pub fn continued(mut self, continued: bool) -> Self {
        self.continued = continued;
        self
    }

    /// Whether the bubble pinches its tail corner. Only the last bubble of a
    /// run does.
    pub fn tail(mut self, tail: bool) -> Self {
        self.tail = tail;
        self
    }

    /// Drops the bubble surface, for a message that is only an attachment.
    pub fn unstyled(mut self, unstyled: bool) -> Self {
        self.unstyled = unstyled;
        self
    }

    /// Adds an item to the author row: avatar, then name, then time. The row
    /// is laid out inward from the thread edge, so the sender's items read in
    /// reverse and the avatar always sits at the edge.
    pub fn header(mut self, item: impl IntoElement) -> Self {
        self.header.push(item.into_any_element());
        self
    }

    pub fn message(mut self, message: impl IntoElement) -> Self {
        self.message = Some(message.into_any_element());
        self
    }

    /// Per-message commands, shown while the pointer is over the bubble.
    pub fn actions(mut self, actions: impl IntoElement) -> Self {
        self.actions = Some(actions.into_any_element());
        self
    }

    pub fn reaction(mut self, reaction: BubbleReaction) -> Self {
        self.reactions.push(reaction);
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

    /// Puts a control at the end of the reaction pill, in place of the plain
    /// button of [`Self::on_add_reaction`]. Pass a
    /// [`crate::composed::ReactionPicker`] to open the emoji picker from it.
    pub fn add_reaction(mut self, control: impl IntoElement) -> Self {
        self.add_reaction = Some(control.into_any_element());
        self
    }

    /// Adds an "Add reaction" button to the reaction pill that only calls
    /// the handler.
    pub fn on_add_reaction(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_add_reaction = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for Bubble {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let palette = *cx.palette();
        let variant = self.variant;
        let outgoing = variant == BubbleVariant::Sender;
        let child_id = |name: &'static str| {
            ElementId::NamedChild(std::sync::Arc::new(self.id.clone()), name.into())
        };

        let header = (!self.header.is_empty()).then(|| {
            h_flex()
                .gap_2()
                // The column keeps its inset; only the identity reaches the
                // thread edge.
                .map(|this| match variant {
                    BubbleVariant::Sender => this.flex_row_reverse().mr(-rems(1.)),
                    BubbleVariant::Recipient => this.ml(-rems(1.)),
                    BubbleVariant::Ai => this,
                })
                .children(self.header)
        });

        let message = self.message.map(|message| {
            let surface = div().relative().flex().flex_col().gap_y_2();
            if self.unstyled {
                return surface.min_w_0().max_w_full().child(message);
            }
            match variant {
                BubbleVariant::Ai => surface
                    .w_full()
                    .my_1()
                    .text_sm()
                    .line_height(rems(1.25))
                    .text_color(theme.foreground)
                    .child(message),
                BubbleVariant::Sender | BubbleVariant::Recipient => surface
                    .rounded(Radius::Full.resolve(cx))
                    .py_3()
                    .text_xs()
                    .line_height(rems(1.))
                    .font_medium()
                    .shadow(shadow_bubble(outgoing, cx))
                    .map(|this| {
                        if outgoing {
                            this.pl_6()
                                .pr_4()
                                .bg(palette.bubble_sender)
                                .text_color(palette.bubble_sender_foreground)
                                .when(self.tail, |this| this.rounded_br(px(TAIL_RADIUS)))
                        } else {
                            this.pl_4()
                                .pr_6()
                                .bg(palette.bubble_recipient)
                                .text_color(palette.bubble_recipient_foreground)
                                .when(self.tail, |this| this.rounded_bl(px(TAIL_RADIUS)))
                        }
                    })
                    .child(message),
            }
        });

        let on_toggle = self.on_toggle_reaction;
        let on_add = self.on_add_reaction;
        let add_reaction = self.add_reaction;
        let has_pill = !self.reactions.is_empty() || on_add.is_some() || add_reaction.is_some();
        let pill = has_pill.then(|| {
            h_flex()
                .absolute()
                // Hangs off the corner opposite the tail.
                .bottom(-rems(1.25))
                .map(|this| {
                    if outgoing {
                        this.left_4()
                    } else {
                        this.right_4()
                    }
                })
                .h_7()
                .px_1()
                .gap_0p5()
                .rounded(Radius::Lg.resolve(cx))
                .border_1()
                .border_color(theme.border)
                .shadow(shadow_pill())
                .children(self.reactions.into_iter().map(|reaction| {
                    let on_toggle = on_toggle.clone();
                    let ink = if reaction.reacted {
                        theme.foreground
                    } else {
                        theme.muted_foreground
                    };
                    h_flex()
                        .id(ElementId::NamedChild(
                            std::sync::Arc::new(child_id("reaction")),
                            reaction.id.clone(),
                        ))
                        .gap_1()
                        .px_1()
                        .h_6()
                        .rounded(Radius::Sm.resolve(cx))
                        .cursor_pointer()
                        .text_xs()
                        .font_bold()
                        .text_color(ink)
                        .when(reaction.reacted, |this| this.bg(theme.accent))
                        .hover(|style| style.bg(theme.accent))
                        .child(ReactionMark {
                            id: ElementId::NamedChild(
                                std::sync::Arc::new(child_id("reaction-mark")),
                                reaction.id.clone(),
                            ),
                            emoji: reaction.emoji.clone(),
                            count: reaction.count,
                        })
                        .on_click(move |_, window, cx| {
                            if let Some(on_toggle) = &on_toggle {
                                on_toggle(&reaction, window, cx);
                            }
                        })
                }))
                .when_some(on_add.filter(|_| add_reaction.is_none()), |this, on_add| {
                    this.child(
                        Button::new(child_id("add-reaction"))
                            .ghost()
                            .with_atom_size(AtomSize::Xs)
                            .icon(IconName::Plus)
                            .tooltip("Add reaction")
                            .on_click(move |event, window, cx| on_add(event, window, cx)),
                    )
                })
                .children(add_reaction)
                // Frosted glass: the thread shows through the pill. The lens
                // is kept shallow, as the pill is only a line of text tall.
                .glass_with(GlassSpec {
                    lens: px(5.),
                    reach: px(8.),
                    edges: GlassEdges::all(GlassEdge::new(px(1.), 0.18)),
                    ..GlassSpec::frosted(cx)
                })
        });

        let actions = self.actions.map(|actions| {
            h_flex()
                .gap_0p5()
                .opacity(0.)
                .group_hover(BUBBLE_GROUP, |style| style.opacity(1.))
                .child(actions)
        });

        div()
            .id(self.id.clone())
            .group(BUBBLE_GROUP)
            .relative()
            .flex()
            .flex_col()
            .w_full()
            .my_3()
            // 12px above minus 10px: a 2px seam between the bubbles of a run.
            .when(self.continued, |this| this.mt(-rems(0.625)))
            .map(|this| {
                if outgoing {
                    this.items_end()
                } else {
                    this.items_start()
                }
            })
            .child(
                div()
                    .relative()
                    .flex()
                    .flex_col()
                    .gap_y_2()
                    .min_w_0()
                    .map(|this| match variant {
                        BubbleVariant::Sender => this.items_end().max_w(relative(0.8)).mr_4(),
                        BubbleVariant::Recipient => this.items_start().max_w(relative(0.8)).ml_4(),
                        BubbleVariant::Ai => this.w_full(),
                    })
                    // Room for the pill that hangs below the message.
                    .when(has_pill, |this| this.mb_4())
                    .children(header)
                    .children(message)
                    .children(pill)
                    .children(actions),
            )
    }
}
