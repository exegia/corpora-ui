//! Logo: `react/src/components/composed/logo.tsx`.

use gpui_kit::base::motion::{Transition, transition};
use gpui_kit::component::{ActiveTheme as _, StyledExt as _, h_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    AnyElement, App, ElementId, ImageSource, IntoElement, ObjectFit, ParentElement as _,
    RenderOnce, SharedString, Styled as _, StyledImage as _, Window, div, img, rems,
};

use crate::foundations::Radius;
use crate::foundations::motion::{DISTANCE_MICRO, DURATION_QUICK, EASE_OUT};

/// Up to two capitals: the first letter of the first and of the last word.
fn monogram(name: &str) -> String {
    let mut words = name.split_whitespace();
    let first = words.next().and_then(|word| word.chars().next());
    let last = words.next_back().and_then(|word| word.chars().next());
    first
        .into_iter()
        .chain(last)
        .flat_map(char::to_uppercase)
        .collect()
}

/// A brand lockup: a mark beside a wordmark.
///
/// The mark is an element ([`Self::mark`]), an image ([`Self::src`]) or,
/// given neither, a monogram tile made from the name.
///
/// ```ignore
/// Logo::new("brand", "Exegia").folded(self.sidebar_collapsed)
/// ```
///
/// `folded` fades the wordmark out and leaves the mark, for a collapsed rail.
#[derive(IntoElement)]
pub struct Logo {
    id: ElementId,
    name: SharedString,
    mark: Option<AnyElement>,
    src: Option<ImageSource>,
    wordmark: Option<SharedString>,
    folded: bool,
}

impl Logo {
    /// `id` must be stable and unique among siblings. `name` is the brand:
    /// the default wordmark and the source of the monogram.
    pub fn new(id: impl Into<ElementId>, name: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            mark: None,
            src: None,
            wordmark: None,
            folded: false,
        }
    }

    /// A custom mark, sized to fill a square. Wins over [`Self::src`].
    pub fn mark(mut self, mark: impl IntoElement) -> Self {
        self.mark = Some(mark.into_any_element());
        self
    }

    /// An image for the mark: a URL, a file path or an asset path.
    pub fn src(mut self, src: impl Into<ImageSource>) -> Self {
        self.src = Some(src.into());
        self
    }

    /// The text beside the mark. The name by default.
    pub fn wordmark(mut self, wordmark: impl Into<SharedString>) -> Self {
        self.wordmark = Some(wordmark.into());
        self
    }

    /// Shows the mark alone.
    pub fn folded(mut self, folded: bool) -> Self {
        self.folded = folded;
        self
    }
}

impl RenderOnce for Logo {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let shown = transition(
            (self.id, "wordmark"),
            if self.folded { 0.0_f32 } else { 1.0 },
            Transition::new(DURATION_QUICK).easing(EASE_OUT.easing()),
            window,
            cx,
        );
        let theme = cx.theme();

        let mark = match (self.mark, self.src) {
            (Some(mark), _) => mark,
            (None, Some(src)) => img(src)
                .size_full()
                .object_fit(ObjectFit::Contain)
                .into_any_element(),
            (None, None) => div()
                .flex()
                .items_center()
                .justify_center()
                .size_full()
                .rounded(Radius::Sm.resolve(cx))
                .bg(theme.foreground)
                .text_color(theme.background)
                .text_size(rems(0.9))
                .font_semibold()
                .child(monogram(&self.name))
                .into_any_element(),
        };

        let wordmark = self.wordmark.unwrap_or(self.name);
        h_flex()
            .flex_none()
            .gap_2()
            .text_color(theme.foreground)
            .child(div().flex_none().size_8().child(mark))
            // The wordmark leaves the layout once it has faded, so a folded
            // logo is exactly as wide as its mark.
            .when(shown > 0., |this| {
                this.child(
                    div()
                        .relative()
                        .left(-DISTANCE_MICRO * (1. - shown))
                        .opacity(shown)
                        .font_semibold()
                        .whitespace_nowrap()
                        .child(wordmark),
                )
            })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn monogram_takes_the_first_and_last_word() {
        assert_eq!(monogram("Exegia"), "E");
        assert_eq!(monogram("corpora ui"), "CU");
        assert_eq!(monogram("  The Open Text  "), "TT");
        assert_eq!(monogram(""), "");
    }
}
