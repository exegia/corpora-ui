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
//! | `SelectionPopover` | [`SelectionCard`], inside a popover |
//! | `SelectionHighlight`, `AppliedMark`, `ApplyToast` | [`SelectionHighlight`], [`AppliedMark`], [`ApplyToast`] |
//! | `Verse`, `VerseSpan`, `VerseNote` | [`Verse`] and its `span` and `note` |

mod action_bar;
mod ai;
mod hint;
mod logo;
mod password;
mod reader;
mod social;
mod user;
mod verse;

pub use action_bar::{ActionBar, EmojiActionBar, ReactionPicker, quick_reactions};
pub use ai::{
    AiIdentity, AiMessage, STREAM_GAP, StreamToken, StreamingText, SuggestedPrompt,
    SuggestedPrompts,
};
pub use hint::SendHint;
pub use logo::Logo;
pub use password::{PASSWORD_REQUIREMENTS, PasswordInput, PasswordRequirement, password_strength};
pub use reader::{
    AppliedMark, ApplyToast, NodeSelection, ReaderSelection, SelectionCard, SelectionHighlight,
    WordSelection,
};
pub use social::{SocialAction, SocialLayout, SocialProvider, SocialProviders};
pub use user::{UserInfo, UserMessage, UserPill};
pub use verse::Verse;
