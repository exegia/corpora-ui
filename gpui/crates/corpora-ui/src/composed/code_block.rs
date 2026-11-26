//! CodeBlock: `react/src/components/composed/chat/code-block.tsx`.

use std::ops::Range;
use std::rc::Rc;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::component::{ActiveTheme as _, Icon, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    App, ClipboardItem, ElementId, HighlightStyle, InteractiveElement as _, IntoElement,
    ParentElement as _, RenderOnce, SharedString, StatefulInteractiveElement as _, Styled as _,
    StyledText, Window, div, rems,
};

use crate::atoms::{Button, Card, CardFrame, CardFrameHeader, SegmentedToggle};
use crate::foundations::AtomSize;

/// The words tinted as keywords in every block.
const KEYWORDS: &[&str] = &[
    "export",
    "import",
    "from",
    "async",
    "await",
    "function",
    "const",
    "let",
    "var",
    "return",
    "if",
    "else",
    "null",
    "true",
    "false",
    "new",
    "class",
    "type",
    "interface",
    "fn",
    "pub",
    "use",
    "struct",
    "enum",
    "impl",
    "match",
    "mut",
];

/// What a tinted stretch of a line is.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum CodeToken {
    Keyword,
    String,
}

fn is_identifier_start(character: char) -> bool {
    character == '$' || character == '_' || character.is_ascii_alphabetic()
}

/// The keywords and string literals of a line, as byte ranges. A minimal
/// highlighter on purpose: it knows no language, only quotes and words.
pub fn tokenize(line: &str, extra_keywords: &[SharedString]) -> Vec<(Range<usize>, CodeToken)> {
    let mut tokens = Vec::new();
    let mut characters = line.char_indices().peekable();
    while let Some((start, character)) = characters.next() {
        if matches!(character, '"' | '\'' | '`') {
            let mut end = line.len();
            while let Some((index, next)) = characters.next() {
                if next == '\\' {
                    characters.next();
                } else if next == character {
                    end = index + next.len_utf8();
                    break;
                }
            }
            tokens.push((start..end, CodeToken::String));
        } else if is_identifier_start(character) {
            let mut end = start + character.len_utf8();
            while let Some((index, next)) = characters.peek().copied() {
                if !(is_identifier_start(next) || next.is_ascii_digit()) {
                    break;
                }
                end = index + next.len_utf8();
                characters.next();
            }
            let word = &line[start..end];
            if KEYWORDS.contains(&word) || extra_keywords.iter().any(|extra| extra == word) {
                tokens.push((start..end, CodeToken::Keyword));
            }
        }
    }
    tokens
}

/// How a line of a diff changed.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq)]
pub enum DiffKind {
    Added,
    Removed,
    #[default]
    Context,
}

/// One line of a diff.
#[derive(Clone, Debug, PartialEq)]
pub struct DiffLine {
    pub kind: DiffKind,
    pub text: SharedString,
}

impl DiffLine {
    pub fn added(text: impl Into<SharedString>) -> Self {
        Self {
            kind: DiffKind::Added,
            text: text.into(),
        }
    }

    pub fn removed(text: impl Into<SharedString>) -> Self {
        Self {
            kind: DiffKind::Removed,
            text: text.into(),
        }
    }

    pub fn context(text: impl Into<SharedString>) -> Self {
        Self {
            kind: DiffKind::Context,
            text: text.into(),
        }
    }
}

type CopyHandler = Rc<dyn Fn(&SharedString, &mut Window, &mut App)>;

/// Which view of the block is showing.
#[derive(Default)]
struct View {
    diff: bool,
}

/// A file's code on a card: its name, a Copy button, numbered lines, and a
/// Code and Diff switch when a diff is given.
///
/// ```ignore
/// CodeBlock::new("patch", source)
///     .filename("src/collate.ts")
///     .diff([DiffLine::removed("const a = 1"), DiffLine::added("const a = 2")])
/// ```
///
/// "Copy" puts the code on the clipboard, then calls [`Self::on_copy`].
#[derive(IntoElement)]
pub struct CodeBlock {
    id: ElementId,
    code: SharedString,
    filename: SharedString,
    diff: Vec<DiffLine>,
    keywords: Vec<SharedString>,
    on_copy: Option<CopyHandler>,
    #[cfg(test)]
    scroll: Option<gpui_kit::ScrollHandle>,
}

impl CodeBlock {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>, code: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            code: code.into(),
            filename: "Code".into(),
            diff: Vec::new(),
            keywords: Vec::new(),
            on_copy: None,
            #[cfg(test)]
            scroll: None,
        }
    }

    pub fn filename(mut self, filename: impl Into<SharedString>) -> Self {
        self.filename = filename.into();
        self
    }

    /// Adds a Diff view beside the code.
    pub fn diff(mut self, lines: impl IntoIterator<Item = DiffLine>) -> Self {
        self.diff.extend(lines);
        self
    }

    /// More words to tint as keywords.
    pub fn keywords(mut self, keywords: impl IntoIterator<Item = impl Into<SharedString>>) -> Self {
        self.keywords.extend(keywords.into_iter().map(Into::into));
        self
    }

    /// Called with the code after it has been copied.
    pub fn on_copy(
        mut self,
        handler: impl Fn(&SharedString, &mut Window, &mut App) + 'static,
    ) -> Self {
        self.on_copy = Some(Rc::new(handler));
        self
    }
}

impl RenderOnce for CodeBlock {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let child_id = |name: &'static str| {
            ElementId::NamedChild(std::sync::Arc::new(self.id.clone()), name.into())
        };
        let state = window.use_keyed_state(child_id("view"), cx, |_, _| View::default());
        let has_diff = !self.diff.is_empty();
        let show_diff = has_diff && state.read(cx).diff;

        let theme = cx.theme();
        let keyword = theme.info;
        let string = theme.success;
        let muted = theme.muted_foreground;
        let border = theme.border;
        let added = theme.success.opacity(0.12);
        let removed = theme.danger.opacity(0.12);
        let surface = if theme.is_dark() {
            theme.background
        } else {
            theme.muted
        };
        let mono = theme.mono_font_family.clone();

        let lines: Vec<DiffLine> = if show_diff {
            self.diff
        } else {
            self.code.lines().map(DiffLine::context).collect()
        };
        // Give the scroll child its actual unwrapped width. Descendant text
        // overflow alone does not enlarge GPUI's scrollable content bounds.
        let content_width = lines
            .iter()
            .map(|line| {
                window
                    .text_system()
                    .shape_line(
                        line.text.clone(),
                        rems(0.75).to_pixels(window.rem_size()),
                        &[gpui_kit::TextRun {
                            len: line.text.len(),
                            font: gpui_kit::font(mono.clone()),
                            color: muted,
                            ..Default::default()
                        }],
                        None,
                    )
                    .width
            })
            .fold(gpui_kit::px(0.), |max, width| max.max(width))
            + rems(4.25).to_pixels(window.rem_size());
        let keywords = self.keywords;
        let rows = lines.into_iter().enumerate().map(|(index, line)| {
            let highlights = tokenize(&line.text, &keywords)
                .into_iter()
                .map(|(range, token)| {
                    let color = match token {
                        CodeToken::Keyword => keyword,
                        CodeToken::String => string,
                    };
                    (
                        range,
                        HighlightStyle {
                            color: Some(color),
                            ..HighlightStyle::default()
                        },
                    )
                });
            let gutter: SharedString = match line.kind {
                DiffKind::Added => "+".into(),
                DiffKind::Removed => "−".into(),
                DiffKind::Context => (index + 1).to_string().into(),
            };
            let text =
                StyledText::new(line.text.clone()).with_highlights(highlights.collect::<Vec<_>>());
            h_flex()
                .items_start()
                .map(|this| match line.kind {
                    DiffKind::Added => this.bg(added),
                    DiffKind::Removed => this.bg(removed),
                    DiffKind::Context => this,
                })
                .child(
                    div()
                        .flex_none()
                        .w_10()
                        .pr_2p5()
                        .border_r_1()
                        .border_color(border)
                        .text_right()
                        .text_color(muted)
                        .child(gutter),
                )
                .child(
                    div()
                        .flex_none()
                        .pl_3()
                        .pr_4()
                        .whitespace_nowrap()
                        .child(text),
                )
        });

        let view = state.clone();
        let code = self.code.clone();
        let on_copy = self.on_copy;
        let actions = h_flex()
            .gap_2()
            .when(has_diff, |this| {
                this.child(
                    SegmentedToggle::new(child_id("toggle"))
                        .option("code", "Code")
                        .option("diff", "Diff")
                        .value(if show_diff { "diff" } else { "code" })
                        .on_change(move |value, _, cx| {
                            let diff = value.as_ref() == "diff";
                            view.update(cx, |view, cx| {
                                view.diff = diff;
                                cx.notify();
                            });
                        }),
                )
            })
            .child(
                Button::new(child_id("copy"))
                    .copy_feedback()
                    .ghost()
                    .with_atom_size(AtomSize::Xs)
                    .icon(Icon::new(LucideIcon::Copy))
                    .label("Copy")
                    .on_click(move |_, window, cx| {
                        cx.write_to_clipboard(ClipboardItem::new_string(code.to_string()));
                        if let Some(on_copy) = &on_copy {
                            on_copy(&code, window, cx);
                        }
                    }),
            );

        CardFrame::new()
            .header(CardFrameHeader::new(self.filename).action(actions))
            .card(
                Card::new().overflow_hidden().child(
                    div()
                        .id(child_id("lines"))
                        .w_full()
                        .min_w_0()
                        .overflow_x_scroll()
                        .map(|this| {
                            #[cfg(test)]
                            if let Some(scroll) = &self.scroll {
                                return this.track_scroll(scroll);
                            }
                            this
                        })
                        .overflow_y_hidden()
                        .py_3()
                        .bg(surface)
                        .font_family(mono)
                        .text_xs()
                        .line_height(rems(1.3125))
                        .child(v_flex().w(content_width).min_w_full().children(rows)),
                ),
            )
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[gpui_kit::test]
    fn long_code_scrolls_horizontally(cx: &mut gpui_kit::TestAppContext) {
        use gpui_kit::test::TestWindowExt as _;
        use gpui_kit::{
            AppContext as _, Context, Render, ScrollDelta, ScrollEvent, TestSupportExt as _,
            VisualTestContext, point, px,
        };
        struct Host(gpui_kit::ScrollHandle);
        impl Render for Host {
            fn render(&mut self, _: &mut Window, _: &mut Context<Self>) -> impl IntoElement {
                let mut block = CodeBlock::new(
                    "code",
                    "return witnesses.map((w) => diff(base, w, \"word\", { normalizeUnicode: \"NFC\", ignoreWhitespace: true }))",
                );
                block.scroll = Some(self.0.clone());
                div().id("host").test_support().w(px(300.)).child(block)
            }
        }
        cx.update(crate::init);
        let scroll = gpui_kit::ScrollHandle::new();
        let window = cx.update(|cx| {
            gpui_kit::open_window(Default::default(), cx, |_, cx| {
                cx.new(|_| Host(scroll.clone()))
            })
            .unwrap()
            .0
        });
        let bounds = cx
            .update_window(window, |_, window, cx| {
                window.render_frame(cx);
                window.find("host").bounds()
            })
            .unwrap();
        let mut visual = VisualTestContext::from_window(window, cx);
        visual.simulate_event(ScrollEvent {
            position: point(bounds.origin.x + px(150.), bounds.bottom() - px(20.)),
            delta: ScrollDelta::Pixels(point(px(-150.), px(0.))),
            ..Default::default()
        });
        visual.run_until_parked();
        assert!(
            scroll.offset().x < px(-100.),
            "long code must scroll, got {:?}",
            scroll.offset()
        );
        assert_eq!(scroll.offset().y, px(0.));
    }

    fn tokens(line: &str) -> Vec<(&str, CodeToken)> {
        tokenize(line, &[])
            .into_iter()
            .map(|(range, token)| (&line[range], token))
            .collect()
    }

    #[test]
    fn keywords_and_strings_are_found_and_plain_words_are_not() {
        assert_eq!(
            tokens(r#"const name = "Codex Bezae""#),
            vec![
                ("const", CodeToken::Keyword),
                (r#""Codex Bezae""#, CodeToken::String),
            ]
        );
    }

    #[test]
    fn a_keyword_inside_a_string_or_a_longer_word_is_left_alone() {
        assert_eq!(
            tokens(r#"constant('return \'x\'')"#),
            vec![(r#"'return \'x\''"#, CodeToken::String)]
        );
    }

    #[test]
    fn an_open_string_runs_to_the_end_of_the_line() {
        assert_eq!(
            tokens("let s = `abc"),
            vec![("let", CodeToken::Keyword), ("`abc", CodeToken::String)]
        );
    }

    #[test]
    fn extra_keywords_are_tinted_and_other_scripts_do_not_break_ranges() {
        let line = "collate λόγος";
        let found = tokenize(line, &["collate".into()]);
        assert_eq!(found, vec![(0..7, CodeToken::Keyword)]);
    }
}
