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
mod mark;
mod reference;
mod reveal;
mod scaled;
mod segmented;
mod text;
mod text_selection;
mod texture;

pub use avatar::{Avatar, AvatarAudio, AvatarStatus, AvatarUser};
pub use badge::{Badge, BadgeAppearance, BadgeVariant};
pub use bubble::{Bubble, BubbleReaction, BubbleVariant};
pub use button::{Button, ButtonKind};
pub(crate) use card::FRAME_TINT;
pub use card::{Card, CardFrame, CardFrameHeader, CardHeader, Frame};
pub use chip::{Chip, SelectChip};
pub(crate) use emoji::WIDTH as PICKER_WIDTH;
pub use emoji::{Emoji, EmojiPicker, EmojiPickerState};
pub use field::InputField;
pub use glass::{
    GlassEdge, GlassEdges, GlassSpec, GlassSurface, GlassSurfaceExt, glass, neutral_tint,
};
pub use loader::{Loader, LoaderKind};
pub(crate) use mark::subtle;
pub use mark::{
    Dot, FileTypeBadge, FollowUpRow, Pill, Signal, SignalLevel, Stat, Tag, TagTone, Tone,
};
pub use reference::Reference;
pub use reveal::Reveal;
pub use segmented::SegmentedToggle;
pub use text::{LabelLevel, Text, TextSize, TextVariant};
pub(crate) use text_selection::floating;
pub use text_selection::{TextPopover, TextSelection};
pub use texture::{Texture, TextureVariant};

pub use gpui_kit::component::kbd::Kbd;
pub use gpui_kit::component::label::Label;
pub use gpui_kit::component::separator::Separator;
pub use gpui_kit::component::skeleton::Skeleton;
pub use gpui_kit::component::spinner::Spinner;
pub use gpui_kit::component::{Disableable, Icon, IconName, Selectable, Sizable, Size};
