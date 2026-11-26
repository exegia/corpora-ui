//! Verse: `react/src/components/composed/verse`.

#[cfg(test)]
use std::ops::Range;
use std::rc::Rc;

use gpui_kit::component::ActiveTheme as _;
use gpui_kit::component::text::{
    InlineElement, InlineRenderContext, MarkdownNode, MarkdownParseContext, MarkdownPlugin,
    TextView, markdown_ast,
};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    AnyElement, App, ElementId, FontWeight, InteractiveText, IntoElement, ParentElement as _,
    Pixels, Point, RenderOnce, SharedString, Styled as _, StyledText, Window, div, rems,
};
use gpui_kit::{Entity, InteractiveElement as _, StatefulInteractiveElement as _};

use crate::atoms::{TextSize, floating};
use crate::foundations::ActiveCorporaTheme as _;

type Content = Rc<dyn Fn(&mut Window, &mut App) -> AnyElement>;

/// What a stretch of a verse is.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
enum Role {
    /// The verse's reference, such as "3:16", at its head.
    Chapter,
    /// Plain words.
    Text,
    /// A glossed word or phrase, underlined.
    Span,
    /// A footnote mark.
    Note,
}

struct Segment {
    role: Role,
    text: SharedString,
    popover: Option<Content>,
}

/// The verse as one string, with the byte range and role of each segment.
/// The chapter and each note are set off by a space so they never fuse with
/// the word beside them.
#[cfg(test)]
fn compose(segments: &[Segment]) -> (String, Vec<Range<usize>>) {
    let mut text = String::new();
    let mut ranges = Vec::with_capacity(segments.len());
    for segment in segments {
        if segment.role == Role::Note {
            // A narrow no-break space: the mark stands off the word it
            // annotates and never wraps away from it.
            text.push('\u{202F}');
        }
        let start = text.len();
        text.push_str(&segment.text);
        ranges.push(start..text.len());
        if segment.role == Role::Chapter {
            text.push(' ');
        }
    }
    (text, ranges)
}

/// The segment whose popover is open, and where it was clicked.
#[derive(Default)]
struct Open(Option<(usize, Point<Pixels>)>);

struct NotePlugin {
    open: Entity<Open>,
    marks: Vec<(usize, SharedString)>,
    serif: SharedString,
}

impl MarkdownPlugin for NotePlugin {
    fn name(&self) -> &str {
        "verse-note"
    }
    fn parse(
        &self,
        node: &markdown_ast::Node,
        _: &MarkdownParseContext<'_>,
    ) -> Option<MarkdownNode> {
        let markdown_ast::Node::Link(link) = node else {
            return None;
        };
        let index: usize = link.url.strip_prefix("verse-note:")?.parse().ok()?;
        let (_, text) = self.marks.iter().find(|(id, _)| *id == index)?;
        Some(
            MarkdownNode::new("verse-note", index)
                .text(text.clone())
                .accessibility_label(format!("Note {text}")),
        )
    }
    fn render_inline(
        &self,
        node: &MarkdownNode,
        context: &InlineRenderContext,
        _: &mut Window,
        cx: &mut App,
    ) -> Option<InlineElement> {
        let index = *node.data::<usize>()?;
        let open = self.open.clone();
        Some(
            InlineElement::new(
                div()
                    .id(("verse-note", index))
                    .font_family(self.serif.clone())
                    .h(context.font_size())
                    .text_size(context.font_size() * 0.65)
                    .line_height(context.font_size() * 0.8)
                    .text_color(cx.theme().primary)
                    .whitespace_nowrap()
                    .cursor_pointer()
                    .child(node.as_text().to_owned())
                    .on_click(move |_, window, cx| {
                        let at = window.mouse_position();
                        open.update(cx, |open, cx| {
                            open.0 = Some((index, at));
                            cx.notify();
                        });
                    }),
            )
            .with_baseline(context.font_size() * 0.95),
        )
    }
}

fn escape_markdown(text: &str) -> String {
    let mut escaped = String::with_capacity(text.len());
    for ch in text.replace("\r\n", "\n").replace('\r', "\n").chars() {
        match ch {
            '\n' => {
                escaped.push_str("\\\n");
                continue;
            }
            ' ' => {
                escaped.push_str("&#32;");
                continue;
            }
            '\t' => {
                escaped.push_str("&#9;");
                continue;
            }
            _ => {}
        }
        if ch.is_ascii_punctuation() {
            escaped.push('\\');
        }
        escaped.push(ch);
    }
    escaped
}

/// One verse of a text: its reference, its words, and the glosses and notes
/// that hang on them.
///
/// ```ignore
/// Verse::new("john-1-1")
///     .chapter("1:1")
///     .text("In the beginning was ")
///     .span("the Word", |_, _| Text::new("λόγος: word, reason").small().into_any_element())
///     .note("a", |_, _| Text::new("Or: the Message").small().into_any_element())
///     .text(", and the Word was with God.")
/// ```
///
/// A span or a note opens its popover when clicked; so does the chapter if
/// it is given one. Popovers close on a press outside them and on Escape.
#[derive(IntoElement)]
pub struct Verse {
    id: ElementId,
    segments: Vec<Segment>,
    size: TextSize,
    serif: bool,
}

impl Verse {
    /// `id` must be stable and unique in the passage, such as the verse's
    /// reference.
    pub fn new(id: impl Into<ElementId>) -> Self {
        Self {
            id: id.into(),
            segments: Vec::new(),
            size: TextSize::Medium,
            serif: true,
        }
    }

    fn push(mut self, role: Role, text: impl Into<SharedString>, popover: Option<Content>) -> Self {
        self.segments.push(Segment {
            role,
            text: text.into(),
            popover,
        });
        self
    }

    /// The verse's reference, such as "3:16". Call it first.
    pub fn chapter(self, chapter: impl Into<SharedString>) -> Self {
        self.push(Role::Chapter, chapter, None)
    }

    /// The reference, with a popover that opens when it is clicked.
    pub fn chapter_popover(
        self,
        chapter: impl Into<SharedString>,
        popover: impl Fn(&mut Window, &mut App) -> AnyElement + 'static,
    ) -> Self {
        self.push(Role::Chapter, chapter, Some(Rc::new(popover)))
    }

    /// Plain words. Include the spaces around them.
    pub fn text(self, text: impl Into<SharedString>) -> Self {
        self.push(Role::Text, text, None)
    }

    /// A glossed word or phrase: underlined, with a popover.
    pub fn span(
        self,
        text: impl Into<SharedString>,
        popover: impl Fn(&mut Window, &mut App) -> AnyElement + 'static,
    ) -> Self {
        self.push(Role::Span, text, Some(Rc::new(popover)))
    }

    /// A footnote mark, such as "a", with the note in a popover.
    pub fn note(
        self,
        mark: impl Into<SharedString>,
        popover: impl Fn(&mut Window, &mut App) -> AnyElement + 'static,
    ) -> Self {
        self.push(Role::Note, mark, Some(Rc::new(popover)))
    }

    /// The type size of the whole verse.
    pub fn with_text_size(mut self, size: TextSize) -> Self {
        self.size = size;
        self
    }

    /// Sets the verse in the interface family instead of the reading one.
    pub fn sans(mut self) -> Self {
        self.serif = false;
        self
    }
}

impl RenderOnce for Verse {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let child_id = |name: &'static str| {
            ElementId::NamedChild(std::sync::Arc::new(self.id.clone()), name.into())
        };
        let state = window.use_keyed_state(child_id("open"), cx, |_, _| Open::default());
        let open = state.read(cx).0;

        let theme = cx.theme();
        let reference = self
            .segments
            .first()
            .filter(|segment| segment.role == Role::Chapter);
        let body_start = usize::from(reference.is_some());
        let body = &self.segments[body_start..];
        let mut source = String::new();
        let mut marks = Vec::new();
        for (offset, segment) in body.iter().enumerate() {
            let index = offset + body_start;
            let label = escape_markdown(&segment.text);
            if segment.role == Role::Note {
                source.push_str(&format!("\u{202F}[{label}](verse-note:{index})"));
                marks.push((index, segment.text.clone()));
            } else if segment.popover.is_some() {
                source.push_str(&format!("[{label}](verse-segment:{index})"));
            } else {
                source.push_str(&label);
            }
        }
        let opened = state.clone();
        let words = TextView::markdown(child_id("text"), source)
            .plugin(NotePlugin {
                open: state.clone(),
                marks,
                serif: cx
                    .corpora_theme()
                    .fonts()
                    .serif()
                    .unwrap_or_else(|| theme.font_family.clone()),
            })
            .on_link_click(move |url, _, window, cx| {
                let Some(segment) = url
                    .strip_prefix("verse-segment:")
                    .and_then(|id| id.parse().ok())
                else {
                    return;
                };
                let at = window.mouse_position();
                opened.update(cx, |open, cx| {
                    open.0 = Some((segment, at));
                    cx.notify();
                });
            });

        let reference = reference.map(|reference| {
            let opened = state.clone();
            let clickable = if reference.popover.is_some() {
                vec![0..reference.text.len()]
            } else {
                Vec::new()
            };
            let size = match self.size {
                TextSize::Small => 0.875,
                TextSize::Medium => 1.,
                TextSize::Large => 1.125,
            };
            div()
                .flex_none()
                .relative()
                .top(rems(0.1875))
                .font_family(theme.font_family.clone())
                .text_size(rems(size * 0.75))
                .text_color(theme.primary)
                .font_weight(FontWeight::MEDIUM)
                .child(
                    InteractiveText::new(
                        child_id("reference"),
                        StyledText::new(reference.text.clone()),
                    )
                    .on_click(clickable, move |_, window, cx| {
                        let position = window.mouse_position();
                        opened.update(cx, |open, cx| {
                            open.0 = Some((0, position));
                            cx.notify();
                        });
                    }),
                )
        });

        let popover = open.and_then(|(segment, at)| {
            let content = self.segments.get(segment)?.popover.clone()?;
            let closed = state.clone();
            let content = content(window, cx);
            Some(floating(
                child_id("popover"),
                at,
                content,
                move |_, cx| {
                    closed.update(cx, |open, cx| {
                        if open.0.take().is_some() {
                            cx.notify();
                        }
                    });
                },
                window,
                cx,
            ))
        });

        let family = self
            .serif
            .then(|| cx.corpora_theme().fonts().serif())
            .flatten();
        div()
            .flex()
            .items_start()
            .gap_1()
            .text_color(cx.theme().foreground)
            // `leading-7`
            .line_height(rems(1.75))
            .map(|this| match self.size {
                TextSize::Small => this.text_sm(),
                TextSize::Medium => this.text_base(),
                TextSize::Large => this.text_lg(),
            })
            .when_some(family, |this, family| this.font_family(family))
            .children(reference)
            .child(div().flex_1().min_w_0().child(words))
            .children(popover)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn segment(role: Role, text: &'static str) -> Segment {
        Segment {
            role,
            text: text.into(),
            popover: None,
        }
    }

    #[test]
    fn a_verse_reads_as_one_string_with_a_range_per_segment() {
        let (text, ranges) = compose(&[
            segment(Role::Chapter, "1:1"),
            segment(Role::Text, "In the beginning was "),
            segment(Role::Span, "the Word"),
            segment(Role::Note, "a"),
            segment(Role::Text, "."),
        ]);
        assert_eq!(text, "1:1 In the beginning was the Word\u{202F}a.");
        assert_eq!(&text[ranges[0].clone()], "1:1");
        assert_eq!(&text[ranges[2].clone()], "the Word");
        assert_eq!(&text[ranges[3].clone()], "a");
    }

    #[test]
    fn ranges_count_bytes_so_greek_and_hebrew_stay_whole() {
        let (text, ranges) = compose(&[
            segment(Role::Text, "ἐν ἀρχῇ ἦν "),
            segment(Role::Span, "ὁ λόγος"),
        ]);
        assert_eq!(&text[ranges[1].clone()], "ὁ λόγος");
    }
}
