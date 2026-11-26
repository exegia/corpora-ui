//! Corpus navigation: `react/src/components/composed/corpus-navigation`.

use std::rc::Rc;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::component::input::{Input, InputState};
use gpui_kit::component::{ActiveTheme as _, Icon, Sizable as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    App, AppContext as _, Context, ElementId, Entity, EventEmitter, FontWeight, IntoElement,
    ParentElement as _, RenderOnce, SharedString, Styled as _, Subscription, Window, div, px,
    relative, rems,
};

use super::tree::{Tree, TreeNode, TreeVariant};
use crate::atoms::{Button, IconName};
use crate::foundations::{AtomSize, Radius};

/// How a level of a corpus is picked.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum CorpusLevelKind {
    /// Named parts, picked from a tree: books, sections.
    #[default]
    Hierarchy,
    /// Numbered parts, picked from a grid: chapters, verses.
    Number,
}

/// One level of a corpus's structure, outermost first.
#[derive(Clone, Debug, PartialEq)]
pub struct CorpusLevel {
    pub id: SharedString,
    pub label: SharedString,
    pub kind: CorpusLevelKind,
    /// A node of the next level may sit directly under the one before.
    pub optional: bool,
}

impl CorpusLevel {
    pub fn new(
        id: impl Into<SharedString>,
        label: impl Into<SharedString>,
        kind: CorpusLevelKind,
    ) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            kind,
            optional: false,
        }
    }

    pub fn optional(mut self) -> Self {
        self.optional = true;
        self
    }
}

/// A place in a corpus: a book, a chapter, a verse.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct CorpusNode {
    /// Unique in the corpus, and stable: it is what a location is.
    pub id: SharedString,
    /// The id of the [`CorpusLevel`] it belongs to.
    pub level: SharedString,
    pub label: SharedString,
    /// The exact token it is cited by: "32", "iv".
    pub reference: Option<SharedString>,
    /// Other names it answers to in a typed reference: "Jn".
    pub aliases: Vec<SharedString>,
    pub children: Vec<CorpusNode>,
    pub disabled: bool,
}

impl CorpusNode {
    pub fn new(
        id: impl Into<SharedString>,
        level: impl Into<SharedString>,
        label: impl Into<SharedString>,
    ) -> Self {
        Self {
            id: id.into(),
            level: level.into(),
            label: label.into(),
            ..Self::default()
        }
    }

    pub fn reference(mut self, reference: impl Into<SharedString>) -> Self {
        self.reference = Some(reference.into());
        self
    }

    pub fn aliases(mut self, aliases: impl IntoIterator<Item = &'static str>) -> Self {
        self.aliases.extend(aliases.into_iter().map(Into::into));
        self
    }

    pub fn children(mut self, children: impl IntoIterator<Item = CorpusNode>) -> Self {
        self.children.extend(children);
        self
    }

    pub fn disabled(mut self) -> Self {
        self.disabled = true;
        self
    }
}

/// A corpus to navigate: its levels and the tree of places in it.
#[derive(Clone, Debug, PartialEq)]
pub struct CorpusData {
    pub label: SharedString,
    pub levels: Vec<CorpusLevel>,
    pub nodes: Vec<CorpusNode>,
}

/// Lowercases a reference and treats its punctuation as spaces, so
/// "John 3:16" and "john 3 16" compare equal.
fn normalize(value: &str) -> String {
    value
        .to_lowercase()
        .replace([':', '.', ',', '/', '›'], " ")
        .split_whitespace()
        .collect::<Vec<_>>()
        .join(" ")
}

impl CorpusData {
    pub fn new(
        label: impl Into<SharedString>,
        levels: impl IntoIterator<Item = CorpusLevel>,
        nodes: impl IntoIterator<Item = CorpusNode>,
    ) -> Self {
        Self {
            label: label.into(),
            levels: levels.into_iter().collect(),
            nodes: nodes.into_iter().collect(),
        }
    }

    fn level_index(&self, level: &str) -> Option<usize> {
        self.levels
            .iter()
            .position(|item| item.id.as_ref() == level)
    }

    /// The nodes from a root down to `id`, `id` included.
    pub fn path(&self, id: &str) -> Option<Vec<&CorpusNode>> {
        fn find<'a>(nodes: &'a [CorpusNode], id: &str) -> Option<Vec<&'a CorpusNode>> {
            nodes.iter().find_map(|node| {
                if node.id.as_ref() == id {
                    return Some(vec![node]);
                }
                let mut path = find(&node.children, id)?;
                path.insert(0, node);
                Some(path)
            })
        }
        find(&self.nodes, id)
    }

    /// Every node's path, in reading order.
    fn paths(&self) -> Vec<Vec<&CorpusNode>> {
        fn walk<'a>(
            nodes: &'a [CorpusNode],
            trail: &mut Vec<&'a CorpusNode>,
            into: &mut Vec<Vec<&'a CorpusNode>>,
        ) {
            for node in nodes {
                trail.push(node);
                into.push(trail.clone());
                walk(&node.children, trail, into);
                trail.pop();
            }
        }
        let mut paths = Vec::new();
        walk(&self.nodes, &mut Vec::new(), &mut paths);
        paths
    }

    /// Checks that ids are unique and every node sits at a deeper level than
    /// its parent, skipping only optional levels.
    pub fn validate(&self) -> Result<(), String> {
        let mut seen = std::collections::HashSet::new();
        for (index, level) in self.levels.iter().enumerate() {
            if self.levels[..index]
                .iter()
                .any(|other| other.id == level.id)
            {
                return Err(format!("Duplicate level ID: {}", level.id));
            }
        }
        for path in self.paths() {
            let node = path[path.len() - 1];
            if !seen.insert(node.id.clone()) {
                return Err(format!("Duplicate node ID: {}", node.id));
            }
            let depth = self
                .level_index(&node.level)
                .ok_or_else(|| format!("Invalid schema level: {}", node.level))?;
            let after = match path.len().checked_sub(2).map(|parent| path[parent]) {
                Some(parent) => self.level_index(&parent.level).map_or(0, |index| index + 1),
                None => 0,
            };
            if depth < after {
                return Err(format!("Invalid schema level: {}", node.level));
            }
            if self.levels[after..depth]
                .iter()
                .any(|level| !level.optional)
            {
                return Err(format!("Missing required level before {}", node.id));
            }
        }
        Ok(())
    }

    /// Whether `id` names a place that can be read: it exists and nothing
    /// above it is disabled.
    pub fn is_valid(&self, id: &str) -> bool {
        self.path(id)
            .is_some_and(|path| !path.iter().any(|node| node.disabled))
    }

    /// A location as it reads in a breadcrumb: "John › 3 › 16".
    pub fn format_reference(&self, id: Option<&str>) -> String {
        match id
            .filter(|id| self.is_valid(id))
            .and_then(|id| self.path(id))
        {
            Some(path) => path
                .iter()
                .map(|node| node.label.as_ref())
                .collect::<Vec<_>>()
                .join(" › "),
            None => "Choose location".to_string(),
        }
    }

    /// The places a typed reference names exactly, by label, reference
    /// token or alias at each level: at most twenty, in reading order. It
    /// never guesses: "John 99" finds nothing if there is no chapter 99.
    pub fn reference_results(&self, query: &str) -> Vec<(SharedString, String)> {
        let input = normalize(query);
        if input.is_empty() {
            return Vec::new();
        }
        let matches = |path: &[&CorpusNode]| {
            fn step(data: &CorpusData, path: &[&CorpusNode], rest: &str) -> bool {
                let Some((part, deeper)) = path.split_first() else {
                    return rest.is_empty();
                };
                let level = data
                    .levels
                    .iter()
                    .find(|level| level.id == part.level)
                    .map(|level| level.label.clone());
                let titled = part
                    .reference
                    .as_ref()
                    .zip(level)
                    .map(|(reference, level)| format!("{level} {reference}"));
                [
                    Some(part.label.to_string()),
                    part.reference.as_ref().map(|r| r.to_string()),
                ]
                .into_iter()
                .flatten()
                .chain(part.aliases.iter().map(|alias| alias.to_string()))
                .chain(titled)
                .any(|name| {
                    let token = normalize(&name);
                    if rest == token {
                        step(data, deeper, "")
                    } else {
                        rest.strip_prefix(&token)
                            .and_then(|rest| rest.strip_prefix(' '))
                            .is_some_and(|rest| step(data, deeper, rest))
                    }
                })
            }
            step(self, path, &input)
        };
        self.paths()
            .into_iter()
            .filter(|path| !path.iter().any(|node| node.disabled))
            .filter(|path| matches(path))
            .take(20)
            .map(|path| {
                let id = path[path.len() - 1].id.clone();
                let label = self.format_reference(Some(&id));
                (id, label)
            })
            .collect()
    }

    /// The sibling before (`-1`) or after (`1`) `id` at its own level,
    /// passing over disabled ones.
    pub fn adjacent(&self, id: &str, offset: isize) -> Option<SharedString> {
        if !self.is_valid(id) {
            return None;
        }
        let path = self.path(id)?;
        let node = path[path.len() - 1];
        let siblings: Vec<&CorpusNode> = match path.len().checked_sub(2) {
            Some(parent) => &path[parent].children,
            None => &self.nodes,
        }
        .iter()
        .filter(|sibling| sibling.level == node.level && !sibling.disabled)
        .collect();
        let index = siblings.iter().position(|sibling| sibling.id == node.id)?;
        let next = index.checked_add_signed(offset)?;
        siblings.get(next).map(|sibling| sibling.id.clone())
    }
}

/// What a [`CorpusNavigation`] tells its owner.
#[derive(Clone, Debug, PartialEq)]
pub enum CorpusNavigationEvent {
    /// The reading location moved to this node id.
    Navigate(SharedString),
}

/// How many choices a [`LocationGrid`] shows at a time.
const PAGE_SIZE: usize = 60;
/// The most names a [`HierarchyPicker`] lists before asking for a filter.
const NAME_LIMIT: usize = 100;

/// The state the corpus navigation pieces share: where the reader is, where
/// they are about to go, and where they have been.
///
/// ```ignore
/// // in `new`:
/// let navigation = cx.new(|cx| CorpusNavigation::new(data, window, cx).location("john-1"));
/// cx.subscribe(&navigation, |this, _, event: &CorpusNavigationEvent, cx| {
///     let CorpusNavigationEvent::Navigate(id) = event;
///     this.open(id.clone(), cx);
/// })
/// .detach();
/// // in `render`:
/// LocationBar::new(&self.navigation)
/// HierarchyPicker::new(&self.navigation)
/// LocationGrid::new(&self.navigation, "chapter")
/// ```
///
/// Picking in the tree or a grid only moves the draft. The location moves on
/// [`Self::commit`], which the bar's arrows and the reference results call.
pub struct CorpusNavigation {
    data: Rc<CorpusData>,
    location: Option<SharedString>,
    draft: Option<SharedString>,
    history: Vec<SharedString>,
    history_limit: usize,
    picker_open: bool,
    names: Entity<InputState>,
    query: Entity<InputState>,
    /// The page each grid is on, by its level and parent.
    pages: Vec<(String, usize)>,
    _subscriptions: [Subscription; 2],
}

impl EventEmitter<CorpusNavigationEvent> for CorpusNavigation {}

impl CorpusNavigation {
    pub fn new(data: CorpusData, window: &mut Window, cx: &mut Context<Self>) -> Self {
        let names = cx.new(|cx| InputState::new(window, cx).placeholder("Filter names…"));
        let query = cx.new(|cx| InputState::new(window, cx).placeholder("Enter a reference…"));
        let subscriptions = [
            cx.observe(&names, |_, _, cx| cx.notify()),
            cx.observe(&query, |_, _, cx| cx.notify()),
        ];
        Self {
            data: Rc::new(data),
            location: None,
            draft: None,
            history: Vec::new(),
            history_limit: 20,
            picker_open: false,
            names,
            query,
            pages: Vec::new(),
            _subscriptions: subscriptions,
        }
    }

    /// Where the reader starts. Ignored if it is not a valid place.
    pub fn location(mut self, id: impl Into<SharedString>) -> Self {
        let id = id.into();
        if self.data.is_valid(&id) {
            self.location = Some(id.clone());
            self.draft = Some(id);
        }
        self
    }

    /// How many earlier locations are kept for [`Self::return_to_previous`].
    /// Twenty by default.
    pub fn history_limit(mut self, limit: usize) -> Self {
        self.history_limit = limit;
        self
    }

    pub fn data(&self) -> &CorpusData {
        &self.data
    }

    /// The committed reading location.
    pub fn current(&self) -> Option<&SharedString> {
        self.location.as_ref()
    }

    /// The place picked but not yet gone to.
    pub fn draft(&self) -> Option<&SharedString> {
        self.draft.as_ref()
    }

    pub fn history(&self) -> &[SharedString] {
        &self.history
    }

    /// Whether a folded picker is showing. [`Self::cancel`] and a commit
    /// close it.
    pub fn picker_open(&self) -> bool {
        self.picker_open
    }

    pub fn set_picker_open(&mut self, open: bool, cx: &mut Context<Self>) {
        self.picker_open = open;
        cx.notify();
    }

    /// Moves the draft, leaving the reading location alone.
    pub fn select(&mut self, id: impl Into<SharedString>, cx: &mut Context<Self>) {
        let id = id.into();
        if self.data.is_valid(&id) {
            self.draft = Some(id);
            cx.notify();
        }
    }

    /// Puts the draft back on the reading location and closes the picker.
    pub fn cancel(&mut self, cx: &mut Context<Self>) {
        self.draft = self.location.clone();
        self.picker_open = false;
        cx.notify();
    }

    /// Goes to `id`, or to the draft when it is `None`.
    pub fn commit(&mut self, id: Option<SharedString>, cx: &mut Context<Self>) {
        self.go(id.or_else(|| self.draft.clone()), false, cx);
    }

    /// Goes back to the location before this one.
    pub fn return_to_previous(&mut self, cx: &mut Context<Self>) {
        let previous = self.history.last().cloned();
        self.go(previous, true, cx);
    }

    fn go(&mut self, id: Option<SharedString>, returning: bool, cx: &mut Context<Self>) {
        let Some(id) = id.filter(|id| self.data.is_valid(id)) else {
            return;
        };
        self.picker_open = false;
        if self.location.as_ref() == Some(&id) {
            self.draft = Some(id);
            return cx.notify();
        }
        if returning {
            self.history.pop();
        } else if let Some(previous) = self.location.take() {
            self.history.push(previous);
            let extra = self.history.len().saturating_sub(self.history_limit);
            self.history.drain(..extra);
        }
        self.location = Some(id.clone());
        self.draft = Some(id.clone());
        cx.emit(CorpusNavigationEvent::Navigate(id));
        cx.notify();
    }

    fn page(&self, scope: &str) -> Option<usize> {
        self.pages
            .iter()
            .find(|(key, _)| key == scope)
            .map(|(_, page)| *page)
    }

    fn set_page(&mut self, scope: String, page: usize, cx: &mut Context<Self>) {
        self.pages.retain(|(key, _)| key != &scope);
        self.pages.push((scope, page));
        cx.notify();
    }
}

/// Redraws the piece being rendered whenever the navigation changes.
fn watch(
    navigation: &Entity<CorpusNavigation>,
    piece: &'static str,
    window: &mut Window,
    cx: &mut App,
) -> ElementId {
    let id = ElementId::from((piece, navigation.entity_id()));
    let navigation = navigation.clone();
    window.use_keyed_state(id.clone(), cx, move |_, cx| {
        cx.observe(&navigation, |_, _, cx| cx.notify())
    });
    id
}

fn child_id(id: &ElementId, name: String) -> ElementId {
    ElementId::NamedChild(std::sync::Arc::new(id.clone()), name.into())
}

/// The reading location as breadcrumbs, with arrows to the place before and
/// after it.
///
/// A crumb moves the draft to that ancestor, for the pickers to continue
/// from; the arrows go straight there.
#[derive(IntoElement)]
pub struct LocationBar {
    navigation: Entity<CorpusNavigation>,
}

impl LocationBar {
    pub fn new(navigation: &Entity<CorpusNavigation>) -> Self {
        Self {
            navigation: navigation.clone(),
        }
    }
}

impl RenderOnce for LocationBar {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let id = watch(&self.navigation, "corpus-location-bar", window, cx);
        let state = self.navigation.read(cx);
        let data = state.data.clone();
        let location = state.location.clone();
        let muted = cx.theme().muted_foreground;
        let crumbs: Vec<(SharedString, SharedString)> = location
            .as_ref()
            .and_then(|id| data.path(id))
            .unwrap_or_default()
            .into_iter()
            .map(|node| (node.id.clone(), node.label.clone()))
            .collect();
        let step = |offset: isize| {
            location
                .as_ref()
                .and_then(|location| data.adjacent(location, offset))
        };
        let arrow = |name: &'static str, tip: &'static str, icon, target: Option<SharedString>| {
            let navigation = self.navigation.clone();
            Button::new(child_id(&id, name.into()))
                .ghost()
                .icon(Icon::new(icon))
                .tooltip(tip)
                .disabled(target.is_none())
                .on_click(move |_, _, cx| {
                    navigation.update(cx, |state, cx| state.commit(target.clone(), cx));
                })
        };
        let trail = if crumbs.is_empty() {
            h_flex().flex_1().min_w_0().child(
                Button::new(child_id(&id, "choose".into()))
                    .ghost()
                    .icon(Icon::new(LucideIcon::MapPin))
                    .label("Choose location")
                    .disabled(true),
            )
        } else {
            h_flex().flex_1().min_w_0().flex_wrap().gap_0p5().children(
                crumbs
                    .into_iter()
                    .enumerate()
                    .map(|(index, (node, label))| {
                        let navigation = self.navigation.clone();
                        let target = node.clone();
                        h_flex()
                            .gap_0p5()
                            .when(index > 0, |this| {
                                this.child(
                                    Icon::new(IconName::ChevronRight).xsmall().text_color(muted),
                                )
                            })
                            .child(
                                Button::new(child_id(&id, format!("crumb-{node}")))
                                    .ghost()
                                    .label(label)
                                    .on_click(move |_, _, cx| {
                                        navigation.update(cx, |state, cx| {
                                            state.select(target.clone(), cx);
                                        });
                                    }),
                            )
                    }),
            )
        };
        h_flex()
            .w_full()
            .min_w_0()
            .gap_1()
            .child(trail)
            .child(arrow(
                "previous",
                "Previous location",
                IconName::ChevronLeft,
                step(-1),
            ))
            .child(arrow(
                "next",
                "Next location",
                IconName::ChevronRight,
                step(1),
            ))
    }
}

/// The named levels of the corpus as a filterable tree. Picking a name moves
/// the draft.
#[derive(IntoElement)]
pub struct HierarchyPicker {
    navigation: Entity<CorpusNavigation>,
}

impl HierarchyPicker {
    pub fn new(navigation: &Entity<CorpusNavigation>) -> Self {
        Self {
            navigation: navigation.clone(),
        }
    }
}

/// Builds the hierarchy's tree rows: names matching `query`, their
/// ancestors, and the kept path, up to `remaining` of them.
struct Names<'a> {
    data: &'a CorpusData,
    query: &'a str,
    kept: &'a [SharedString],
    reading: Option<&'a SharedString>,
    remaining: usize,
    truncated: bool,
}

impl Names<'_> {
    fn rows(&mut self, nodes: &[CorpusNode], inherited: bool) -> Vec<TreeNode> {
        let mut rows = Vec::new();
        for node in nodes {
            let keep = self.kept.contains(&node.id);
            let named =
                self.data.levels.iter().any(|level| {
                    level.id == node.level && level.kind == CorpusLevelKind::Hierarchy
                });
            if !named {
                // A numbered level between two named ones is passed through,
                // but only along the path already chosen.
                if keep {
                    rows.extend(self.rows(&node.children, inherited));
                }
                continue;
            }
            let matches = inherited
                || std::iter::once(&node.label)
                    .chain(&node.aliases)
                    .any(|name| name.to_lowercase().contains(self.query));
            let children = self.rows(&node.children, matches);
            if !matches && children.is_empty() && !keep {
                continue;
            }
            if self.remaining == 0 && !keep && children.is_empty() {
                self.truncated = true;
                continue;
            }
            self.remaining = self.remaining.saturating_sub(1);
            let mut row = TreeNode::new(node.id.clone(), node.label.clone())
                .disabled(node.disabled)
                .children(children);
            if self.reading == Some(&node.id) {
                row = row.badge("Reading");
            }
            rows.push(row);
        }
        rows
    }
}

impl RenderOnce for HierarchyPicker {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let id = watch(&self.navigation, "corpus-hierarchy", window, cx);
        let state = self.navigation.read(cx);
        let data = state.data.clone();
        let filter = state.names.clone();
        let query = filter.read(cx).value().trim().to_lowercase();
        let draft_path: Vec<&CorpusNode> = state
            .draft
            .as_ref()
            .and_then(|draft| data.path(draft))
            .unwrap_or_default();
        let kept: Vec<SharedString> = draft_path.iter().map(|node| node.id.clone()).collect();
        // The row to mark is the deepest named part of the draft.
        let selected = draft_path
            .iter()
            .rev()
            .find(|node| {
                data.levels
                    .iter()
                    .any(|level| level.id == node.level && level.kind == CorpusLevelKind::Hierarchy)
            })
            .map(|node| node.id.clone());
        let reading = state
            .location
            .as_ref()
            .and_then(|location| data.path(location))
            .unwrap_or_default()
            .into_iter()
            .rev()
            .find(|node| {
                data.levels
                    .iter()
                    .any(|level| level.id == node.level && level.kind == CorpusLevelKind::Hierarchy)
            })
            .map(|node| node.id.clone());
        let mut names = Names {
            data: &data,
            query: &query,
            kept: &kept,
            reading: reading.as_ref(),
            remaining: NAME_LIMIT,
            truncated: false,
        };
        let rows = names.rows(&data.nodes, false);
        let truncated = names.truncated;
        let muted = cx.theme().muted_foreground;
        let empty = rows.is_empty();
        let navigation = self.navigation.clone();
        v_flex()
            .w_full()
            .gap_2()
            .child(Input::new(&filter))
            .child(
                Tree::new(child_id(&id, "tree".into()), TreeVariant::Toc)
                    .items(rows)
                    .force_open(!query.is_empty())
                    .when_some(selected, |tree, selected| tree.active(selected))
                    .on_navigate(move |node, _, cx| {
                        navigation.update(cx, |state, cx| state.select(node.clone(), cx));
                    }),
            )
            .when(empty, |this| {
                this.child(
                    div()
                        .text_sm()
                        .text_color(muted)
                        .child("No matching names."),
                )
            })
            .when(truncated, |this| {
                this.child(div().text_xs().text_color(muted).child(
                    "Showing up to 100 names and your selected path. Filter to find another name.",
                ))
            })
    }
}

/// The numbered choices of one level under the draft: chapters of the picked
/// book, verses of the picked chapter. Picking one moves the draft.
///
/// It renders nothing when the level is not a numbered one or the draft has
/// no such choices.
#[derive(IntoElement)]
pub struct LocationGrid {
    navigation: Entity<CorpusNavigation>,
    level: SharedString,
}

impl LocationGrid {
    pub fn new(navigation: &Entity<CorpusNavigation>, level: impl Into<SharedString>) -> Self {
        Self {
            navigation: navigation.clone(),
            level: level.into(),
        }
    }
}

impl RenderOnce for LocationGrid {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let id = watch(&self.navigation, "corpus-location-grid", window, cx);
        let id = child_id(&id, self.level.to_string());
        let state = self.navigation.read(cx);
        let data = state.data.clone();
        let Some(depth) = data.level_index(&self.level) else {
            return div().into_any_element();
        };
        let level = &data.levels[depth];
        if level.kind != CorpusLevelKind::Number {
            return div().into_any_element();
        }
        let path = |id: Option<&SharedString>| id.and_then(|id| data.path(id)).unwrap_or_default();
        let draft_path = path(state.draft.as_ref());
        // The choices hang off the deepest picked part above this level.
        let parent = draft_path.iter().rev().find(|node| {
            data.level_index(&node.level)
                .is_some_and(|index| index < depth)
        });
        let candidates: Vec<&CorpusNode> = parent
            .map_or(&data.nodes, |parent| &parent.children)
            .iter()
            .filter(|node| node.level == self.level)
            .collect();
        if candidates.is_empty() {
            return div().into_any_element();
        }
        let at_level = |path: &[&CorpusNode]| {
            path.iter()
                .find(|node| node.level == self.level)
                .map(|node| node.id.clone())
        };
        let selected = at_level(&draft_path);
        let current = at_level(&path(state.location.as_ref()));

        let scope = format!(
            "{}/{}",
            self.level,
            parent.map(|parent| parent.id.as_ref()).unwrap_or_default()
        );
        let pages = candidates.len().div_ceil(PAGE_SIZE).max(1);
        let selected_page = candidates
            .iter()
            .position(|node| Some(&node.id) == selected.as_ref())
            .map_or(0, |index| index / PAGE_SIZE);
        let page = state.page(&scope).unwrap_or(selected_page).min(pages - 1);
        let visible = &candidates[page * PAGE_SIZE..candidates.len().min((page + 1) * PAGE_SIZE)];

        let muted = cx.theme().muted_foreground;
        let foreground = cx.theme().foreground;
        let on_primary = cx.theme().primary_foreground;
        let cell = |node: &CorpusNode| {
            let navigation = self.navigation.clone();
            let target = node.id.clone();
            let is_selected = Some(&node.id) == selected.as_ref();
            let reading = Some(&node.id) == current.as_ref();
            let dot = if is_selected { on_primary } else { foreground };
            div()
                .relative()
                .flex_none()
                .w(rems(3.5))
                .child(
                    Button::new(child_id(&id, format!("cell-{}", node.id)))
                        .map(|button| {
                            if is_selected {
                                button.primary()
                            } else {
                                button.outline()
                            }
                        })
                        .full_width(true)
                        .height(rems(3.5))
                        .radius(Radius::Sm)
                        .content_padding(px(0.), px(0.))
                        .label(node.label.clone())
                        .disabled(node.disabled)
                        .on_click(move |_, _, cx| {
                            navigation.update(cx, |state, cx| state.select(target.clone(), cx));
                        }),
                )
                // A dot under the number marks the place being read.
                .when(reading, |this| {
                    this.child(
                        div()
                            .absolute()
                            .bottom(px(4.))
                            .left(relative(0.5))
                            .ml(px(-2.))
                            .size(px(4.))
                            .rounded_full()
                            .bg(dot),
                    )
                })
        };
        let turn = |name: &'static str, tip: &'static str, icon, target: Option<usize>| {
            let navigation = self.navigation.clone();
            let scope = scope.clone();
            Button::new(child_id(&id, name.into()))
                .ghost()
                .with_atom_size(AtomSize::Sm)
                .icon(Icon::new(icon))
                .tooltip(tip)
                .disabled(target.is_none())
                .on_click(move |_, _, cx| {
                    if let Some(target) = target {
                        navigation.update(cx, |state, cx| {
                            state.set_page(scope.clone(), target, cx);
                        });
                    }
                })
        };
        v_flex()
            .w_full()
            .gap_3()
            .child(
                h_flex()
                    .justify_between()
                    .gap_3()
                    .child(
                        h_flex()
                            .gap_1()
                            .text_sm()
                            .font_weight(FontWeight::MEDIUM)
                            .child(level.label.clone())
                            .when(level.optional, |this| {
                                this.child(
                                    div()
                                        .font_weight(FontWeight::NORMAL)
                                        .text_color(muted)
                                        .child("(optional)"),
                                )
                            }),
                    )
                    .child(
                        div()
                            .text_xs()
                            .text_color(muted)
                            .child(format!("{} available", candidates.len())),
                    ),
            )
            .child(
                h_flex()
                    .w_full()
                    // Five columns when space permits; narrower rails wrap.
                    .max_w(rems(18.5))
                    .flex_wrap()
                    .gap_1()
                    .children(visible.iter().copied().map(cell)),
            )
            .when(pages > 1, |this| {
                this.child(
                    h_flex()
                        .justify_between()
                        .child(turn(
                            "page-back",
                            "Previous page",
                            IconName::ChevronLeft,
                            page.checked_sub(1),
                        ))
                        .child(
                            div()
                                .text_xs()
                                .text_color(muted)
                                .child(format!("Page {} of {pages}", page + 1)),
                        )
                        .child(turn(
                            "page-on",
                            "Next page",
                            IconName::ChevronRight,
                            (page + 1 < pages).then_some(page + 1),
                        )),
                )
            })
            .into_any_element()
    }
}

/// A field that takes a typed reference, "John 3 16", and lists the places
/// it names. Picking one goes there.
#[derive(IntoElement)]
pub struct ReferenceCommand {
    navigation: Entity<CorpusNavigation>,
}

impl ReferenceCommand {
    pub fn new(navigation: &Entity<CorpusNavigation>) -> Self {
        Self {
            navigation: navigation.clone(),
        }
    }
}

impl RenderOnce for ReferenceCommand {
    fn render(self, window: &mut Window, cx: &mut App) -> impl IntoElement {
        let id = watch(&self.navigation, "corpus-reference", window, cx);
        let state = self.navigation.read(cx);
        let field = state.query.clone();
        let query = field.read(cx).value();
        let results = state.data.reference_results(&query);
        let muted = cx.theme().muted_foreground;
        let typed = !query.trim().is_empty();
        let status = if !typed {
            "Type a reference to begin.".to_string()
        } else if results.is_empty() {
            "No valid reference. Check the name and range.".to_string()
        } else if results.len() == 1 {
            "1 result".to_string()
        } else {
            format!("{} results", results.len())
        };
        let navigation = self.navigation.clone();
        v_flex()
            .w_full()
            .gap_1()
            .child(Input::new(&field).prefix(Icon::new(IconName::Search).small()))
            .children(results.into_iter().map(|(node, label)| {
                let navigation = navigation.clone();
                let field = field.clone();
                let target = node.clone();
                Button::new(child_id(&id, format!("result-{node}")))
                    .ghost()
                    .full_width(true)
                    .label(label)
                    .on_click(move |_, window, cx| {
                        navigation.update(cx, |state, cx| state.commit(Some(target.clone()), cx));
                        field.update(cx, |field, cx| field.set_value("", window, cx));
                    })
            }))
            .child(div().px_1().text_xs().text_color(muted).child(status))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn bible() -> CorpusData {
        let chapter = |book: &str, number: usize, verses: usize| {
            CorpusNode::new(format!("{book}-{number}"), "chapter", number.to_string())
                .reference(number.to_string())
                .children((1..=verses).map(|verse| {
                    CorpusNode::new(
                        format!("{book}-{number}-{verse}"),
                        "verse",
                        verse.to_string(),
                    )
                    .reference(verse.to_string())
                }))
        };
        CorpusData::new(
            "New Testament",
            [
                CorpusLevel::new("book", "Book", CorpusLevelKind::Hierarchy),
                CorpusLevel::new("chapter", "Chapter", CorpusLevelKind::Number),
                CorpusLevel::new("verse", "Verse", CorpusLevelKind::Number),
            ],
            [
                CorpusNode::new("john", "book", "John")
                    .aliases(["Jn"])
                    .children([chapter("john", 1, 3), chapter("john", 2, 2)]),
                CorpusNode::new("jude", "book", "Jude")
                    .disabled()
                    .children([chapter("jude", 1, 1)]),
            ],
        )
    }

    #[test]
    fn a_reference_reads_as_its_path() {
        let data = bible();
        assert_eq!(data.validate(), Ok(()));
        assert_eq!(data.format_reference(Some("john-1-2")), "John › 1 › 2");
        assert_eq!(data.format_reference(None), "Choose location");
        // A place under a disabled book cannot be read.
        assert_eq!(data.format_reference(Some("jude-1")), "Choose location");
    }

    #[test]
    fn a_typed_reference_matches_names_tokens_and_aliases_exactly() {
        let data = bible();
        let ids = |query: &str| -> Vec<String> {
            data.reference_results(query)
                .into_iter()
                .map(|(id, _)| id.to_string())
                .collect()
        };
        assert_eq!(ids("John 1:2"), ["john-1-2"]);
        assert_eq!(ids("jn 2"), ["john-2"]);
        assert_eq!(ids("john chapter 1 verse 3"), ["john-1-3"]);
        // No guessing past the end of a book, and nothing under a disabled one.
        assert!(ids("John 9").is_empty());
        assert!(ids("Jude 1").is_empty());
        assert!(ids("  ").is_empty());
    }

    #[test]
    fn adjacent_steps_between_siblings_and_stops_at_the_ends() {
        let data = bible();
        assert_eq!(data.adjacent("john-1", 1), Some("john-2".into()));
        assert_eq!(data.adjacent("john-2", 1), None);
        assert_eq!(data.adjacent("john-1", -1), None);
        // Jude is disabled, so John has no neighbor.
        assert_eq!(data.adjacent("john", 1), None);
    }

    #[test]
    fn validate_rejects_repeated_ids_and_skipped_levels() {
        let mut data = bible();
        data.nodes
            .push(CorpusNode::new("john", "book", "John again"));
        assert_eq!(data.validate(), Err("Duplicate node ID: john".to_string()));

        let mut data = bible();
        data.nodes.push(CorpusNode::new("stray", "verse", "1"));
        assert_eq!(
            data.validate(),
            Err("Missing required level before stray".to_string())
        );
    }
}
