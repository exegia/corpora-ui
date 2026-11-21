//! Reference: `react/src/components/atoms/reference.tsx`.

use std::rc::Rc;
use std::time::Duration;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::component::button::{Button as StockButton, ButtonRounded};
use gpui_kit::component::hover_card::HoverCard;
use gpui_kit::component::{ActiveTheme as _, Icon, Sizable as _, StyledExt as _, v_flex};
use gpui_kit::{
    App, ClickEvent, ElementId, IntoElement, ParentElement as _, RenderOnce, SharedString,
    Styled as _, Window, div, px, radians, rems,
};

use crate::foundations::{ActiveCorporaTheme as _, Radius};

/// How long the pointer rests on the chip before the passage opens.
const PREVIEW_DELAY: Duration = Duration::from_millis(300);

type ClickHandler = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App)>;

/// "Reference 1" — a small tag pointing at the node, passage or source a
/// statement is grounded in.
///
/// ```ignore
/// Reference::new("ref-1", "Genesis 1:1")
///     .preview("In the beginning God created the heavens and the earth.")
///     .on_click(|_, window, cx| { /* reveal the passage */ })
/// ```
///
/// With an `href` the chip opens that URL; otherwise it runs `on_click`. With
/// a `preview`, the passage shows in a card after the pointer rests on it.
#[derive(IntoElement)]
pub struct Reference {
    id: ElementId,
    label: SharedString,
    href: Option<SharedString>,
    preview: Option<SharedString>,
    on_click: Option<ClickHandler>,
}

impl Reference {
    /// `id` must be stable and unique among the chip's siblings.
    pub fn new(id: impl Into<ElementId>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            href: None,
            preview: None,
            on_click: None,
        }
    }

    /// An external URL to open when the chip is activated.
    pub fn href(mut self, href: impl Into<SharedString>) -> Self {
        self.href = Some(href.into());
        self
    }

    /// The passage the chip points at.
    pub fn preview(mut self, preview: impl Into<SharedString>) -> Self {
        self.preview = Some(preview.into());
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

impl RenderOnce for Reference {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let theme = cx.theme();
        let palette = *cx.palette();
        let href = self.href;
        let on_click = self.on_click;

        let chip = StockButton::new(self.id.clone())
            .small()
            .rounded(ButtonRounded::Size(Radius::Md.resolve(cx)))
            // `h-6.5 pl-2`
            .h(rems(1.625))
            .pl_2()
            .pr_2p5()
            .gap_1p5()
            .cursor_pointer()
            .bg(theme.input.opacity(0.3))
            .border_color(theme.foreground.opacity(0.1))
            .accessibility_label(self.label.clone())
            .child(
                Icon::new(LucideIcon::Link2)
                    .rotate(radians(-std::f32::consts::FRAC_PI_4))
                    .xsmall()
                    .text_color(palette.warning_foreground),
            )
            .child(
                div()
                    .max_w(rems(14.))
                    .truncate()
                    .text_xs()
                    .text_color(theme.foreground.opacity(0.9))
                    .child(self.label.clone()),
            )
            .on_click(move |event, window, cx| {
                if let Some(href) = &href {
                    cx.open_url(href);
                }
                if let Some(on_click) = &on_click {
                    on_click(event, window, cx);
                }
            });

        let Some(preview) = self.preview else {
            return chip.into_any_element();
        };

        let label = self.label;
        HoverCard::new(ElementId::NamedChild(
            std::sync::Arc::new(self.id),
            "preview".into(),
        ))
        .open_delay(PREVIEW_DELAY)
        .trigger(chip)
        .content(move |_, _, cx| {
            let theme = cx.theme();
            v_flex()
                .w_72()
                .gap_1p5()
                .child(
                    div()
                        .truncate()
                        .text_size(px(11.))
                        .font_semibold()
                        .text_color(theme.muted_foreground)
                        .child(label.clone()),
                )
                .child(
                    div()
                        .border_l_2()
                        .border_color(cx.palette().warning.opacity(0.7))
                        .pl_2p5()
                        .text_xs()
                        .text_color(theme.foreground.opacity(0.9))
                        .child(preview.clone()),
                )
        })
        .into_any_element()
    }
}
