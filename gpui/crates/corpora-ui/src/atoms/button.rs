//! The Corpora button, on GPUI Component's `Button`.
//!
//! The stock button supplies focus, keyboard activation, accessibility and
//! the variant colors. This atom owns what the stock one has no hook for: the
//! embossed surface, the size scale, the press squeeze and the trailing icon.

use std::rc::Rc;
use std::sync::Arc;

use gpui_kit::base::motion::{Transition, transition};
use gpui_kit::component::button::{Button as StockButton, ButtonRounded, ButtonVariants as _};
use gpui_kit::component::{ActiveTheme as _, Disableable, Icon, Sizable, Size};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    App, BoxShadow, ClickEvent, ElementId, Hsla, InteractiveElement as _, IntoElement, MouseButton,
    ParentElement as _, Pixels, RenderOnce, SharedString, StatefulInteractiveElement as _,
    Styled as _, Window, div, px, rems,
};

use crate::foundations::motion::{DURATION_FAST, DURATION_QUICK, EASE_OUT, SCALE_LARGE};
use crate::foundations::shadow::{Emboss, shadow_raised, shadow_raised_neutral};
use crate::foundations::{AtomSize, Radius};

/// Hover group every button forms with itself, so its emboss can respond to
/// the pointer. Buttons never nest, so one name serves them all.
const HOVER_GROUP: SharedString = SharedString::new_static("corpora-button");

/// How far the trailing icon travels toward the trailing edge under the
/// pointer. Physical: a nudge, not a layout distance.
const TRAILING_NUDGE: Pixels = px(2.);

/// A `variant` of the React `Button`.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum ButtonKind {
    /// The one main action of a view. React's `default`.
    Primary,
    Secondary,
    /// The quiet default: most buttons in a view.
    #[default]
    Outline,
    Ghost,
    Destructive,
    DestructiveOutline,
}

impl ButtonKind {
    /// Whether the kind is a raised surface with an embossed edge. Only the
    /// ghost button is flat.
    pub const fn is_embossed(self) -> bool {
        !matches!(self, Self::Ghost)
    }

    /// Whether the kind is a solid accent fill, rather than a pale surface.
    const fn is_filled(self) -> bool {
        matches!(self, Self::Primary | Self::Destructive)
    }

    /// The ink of the kind's label and icons.
    fn foreground(self, cx: &App) -> Hsla {
        let theme = cx.theme();
        match self {
            Self::Primary => theme.primary_foreground,
            Self::Secondary => theme.secondary_foreground,
            Self::Outline | Self::Ghost => theme.foreground,
            Self::Destructive => theme.danger_foreground,
            Self::DestructiveOutline => theme.danger,
        }
    }

    fn emboss(self, state: Emboss, cx: &App) -> Vec<BoxShadow> {
        if !self.is_embossed() {
            Vec::new()
        } else if self.is_filled() {
            shadow_raised(state, cx)
        } else {
            shadow_raised_neutral(state, cx)
        }
    }
}

/// The frame of one size tier, in rems so it follows interface zoom.
struct ButtonMetrics {
    height: f32,
    /// Inline padding of a labelled button.
    padding: f32,
    /// Diameter of the trailing icon's well.
    well: f32,
}

impl ButtonMetrics {
    fn of(size: AtomSize) -> Self {
        let (height, padding, well) = match size {
            AtomSize::Xs => (1.25, 0.5, 0.875),
            AtomSize::Sm => (1.5, 0.75, 1.0),
            AtomSize::Md => (2.0, 1.0, 1.25),
            AtomSize::Lg => (2.0, 1.25, 1.25),
            AtomSize::Xl | AtomSize::Xxl => (2.5, 1.5, 1.625),
        };
        Self {
            height,
            padding,
            well,
        }
    }
}

/// What the pointer is doing to one button, kept across frames.
#[derive(Default)]
struct Interaction {
    hovered: bool,
    pressed: bool,
}

type ClickHandler = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App)>;

/// A command the user can run.
///
/// ```ignore
/// Button::new("invite").primary().label("Invite")
/// Button::new("next").label("Continue").trailing_icon(IconName::ArrowRight)
/// Button::new("search").icon(IconName::Search).tooltip("Search")
/// ```
///
/// A button with an icon and no label is round; give it a tooltip, which is
/// also its accessible name. Use GPUI Component's `Link`, not this, for a URL.
#[derive(IntoElement)]
pub struct Button {
    id: ElementId,
    kind: ButtonKind,
    size: AtomSize,
    label: Option<SharedString>,
    icon: Option<Icon>,
    trailing_icon: Option<Icon>,
    tooltip: Option<SharedString>,
    disabled: bool,
    loading: bool,
    on_click: Option<ClickHandler>,
}

impl Button {
    /// `id` must be stable and unique among the button's siblings.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            kind: ButtonKind::default(),
            size: AtomSize::default(),
            label: None,
            icon: None,
            trailing_icon: None,
            tooltip: None,
            disabled: false,
            loading: false,
            on_click: None,
        }
    }

    pub fn with_kind(mut self, kind: ButtonKind) -> Self {
        self.kind = kind;
        self
    }

    /// [`ButtonKind::Primary`].
    pub fn primary(self) -> Self {
        self.with_kind(ButtonKind::Primary)
    }

    /// [`ButtonKind::Secondary`].
    pub fn secondary(self) -> Self {
        self.with_kind(ButtonKind::Secondary)
    }

    /// [`ButtonKind::Outline`], the default.
    pub fn outline(self) -> Self {
        self.with_kind(ButtonKind::Outline)
    }

    /// [`ButtonKind::Ghost`].
    pub fn ghost(self) -> Self {
        self.with_kind(ButtonKind::Ghost)
    }

    /// [`ButtonKind::Destructive`].
    pub fn destructive(self) -> Self {
        self.with_kind(ButtonKind::Destructive)
    }

    /// [`ButtonKind::DestructiveOutline`].
    pub fn destructive_outline(self) -> Self {
        self.with_kind(ButtonKind::DestructiveOutline)
    }

    /// Any tier of the atom scale, including the two above the stock `large`.
    pub fn with_atom_size(mut self, size: AtomSize) -> Self {
        self.size = size;
        self
    }

    pub fn label(mut self, label: impl Into<SharedString>) -> Self {
        self.label = Some(label.into());
        self
    }

    /// An icon before the label. With no label the button is icon-only.
    pub fn icon(mut self, icon: impl Into<Icon>) -> Self {
        self.icon = Some(icon.into());
        self
    }

    /// An icon after the label, seated in its own well at the trailing edge.
    /// It leans toward that edge under the pointer. Ignored without a label.
    pub fn trailing_icon(mut self, icon: impl Into<Icon>) -> Self {
        self.trailing_icon = Some(icon.into());
        self
    }

    /// Describes the button on hover and to assistive technology.
    pub fn tooltip(mut self, tooltip: impl Into<SharedString>) -> Self {
        self.tooltip = Some(tooltip.into());
        self
    }

    /// Shows a spinner and stops responding, keeping the resting colors.
    pub fn loading(mut self, loading: bool) -> Self {
        self.loading = loading;
        self
    }

    pub fn on_click(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_click = Some(Rc::new(handler));
        self
    }

    /// Greys the button out, flattens it and stops it responding.
    pub fn disabled(mut self, disabled: bool) -> Self {
        self.disabled = disabled;
        self
    }
}

impl Disableable for Button {
    fn disabled(self, disabled: bool) -> Self {
        Button::disabled(self, disabled)
    }
}

impl Sizable for Button {
    fn with_size(mut self, size: impl Into<Size>) -> Self {
        self.size = size.into().into();
        self
    }
}

impl RenderOnce for Button {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let interactive = !self.disabled && !self.loading;
        let icon_only = self.label.is_none();
        let trailing_icon = self.trailing_icon.filter(|_| !icon_only);
        let frame_id = ElementId::NamedChild(Arc::new(self.id.clone()), "frame".into());

        let interaction = window.use_keyed_state(
            ElementId::NamedChild(Arc::new(self.id.clone()), "interaction".into()),
            cx,
            |_, _| Interaction::default(),
        );
        let (hovered, pressed) = {
            let interaction = interaction.read(cx);
            (interaction.hovered, interaction.pressed)
        };

        let press = transition(
            (self.id.clone(), "press"),
            if pressed && interactive { 1.0_f32 } else { 0.0 },
            Transition::new(DURATION_QUICK).easing(EASE_OUT.easing()),
            window,
            cx,
        );
        let lean = transition(
            (self.id.clone(), "lean"),
            if hovered && interactive { 1.0_f32 } else { 0.0 },
            Transition::new(DURATION_FAST).easing(EASE_OUT.easing()),
            window,
            cx,
        );

        let rem_size = window.rem_size();
        let metrics = ButtonMetrics::of(self.size);
        let height = rems(metrics.height).to_pixels(rem_size);
        let padding = rems(metrics.padding).to_pixels(rem_size);
        let well = rems(metrics.well).to_pixels(rem_size);
        // GPUI has no element transform, so a press squeezes the surface in
        // from every side by the share a `scale(0.96)` would take off the
        // height, and margins hold the layout box still. The label does not
        // shrink with it.
        let squeeze = height * ((1.0 - SCALE_LARGE) / 2.0) * press;

        let theme = cx.theme();
        let stock = StockButton::new(self.id.clone()).with_size(Size::from(self.size));
        let stock = match self.kind {
            ButtonKind::Primary => stock.primary(),
            ButtonKind::Secondary => stock.secondary(),
            // The stock default variant is the outlined one.
            ButtonKind::Outline => stock,
            ButtonKind::Ghost => stock.ghost(),
            ButtonKind::Destructive => stock.danger(),
            ButtonKind::DestructiveOutline => {
                // The stock danger outline is a red tint. Corpora's sits on
                // the neutral outline surface and keeps red for the text:
                // `border-input bg-popover`, `dark:bg-input/32`.
                let surface = if theme.is_dark() {
                    theme.input.opacity(0.32)
                } else {
                    theme.popover
                };
                stock
                    .danger()
                    .outline()
                    .bg(surface)
                    .border_color(theme.input)
            }
        };

        let radius = if icon_only { Radius::Full } else { Radius::Lg };
        let hover_emboss = self.kind.emboss(Emboss::Hover, cx);
        let stock = stock
            .rounded(ButtonRounded::Size(radius.resolve(cx)))
            .m(squeeze)
            .map(|this| {
                if icon_only {
                    this.size(height - squeeze * 2.)
                } else {
                    this.h(height - squeeze * 2.).px(padding - squeeze)
                }
            })
            .when(interactive, |this| this.cursor_pointer())
            .when(!self.disabled, |this| {
                this.shadow(self.kind.emboss(Emboss::Rest, cx))
                    .group(HOVER_GROUP)
                    .group_hover(HOVER_GROUP, |style| style.shadow(hover_emboss))
            })
            .when_some(self.icon, |this, icon| this.icon(icon))
            .when_some(self.label, |this, label| this.label(label))
            .when_some(trailing_icon, |this, icon| {
                let ink = self.kind.foreground(cx);
                // The well sits as far from the trailing edge as from the top
                // and bottom, so it reads as seated in the button.
                this.pr((height - well) / 2. - squeeze).child(
                    div()
                        .flex()
                        .flex_none()
                        .items_center()
                        .justify_center()
                        .size(well)
                        .rounded_full()
                        .bg(ink.opacity(0.14))
                        .text_color(ink)
                        .child(
                            div()
                                .relative()
                                .left(TRAILING_NUDGE * lean)
                                .child(icon.xsmall()),
                        ),
                )
            })
            .when_some(self.tooltip, |this, tooltip| this.tooltip(tooltip))
            .disabled(self.disabled)
            .loading(self.loading)
            .when_some(self.on_click, |this, handler| {
                this.on_click(move |event, window, cx| handler(event, window, cx))
            })
            .capture_any_mouse_down({
                let interaction = interaction.clone();
                move |event, _, cx| {
                    if event.button == MouseButton::Left {
                        interaction.update(cx, |interaction, cx| {
                            interaction.pressed = true;
                            cx.notify();
                        });
                    }
                }
            })
            .capture_any_mouse_up({
                let interaction = interaction.clone();
                move |_, _, cx| release(&interaction, cx)
            })
            .on_mouse_up_out(MouseButton::Left, {
                let interaction = interaction.clone();
                move |_, _, cx| release(&interaction, cx)
            });

        // The frame never changes size, so the pointer cannot fall off a
        // button that is squeezing under it.
        div()
            .id(frame_id)
            .flex()
            .flex_none()
            .on_hover(move |hovered, _, cx| {
                let hovered = *hovered;
                interaction.update(cx, |interaction, cx| {
                    if interaction.hovered != hovered {
                        interaction.hovered = hovered;
                        cx.notify();
                    }
                });
            })
            .child(stock)
    }
}

fn release(interaction: &gpui_kit::Entity<Interaction>, cx: &mut App) {
    interaction.update(cx, |interaction, cx| {
        if interaction.pressed {
            interaction.pressed = false;
            cx.notify();
        }
    });
}
