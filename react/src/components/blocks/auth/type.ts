import type { TSocialProvider } from "@/components/composed/types";
import type { TAuthAccent } from "@/lib/auth-accent";

export interface IUpdatePasswordBlockProps {
  title?: string;
  description?: string;
  /** Brand mark rendered above the title. Omit for no logo row at all. */
  logo?: React.ReactNode;
  /** Brand accent for the primary action. Omit to keep the default primary. */
  accent?: TAuthAccent;
  /**
   * Minimum strength (0-4, as scored by `getPasswordStrength`) the new
   * password must reach before the confirm field is revealed. 0 disables the
   * gate.
   */
  minStrength?: number;
  /** Reject (or throw) to show the error state with the error's message. */
  onSubmit?: (data: { password: string }) => Promise<void> | void;
  onDone?: () => void;
}

export interface ISignupBlockProps {
  title?: string;
  description?: string;
  /**
   * Replaces the built-in "terms" link inside the consent label — pass your
   * own dialog trigger to render it inline instead of wiring `onTerms`.
   */
  termsComponent?: React.ReactNode;
  /** Brand mark rendered above the title. Omit for no logo row at all. */
  logo?: React.ReactNode;
  /** Brand accent for the primary action. Omit keeping the default primary. */
  accent?: TAuthAccent;
  providers?: TSocialProvider[];
  showNameField?: boolean;
  /** Require the term checkbox before submitting. */
  showTerms?: boolean;
  /**
   * Controls the term checkbox. Pass it with `onTermsCheckedChange` when
   * something outside the block has to tick the box — an "I agree" action in
   * your own terms dialog, say. Omit letting the block own the state.
   */
  termsChecked?: boolean;
  /** Starting state of the term checkbox while it is uncontrolled. */
  defaultTermsChecked?: boolean;
  /** Fires on every change, controlled or not. */
  onTermsCheckedChange?: (checked: boolean) => void;
  /** Block submission until every password requirement is met. */
  enforceStrongPassword?: boolean;
  onSubmit?: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void> | void;
  onProviderSelect?: (provider: TSocialProvider) => Promise<void> | void;
  onLogin?: () => void;
  onTerms?: () => void;
}

export interface IPasskeySignInBlockProps {
  /**
   * Whether this device can use passkeys. `false` renders nothing at all —
   * a passkey button that is guaranteed to fail is worse than no button.
   */
  available?: boolean;
  /** Button label. */
  label?: string;
  /**
   * Reject (or throw) to show the inline error. Resolving with
   * `{ cancelled: true }` returns silently to idle — a dismissed OS prompt is
   * not a failure and must not surface an error.
   */
  onSignIn?: () => Promise<{ cancelled?: boolean } | void> | void;
  /** Hint shown under an error, pointing at the remaining sign-in methods. */
  fallbackHint?: React.ReactNode;
  className?: string;
}

/** One registered passkey, as rendered by {@link PasskeyManagerBlock}. */
export interface IPasskeyRecord {
  id: string
  /** Server-derived name; falls back to "Passkey" when absent. */
  name?: string | null
  /** ISO timestamps. Unparseable values are simply not shown. */
  createdAt?: string | null
  lastUsedAt?: string | null
}

/** Value a single onboarding field can hold. */
export type TOnboardingValue = string | boolean;

export interface IOnboardingSelectOption {
  value: string;
  label: string;
}

interface IOnboardingFieldBase {
  /** Key the value is collected under; unique within the flow. */
  name: string;
  label: string;
  /** Required fields gate the step's advance. */
  required?: boolean;
  placeholder?: string;
  /** Extra validation; return a message to reject, `null` to accept. */
  validate?: (value: string) => string | null;
}

export interface IOnboardingTextField extends IOnboardingFieldBase {
  kind: "text" | "textarea" | "url";
}

export interface IOnboardingCheckboxField extends IOnboardingFieldBase {
  kind: "checkbox";
}

export interface IOnboardingSelectField extends IOnboardingFieldBase {
  kind: "select";
  options: IOnboardingSelectOption[];
}

/** Discriminated on `kind`. */
export type TOnboardingFieldConfig =
  | IOnboardingTextField
  | IOnboardingCheckboxField
  | IOnboardingSelectField;

export interface IOnboardingStepConfig {
  /** Unique within the flow and stable across releases. */
  id: string;
  title: string;
  description?: string;
  fields: TOnboardingFieldConfig[];
}

export interface IOnboardingBlockProps {
  /** Declared profile steps. */
  steps?: IOnboardingStepConfig[];
  /** Brand mark rendered above the title. Omit for no logo row at all. */
  logo?: React.ReactNode;
  /** Brand accent for the primary action. Omit to keep the default primary. */
  accent?: TAuthAccent;
  /**
   * Fires per step as it is submitted. Reject (or throw) to keep the user on
   * the step and show the error.
   */
  onStepSubmit?: (
    stepId: string,
    values: Record<string, TOnboardingValue>,
  ) => Promise<void> | void;
  /** Fires once, after the final step is accepted, with the merged profile. */
  onComplete?: (profile: Record<string, TOnboardingValue>) => Promise<void> | void;
  /** Shows a brief success screen once onboarding completes. */
  showCompleteScreen?: boolean;
  /** Move focus to step headings. Disable when embedding a gallery preview. */
  autoFocus?: boolean;
  className?: string;
}

export interface ILoginBlockProps {
  title?: string;
  description?: string;
  /** Brand mark rendered above the title. Omit for no logo row at all. */
  logo?: React.ReactNode;
  /** Brand accent for the primary action. Omit to keep the default primary. */
  accent?: TAuthAccent;
  /** Social providers to offer; empty array hides the social section. */
  providers?: TSocialProvider[];
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
  /** Reject (or throw) to show the error state with the error's message. */
  onSubmit?: (data: {
    email: string;
    password: string;
    remember: boolean;
  }) => Promise<void> | void;
  onProviderSelect?: (provider: TSocialProvider) => Promise<void> | void;
  onForgotPassword?: () => void;
  onSignup?: () => void;
}

/** One sign-in identity attached to the account. */
export interface ILinkedIdentity {
  id: string
  provider: TSocialProvider
  /** Account address shown under the provider name, when known. */
  email?: string | null
}

export interface ILinkedAccountsBlockProps {
  title?: string
  description?: string
  /** Identities already attached to the account. */
  identities?: ILinkedIdentity[]
  /** Providers offered as connect candidates; connected ones are filtered out. */
  providers?: TSocialProvider[]
  /** Shows the loading row instead of the list. */
  loading?: boolean
  /**
   * The account can also sign in through a method that has no row in this
   * list — an email/password credential, say. Lifts the last-method guard,
   * which otherwise refuses to disconnect the final listed identity.
   */
  hasOtherSignInMethods?: boolean
  /** Reject (or throw) to show the inline error. */
  onLink?: (provider: TSocialProvider) => Promise<void> | void
  onUnlink?: (id: string) => Promise<void> | void
  className?: string
}


export interface IForgotPasswordBlockProps {
  title?: string;
  description?: string;
  /** Brand mark rendered above the title. Omit for no logo row at all. */
  logo?: React.ReactNode;
  /** Brand accent for the primary action. Omit to keep the default primary. */
  accent?: TAuthAccent;
  onSubmit?: (data: { email: string }) => Promise<void> | void;
  onBackToLogin?: () => void;
}


export interface ICodeAuthBlockProps {
  /** Brand mark rendered above the title. Omit for no logo row at all. */
  logo?: React.ReactNode;
  /** Brand accent for the primary action. Omit to keep the default primary. */
  accent?: TAuthAccent;
  /** Where the code was sent; drives copy and icon. */
  channel?: "email" | "sms";
  /** Masked destination shown in the description, e.g. "y•••@example.com". */
  destination?: string;
  length?: number;
  /** Submit automatically once all digits are entered. */
  autoSubmit?: boolean;
  /** Seconds before "Resend code" becomes available. 0 disables the wait. */
  resendSeconds?: number;
  /** Reject (or throw) to show the error shake and clear the code. */
  onVerify?: (code: string) => Promise<void> | void;
  onResend?: () => Promise<void> | void;
  onBack?: () => void;
}


export type TAuthFlowId = string

/** Which auth block the app is showing. */
export type TAuthFlowStep =
  | "login"
  | "signup"
  | "verify-code"
  | "forgot-password"
  | "update-password"
  | "onboarding"
  | "success"

export type TAuthFlowChannel = "email" | "sms"

export interface IAuthFlowState {
  step: TAuthFlowStep
  /** The identifier in flight — an email or phone number. Cleared by reset
   * and by signOut. Never store passwords or codes here. */
  identifier: string | null
  /** `identifier` masked for display — "y•••@example.com", "•••1234". */
  maskedIdentifier: string | null
  channel: TAuthFlowChannel
  status: TAuthStatus
  error: string | null
}

/** Options for `beginAuthVerificationAtom` / `beginVerification`. */
export interface IBeginAuthVerificationOptions {
  identifier: string
  /** @default "email" */
  channel?: TAuthFlowChannel
  /** @default "verify-code" */
  step?: TAuthFlowStep
}

/** What `useAuthFlowActions(flowId)` returns. */
export interface IAuthFlowActions {
  /** Show a step; resets status to `"idle"` and clears the error. Keeps the
   * identifier. */
  goToStep: (step: TAuthFlowStep) => void
  /** Record the identifier in flight and move to the verification step. */
  beginVerification: (options: IBeginAuthVerificationOptions) => void
  /** Mark the flow `"loading"` while an async attempt is in flight. */
  beginAttempt: () => void
  /** Mark the flow `"error"` with a message. */
  fail: (message: string) => void
  /** Mark the flow `"success"`; when a user is given, also sign the session
   * in. */
  complete: (user?: IAuthUser) => void
  /** Back to the initial values (login step, no identifier). */
  reset: () => void
}

/** The signed-in identity, kept for the whole session. Structurally
 * assignable to `ProfileCardUser`, so it drops into `ProfileCardBlock`. */
export interface IAuthUser {
  id: string
  name: string
  /** Secondary line — a handle, an email, a role. */
  username?: string
  email?: string
  /** Avatar image URL. */
  avatar?: string
  initials?: string
  /** App-specific extras the library never interprets. */
  metadata?: Record<string, unknown>
}

/** `unknown` until the app restores or rejects a session at boot. */
export type TAuthSessionStatus = "unknown" | "unauthenticated" | "authenticated"

export interface IAuthSessionState {
  status: TAuthSessionStatus
  user: IAuthUser | null
}

/** What `useAuthSessionActions()` returns. */
export interface IAuthSessionActions {
  signIn: (user: IAuthUser) => void
  /** Shallow-merge a patch into the signed-in user; no-op when signed out. */
  updateUser: (patch: Partial<IAuthUser>) => void
  /** What an app calls at boot when session restore fails. */
  markUnauthenticated: () => void
  /** Sign out AND return the default auth flow to the login step. */
  signOut: () => void
}

export type TAuthStatus = "idle" | "loading" | "success" | "error";

export type TAuthFlowDirective =
  | { user: IAuthUser }
  | { verify: IBeginAuthVerificationOptions }
  | { step: TAuthFlowStep }
  | void

export type TAuthFlowHandler<Data = void> = (
  data: Data
) => Promise<TAuthFlowDirective> | TAuthFlowDirective

/** Per-step prop overrides, merged over the orchestrator's wiring — spread
 * last, so an app can restyle a block or unhook a default navigation link
 * (`{ login: { onSignup: undefined } }` removes the sign-up hand-off). */
export interface IAuthFlowStepOverrides {
  login?: Partial<ILoginBlockProps>
  signup?: Partial<ISignupBlockProps>
  "verify-code"?: Partial<ICodeAuthBlockProps>
  "forgot-password"?: Partial<IForgotPasswordBlockProps>
  "update-password"?: Partial<IUpdatePasswordBlockProps>
  onboarding?: Partial<IOnboardingBlockProps>
}

export interface IAuthFlowBlockProps {
  /** Which flow instance to orchestrate. The default flow unless a re-auth
   * modal or a second surface needs its own. */
  flowId?: TAuthFlowId
  /** Brand mark handed to every step's card. */
  logo?: React.ReactNode
  /** Brand accent handed to every step's card. */
  accent?: TAuthAccent
  /** Social providers offered on the login and signup steps. */
  providers?: TSocialProvider[]
  /** The login attempt. Resolve with a directive; reject to show the error
   * in the block. */
  onLogin?: TAuthFlowHandler<{
    email: string
    password: string
    remember: boolean
  }>
  /** The signup attempt. */
  onSignup?: TAuthFlowHandler<{ name: string; email: string; password: string }>
  /** A social provider chosen on the login or signup step. */
  onProviderSelect?: TAuthFlowHandler<TSocialProvider>
  /** The forgot-password request. Resolving without a directive stays on the
   * step (the block shows its own "link sent" state). */
  onRequestReset?: TAuthFlowHandler<{ email: string }>
  /** The code entered on the verification step. */
  onVerifyCode?: TAuthFlowHandler<string>
  /** "Resend code" on the verification step. */
  onResendCode?: TAuthFlowHandler
  /** The update-password submit. */
  onUpdatePassword?: TAuthFlowHandler<{ password: string }>
  /** Onboarding finished, with the merged profile. */
  onOnboardingComplete?: TAuthFlowHandler<Record<string, TOnboardingValue>>
  /** Declared onboarding steps, handed to `OnboardingBlock`. */
  onboardingSteps?: IOnboardingStepConfig[]
  /** Per-step prop overrides, merged over the orchestrator's wiring. */
  steps?: IAuthFlowStepOverrides
  /** Replace any step's UI entirely; return `undefined` to keep the default
   * for that step. Receives the flow state for destination copy etc. */
  renderStep?: (
    step: TAuthFlowStep,
    flow: IAuthFlowState
  ) => React.ReactNode | undefined
  /** Replaces the whole default success card. */
  success?: React.ReactNode
  /** Card title of the default success step. */
  successTitle?: string
  /** Body under the default success step's "You're signed in" check. */
  successDescription?: string
  className?: string
}

export interface IProfileStepProps {
  step: IOnboardingStepConfig;
  /** Seed values, so drafts survive back/forward navigation. */
  values: Record<string, TOnboardingValue>;
  submitting?: boolean;
  submitLabel: string;
  onSubmit: (values: Record<string, TOnboardingValue>) => void | Promise<void>;
  onBack?: () => void;
  /** Reports every edit so the flow can restore drafts across navigation. */
  onDraftChange?: (name: string, value: TOnboardingValue) => void;
}

export interface IPasskeyManagerBlockProps {
  title?: string
  description?: string
  /** The account's passkeys, newest first. */
  passkeys?: IPasskeyRecord[]
  /** Whether this device can register passkeys at all. */
  available?: boolean
  /** Shows the loading row instead of the list. */
  loading?: boolean
  /**
   * Reject (or throw) to show the error. Resolving with `{ cancelled: true }`
   * returns silently to idle — a dismissed OS prompt is not a failure.
   */
  onRegister?: () => Promise<{ cancelled?: boolean } | void> | void
  onRename?: (id: string, name: string) => Promise<void> | void
  onDelete?: (id: string) => Promise<void> | void
  className?: string
}

