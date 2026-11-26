//! SendHint: `react/src/components/composed/chat/hint.tsx`.

use gpui_kit::component::ActiveTheme as _;
use gpui_kit::component::h_flex;
use gpui_kit::component::kbd::Kbd;
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    App, IntoElement, Keystroke, ParentElement as _, RenderOnce, Styled as _, Window, div,
};

/// The composer's send hint: "Press ⌘↵ to send message".
///
/// ```ignore
/// SendHint::new()
/// SendHint::new().compact(false)
/// ```
///
/// Compact, the default, pins "Press ⌘↵" to the trailing edge and drops the
/// rest. The keys are shown as the platform writes them.
#[derive(IntoElement)]
pub struct SendHint {
    compact: bool,
}

impl SendHint {
    pub fn new() -> Self {
        Self { compact: true }
    }

    pub fn compact(mut self, compact: bool) -> Self {
        self.compact = compact;
        self
    }
}

impl Default for SendHint {
    fn default() -> Self {
        Self::new()
    }
}

impl RenderOnce for SendHint {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        // `secondary` is Command on macOS and Control elsewhere.
        let send = Keystroke::parse_with_os("secondary-enter", cx.platform_info().os).ok();
        h_flex()
            .flex_1()
            .gap_1p5()
            .text_sm()
            .whitespace_nowrap()
            .text_color(cx.theme().muted_foreground.opacity(0.6))
            .when(self.compact, |this| this.child(div().flex_1()))
            .child("Press")
            .children(send.map(Kbd::new))
            .when(!self.compact, |this| this.child("to send message"))
    }
}
