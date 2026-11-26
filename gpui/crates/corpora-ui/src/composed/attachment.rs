//! Attachment: `react/src/components/composed/chat/attachment.tsx`.

use std::{cell::Cell, rc::Rc};

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::component::{ActiveTheme as _, Icon, Sizable as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    App, Bounds, ClickEvent, Div, ElementId, FontWeight, ImageSource, InteractiveElement as _,
    IntoElement, MouseButton, ObjectFit, ParentElement as _, Pixels, RenderOnce, SharedString,
    Styled as _, StyledImage as _, Window, canvas, div, img, px, rems,
};

use crate::atoms::{Button, GlassSpec, IconName, subtle};
use crate::foundations::{ActiveCorporaTheme as _, AtomSize, Radius};

/// What an [`Attachment`] carries, with the details only that kind has.
#[derive(Clone, Debug, Default, PartialEq)]
pub enum AttachmentKind {
    #[default]
    Document,
    Image,
    /// A video, with its length as it should read ("0:42").
    Video {
        duration: Option<SharedString>,
    },
    /// A sound, with its length and the heights of its waveform's bars,
    /// each from 0 to 1.
    Audio {
        duration: Option<SharedString>,
        waveform: Vec<f32>,
    },
    /// A passage quoted from the reader. The title names its source.
    TextSelection {
        quote: SharedString,
    },
    /// An earlier message being answered. The title names its author.
    ChatReply {
        time: Option<SharedString>,
        body: SharedString,
    },
    /// A mentioned person. The title is their handle.
    Handle {
        initials: SharedString,
    },
    /// A web page.
    Link {
        domain: SharedString,
        description: Option<SharedString>,
        url: Option<SharedString>,
    },
}

impl AttachmentKind {
    fn icon(&self) -> LucideIcon {
        match self {
            Self::Document => LucideIcon::FileText,
            Self::Image => LucideIcon::Image,
            Self::Video { .. } | Self::Audio { .. } => LucideIcon::Film,
            Self::TextSelection { .. } => LucideIcon::TextQuote,
            Self::ChatReply { .. } => LucideIcon::Reply,
            Self::Handle { .. } => LucideIcon::AtSign,
            Self::Link { .. } => LucideIcon::Link2,
        }
    }
}

/// The bars drawn for a sound with no waveform of its own.
const DEFAULT_WAVEFORM: [f32; 24] = [
    0.3, 0.5, 0.8, 0.6, 0.4, 0.9, 0.7, 0.5, 0.3, 0.6, 1.0, 0.8, 0.5, 0.4, 0.7, 0.9, 0.6, 0.3, 0.5,
    0.8, 0.6, 0.4, 0.3, 0.2,
];

type ClickHandler = Rc<dyn Fn(&ClickEvent, &mut Window, &mut App)>;

/// Something attached to a message or waiting in the composer: a file, an
/// image, a recording, a quoted passage, a reply, a mention or a link.
///
/// ```ignore
/// // A chip for the composer's tray.
/// Attachment::new("draft-collation", "bezae-collation.pdf")
///     .meta("PDF · 2.4 MB")
///     .on_remove(cx.listener(|this, _, _, cx| this.detach(cx)))
///
/// // The content itself, in a sent message.
/// Attachment::new("quote-1", "John 1:1")
///     .kind(AttachmentKind::TextSelection { quote: "In the beginning was the Word".into() })
///     .preview()
/// ```
///
/// Without [`Self::preview`] every kind is the same compact chip.
#[derive(IntoElement)]
pub struct Attachment {
    id: ElementId,
    kind: AttachmentKind,
    title: SharedString,
    meta: Option<SharedString>,
    thumbnail: Option<ImageSource>,
    preview: bool,
    playing: bool,
    progress: Option<f32>,
    on_seek: Option<Rc<dyn Fn(&f32, &mut Window, &mut App)>>,
    on_remove: Option<ClickHandler>,
    on_action: Option<ClickHandler>,
}

impl Attachment {
    /// `id` must be stable and unique among siblings, such as the
    /// attachment's id.
    pub fn new(id: impl Into<ElementId>, title: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            kind: AttachmentKind::default(),
            title: title.into(),
            meta: None,
            thumbnail: None,
            preview: false,
            playing: false,
            progress: None,
            on_seek: None,
            on_remove: None,
            on_action: None,
        }
    }

    pub fn kind(mut self, kind: AttachmentKind) -> Self {
        self.kind = kind;
        self
    }

    /// A second line under the title, such as the format and size.
    pub fn meta(mut self, meta: impl Into<SharedString>) -> Self {
        self.meta = Some(meta.into());
        self
    }

    /// The picture shown for the attachment: the image itself, a video's
    /// poster, a page's preview. Without it the kind's icon stands in.
    pub fn thumbnail(mut self, thumbnail: impl Into<ImageSource>) -> Self {
        self.thumbnail = Some(thumbnail.into());
        self
    }

    /// Shows the content itself instead of the compact chip.
    pub fn preview(mut self) -> Self {
        self.preview = true;
        self
    }

    /// Whether the host is playing the audio/video preview. Playback remains
    /// owned by the host; its action handler toggles this state.
    pub fn playing(mut self, playing: bool) -> Self {
        self.playing = playing;
        self
    }

    /// Controlled playback progress, from zero to one. Colors audio bars and
    /// places the video scrubber over the lower edge of its picture.
    pub fn playback_progress(mut self, progress: f32) -> Self {
        self.progress = Some(if progress.is_finite() {
            progress.clamp(0., 1.)
        } else {
            0.
        });
        self
    }

    /// Requests a new normalized playback position when the scrubber is used.
    pub fn on_seek(mut self, handler: impl Fn(&f32, &mut Window, &mut App) + 'static) -> Self {
        self.on_seek = Some(Rc::new(handler));
        self
    }

    /// Adds a remove button to the chip.
    pub fn on_remove(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_remove = Some(Rc::new(handler));
        self
    }

    /// The attachment's own action in its preview: "Download" for a
    /// document, "Play" for a recording, "Open link" for a page.
    pub fn on_action(
        mut self,
        handler: impl Fn(&ClickEvent, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_action = Some(Rc::new(handler));
        self
    }
}

fn seek_fraction(x: Pixels, bounds: Bounds<Pixels>) -> f32 {
    if bounds.size.width <= px(0.) {
        return 0.;
    }
    (f32::from(x - bounds.origin.x) / f32::from(bounds.size.width)).clamp(0., 1.)
}

fn playback_icon(playing: bool) -> Icon {
    let svg: &'static [u8] = if playing {
        br#"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M6 4h4v16H6zM14 4h4v16h-4z"/></svg>"#
    } else {
        br#"<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M6 3v18l15-9z"/></svg>"#
    };
    Icon::default().data(svg)
}

/// The attachment's picture, or its kind's icon on a quiet tile.
fn visual(kind: &AttachmentKind, thumbnail: Option<ImageSource>, small: bool, cx: &App) -> Div {
    let radius = if matches!(kind, AttachmentKind::Video { .. }) && !small {
        Radius::Lg.resolve(cx)
    } else {
        Radius::Md.resolve(cx)
    };
    let tile = h_flex()
        .flex_none()
        .justify_center()
        .overflow_hidden()
        .rounded(radius)
        .bg(subtle(cx))
        .text_color(cx.theme().muted_foreground);
    let tile = if small {
        tile.size_10()
    } else {
        tile.w_full().map(|this| {
            if matches!(kind, AttachmentKind::Video { .. }) {
                this.aspect_ratio(16. / 9.)
            } else {
                this.h(rems(10.))
            }
        })
    };
    match thumbnail {
        Some(thumbnail) => tile.child(
            img(thumbnail)
                .size_full()
                .rounded(radius)
                .object_fit(ObjectFit::Cover),
        ),
        None => tile.child(Icon::new(kind.icon()).map(|icon| {
            if small {
                icon.small()
            } else {
                icon.large().opacity(0.6)
            }
        })),
    }
}

/// The accent bar that rails a quote or a reply.
fn quote_rail(cx: &App) -> Div {
    div()
        .flex_none()
        .w(px(3.))
        .rounded_full()
        .bg(cx.theme().primary)
}

impl RenderOnce for Attachment {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let child_id = |name: &'static str| {
            ElementId::NamedChild(std::sync::Arc::new(self.id.clone()), name.into())
        };
        let theme = cx.theme();
        let muted = theme.muted_foreground;
        let border = theme.border;
        let accent = theme.primary;
        let card = cx.palette().card;
        let radius = Radius::Md.resolve(cx);
        let mono = theme.mono_font_family.clone();

        let title = |title: SharedString| {
            div()
                .truncate()
                .text_sm()
                .font_weight(FontWeight::MEDIUM)
                .child(title)
        };
        let meta = |meta: Option<SharedString>| {
            meta.map(|meta| div().truncate().text_xs().text_color(muted).child(meta))
        };
        let action =
            |name: &'static str, icon: Icon, tooltip: &'static str, handler: ClickHandler| {
                Button::new(child_id(name))
                    .ghost()
                    .with_atom_size(AtomSize::Xs)
                    .icon(icon)
                    .tooltip(tooltip)
                    .on_click(move |event, window, cx| handler(event, window, cx))
            };
        let chip = |trailing: Option<Button>, thumbnail: Option<ImageSource>, cx: &App| {
            h_flex()
                .w(rems(15.))
                .max_w_full()
                .min_h(rems(3.25))
                .gap_2p5()
                .py_1p5()
                .pl_1p5()
                .pr_2p5()
                .rounded(radius)
                .border_1()
                .border_color(border)
                .bg(card)
                .child(visual(&self.kind, thumbnail, true, cx))
                .child(
                    v_flex()
                        .flex_1()
                        .min_w_0()
                        .gap_0p5()
                        .child(title(self.title.clone()))
                        .children(meta(self.meta.clone())),
                )
                .children(trailing)
        };

        if !self.preview {
            let remove = self.on_remove.map(|handler| {
                action(
                    "remove",
                    Icon::new(IconName::Close),
                    "Remove attachment",
                    handler,
                )
            });
            return chip(remove, self.thumbnail, cx).into_any_element();
        }

        let panel = || {
            v_flex()
                .w(rems(16.25))
                .max_w_full()
                .overflow_hidden()
                .rounded(radius)
        };
        match self.kind.clone() {
            AttachmentKind::Document => {
                let download = self.on_action.map(|handler| {
                    action(
                        "action",
                        Icon::new(LucideIcon::Download),
                        "Download",
                        handler,
                    )
                });
                chip(download, self.thumbnail, cx).into_any_element()
            }
            AttachmentKind::Image => div()
                .w(rems(15.))
                .max_w_full()
                .child(visual(&self.kind, self.thumbnail, false, cx))
                .into_any_element(),
            AttachmentKind::Video { duration } => div()
                .relative()
                .w(rems(15.))
                .max_w_full()
                .child(visual(&self.kind, self.thumbnail, false, cx))
                .when_some(self.on_action, |this, handler| {
                    this.child(
                        h_flex().absolute().inset_0().justify_center().child(
                            Button::new(child_id("action"))
                                .glass_spec(GlassSpec {
                                    tint: Some(gpui_kit::transparent_black()),
                                    gain_light: 1.,
                                    gain_dark: 1.,
                                    ..GlassSpec::button(cx)
                                })
                                .icon(playback_icon(self.playing))
                                .tooltip(if self.playing {
                                    "Pause video"
                                } else {
                                    "Play video"
                                })
                                .on_click(move |event, window, cx| handler(event, window, cx)),
                        ),
                    )
                })
                .when_some(self.progress, |this, progress| {
                    let bounds = Rc::new(Cell::new(Bounds::<Pixels>::default()));
                    let measured = bounds.clone();
                    let down_bounds = bounds.clone();
                    let down = self.on_seek.clone();
                    let drag = self.on_seek.clone();
                    this.child(
                        div()
                            .absolute()
                            .bottom_1()
                            .left_2()
                            .right_2()
                            .id(child_id("scrubber"))
                            .h_5()
                            .cursor_pointer()
                            .on_mouse_down(MouseButton::Left, move |event, window, cx| {
                                if let Some(handler) = &down {
                                    let b = down_bounds.get();
                                    handler(&seek_fraction(event.position.x, b), window, cx);
                                    cx.stop_propagation();
                                }
                            })
                            .on_mouse_move(move |event, window, cx| {
                                if event.pressed_button == Some(MouseButton::Left) {
                                    if let Some(handler) = &drag {
                                        handler(
                                            &seek_fraction(event.position.x, bounds.get()),
                                            window,
                                            cx,
                                        );
                                        cx.stop_propagation();
                                    }
                                }
                            })
                            .child(
                                canvas(
                                    move |b, _, _| {
                                        measured.set(b);
                                    },
                                    |_, _, _, _| {},
                                )
                                .absolute()
                                .size_full(),
                            )
                            .child(
                                div()
                                    .absolute()
                                    .left_0()
                                    .right_0()
                                    .top_2()
                                    .h_1()
                                    .rounded_full()
                                    .bg(gpui_kit::white().opacity(0.35))
                                    .child(
                                        div()
                                            .h_full()
                                            .rounded_full()
                                            .bg(gpui_kit::white())
                                            .w(gpui_kit::relative(progress)),
                                    ),
                            ),
                    )
                })
                .when_some(duration, |this, duration| {
                    this.child(
                        div()
                            .absolute()
                            .top_2()
                            .right_2()
                            .px_1p5()
                            .rounded(px(4.))
                            .bg(theme.background.opacity(0.7))
                            .font_family(mono.clone())
                            .text_xs()
                            .child(duration),
                    )
                })
                .into_any_element(),
            AttachmentKind::Audio { duration, waveform } => {
                let bars = if waveform.is_empty() {
                    DEFAULT_WAVEFORM.to_vec()
                } else {
                    waveform
                };
                let line = [self.meta, duration]
                    .into_iter()
                    .flatten()
                    .map(|part| part.to_string())
                    .collect::<Vec<_>>()
                    .join(" · ");
                let count = bars.len();
                panel()
                    .gap_2()
                    .p_2p5()
                    .border_1()
                    .border_color(border)
                    .bg(card)
                    .child(
                        h_flex()
                            .gap_3()
                            .when_some(self.on_action, |this, handler| {
                                this.child(
                                    Button::new(child_id("action"))
                                        .secondary()
                                        .icon(Icon::new(if self.playing {
                                            LucideIcon::Pause
                                        } else {
                                            LucideIcon::Play
                                        }))
                                        .tooltip(if self.playing {
                                            "Pause audio"
                                        } else {
                                            "Play audio"
                                        })
                                        .on_click(move |event, window, cx| {
                                            handler(event, window, cx)
                                        }),
                                )
                            })
                            .child(h_flex().flex_1().h_6().gap(px(2.)).children(
                                bars.into_iter().enumerate().map(|(index, height)| {
                                    div()
                                        .flex_1()
                                        .h(gpui_kit::relative(height.clamp(0.1, 1.)))
                                        .rounded_full()
                                        .bg(
                                            if self.progress.is_some_and(|progress| {
                                                (index as f32 + 0.5) / count as f32 <= progress
                                            }) {
                                                accent
                                            } else {
                                                muted.opacity(0.6)
                                            },
                                        )
                                }),
                            )),
                    )
                    .child(title(self.title))
                    .when(!line.is_empty(), |this| {
                        this.child(div().text_xs().text_color(muted).child(line))
                    })
                    .into_any_element()
            }
            AttachmentKind::TextSelection { quote } => panel()
                .flex_row()
                .gap_2p5()
                .p_2p5()
                .bg(subtle(cx))
                .child(quote_rail(cx))
                .child(
                    v_flex()
                        .flex_1()
                        .min_w_0()
                        .gap_1()
                        .child(
                            h_flex()
                                .gap_1p5()
                                .text_xs()
                                .font_weight(FontWeight::SEMIBOLD)
                                .text_color(accent)
                                .child(Icon::new(IconName::BookOpen).small().flex_none())
                                .child(div().truncate().child(self.title)),
                        )
                        .child(div().text_sm().line_clamp(4).text_ellipsis().child(quote)),
                )
                .into_any_element(),
            AttachmentKind::ChatReply { time, body } => panel()
                .flex_row()
                .gap_2()
                .p_2p5()
                .bg(subtle(cx))
                .child(quote_rail(cx))
                .child(
                    v_flex()
                        .flex_1()
                        .min_w_0()
                        .gap_0p5()
                        .child(
                            h_flex()
                                .gap_1p5()
                                .text_xs()
                                .text_color(accent)
                                .child(Icon::new(LucideIcon::Reply).small().flex_none())
                                .child(
                                    div()
                                        .truncate()
                                        .font_weight(FontWeight::SEMIBOLD)
                                        .child(self.title),
                                )
                                .when_some(time, |this, time| {
                                    this.child(div().flex_none().text_color(muted).child(time))
                                }),
                        )
                        .child(div().text_sm().line_clamp(3).text_ellipsis().child(body)),
                )
                .into_any_element(),
            AttachmentKind::Handle { initials } => h_flex()
                .flex_none()
                .h_6()
                .gap_1p5()
                .pl_0p5()
                .pr_2()
                .rounded(radius)
                .bg(accent.opacity(0.12))
                .text_sm()
                .font_weight(FontWeight::SEMIBOLD)
                .text_color(accent)
                .child(
                    h_flex()
                        .flex_none()
                        .justify_center()
                        .size_5()
                        .rounded_full()
                        .bg(accent)
                        .text_size(rems(0.5625))
                        .text_color(theme.primary_foreground)
                        .child(initials),
                )
                .child(self.title)
                .into_any_element(),
            AttachmentKind::Link {
                domain,
                description,
                url,
            } => {
                let open: Option<ClickHandler> = self.on_action.or_else(|| {
                    url.map(|url| {
                        Rc::new(move |_: &ClickEvent, _: &mut Window, cx: &mut App| {
                            cx.open_url(&url)
                        }) as ClickHandler
                    })
                });
                panel()
                    .w(rems(15.))
                    .border_1()
                    .border_color(border)
                    .bg(card)
                    .child(
                        visual(&self.kind, self.thumbnail, false, cx)
                            .h(rems(7.5))
                            .rounded_none(),
                    )
                    .child(
                        v_flex()
                            .gap_1()
                            .px_3()
                            .pt_2p5()
                            .pb_3()
                            .child(
                                h_flex()
                                    .gap_1p5()
                                    .font_family(mono)
                                    .text_xs()
                                    .text_color(muted)
                                    .child(Icon::new(IconName::Globe).xsmall().flex_none())
                                    .child(div().flex_1().min_w_0().truncate().child(domain))
                                    .when_some(open, |this, handler| {
                                        this.child(action(
                                            "action",
                                            Icon::new(IconName::ExternalLink),
                                            "Open link",
                                            handler,
                                        ))
                                    }),
                            )
                            .child(title(self.title))
                            .when_some(description, |this, description| {
                                this.child(
                                    div()
                                        .text_xs()
                                        .text_color(muted)
                                        .line_clamp(2)
                                        .text_ellipsis()
                                        .child(description),
                                )
                            }),
                    )
                    .into_any_element()
            }
        }
    }
}

#[cfg(test)]
mod playback_tests {
    use super::*;
    #[test]
    fn scrub_position_is_clamped_to_the_video_timeline() {
        let bounds = Bounds::new(
            gpui_kit::point(px(10.), px(0.)),
            gpui_kit::size(px(100.), px(20.)),
        );
        assert_eq!(seek_fraction(px(60.), bounds), 0.5);
        assert_eq!(seek_fraction(px(0.), bounds), 0.);
        assert_eq!(seek_fraction(px(150.), bounds), 1.);
        assert_eq!(seek_fraction(px(10.), Bounds::default()), 0.);
    }
}
