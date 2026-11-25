//! Markdown: `react/src/components/composed/chat/markdown.tsx`.

use std::rc::Rc;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::component::text::TextView;
use gpui_kit::component::{ActiveTheme as _, Icon, h_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    Animation, AnimationExt as _, App, ClickEvent, ClipboardItem, ElementId, IntoElement,
    ParentElement as _, RenderOnce, SharedString, Styled as _, Window, div, px, rems,
};

use crate::atoms::{Button, Card, CardFrame, CardFrameHeader, SegmentedToggle, subtle};
use crate::foundations::motion::DURATION_FAST;
use crate::foundations::{AtomSize, Radius};

type CopyHandler = Rc<dyn Fn(&SharedString, &mut Window, &mut App)>;
type ClickHandler = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App)>;

/// Which side of the document is showing.
#[derive(Default)]
struct View {
    markup: bool,
    /// Set once the view has been switched, so the first one does not animate.
    switched: bool,
}

/// A markdown document on a card, behind a Preview and Markup switch, with
/// Copy and an optional Expand.
///
/// ```ignore
/// Markdown::new("notes", source)
///     .on_expand(cx.listener(|this, _, window, cx| this.open_notes(window, cx)))
/// ```
///
/// "Copy markdown" puts the source on the clipboard, then calls
/// [`Self::on_copy`]. The text of the preview is selectable.
#[derive(IntoElement)]
pub struct Markdown {
    id: ElementId,
    source: SharedString,
    on_copy: Option<CopyHandler>,
    on_expand: Option<ClickHandler>,
}

impl Markdown {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>, source: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            source: source.into(),
            on_copy: None,
            on_expand: None,
        }
    }

    /// Called with the source after it has been copied.
    pub fn on_copy(
        mut self,
        handler: impl Fn(&SharedString, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_copy = Some(Rc::new(handler));
        self
    }

    /// Adds an "Expand" button, for opening the document on its own.
    pub fn on_expand(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_expand = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for Markdown {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let child_id = |name: &'static str| {
            ElementId::NamedChild(std::sync::Arc::new(self.id.clone()), name.into())
        };
        let state = window.use_keyed_state(child_id("view"), cx, |_, _| View::default());
        let (markup, switched) = {
            let state = state.read(cx);
            (state.markup, state.switched)
        };
        let reduce_motion = cx.reduce_motion();
        let mono = cx.theme().mono_font_family.clone();

        let view = state.clone();
        let switch = SegmentedToggle::new(child_id("toggle"))
            .option("preview", "Preview")
            .option("markup", "Markup")
            .value(if markup { "markup" } else { "preview" })
            .on_change(move |value, _, cx| {
                let markup = value.as_ref() == "markup";
                view.update(cx, |view, cx| {
                    view.markup = markup;
                    view.switched = true;
                    cx.notify();
                });
            });

        let source = self.source.clone();
        let on_copy = self.on_copy;
        let actions = h_flex()
            .gap_1()
            .when_some(self.on_expand, |this, on_expand| {
                this.child(
                    Button::new(child_id("expand"))
                        .ghost()
                        .with_atom_size(AtomSize::Xs)
                        .icon(Icon::new(LucideIcon::Maximize2))
                        .tooltip("Expand")
                        .on_click(move |event, window, cx| on_expand(event, window, cx)),
                )
            })
            .child(
                Button::new(child_id("copy"))
                    .ghost()
                    .with_atom_size(AtomSize::Xs)
                    .icon(Icon::new(LucideIcon::Copy))
                    .tooltip("Copy markdown")
                    .on_click(move |_, window, cx| {
                        cx.write_to_clipboard(ClipboardItem::new_string(source.to_string()));
                        if let Some(on_copy) = &on_copy {
                            on_copy(&source, window, cx);
                        }
                    }),
            );

        let body = if markup {
            div().relative().p_2().child(
                div()
                    .px_2p5()
                    .py_2()
                    .rounded(Radius::Md.resolve(cx))
                    .bg(subtle(cx))
                    .font_family(mono)
                    .text_xs()
                    .line_height(rems(1.))
                    .child(self.source),
            )
        } else {
            div()
                .relative()
                .p_4()
                .text_sm()
                .child(TextView::markdown(child_id("preview"), self.source).selectable(true))
        };
        let body = body.with_animation(
            child_id(if markup { "markup-in" } else { "preview-in" }),
            Animation::new(DURATION_FAST),
            move |body, delta| {
                if reduce_motion || !switched {
                    return body;
                }
                let progress = 1. - (1. - delta).powi(3);
                body.opacity(progress).top(px(12. * (1. - progress)))
            },
        );

        CardFrame::new()
            .header(CardFrameHeader::custom(switch).action(actions))
            .card(Card::new().child(body))
    }
}
