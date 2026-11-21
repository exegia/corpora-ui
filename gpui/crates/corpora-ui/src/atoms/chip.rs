//! Chips: `react/src/components/atoms/chip.tsx`.

use std::rc::Rc;

use gpui_kit::component::button::{Button as StockButton, ButtonRounded, ButtonVariants as _};
use gpui_kit::component::{ActiveTheme as _, Icon, Selectable as _, Sizable as _, StyledExt as _};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    App, ClickEvent, ElementId, IntoElement, ParentElement as _, RenderOnce, SharedString,
    Styled as _, Window, div, rems,
};

use crate::foundations::shadow::shadow_xs;
use crate::foundations::{ActiveCorporaTheme as _, Radius};

/// A small static tag naming a value's source, such as the object a condition
/// reads from. React's `SourceChip`.
///
/// ```ignore
/// Chip::new("order").icon(LucideIcon::Cone)
/// ```
#[derive(IntoElement)]
pub struct Chip {
    label: SharedString,
    icon: Option<Icon>,
}

impl Chip {
    pub fn new(label: impl Into<SharedString>) -> Self {
        Self {
            label: label.into(),
            icon: None,
        }
    }

    pub fn icon(mut self, icon: impl Into<Icon>) -> Self {
        self.icon = Some(icon.into());
        self
    }
}

impl RenderOnce for Chip {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        div()
            .flex()
            .flex_none()
            .items_center()
            .gap_1()
            .h_6()
            .px_1p5()
            .rounded(Radius::Sm.resolve(cx))
            .bg(cx.palette().card)
            .border_1()
            .border_color(theme.border)
            .shadow(shadow_xs(cx))
            .text_xs()
            .font_medium()
            .text_color(theme.foreground)
            .when_some(self.icon, |this, icon| {
                this.child(icon.xsmall().text_color(theme.muted_foreground))
            })
            .child(self.label)
    }
}

type ClickHandler = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App)>;

/// A compact trigger showing the current choice of a menu. React's
/// `SelectChip`.
///
/// The chip is only the trigger: the caller owns the open state and the menu.
///
/// ```ignore
/// SelectChip::new("status", "Pending")
///     .dot(true)
///     .open(self.status_menu_open)
///     .on_click(cx.listener(|this, _, _, cx| this.toggle_status_menu(cx)))
/// ```
#[derive(IntoElement)]
pub struct SelectChip {
    id: ElementId,
    value: SharedString,
    dot: bool,
    open: bool,
    on_click: Option<ClickHandler>,
}

impl SelectChip {
    /// `id` must be stable and unique among the chip's siblings.
    pub fn new(id: impl Into<ElementId>, value: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            value: value.into(),
            dot: false,
            open: false,
            on_click: None,
        }
    }

    /// Marks the value with an attention dot.
    pub fn dot(mut self, dot: bool) -> Self {
        self.dot = dot;
        self
    }

    /// Whether the menu this chip triggers is showing.
    pub fn open(mut self, open: bool) -> Self {
        self.open = open;
        self
    }

    pub fn on_click(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_click = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for SelectChip {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let warning = cx.palette().warning;
        StockButton::new(self.id)
            .secondary()
            .small()
            .rounded(ButtonRounded::Size(Radius::Sm.resolve(cx)))
            .px_1p5()
            .gap_1()
            .cursor_pointer()
            .selected(self.open)
            .dropdown_caret(true)
            .when(self.dot, |this| {
                this.child(div().flex_none().size_1p5().rounded_full().bg(warning))
            })
            .child(
                div()
                    .max_w(rems(12.))
                    .truncate()
                    .text_xs()
                    .font_medium()
                    .child(self.value),
            )
            .when_some(self.on_click, |this, handler| {
                this.on_click(move |event, window, cx| handler(event, window, cx))
            })
    }
}
