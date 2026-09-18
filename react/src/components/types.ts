import type * as NAtomsProps from "./atoms/types"
import type * as NComposedProps from "./composed/types"
import type * as NBlockProps from "./blocks/types"
import type * as NIconsProps from "./icons/types"

// Type-only namespace exports cannot be reflected with `typeof`/`keyof`.
// Keep these lists aligned with the exported *Props types, not state or options.
type TAtomsProps =
  | NAtomsProps.IReferenceProps
  | NAtomsProps.IInputFieldProps
  | NAtomsProps.ILoaderProps
  | NAtomsProps.IAvatarProps<NAtomsProps.TUserType>
  | NAtomsProps.ITextureProps
  | NAtomsProps.IBubbleProps
  | NAtomsProps.TBubbleMessageProps
  | NAtomsProps.TBubbleHeaderProps
  | NAtomsProps.IBubbleReactionsProps
  | NAtomsProps.TBubbleActionsProps
  | NAtomsProps.IBubbleReactionChipProps
  | NAtomsProps.TBubbleReactionsButtonProps
  | NAtomsProps.TTextProps
  | NAtomsProps.THeadingProps
  | NAtomsProps.TSpanProps
  | NAtomsProps.TParagraphProps
  | NAtomsProps.TLabelProps
  | NAtomsProps.ISelectionRenderProps
  | NAtomsProps.THighlightPopoverPrimitiveProps
  | NAtomsProps.IHighlightPopoverProps
  | NAtomsProps.ITextSelectionProps
  | NAtomsProps.ITextPopoverRenderProps
  | NAtomsProps.ITextClickPopoverProps

// Instantiate generic props at their declared domains. Stories still infer the
// concrete component's props (including narrower generic arguments) separately.
type TComposedProps =
  | NComposedProps.IActionButtonProps<string>
  | NComposedProps.IActionBarProps
  | NComposedProps.IEmojiActionBarProps
  | NComposedProps.IStreamingTextProps
  | NComposedProps.TAIContentProps<NComposedProps.TAIMessageType>
  | NComposedProps.IAIMessageProps<NComposedProps.TAIMessageType>
  | NComposedProps.IFlowchartProps
  | NComposedProps.IConnectorProps
  | NComposedProps.IChartNodeProps
  | NComposedProps.IRecommendationItemProps
  | NComposedProps.IRecommendationCardProps
  | NComposedProps.IUserBaseProps<NAtomsProps.TUserType, NComposedProps.TUserVariant>
  | NComposedProps.IUserMessageProps<NAtomsProps.TUserType>
  | NComposedProps.TUserInfoProps<NAtomsProps.TUserType>
  | NComposedProps.TUserPillProps<NAtomsProps.TUserType>
  | NComposedProps.IVerseProps
  | NComposedProps.TVerseSpanProps
  | NComposedProps.TVerseNoteProps

type TBlockProps =
  | NBlockProps.IRecommendationStackProps
  | NBlockProps.IPinnedThreadBannerProps
  | NBlockProps.IDegradedBannerProps
  | NBlockProps.IAiPanelProps
  | NBlockProps.IAiPanelHeaderProps
  | NBlockProps.ISuggestedPromptsProps
  | NBlockProps.IVersionHistoryRecordProps
  | NBlockProps.ILockedBannerProps
  | NBlockProps.IAISidebarProps
  | NBlockProps.TAISidebarViewProps
  | NBlockProps.IAISidebarControllerProps
  | NBlockProps.TAISidebarComponentProps
  | NBlockProps.ISignupBlockProps
  | NBlockProps.IForgotPasswordBlockProps
  | NBlockProps.ILoginBlockProps
  | NBlockProps.ICodeAuthBlockProps
  | NBlockProps.IOnboardingBlockProps
  | NBlockProps.IPasskeySignInBlockProps
  | NBlockProps.IPasskeyManagerBlockProps
  | NBlockProps.IUpdatePasswordBlockProps
  | NBlockProps.ILinkedAccountsBlockProps
  | NBlockProps.IAuthFlowBlockProps
  | NBlockProps.IAISidebarProps
  | NBlockProps.IAiPanelHeaderProps
  | NBlockProps.IResourceRowProps
  | NBlockProps.IScaffoldRootProps
  | NBlockProps.TScaffoldSidebarProps
  | NBlockProps.TScaffoldMainProps
  | NBlockProps.TScaffoldCanvasProps
  | NBlockProps.IScaffoldActionsProps
  | NBlockProps.IScaffoldPanelProps
  | NBlockProps.IScaffoldTabProps
  | NBlockProps.IScaffoldSubPanelProps
  | NBlockProps.IScaffoldInspectorProps
  | NBlockProps.IPanelFloatingButtonProps
  | NBlockProps.IPanelMenuButtonProps
  | NBlockProps.TShellPanelControlProps
  | NBlockProps.IShellLayoutProps
  | NBlockProps.IAnimatedSidebarProviderProps
  | NBlockProps.TAnimatedSidebarInsetProps
  | NBlockProps.IAnimatedSidebarTriggerProps
  | NBlockProps.IAnimatedSidebarProps
  | NBlockProps.IAnimatedSidebarMenuSubProps
  | NBlockProps.IAnimatedSidebarMenuSubButtonProps
  | NBlockProps.IAnimatedSidebarMenuButtonProps

type TIconsProps = NIconsProps.IFileIconProps

/** Catalog of namespace-exported props, not a shared component call signature. */
type TStoryComponentProps = TAtomsProps | TComposedProps | TBlockProps | TIconsProps
export type { NAtomsProps, NComposedProps, NBlockProps, NIconsProps, TStoryComponentProps }
