//! Chips: `react/src/components/atoms/chip.tsx`.

use std::rc::Rc;

use gpui_kit::component::button::{Button as StockButton, ButtonRounded, ButtonVariants as _};
use gpui_kit::component::menu::{DropdownMenu as _, PopupMenuItem};
use gpui_kit::component::{ActiveTheme as _, Icon, Sizable as _, StyledExt as _};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    App, ElementId, IntoElement, ParentElement as _, RenderOnce, SharedString, Styled as _, Window,
    div, rems,
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

type PickHandler = Rc<dyn Fn(&SharedString, &mut Window, &mut App)>;

/// A compact value that opens a menu of the other values it can take.
///
/// ```ignore
/// SelectChip::new("status", self.status.clone())
///     .options(["Pending", "Paid", "Refunded"])
///     .on_pick(cx.listener(|this, status, _, cx| {
///         this.status = status.clone();
///         cx.notify();
///     }))
/// ```
///
/// The current value is checked in the menu. Without options the chip is a
/// plain button with no menu.
#[derive(IntoElement)]
pub struct SelectChip {
    id: ElementId,
    value: SharedString,
    dot: bool,
    options: Vec<SharedString>,
    on_pick: Option<PickHandler>,
}

impl SelectChip {
    /// `id` must be stable and unique among the chip's siblings.
    pub fn new(id: impl Into<ElementId>, value: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            value: value.into(),
            dot: false,
            options: Vec::new(),
            on_pick: None,
        }
    }

    /// Marks the value with an attention dot.
    pub fn dot(mut self, dot: bool) -> Self {
        self.dot = dot;
        self
    }

    /// Every value the chip can take, the current one included.
    pub fn options(mut self, options: impl IntoIterator<Item = impl Into<SharedString>>) -> Self {
        self.options = options.into_iter().map(Into::into).collect();
        self
    }

    /// Called with the option picked from the menu.
    pub fn on_pick(
        mut self,
        handler: impl Fn(&SharedString, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_pick = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for SelectChip {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let warning = cx.palette().warning;
        let trigger = StockButton::new(self.id)
            .secondary()
            .small()
            .rounded(ButtonRounded::Size(Radius::Sm.resolve(cx)))
            .px_1p5()
            .gap_1()
            .cursor_pointer()
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
                    .child(self.value.clone()),
            );
        if self.options.is_empty() {
            return trigger.into_any_element();
        }

        let value = self.value;
        let options = self.options;
        let on_pick = self.on_pick;
        trigger
            .dropdown_menu(move |mut menu, _, _| {
                for option in &options {
                    let on_pick = on_pick.clone();
                    let picked = option.clone();
                    menu = menu.item(
                        PopupMenuItem::new(option.clone())
                            .checked(*option == value)
                            .on_click(move |_, window, cx| {
                                if let Some(on_pick) = &on_pick {
                                    on_pick(&picked, window, cx);
                                }
                            }),
                    );
                }
                menu
            })
            .into_any_element()
    }
}
