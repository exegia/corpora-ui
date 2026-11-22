//! Blocks: composed pieces arranged into a whole region of an app.
//!
//! | React | GPUI |
//! | --- | --- |
//! | `CorpusNavigator`, `NavigationPicker` | [`CorpusNavigator`], [`NavigationPicker`] |
//! | `AiPanel`, `AiPanelHeader` | [`AiPanel`], [`AiPanelHeader`] |
//! | `SuggestedPrompts` (the panel's) | [`PromptList`] |
//! | `RecommendationStack` | [`RecommendationStack`] |
//! | `LockedBanner`, `PinnedThreadBanner`, `DegradedBanner` | [`LockedBanner`], [`PinnedThreadBanner`], [`DegradedBanner`] |
//! | `VersionHistoryRecord` | [`VersionHistoryRecord`], [`VersionHistoryEntry`] |
//! | `ProfileCardBlock`, `defaultProfileCardItems` | [`ProfileCard`] and its `default_items` |
//! | `IProfileCardAction`, `TProfileCardItem` | [`ProfileAction`], [`ProfileItem`] |
//! | `AISidebar`, `useAISidebar` | [`ResourceSidebar`], [`ResourceSidebarEvent`] |
//! | `ISidebarResource`, `ISidebarResourceMove` | [`SidebarResource`], [`ResourceKind`], [`ResourceMove`], [`DropPosition`] |
//! | `ShellLayout`, `useShellPanels`, `useShellFitState` | [`ShellLayout`], [`Shell`], [`ShellEvent`] |
//! | `SHELL_WIDTHS`, `IShellSidebarFit` | [`ShellWidths`], [`RailMode`] |
//! | `Scaffold.Root`, `Scaffold.Canvas`, `Scaffold.Actions`, `Scaffold.Inspector`, `useScaffold` | [`ScaffoldLayout`], [`Scaffold`], [`ScaffoldEvent`] |
//! | `Scaffold.Panel`, `Scaffold.Tab` | [`ScaffoldPanel`], [`ScaffoldTab`] |
//! | `AuthCard`, `AuthError`, `AuthSuccess`, `AuthSeparator` | same names |
//! | `LoginBlock`, `SignupBlock`, `ForgotPasswordBlock`, `UpdatePasswordBlock`, `CodeAuthBlock` | same names, each with its event |
//! | `IAiScope`, `formatScopeLabel` | [`AiScope`] and its `label` |

mod auth;
mod chat;
mod corpus_navigator;
mod profile;
mod scaffold;
mod shell;
mod sidebar;

pub use auth::{
    AuthCard, AuthError, AuthSeparator, AuthStatus, AuthSuccess, CodeAuthBlock, CodeAuthEvent,
    CodeChannel, ForgotPasswordBlock, ForgotPasswordEvent, LoginBlock, LoginEvent, SignupBlock,
    SignupEvent, UpdatePasswordBlock, UpdatePasswordEvent, is_email,
};
pub use chat::{
    AiPanel, AiPanelHeader, AiScope, AiScopeKind, DegradedBanner, LockedBanner, PinnedThreadBanner,
    PromptList, RecommendationStack, VersionHistoryEntry, VersionHistoryRecord,
};
pub use corpus_navigator::{CorpusNavigator, NavigationPicker};
pub use profile::{ProfileAction, ProfileCard, ProfileItem};
pub use scaffold::{
    SCAFFOLD_PANEL_CAPACITY, Scaffold, ScaffoldEvent, ScaffoldLayout, ScaffoldPanel, ScaffoldTab,
};
pub use shell::{RailMode, Shell, ShellEvent, ShellLayout, ShellSide, ShellVariant, ShellWidths};
pub use sidebar::{
    DropPosition, ResourceKind, ResourceMove, ResourceSidebar, ResourceSidebarEvent,
    SidebarResource,
};
