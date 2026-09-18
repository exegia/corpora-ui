// Props interfaces from `atoms`, `blocks`, `composed`

export type { IAvatarProps } from "./atoms/avatar/types"
export type { ITextureProps } from "./atoms/background/type"
export type {
  IBubbleProps,
  IBubbleReactionsProps,
  IBubbleReactionChipProps,
} from "./atoms/bubble/types"
export type {
  ISelectionRenderProps,
  IHighlightPopoverProps,
  ITextSelectionProps,
  ITextPopoverRenderProps,
  ITextClickPopoverProps,
} from "./atoms/text-selection/types"
export type { IReferenceProps, IInputFieldProps, ILoaderProps } from "./atoms/types"

export type {
  IActionButtonProps,
  IActionBarProps,
  IEmojiActionBarProps,
} from "./composed/action-bar/types"
export type { IResearchAnswerProps } from "./composed/ai/research-answer"
export type { IStreamingTextProps } from "./composed/ai/streaming-text"
export type {
  ISuggestedPromptProps,
  ISuggestedPromptsProps as IAISuggestedPromptsProps,
} from "./composed/ai/suggested-prompt"
export type {
  IStreamingTextProps as IAIStreamingTextProps,
  IAIMessageProps,
} from "./composed/ai/types"
export type { IChartProps } from "./composed/chat/chart"
export type { ICodeBlockProps } from "./composed/chat/code-block"
export type { IContextCardsProps } from "./composed/chat/context-cards"
export type { IFilterTableProps } from "./composed/chat/filter-table"
export type {
  IFlowchartProps,
  IConnectorProps,
  IChartNodeProps,
} from "./composed/chat/flowchart/types"
export type { IInsightCardsProps } from "./composed/chat/insight-cards"
export type { IMarkdownProps } from "./composed/chat/markdown"
export type { IRecommendationCheckboxProps } from "./composed/chat/recommendation/checkbox"
export type {
  IRecommendationItemProps,
  IRecommendationCardProps,
} from "./composed/chat/recommendation/types"
export type { IRecordsTableProps } from "./composed/chat/records-table"
export type {
  IComposerMenuProps,
  IComposerSuggestionsProps,
  IComposerSubmitButtonProps,
  IComposerModeProps,
  IComposerBaseProps,
  IComposerProps,
  ISuggestedPromptsProps as IComposerSuggestedPromptsProps,
  IBubbleActionBaseProps,
  IBubbleActionsProps,
} from "./composed/chat/type"
export type { ILogoProps } from "./composed/logo"
export type { IPasswordInputProps } from "./composed/password-input"
export type {
  ISelectionPopoverProps,
  ISelectionHighlightProps,
  IAppliedMarkProps,
  IApplyToastProps,
} from "./composed/reader/type"
export type { ISocialProvidersProps } from "./composed/social-providers"
export type { ITreeRowProps } from "./composed/tree/tree-node"
export type { ITreeControllerProps } from "./composed/tree/type"
export type { IUserBaseProps, IUserMessageProps } from "./composed/user/types"
export type { IVerseProps } from "./composed/verse/types"

export type { IAuthFlowBlockProps } from "./blocks/auth/auth-flow-block"
export type { ICodeAuthBlockProps } from "./blocks/auth/code-auth-block"
export type { IForgotPasswordBlockProps } from "./blocks/auth/forgot-password-block"
export type { ILinkedAccountsBlockProps } from "./blocks/auth/linked-accounts-block"
export type { ILoginBlockProps } from "./blocks/auth/login-block"
export type { IProfileStepProps } from "./blocks/auth/onboarding/profile-step"
export type { IOnboardingBlockProps } from "./blocks/auth/onboarding-block"
export type { IPasskeyManagerBlockProps } from "./blocks/auth/passkey-manager-block"
export type { IPasskeySignInBlockProps } from "./blocks/auth/passkey-sign-in-block"
export type { ISignupBlockProps } from "./blocks/auth/signup-block"
export type { IUpdatePasswordBlockProps } from "./blocks/auth/update-password-block"
export type {
  IRecommendationStackProps,
  IPinnedThreadBannerProps,
  IDegradedBannerProps,
  IAiPanelProps,
  IAiPanelHeaderProps,
  ISuggestedPromptsProps as IChatBlockSuggestedPromptsProps,
  IVersionHistoryRecordProps,
  ILockedBannerProps,
} from "./blocks/chat/types"
export type { IProfileCardBlockProps } from "./blocks/profile/profile-card-block"
export type {
  IScaffoldRootProps,
  IScaffoldActionsProps,
  IScaffoldPanelProps,
  IScaffoldTabProps,
  IScaffoldSubPanelProps,
  IScaffoldInspectorProps,
  IPanelFloatingButtonProps,
  IPanelMenuButtonProps,
} from "./blocks/scaffold/type"
export type {
  IShellLayoutProps,
  IAnimatedSidebarProviderProps,
  IAnimatedSidebarTriggerProps,
  IAnimatedSidebarProps,
  IAnimatedSidebarMenuSubProps,
  IAnimatedSidebarMenuSubButtonProps,
  IAnimatedSidebarMenuButtonProps,
} from "./blocks/shell/type"
export type {
  IAISidebarProps,
  IAISidebarControllerProps,
  IResourceRowProps,
} from "./blocks/sidebar/type"
