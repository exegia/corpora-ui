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
//! | `Markdown` | [`Markdown`] |
//! | `InsightCards` | [`InsightCards`], [`Insight`] |
//! | `FilterTable`, `RecordsTable` | [`FilterTable`], [`RecordsTable`] |
//! | `SelectionPopover` | [`SelectionCard`], inside a popover |
//! | `SelectionHighlight`, `AppliedMark`, `ApplyToast` | [`SelectionHighlight`], [`AppliedMark`], [`ApplyToast`] |
//! | `Verse`, `VerseSpan`, `VerseNote` | [`Verse`] and its `span` and `note` |

mod action_bar;
mod ai;
mod attachment;
mod code_block;
mod context_cards;
mod hint;
mod insight;
mod logo;
mod markdown;
mod password;
mod reader;
mod recommendation;
mod social;
mod tables;
mod user;
mod verse;

pub use action_bar::{ActionBar, EmojiActionBar, ReactionPicker, quick_reactions};
pub use ai::{
    AiIdentity, AiMessage, STREAM_GAP, StreamToken, StreamingText, SuggestedPrompt,
    SuggestedPrompts,
};
pub use attachment::{Attachment, AttachmentKind};
pub use code_block::{CodeBlock, CodeToken, DiffKind, DiffLine, tokenize};
pub use context_cards::{ContextCard, ContextCards};
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
pub use social::{SocialAction, SocialLayout, SocialProvider, SocialProviders};
pub use tables::{FilterRow, FilterStatus, FilterTable, RecordColumn, RecordRow, RecordsTable};
pub use user::{UserInfo, UserMessage, UserPill};
pub use verse::Verse;
