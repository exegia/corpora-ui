//! Atoms: the basic elements.
//!
//! GPUI Component already ships most of the primitives the React library
//! builds by hand, and once the Corpora theme is installed they render in the
//! Corpora palette. Those are re-exported here unchanged so an application
//! imports every atom from one place. Only the atoms GPUI Component has no
//! equivalent for are implemented in this crate.
//!
//! | React | GPUI |
//! | --- | --- |
//! | `Button` | [`Button`] (this crate, on the stock button) |
//! | `Badge` | [`Badge`] (this crate) |
//! | `Card`, `CardHeader`, `CardPanel`, `CardFooter` | [`Card`], [`CardHeader`] (this crate) |
//! | `Text`, `Heading`, `Paragraph` | [`Text`] (this crate) |
//! | `Loader` | [`Loader`] (this crate) |
//! | `Avatar` | [`Avatar`] (this crate, on the stock avatar) |
//! | `Bubble` and its parts | [`Bubble`] (this crate) |
//! | `Reference` | [`Reference`] (this crate) |
//! | `InputField` | [`InputField`] (this crate, on the stock input) |
//! | `SourceChip`, `SelectChip` | [`Chip`], [`SelectChip`] (this crate) |
//! | `EmojiPicker` | [`EmojiPicker`], [`EmojiPickerState`] |
//! | `CardFrame` and its parts | [`CardFrame`], [`CardFrameHeader`] |
//! | `Frame`, `FramePanel` | [`Frame`] |
//! | (height transitions) | [`Reveal`] |
//! | `Label` (text level) | [`Text::label`] with a [`LabelLevel`] |
//! | `Label` | [`Label`] |
//! | `Kbd` | [`Kbd`] |
//! | `Separator` | [`Separator`] |
//! | `Skeleton` | [`Skeleton`] |
//! | `Spinner` | [`Spinner`] |

mod avatar;
mod badge;
mod bubble;
mod button;
mod card;
mod chip;
mod emoji;
mod field;
mod glass;
mod loader;
mod reference;
mod reveal;
mod text;

pub use avatar::{Avatar, AvatarAudio, AvatarStatus, AvatarUser};
pub use badge::{Badge, BadgeAppearance, BadgeVariant};
pub use bubble::{Bubble, BubbleReaction, BubbleVariant};
pub use button::{Button, ButtonKind};
pub use card::{Card, CardFrame, CardFrameHeader, CardHeader, Frame};
pub use chip::{Chip, SelectChip};
pub(crate) use emoji::WIDTH as PICKER_WIDTH;
pub use emoji::{Emoji, EmojiPicker, EmojiPickerState};
pub use field::InputField;
pub use glass::{GlassSpec, GlassSurface, GlassSurfaceExt, glass, neutral_tint};
pub use loader::{Loader, LoaderKind};
pub use reference::Reference;
pub use reveal::Reveal;
pub use text::{LabelLevel, Text, TextSize, TextVariant};

pub use gpui_kit::component::kbd::Kbd;
pub use gpui_kit::component::label::Label;
pub use gpui_kit::component::separator::Separator;
pub use gpui_kit::component::skeleton::Skeleton;
pub use gpui_kit::component::spinner::Spinner;
pub use gpui_kit::component::{Disableable, Icon, IconName, Selectable, Sizable, Size};
