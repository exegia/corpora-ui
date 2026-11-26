//! Composer: `react/src/components/composed/chat/composer`.

use std::path::PathBuf;

use gpui_kit::assets::IconName as LucideIcon;
use gpui_kit::component::input::{
    Enter, Escape, InputEvent, MoveDown, MoveUp, Textarea, TextareaState,
};
use gpui_kit::component::{ActiveTheme as _, Icon, Sizable as _, h_flex, v_flex};
use gpui_kit::prelude::FluentBuilder as _;
use gpui_kit::{
    App, AppContext as _, Context, ElementId, Entity, EventEmitter, Focusable as _,
    InteractiveElement as _, IntoElement, ParentElement as _, PathPromptOptions, Render,
    SharedString, StatefulInteractiveElement as _, Styled as _, Subscription, Window, deferred,
    div, rems,
};

use super::attachment::{Attachment, AttachmentKind};
use crate::atoms::{Button, IconName, subtle};
use crate::foundations::{AtomSize, Radius};

/// A source to mention with `@`, or a command to run with `/`.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct ComposerOption {
    pub id: SharedString,
    pub label: SharedString,
    pub description: Option<SharedString>,
    /// Text to insert instead of `@label` or `/id`.
    pub insert_text: Option<SharedString>,
}

impl ComposerOption {
    pub fn new(id: impl Into<SharedString>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            description: None,
            insert_text: None,
        }
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }

    pub fn insert_text(mut self, insert_text: impl Into<SharedString>) -> Self {
        self.insert_text = Some(insert_text.into());
        self
    }
}

/// A model the message can be sent to.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct ComposerModel {
    pub id: SharedString,
    pub label: SharedString,
    pub description: Option<SharedString>,
}

impl ComposerModel {
    pub fn new(id: impl Into<SharedString>, label: impl Into<SharedString>) -> Self {
        Self {
            id: id.into(),
            label: label.into(),
            description: None,
        }
    }

    pub fn description(mut self, description: impl Into<SharedString>) -> Self {
        self.description = Some(description.into());
        self
    }
}

/// Something attached to the message being written.
#[derive(Clone, Debug, Default, PartialEq)]
pub struct ComposerAttachment {
    /// Unique in the tray.
    pub id: SharedString,
    pub title: SharedString,
    pub meta: Option<SharedString>,
    pub kind: AttachmentKind,
    /// Where the file is, when it was picked from disk.
    pub path: Option<PathBuf>,
}

impl ComposerAttachment {
    /// An attachment for a file on disk, named and typed by its path.
    pub fn from_path(path: PathBuf) -> Self {
        let extension = path
            .extension()
            .map(|extension| extension.to_string_lossy().to_lowercase())
            .unwrap_or_default();
        let kind = match extension.as_str() {
            "png" | "jpg" | "jpeg" | "gif" | "webp" | "heic" | "svg" | "tiff" | "bmp" => {
                AttachmentKind::Image
            }
            "mp4" | "mov" | "webm" | "mkv" | "avi" => AttachmentKind::Video { duration: None },
            "mp3" | "wav" | "m4a" | "ogg" | "flac" | "aac" => AttachmentKind::Audio {
                duration: None,
                waveform: Vec::new(),
            },
            _ => AttachmentKind::Document,
        };
        Self {
            id: path.to_string_lossy().into_owned().into(),
            title: path
                .file_name()
                .map(|name| name.to_string_lossy().into_owned())
                .unwrap_or_default()
                .into(),
            meta: (!extension.is_empty()).then(|| extension.to_uppercase().into()),
            kind,
            path: Some(path),
        }
    }
}

/// The outline of the composer.
#[derive(Clone, Copy, Debug, Default, PartialEq, Eq, Hash)]
pub enum ComposerShape {
    #[default]
    Rounded,
    /// A full pill while the message is one line with nothing attached.
    Pill,
}

/// What a [`Composer`] tells its owner.
#[derive(Clone, Debug, PartialEq)]
pub enum ComposerEvent {
    /// The message was sent. The composer has already cleared itself.
    Submit {
        text: SharedString,
        attachments: Vec<ComposerAttachment>,
    },
    /// Stop was pressed while a reply was streaming.
    Stop,
    SourcePicked(ComposerOption),
    Command(ComposerOption),
    ModelChanged(SharedString),
    /// Files were picked from disk and added to the tray. Uploading them is
    /// the owner's job.
    FilesAdded(Vec<PathBuf>),
}

/// The `@` or `/` word the caret is at the end of.
#[derive(Debug, PartialEq)]
struct Token<'a> {
    kind: char,
    query: &'a str,
    /// Byte offset of the `@` or `/`.
    start: usize,
}

/// Finds the mention or command being typed at the end of `before`, the
/// text up to the caret. The mark must start the text or follow a space.
fn token(before: &str) -> Option<Token<'_>> {
    let start = before.rfind(['@', '/'])?;
    let query = &before[start + 1..];
    if query.chars().any(char::is_whitespace) {
        return None;
    }
    let opens_a_word = before[..start]
        .chars()
        .next_back()
        .is_none_or(char::is_whitespace);
    opens_a_word.then(|| Token {
        kind: if before[start..].starts_with('@') {
            '@'
        } else {
            '/'
        },
        query,
        start,
    })
}

#[derive(Clone, Copy, PartialEq)]
enum MenuKind {
    Sources,
    Commands,
    Models,
}

#[derive(Clone)]
enum Row {
    Upload,
    Source(ComposerOption),
    Command(ComposerOption),
    Model(ComposerModel),
}

/// The menu as it should show now.
struct Menu {
    kind: MenuKind,
    rows: Vec<Row>,
    /// Where the typed token starts, when the menu came from typing.
    token_start: Option<usize>,
}

const UPLOAD_LABEL: &str = "Add photos & files";

/// The message box of a chat: text, attachments, `@` sources, `/` commands,
/// a model choice and Send.
///
/// It is an entity, as it owns the text and the menus:
///
/// ```ignore
/// // in `new`:
/// let composer = cx.new(|cx| {
///     Composer::new(window, cx)
///         .sources([ComposerOption::new("bezae", "Codex Bezae")])
///         .commands([ComposerOption::new("collate", "Collate")])
/// });
/// cx.subscribe(&composer, |this, _, event: &ComposerEvent, cx| {
///     if let ComposerEvent::Submit { text, .. } = event {
///         this.send(text.clone(), cx);
///     }
/// })
/// .detach();
/// // in `render`: self.composer.clone()
/// ```
///
/// Enter sends and Shift+Enter breaks the line. While a reply streams, call
/// [`Self::set_streaming`]: the field locks and Send becomes Stop.
pub struct Composer {
    input: Entity<TextareaState>,
    sources: Vec<ComposerOption>,
    commands: Vec<ComposerOption>,
    models: Vec<ComposerModel>,
    model: Option<SharedString>,
    attachments: Vec<ComposerAttachment>,
    shape: ComposerShape,
    expanded: bool,
    safety_note: Option<SharedString>,
    streaming: bool,
    disabled: bool,
    plus_open: bool,
    models_open: bool,
    /// The menu was closed by hand and stays shut until the text changes.
    dismissed: bool,
    active: usize,
    _subscriptions: [Subscription; 2],
}

impl EventEmitter<ComposerEvent> for Composer {}

impl Composer {
    pub fn new(window: &mut Window, cx: &mut Context<Self>) -> Self {
        let input = cx.new(|cx| {
            TextareaState::new(window, cx)
                .auto_grow(1, 6)
                .submit_on_enter(true)
                .placeholder("Write a message…")
        });
        let subscriptions =
            [
                cx.subscribe_in(&input, window, |this, _, event: &InputEvent, window, cx| {
                    match event {
                        InputEvent::Change => {
                            this.dismissed = false;
                            this.plus_open = false;
                            this.models_open = false;
                            this.active = 0;
                            cx.notify();
                        }
                        InputEvent::PressEnter { shift: false, .. } => this.send(window, cx),
                        _ => {}
                    }
                }),
                // The caret decides which menu shows, so follow it.
                cx.observe(&input, |_, _, cx| cx.notify()),
            ];
        Self {
            input,
            sources: Vec::new(),
            commands: Vec::new(),
            models: Vec::new(),
            model: None,
            attachments: Vec::new(),
            shape: ComposerShape::default(),
            expanded: false,
            safety_note: None,
            streaming: false,
            disabled: false,
            plus_open: false,
            models_open: false,
            dismissed: false,
            active: 0,
            _subscriptions: subscriptions,
        }
    }

    /// What `@` offers.
    pub fn sources(mut self, sources: impl IntoIterator<Item = ComposerOption>) -> Self {
        self.sources.extend(sources);
        self
    }

    /// What `/` offers.
    pub fn commands(mut self, commands: impl IntoIterator<Item = ComposerOption>) -> Self {
        self.commands.extend(commands);
        self
    }

    /// The models to choose from. With none, the model control is left out.
    /// The first is selected unless [`Self::model`] says otherwise.
    pub fn models(mut self, models: impl IntoIterator<Item = ComposerModel>) -> Self {
        self.models.extend(models);
        self
    }

    /// The id of the selected model.
    pub fn model(mut self, model: impl Into<SharedString>) -> Self {
        self.model = Some(model.into());
        self
    }

    pub fn shape(mut self, shape: ComposerShape) -> Self {
        self.shape = shape;
        self
    }

    /// Keeps the text above the controls even for a short message.
    pub fn expanded(mut self, expanded: bool) -> Self {
        self.expanded = expanded;
        self
    }

    /// A line of small print under the composer.
    pub fn safety_note(mut self, note: impl Into<SharedString>) -> Self {
        self.safety_note = Some(note.into());
        self
    }

    /// Seeds the tray.
    pub fn attachments(
        mut self,
        attachments: impl IntoIterator<Item = ComposerAttachment>,
    ) -> Self {
        self.attachments.extend(attachments);
        self
    }

    pub fn set_placeholder(
        &mut self,
        placeholder: impl Into<SharedString>,
        window: &mut Window,
        cx: &mut Context<Self>,
    ) {
        self.input.update(cx, |input, cx| {
            input.set_placeholder(placeholder, window, cx);
        });
    }

    /// The message as written so far.
    pub fn value(&self, cx: &App) -> SharedString {
        self.input.read(cx).value()
    }

    pub fn set_value(
        &mut self,
        value: impl Into<SharedString>,
        window: &mut Window,
        cx: &mut Context<Self>,
    ) {
        let value: SharedString = value.into();
        self.input
            .update(cx, |input, cx| input.set_value(value, window, cx));
    }

    /// The id of the selected model, if there are models.
    pub fn selected_model(&self) -> Option<&SharedString> {
        self.model
            .as_ref()
            .or_else(|| self.models.first().map(|model| &model.id))
    }

    /// What is in the tray now.
    pub fn tray(&self) -> &[ComposerAttachment] {
        &self.attachments
    }

    /// Adds to the tray, unless an attachment with that id is already there.
    pub fn add_attachment(&mut self, attachment: ComposerAttachment, cx: &mut Context<Self>) {
        if !self.attachments.iter().any(|held| held.id == attachment.id) {
            self.attachments.push(attachment);
            cx.notify();
        }
    }

    /// While a reply streams the field locks and Send becomes Stop.
    pub fn set_streaming(&mut self, streaming: bool, cx: &mut Context<Self>) {
        self.streaming = streaming;
        self.sync_lock(cx);
    }

    pub fn set_disabled(&mut self, disabled: bool, cx: &mut Context<Self>) {
        self.disabled = disabled;
        self.sync_lock(cx);
    }

    pub fn focus(&self, window: &mut Window, cx: &mut Context<Self>) {
        self.input.update(cx, |input, cx| input.focus(window, cx));
    }

    fn idle(&self) -> bool {
        !(self.disabled || self.streaming)
    }

    fn sync_lock(&mut self, cx: &mut Context<Self>) {
        let locked = !self.idle();
        self.input
            .update(cx, |input, cx| input.set_disabled(locked, cx));
        cx.notify();
    }

    fn menu(&self, cx: &App) -> Option<Menu> {
        if !self.idle() || self.dismissed {
            return None;
        }
        if self.models_open {
            return Some(Menu {
                kind: MenuKind::Models,
                rows: self.models.iter().cloned().map(Row::Model).collect(),
                token_start: None,
            });
        }
        let sources = |query: &str| {
            let upload = query.is_empty() || "add photos and files".contains(query);
            upload
                .then_some(Row::Upload)
                .into_iter()
                .chain(
                    self.sources
                        .iter()
                        .filter(|source| source.label.to_lowercase().contains(query))
                        .cloned()
                        .map(Row::Source),
                )
                .collect()
        };
        if self.plus_open {
            return Some(Menu {
                kind: MenuKind::Sources,
                rows: sources(""),
                token_start: None,
            });
        }
        let input = self.input.read(cx);
        let value = input.value();
        let token = token(value.get(..input.cursor())?)?;
        let query = token.query.to_lowercase();
        Some(if token.kind == '@' {
            Menu {
                kind: MenuKind::Sources,
                rows: sources(&query),
                token_start: Some(token.start),
            }
        } else {
            Menu {
                kind: MenuKind::Commands,
                rows: self
                    .commands
                    .iter()
                    .filter(|command| command.label.to_lowercase().contains(&query))
                    .cloned()
                    .map(Row::Command)
                    .collect(),
                token_start: Some(token.start),
            }
        })
    }

    fn close_menu(&mut self, cx: &mut Context<Self>) {
        self.plus_open = false;
        self.models_open = false;
        self.dismissed = true;
        cx.notify();
    }

    /// Moves the highlighted row, wrapping at either end.
    fn step(&mut self, delta: isize, cx: &mut Context<Self>) {
        let Some(menu) = self.menu(cx) else { return };
        let count = menu.rows.len();
        if count == 0 {
            return;
        }
        let active = self.active.min(count - 1) as isize;
        self.active = (active + delta).rem_euclid(count as isize) as usize;
        cx.stop_propagation();
        cx.notify();
    }

    fn choose(&mut self, index: usize, window: &mut Window, cx: &mut Context<Self>) {
        let Some(menu) = self.menu(cx) else { return };
        let Some(row) = menu.rows.get(index).cloned() else {
            return;
        };
        self.close_menu(cx);
        let (option, replacement, event) = match row {
            Row::Upload => return self.pick_files(cx),
            Row::Model(model) => {
                self.model = Some(model.id.clone());
                cx.emit(ComposerEvent::ModelChanged(model.id));
                return self.focus(window, cx);
            }
            Row::Source(option) => {
                let text = format!("@{} ", option.label);
                (option.clone(), text, ComposerEvent::SourcePicked(option))
            }
            Row::Command(option) => {
                let text = format!("/{} ", option.id);
                (option.clone(), text, ComposerEvent::Command(option))
            }
        };
        let replacement = option.insert_text.map(String::from).unwrap_or(replacement);
        self.input.update(cx, |input, cx| {
            if let Some(start) = menu.token_start {
                let caret = input.cursor();
                input.set_selected_range(start..caret, cx);
                input.replace(replacement, window, cx);
            } else {
                input.insert(replacement, window, cx);
            }
            input.focus(window, cx);
        });
        cx.emit(event);
    }

    fn pick_files(&mut self, cx: &mut Context<Self>) {
        let picked = cx.prompt_for_paths(PathPromptOptions {
            files: true,
            directories: false,
            multiple: true,
            prompt: Some("Attach".into()),
        });
        cx.spawn(async move |this, cx| {
            if let Ok(Ok(Some(paths))) = picked.await {
                this.update(cx, |this, cx| {
                    for path in &paths {
                        this.add_attachment(ComposerAttachment::from_path(path.clone()), cx);
                    }
                    cx.emit(ComposerEvent::FilesAdded(paths));
                })
                .ok();
            }
        })
        .detach();
    }

    fn send(&mut self, window: &mut Window, cx: &mut Context<Self>) {
        let text: SharedString = self.value(cx).trim().to_string().into();
        if !self.idle() || (text.is_empty() && self.attachments.is_empty()) {
            return;
        }
        let attachments = std::mem::take(&mut self.attachments);
        self.set_value("", window, cx);
        self.close_menu(cx);
        cx.emit(ComposerEvent::Submit { text, attachments });
    }
}

impl Render for Composer {
    fn render(&mut self, window: &mut Window, cx: &mut Context<Self>) -> impl IntoElement {
        let menu = self.menu(cx);
        let idle = self.idle();
        let streaming = self.streaming;
        let value = self.value(cx);
        let wide = self.expanded || value.contains('\n');
        let can_send = idle && (!value.trim().is_empty() || !self.attachments.is_empty());
        let focused = self.input.read(cx).focus_handle(cx).is_focused(window);

        let theme = cx.theme();
        let foreground = theme.foreground;
        let muted = theme.muted_foreground;
        let border = theme.border;
        let background = theme.background;
        let popover = theme.popover;
        let hover = subtle(cx);
        let row_radius = Radius::Sm.resolve(cx);
        let menu_radius = Radius::Lg.resolve(cx);

        let add = Button::new("composer-add")
            .ghost()
            .with_atom_size(AtomSize::Sm)
            .icon(Icon::new(LucideIcon::Plus))
            .tooltip("Add sources and files")
            .disabled(!idle)
            .on_click(cx.listener(|this, _, window, cx| {
                this.plus_open = !this.plus_open;
                this.models_open = false;
                this.dismissed = false;
                this.active = 0;
                this.focus(window, cx);
                cx.notify();
            }));

        let selected_model = self.selected_model().cloned();
        let model = selected_model.as_ref().map(|selected| {
            let label = self
                .models
                .iter()
                .find(|model| &model.id == selected)
                .map_or_else(|| selected.clone(), |model| model.label.clone());
            Button::new("composer-model")
                .ghost()
                .with_atom_size(AtomSize::Sm)
                .label(label)
                .trailing_icon(Icon::new(IconName::ChevronDown))
                .tooltip("Choose model")
                .disabled(!idle)
                .on_click(cx.listener(|this, _, window, cx| {
                    this.models_open = !this.models_open;
                    this.plus_open = false;
                    this.dismissed = false;
                    this.active = 0;
                    this.focus(window, cx);
                    cx.notify();
                }))
        });

        let send = Button::new("composer-send")
            .primary()
            .with_atom_size(AtomSize::Md)
            .icon(Icon::new(if streaming {
                LucideIcon::Square
            } else {
                LucideIcon::ArrowUp
            }))
            .tooltip(if streaming { "Stop" } else { "Send message" })
            .disabled(!streaming && !can_send)
            .on_click(cx.listener(move |this, _, window, cx| {
                if this.streaming {
                    cx.emit(ComposerEvent::Stop);
                } else {
                    this.send(window, cx);
                }
            }));

        let field = div().flex_1().min_w_0().child(
            Textarea::new(&self.input)
                .appearance(false)
                .bordered(false)
                .disabled(!idle),
        );

        let controls = if wide {
            v_flex().gap_1p5().child(field).child(
                h_flex()
                    .gap_1()
                    .child(add)
                    .children(model)
                    .child(div().flex_1())
                    .child(send),
            )
        } else {
            h_flex()
                .gap_1()
                .child(add)
                .child(field)
                .children(model)
                .child(send)
        };

        let tray =
            (!self.attachments.is_empty()).then(|| {
                h_flex().flex_wrap().gap_1p5().px_0p5().pt_0p5().children(
                    self.attachments.iter().map(|attachment| {
                        let id = attachment.id.clone();
                        Attachment::new(
                            ElementId::Name(format!("composer-attachment-{id}").into()),
                            attachment.title.clone(),
                        )
                        .kind(attachment.kind.clone())
                        .when_some(attachment.meta.clone(), |this, meta| this.meta(meta))
                        .when(idle, |this| {
                            this.on_remove(cx.listener(move |this, _, _, cx| {
                                this.attachments.retain(|held| held.id != id);
                                cx.notify();
                            }))
                        })
                    }),
                )
            });

        let popup = menu.map(|menu| {
            let active = self.active.min(menu.rows.len().saturating_sub(1));
            let (hint, empty) = match menu.kind {
                MenuKind::Sources => ("Type @ to search sources and files", "No sources found."),
                MenuKind::Commands => ("Type / to search commands", "No commands found."),
                MenuKind::Models => ("Choose the model that answers", "No models."),
            };
            let none = menu.rows.is_empty();
            let rows = menu.rows.into_iter().enumerate().map(|(index, row)| {
                let (key, icon, label, description, chosen) = match row {
                    Row::Upload => (
                        "upload".to_string(),
                        LucideIcon::Paperclip,
                        SharedString::from(UPLOAD_LABEL),
                        None,
                        false,
                    ),
                    Row::Source(option) => (
                        format!("source-{}", option.id),
                        LucideIcon::AtSign,
                        option.label,
                        option.description,
                        false,
                    ),
                    Row::Command(option) => (
                        format!("command-{}", option.id),
                        LucideIcon::Slash,
                        option.label,
                        option.description,
                        false,
                    ),
                    Row::Model(model) => (
                        format!("model-{}", model.id),
                        LucideIcon::Sparkle,
                        model.label,
                        model.description,
                        selected_model.as_ref() == Some(&model.id),
                    ),
                };
                h_flex()
                    .id(ElementId::Name(format!("composer-row-{key}").into()))
                    .min_h_9()
                    .gap_2()
                    .px_2()
                    .rounded(row_radius)
                    .text_sm()
                    .cursor_pointer()
                    .when(index == active, |this| this.bg(hover))
                    .on_hover(cx.listener(move |this, hovered: &bool, _, cx| {
                        if *hovered && this.active != index {
                            this.active = index;
                            cx.notify();
                        }
                    }))
                    .on_click(cx.listener(move |this, _, window, cx| {
                        this.choose(index, window, cx);
                    }))
                    .child(Icon::new(icon).small().flex_none().text_color(muted))
                    .child(div().flex_none().child(label))
                    .child(
                        div()
                            .flex_1()
                            .min_w_0()
                            .truncate()
                            .text_xs()
                            .text_color(muted)
                            .children(description),
                    )
                    .when(chosen, |this| {
                        this.child(Icon::new(IconName::Check).small().flex_none())
                    })
            });
            deferred(
                div()
                    .absolute()
                    .bottom_full()
                    .left_0()
                    .w_full()
                    .pb_2()
                    .child(
                        v_flex()
                            .id("composer-menu")
                            .occlude()
                            .p_1()
                            .rounded(menu_radius)
                            .border_1()
                            .border_color(border)
                            .bg(popover)
                            .shadow_lg()
                            .on_mouse_down_out(cx.listener(|this, _, _, cx| this.close_menu(cx)))
                            .children(rows)
                            .when(none, |this| {
                                this.child(
                                    div().px_2().py_3().text_xs().text_color(muted).child(empty),
                                )
                            })
                            .child(
                                div()
                                    .mt_1()
                                    .px_2()
                                    .py_1p5()
                                    .border_t_1()
                                    .border_color(border)
                                    .text_xs()
                                    .text_color(muted)
                                    .child(hint),
                            ),
                    ),
            )
            .with_priority(1)
        });

        let compact_pill =
            self.shape == ComposerShape::Pill && !wide && self.attachments.is_empty();
        let surface = v_flex()
            .relative()
            .gap_1p5()
            .p_1p5()
            .border_1()
            .border_color(if focused {
                theme.primary
            } else {
                foreground.opacity(0.1)
            })
            .bg(background)
            .shadow_xs()
            .map(|this| match self.shape {
                ComposerShape::Pill if compact_pill => this.rounded_full(),
                ComposerShape::Pill => this.rounded(Radius::Xl2.resolve(cx)),
                ComposerShape::Rounded => this.rounded(Radius::Xl.resolve(cx)),
            })
            .children(tray)
            .child(controls)
            .children(popup);

        v_flex()
            .id(("composer", cx.entity_id()))
            .w_full()
            .max_w(rems(48.))
            .capture_action(cx.listener(|this, _: &MoveUp, _, cx| this.step(-1, cx)))
            .capture_action(cx.listener(|this, _: &MoveDown, _, cx| this.step(1, cx)))
            .capture_action(cx.listener(|this, action: &Enter, window, cx| {
                if action.shift || action.secondary {
                    return;
                }
                if this.menu(cx).is_some_and(|menu| !menu.rows.is_empty()) {
                    cx.stop_propagation();
                    this.choose(this.active, window, cx);
                }
            }))
            .capture_action(cx.listener(|this, _: &Escape, _, cx| {
                if this.menu(cx).is_some() {
                    cx.stop_propagation();
                    this.close_menu(cx);
                } else if this.streaming {
                    cx.emit(ComposerEvent::Stop);
                }
            }))
            .child(surface)
            .when_some(self.safety_note.clone(), |this, note| {
                this.child(
                    div()
                        .mt_1()
                        .px_1p5()
                        .text_size(rems(0.625))
                        .text_color(muted)
                        .child(note),
                )
            })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn token_is_the_mention_or_command_at_the_caret() {
        assert_eq!(
            token("see @bez"),
            Some(Token {
                kind: '@',
                query: "bez",
                start: 4
            })
        );
        assert_eq!(
            token("/"),
            Some(Token {
                kind: '/',
                query: "",
                start: 0
            })
        );
    }

    #[test]
    fn token_needs_a_word_start_and_no_space_after() {
        // An address or a path is not a mention or a command.
        assert_eq!(token("ada@example"), None);
        assert_eq!(token("src/lib"), None);
        // The word ended, so the menu closes.
        assert_eq!(token("@bezae and"), None);
        assert_eq!(token("plain text"), None);
    }

    #[test]
    fn attachment_from_path_is_named_and_typed_by_the_file() {
        let image = ComposerAttachment::from_path(PathBuf::from("/tmp/folio-205v.PNG"));
        assert_eq!(image.title, "folio-205v.PNG");
        assert_eq!(image.meta.as_deref(), Some("PNG"));
        assert_eq!(image.kind, AttachmentKind::Image);
        let notes = ComposerAttachment::from_path(PathBuf::from("/tmp/notes"));
        assert_eq!(notes.kind, AttachmentKind::Document);
        assert_eq!(notes.meta, None);
    }
}
