//! Composed components: atoms assembled into one recognisable piece of
//! interface.
//!
//! | React | GPUI |
//! | --- | --- |
//! | `User.Info`, `User.Pill`, `User.Message` | [`UserInfo`], [`UserPill`], [`UserMessage`] |
//! | `AI.Avatar`, `AI.Message` | [`AiIdentity`], [`AiMessage`] |
//! | `StreamingText` | [`StreamingText`], [`StreamToken`] |
//! | `SuggestedPrompt`, `SuggestedPrompts` | [`SuggestedPrompt`], [`SuggestedPrompts`] |
//! | `ActionBar`, `EmojiActionBar` | [`ActionBar`], [`EmojiActionBar`] |
//! | `Bubble.ReactionsButton` | [`ReactionPicker`] |
//! | `Logo` | [`Logo`] |
//! | `PasswordInput` | [`PasswordInput`] |
//! | `SocialProviders` | [`SocialProviders`] |
//! | `SendHint` | [`SendHint`] |
//! | `CodeBlock` | [`CodeBlock`], [`DiffLine`] |
//! | `ContextCards` | [`ContextCards`], [`ContextCard`] |
//! | `Attachment` | [`Attachment`], [`AttachmentKind`] |
//! | `Recommendation.Item`, `RecommendationCard` | [`Recommendation`] |
//! | `Composer`, `SendButton`, `AddButton` | [`Composer`] |
//! | `Chart` | [`Chart`] |
//! | `Flowchart` | [`Flowchart`] |
//! | `ResearchAnswer` | [`ResearchAnswer`] |
//! | `Tree` | [`Tree`] |
//! | `CorpusNavigation.*` | [`CorpusNavigation`], [`LocationBar`], [`HierarchyPicker`], [`LocationGrid`], [`ReferenceCommand`] |
//! | `Markdown` | [`Markdown`] |
//! | `InsightCards` | [`InsightCards`], [`Insight`] |
//! | `FilterTable`, `RecordsTable` | [`FilterTable`], [`RecordsTable`] |
//! | `SelectionPopover` | [`SelectionCard`], inside a popover |
//! | `SelectionHighlight`, `AppliedMark`, `ApplyToast` | [`SelectionHighlight`], [`AppliedMark`], [`ApplyToast`] |
//! | `Verse`, `VerseSpan`, `VerseNote` | [`Verse`] and its `span` and `note` |

mod action_bar;
mod ai;
mod attachment;
mod chart;
mod code_block;
mod composer;
mod context_cards;
mod corpus_navigation;
mod flowchart;
mod hint;
mod insight;
mod logo;
mod markdown;
mod password;
mod reader;
mod recommendation;
mod research_answer;
mod social;
mod tables;
mod tree;
mod user;
mod verse;

pub use action_bar::{ActionBar, EmojiActionBar, ReactionPicker, quick_reactions};
pub use ai::{
    AiIdentity, AiMessage, STREAM_GAP, StreamToken, StreamingText, SuggestedPrompt,
    SuggestedPrompts,
};
pub use attachment::{Attachment, AttachmentKind};
pub use chart::{Chart, ChartKind, ChartRow, ChartSeries};
pub use code_block::{CodeBlock, CodeToken, DiffKind, DiffLine, tokenize};
pub use composer::{
    Composer, ComposerAttachment, ComposerEvent, ComposerModel, ComposerOption, ComposerShape,
};
pub use context_cards::{ContextCard, ContextCards};
pub use corpus_navigation::{
    CorpusData, CorpusLevel, CorpusLevelKind, CorpusNavigation, CorpusNavigationEvent, CorpusNode,
    HierarchyPicker, LocationBar, LocationGrid, ReferenceCommand,
};
pub use flowchart::{FlowEdge, FlowStep, Flowchart};
pub use hint::SendHint;
pub use insight::{Insight, InsightAllocation, InsightCards, InsightSegment};
pub use logo::Logo;
pub use markdown::Markdown;
pub use password::{PASSWORD_REQUIREMENTS, PasswordInput, PasswordRequirement, password_strength};
pub use reader::{
    AppliedMark, ApplyToast, NodeSelection, ReaderSelection, SelectionCard, SelectionHighlight,
    WordSelection,
};
pub use recommendation::{Recommendation, RecommendationOption, RecommendationState};
pub use research_answer::ResearchAnswer;
pub use social::{SocialAction, SocialLayout, SocialProvider, SocialProviders};
pub use tables::{FilterRow, FilterStatus, FilterTable, RecordColumn, RecordRow, RecordsTable};
pub use tree::{Tree, TreeNode, TreeVariant};
pub use user::{UserInfo, UserMessage, UserPill};
pub use verse::Verse;
