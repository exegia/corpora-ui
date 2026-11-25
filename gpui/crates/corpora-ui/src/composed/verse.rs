//! Verse: `react/src/components/composed/verse`.

use std::ops::Range;
use std::rc::Rc;

use gpui_kit::component::ActiveTheme as _;
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    AnyElement, App, ElementId, FontWeight, HighlightStyle, InteractiveText, IntoElement,
    ParentElement as _, Pixels, Point, RenderOnce, SharedString, Styled as _, StyledText,
    UnderlineStyle, Window, div, px, rems,
};

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
        let (text, ranges) = compose(&self.segments);
        let highlights = self
            .segments
            .iter()
            .zip(&ranges)
            .filter_map(|(segment, range)| {
                let style = match segment.role {
                    Role::Text => return None,
                    Role::Chapter => HighlightStyle {
                        color: Some(theme.primary),
                        font_weight: Some(FontWeight::MEDIUM),
                        ..HighlightStyle::default()
                    },
                    Role::Span => HighlightStyle {
                        underline: Some(UnderlineStyle {
                            thickness: px(1.),
                            color: Some(theme.muted_foreground.opacity(0.5)),
                            wavy: false,
                        }),
                        ..HighlightStyle::default()
                    },
                    Role::Note => HighlightStyle {
                        color: Some(theme.muted_foreground),
                        font_weight: Some(FontWeight::MEDIUM),
                        ..HighlightStyle::default()
                    },
                };
                Some((range.clone(), style))
            });
        let styled = StyledText::new(text).with_highlights(highlights.collect::<Vec<_>>());

        // Only segments with a popover take clicks.
        let clickable: Vec<(usize, Range<usize>)> = self
            .segments
            .iter()
            .zip(&ranges)
            .enumerate()
            .filter(|(_, (segment, _))| segment.popover.is_some())
            .map(|(index, (_, range))| (index, range.clone()))
            .collect();
        let targets: Vec<usize> = clickable.iter().map(|(index, _)| *index).collect();
        let opened = state.clone();
        let words = InteractiveText::new(child_id("text"), styled).on_click(
            clickable.into_iter().map(|(_, range)| range).collect(),
            move |clicked, window, cx| {
                let position = window.mouse_position();
                let segment = targets[clicked];
                opened.update(cx, |open, cx| {
                    open.0 = Some((segment, position));
                    cx.notify();
                });
            },
        );

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
            .text_color(cx.theme().foreground)
            // `leading-7`
            .line_height(rems(1.75))
            .map(|this| match self.size {
                TextSize::Small => this.text_sm(),
                TextSize::Medium => this.text_base(),
                TextSize::Large => this.text_lg(),
            })
            .when_some(family, |this, family| this.font_family(family))
            .child(words)
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
