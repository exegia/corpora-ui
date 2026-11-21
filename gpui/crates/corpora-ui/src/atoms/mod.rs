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
//! | `Label` | [`Label`] |
//! | `Kbd` | [`Kbd`] |
//! | `Separator` | [`Separator`] |
//! | `Skeleton` | [`Skeleton`] |
//! | `Spinner` | [`Spinner`] |

mod badge;
mod button;
mod card;
mod loader;
mod text;

pub use badge::{Badge, BadgeAppearance, BadgeVariant};
pub use button::{Button, ButtonKind};
pub use card::{Card, CardHeader};
pub use loader::{Loader, LoaderKind};
pub use text::{Text, TextSize, TextVariant};

pub use gpui_kit::component::kbd::Kbd;
pub use gpui_kit::component::label::Label;
pub use gpui_kit::component::separator::Separator;
pub use gpui_kit::component::skeleton::Skeleton;
pub use gpui_kit::component::spinner::Spinner;
pub use gpui_kit::component::{Disableable, Icon, IconName, Selectable, Sizable, Size};
