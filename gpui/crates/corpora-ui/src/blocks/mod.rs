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
//! | `IAiScope`, `formatScopeLabel` | [`AiScope`] and its `label` |

mod chat;
mod corpus_navigator;

pub use chat::{
    AiPanel, AiPanelHeader, AiScope, AiScopeKind, DegradedBanner, LockedBanner, PinnedThreadBanner,
    PromptList, RecommendationStack, VersionHistoryEntry, VersionHistoryRecord,
};
pub use corpus_navigator::{CorpusNavigator, NavigationPicker};
