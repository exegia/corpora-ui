//! Corpus navigator: `react/src/components/blocks/corpus-navigation`.

use std::sync::Arc;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::component::{ActiveTheme as _, Icon, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    AnyElement, App, ElementId, Entity, FontWeight, InteractiveElement as _, IntoElement,
    ParentElement, Pixels, RenderOnce, SharedString, StatefulInteractiveElement as _, Styled as _,
    Window, canvas, div, px, rems,
};

use crate::atoms::{Button, Reveal};
use crate::composed::{
    CorpusLevelKind, CorpusNavigation, HierarchyPicker, LocationBar, LocationGrid, ReferenceCommand,
};
use crate::foundations::Radius;

/// The width from which the picker sits beside the reading instead of
/// folding under the header.
const WIDE: Pixels = px(1100.);
/// The width under which the reference field takes a row of its own.
const COMPACT: Pixels = px(600.);

/// Everything needed to choose a place: the name tree, a grid for each
/// numbered level, the place chosen so far, and the commands to go there or
/// back out.
#[derive(IntoElement)]
pub struct NavigationPicker {
    id: ElementId,
    navigation: Entity<CorpusNavigation>,
}

impl NavigationPicker {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>, navigation: &Entity<CorpusNavigation>) -> Self {
        Self {
            id: id.into(),
            navigation: navigation.clone(),
        }
    }
}

impl RenderOnce for NavigationPicker {
    fn render(self, _: &mut Window, cx: &mut App) -> impl IntoElement {
        let id = Arc::new(self.id);
        let child_id = |name: &'static str| ElementId::NamedChild(id.clone(), name.into());
        let state = self.navigation.read(cx);
        let data = state.data();
        let selected = data.format_reference(state.draft().map(|id| id.as_ref()));
        let has_draft = state.draft().is_some();
        let empty = data.nodes.is_empty();
        let grids: Vec<LocationGrid> = data
            .levels
            .iter()
            .filter(|level| level.kind == CorpusLevelKind::Number)
            .map(|level| LocationGrid::new(&self.navigation, level.id.clone()))
            .collect();
        let muted = cx.theme().muted_foreground;
        let border = cx.theme().border;
        let (cancel, commit) = (self.navigation.clone(), self.navigation.clone());

        v_flex()
            .w_full()
            .min_w_0()
            .child(
                v_flex()
                    .id(child_id("choices"))
                    .max_h(rems(32.))
                    .overflow_y_scroll()
                    .gap_6()
                    .p_4()
                    .child(HierarchyPicker::new(&self.navigation))
                    .children(grids)
                    .when(empty, |this| {
                        this.child(
                            div()
                                .text_sm()
                                .text_color(muted)
                                .child("No navigation index is available for this edition."),
                        )
                    }),
            )
            .child(
                v_flex()
                    .gap_3()
                    .p_4()
                    .border_t_1()
                    .border_color(border)
                    .child(
                        h_flex()
                            .gap_1()
                            .text_xs()
                            .text_color(muted)
                            .child("Selected")
                            .child(
                                div()
                                    .font_weight(FontWeight::MEDIUM)
                                    .text_color(cx.theme().foreground)
                                    .child(selected),
                            ),
                    )
                    .child(
                        h_flex()
                            .gap_2()
                            .child(
                                div().flex_1().child(
                                    Button::new(child_id("cancel"))
                                        .outline()
                                        .full_width(true)
                                        .label("Cancel")
                                        .on_click(move |_, _, cx| {
                                            cancel.update(cx, |state, cx| state.cancel(cx));
                                        }),
                                ),
                            )
                            .child(
                                div().flex_1().child(
                                    Button::new(child_id("go"))
                                        .primary()
                                        .full_width(true)
                                        .label("Go to location")
                                        .disabled(!has_draft)
                                        .on_click(move |_, _, cx| {
                                            commit.update(cx, |state, cx| state.commit(None, cx));
                                        }),
                                ),
                            ),
                    ),
            )
    }
}

/// A reading surface with its navigation around it: the corpus name, a
/// reference field, the location as breadcrumbs, the picker, a way back to
/// the place before, and the reading itself as children.
///
/// ```ignore
/// CorpusNavigator::new("reader", &self.navigation)
///     .edition("SBLGNT")
///     .context(notes)
///     .child(passage)
/// ```
///
/// It lays itself out by its own width, not the window's. From 1100px the
/// picker stands beside the reading; under that it folds away behind a
/// Browse button.
#[derive(IntoElement)]
pub struct CorpusNavigator {
    id: ElementId,
    navigation: Entity<CorpusNavigation>,
    edition: Option<SharedString>,
    context: Option<AnyElement>,
    children: Vec<AnyElement>,
}

impl CorpusNavigator {
    /// `id` must be stable and unique among siblings.
    pub fn new(id: impl Into<ElementId>, navigation: &Entity<CorpusNavigation>) -> Self {
        Self {
            id: id.into(),
            navigation: navigation.clone(),
            edition: None,
            context: None,
            children: Vec::new(),
        }
    }

    /// The edition being read, under the corpus name.
    pub fn edition(mut self, edition: impl Into<SharedString>) -> Self {
        self.edition = Some(edition.into());
        self
    }

    /// A panel about the place being read: notes, parallels. It stands
    /// beside the reading when there is room and under it otherwise.
    pub fn context(mut self, context: impl IntoElement) -> Self {
        self.context = Some(context.into_any_element());
        self
    }
}

impl ParentElement for CorpusNavigator {
    fn extend(&mut self, elements: impl IntoIterator<Item = AnyElement>) {
        self.children.extend(elements);
    }
}

impl RenderOnce for CorpusNavigator {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let id = Arc::new(self.id);
        let child_id = |name: &'static str| ElementId::NamedChild(id.clone(), name.into());
        // The width last painted. It starts wide so that a desktop window
        // does not open on the folded layout and then jump.
        let measured = window.use_keyed_state(child_id("width"), cx, |_, _| WIDE);
        let width = *measured.read(cx);
        let wide = width >= WIDE;
        let compact = width < COMPACT;

        let state = self.navigation.read(cx);
        let data = state.data();
        let label = data.label.clone();
        let picker_open = state.picker_open();
        let previous = state
            .history()
            .last()
            .map(|id| data.format_reference(Some(id.as_ref())));
        let theme = cx.theme();
        let muted = theme.muted_foreground;
        let border = theme.border;

        let browse = self.navigation.clone();
        let header = h_flex()
            .flex_wrap()
            .gap_3()
            .p_3()
            .border_b_1()
            .border_color(border)
            .child(
                v_flex()
                    .flex_1()
                    .min_w_0()
                    .child(
                        div()
                            .text_sm()
                            .font_weight(FontWeight::SEMIBOLD)
                            .truncate()
                            .child(label),
                    )
                    .when_some(self.edition, |this, edition| {
                        this.child(div().text_xs().text_color(muted).child(edition))
                    }),
            )
            .when(!wide, |this| {
                this.child(
                    Button::new(child_id("browse"))
                        // Filled while the picker it opened is showing.
                        .map(|button| {
                            if picker_open {
                                button.secondary()
                            } else {
                                button.outline()
                            }
                        })
                        .icon(Icon::new(LucideIcon::BookOpen))
                        .label("Browse")
                        .on_click(move |_, _, cx| {
                            browse.update(cx, |state, cx| {
                                if state.picker_open() {
                                    state.cancel(cx);
                                } else {
                                    state.set_picker_open(true, cx);
                                }
                            });
                        }),
                )
            })
            .child(
                div()
                    .min_w_0()
                    .map(|this| {
                        if compact {
                            this.w_full()
                        } else {
                            this.w(rems(16.))
                        }
                    })
                    .child(ReferenceCommand::new(&self.navigation)),
            );

        let back = self.navigation.clone();
        let reading = v_flex()
            .flex_1()
            .min_w_0()
            .when_some(previous, |this, previous| {
                this.child(
                    h_flex()
                        .px_4()
                        .py_2()
                        .border_b_1()
                        .border_color(border)
                        .child(
                            Button::new(child_id("return"))
                                .ghost()
                                .icon(Icon::new(LucideIcon::Undo2))
                                .label(format!("Return to {previous}"))
                                .on_click(move |_, _, cx| {
                                    back.update(cx, |state, cx| state.return_to_previous(cx));
                                }),
                        ),
                )
            })
            .child(
                div()
                    .flex()
                    // Fills the column, so the context's rule runs its height.
                    .flex_1()
                    .when(!wide, |this| this.flex_col())
                    .child(div().flex_1().min_w_0().p_5().children(self.children))
                    .when_some(self.context, |this, context| {
                        this.child(
                            div()
                                .min_w_0()
                                .p_4()
                                .text_sm()
                                .border_color(border)
                                .map(|this| {
                                    if wide {
                                        this.flex_none().w(rems(14.)).border_l_1()
                                    } else {
                                        this.border_t_1()
                                    }
                                })
                                .child(context),
                        )
                    }),
            );

        v_flex()
            .relative()
            .w_full()
            .min_w_0()
            .overflow_hidden()
            .rounded(Radius::Xl.resolve(cx))
            .border_1()
            .border_color(border)
            .bg(theme.background)
            .text_color(theme.foreground)
            // Reads the width this frame was given, for the next one.
            .child(
                canvas(
                    move |bounds, window, cx| {
                        let width = bounds.size.width;
                        if *measured.read(cx) != width {
                            measured.update(cx, |measured, _| *measured = width);
                            window.refresh();
                        }
                    },
                    |_, _, _, _| {},
                )
                .absolute()
                .size_full(),
            )
            .child(header)
            .child(
                div()
                    .px_3()
                    .border_b_1()
                    .border_color(border)
                    .child(LocationBar::new(&self.navigation)),
            )
            .when(!wide, |this| {
                this.child(
                    Reveal::new(child_id("fold"), picker_open).child(
                        div()
                            .border_b_1()
                            .border_color(border)
                            .child(NavigationPicker::new(
                                child_id("folded-picker"),
                                &self.navigation,
                            )),
                    ),
                )
            })
            .child(
                h_flex()
                    .items_stretch()
                    .when(wide, |this| {
                        this.child(
                            div()
                                .flex_none()
                                .w(rems(18.))
                                .border_r_1()
                                .border_color(border)
                                .child(NavigationPicker::new(
                                    child_id("side-picker"),
                                    &self.navigation,
                                )),
                        )
                    })
                    .child(reading),
            )
    }
}
