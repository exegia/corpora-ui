//! Foundations: the design tokens every Corpora component reads.
//!
//! | Module | React source |
//! | --- | --- |
//! | [`color`], [`theme`] | `assets/css/theme.css` (`:root`, `.dark`) |
//! | [`radius`] | `theme.css` (`--radius-*`) |
//! | [`motion`] | `theme.css` (`@theme` motion scale), `lib/ease.ts` |
//! | [`shadow`] | `assets/css/shadows.css` |
//! | [`size`] | `components/atoms/types.ts` (`TAtomSize`) |
//! | [`typography`] | `theme.css` (`--font-*`) |

pub mod color;
pub mod motion;
pub mod radius;
pub mod shadow;
pub mod size;
pub mod theme;
pub mod typography;

pub use color::Palette;
pub use radius::{RADIUS_BASE_PX, Radius};
pub use size::AtomSize;
pub use theme::{ActiveCorporaTheme, CorporaTheme, DARK_THEME_NAME, LIGHT_THEME_NAME, set_mode};
pub use typography::{FONT_SANS, FONT_SERIF, FontFamilies};
