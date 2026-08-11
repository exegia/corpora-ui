import * as React from "react"

import type { RegistryEntry } from "./schema"

/**
 * Blocks — opinionated assemblies built for a single purpose.
 * Source lives in `src/components/blocks`.
 */
export const blocks: RegistryEntry[] = [
  {
    slug: "login",
    name: "Login",
    description:
      "Progressive login form: a valid email reveals the password field, a non-empty password reveals the submit button. Social providers, remember-me and animated success/error states.",
    category: "blocks",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/login-demo")),
    registryDependencies: [
      "card",
      "field",
      "input",
      "checkbox",
      "password-input",
      "social-providers",
    ],
    props: [
      {
        name: "logo",
        type: "React.ReactNode",
        description:
          "Brand mark rendered above the title. Omitted leaves no logo row at all.",
      },
      {
        name: "accent",
        type: '"corpora" | "exegia"',
        description:
          "Brand accent for the primary action \u2014 corpora is a solid #E8B124, exegia a purple gradient. Omit to keep the default primary.",
      },
      {
        name: "providers",
        type: "SocialProvider[]",
        default: '["google", "apple", "github"]',
        description: "Social providers; empty array hides the section.",
      },
      {
        name: "showRememberMe / showForgotPassword",
        type: "boolean",
        default: "true",
        description: "Toggle the secondary affordances.",
      },
      {
        name: "onSubmit",
        type: "(data) => Promise<void>",
        description:
          "Reject (or throw) to show the shaking error state with the error message.",
      },
    ],
    usage: `import { LoginBlock } from "@corpora/ui"

<LoginBlock onSubmit={async ({ email, password }) => login(email, password)} />`,
  },
  {
    slug: "signup",
    name: "Signup",
    description:
      "Account creation with a progressively revealed password field, password strength, terms consent and social providers.",
    category: "blocks",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/signup-demo")),
    registryDependencies: [
      "card",
      "field",
      "input",
      "checkbox",
      "password-input",
      "social-providers",
    ],
    props: [
      {
        name: "logo",
        type: "React.ReactNode",
        description:
          "Brand mark rendered above the title. Omitted leaves no logo row at all.",
      },
      {
        name: "accent",
        type: '"corpora" | "exegia"',
        description:
          "Brand accent for the primary action \u2014 corpora is a solid #E8B124, exegia a purple gradient. Omit to keep the default primary.",
      },
      {
        name: "showNameField / showTerms",
        type: "boolean",
        default: "true",
        description: "Toggle the name field and terms checkbox.",
      },
      {
        name: "termsChecked / onTermsCheckedChange",
        type: "boolean / (checked: boolean) => void",
        description:
          "Control the terms checkbox from outside \u2014 an \u201cI agree\u201d action in your own terms dialog, say. Omit both to let the block own it; defaultTermsChecked sets the uncontrolled starting state.",
      },
      {
        name: "termsComponent",
        type: "React.ReactNode",
        description:
          "Replaces the built-in \u201cterms\u201d link inside the consent label \u2014 pass your own dialog trigger to render it inline instead of wiring onTerms.",
      },
      {
        name: "enforceStrongPassword",
        type: "boolean",
        default: "true",
        description: "Block submission until all password requirements pass.",
      },
      {
        name: "onSubmit",
        type: "(data) => Promise<void>",
        description: "Reject to surface the error state.",
      },
    ],
    usage: `import { SignupBlock } from "@corpora/ui"

<SignupBlock onSubmit={async (data) => createAccount(data)} />`,
  },
  {
    slug: "forgot-password",
    name: "Forgot Password",
    description:
      "Password reset request that morphs into a check-your-inbox confirmation.",
    category: "blocks",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/forgot-password-demo")),
    registryDependencies: ["card", "field", "input"],
    props: [
      {
        name: "logo",
        type: "React.ReactNode",
        description:
          "Brand mark rendered above the title. Omitted leaves no logo row at all.",
      },
      {
        name: "accent",
        type: '"corpora" | "exegia"',
        description:
          "Brand accent for the primary action \u2014 corpora is a solid #E8B124, exegia a purple gradient. Omit to keep the default primary.",
      },
      {
        name: "onSubmit",
        type: "({ email }) => Promise<void>",
        description: "Reject to surface the error state.",
      },
      {
        name: "onBackToLogin",
        type: "() => void",
        description: "Footer back-link handler.",
      },
    ],
    usage: `import { ForgotPasswordBlock } from "@corpora/ui"

<ForgotPasswordBlock onSubmit={({ email }) => sendResetLink(email)} />`,
  },
  {
    slug: "code-auth",
    name: "Code Authentication",
    description:
      "SMS/email one-time-code verification with auto-submit, resend countdown and error shake.",
    category: "blocks",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/code-auth-demo")),
    registryDependencies: ["card", "otp-field"],
    props: [
      {
        name: "logo",
        type: "React.ReactNode",
        description:
          "Brand mark rendered above the title. Omitted leaves no logo row at all.",
      },
      {
        name: "accent",
        type: '"corpora" | "exegia"',
        description:
          "Brand accent for the primary action \u2014 corpora is a solid #E8B124, exegia a purple gradient. Omit to keep the default primary.",
      },
      {
        name: "channel",
        type: '"email" | "sms"',
        default: '"email"',
        description: "Where the code was sent; drives copy and icon.",
      },
      {
        name: "length",
        type: "number",
        default: "6",
        description: "Code length.",
      },
      {
        name: "autoSubmit",
        type: "boolean",
        default: "true",
        description: "Verify as soon as all digits are entered.",
      },
      {
        name: "resendSeconds",
        type: "number",
        default: "30",
        description: "Countdown before resend becomes available.",
      },
      {
        name: "onVerify",
        type: "(code) => Promise<void>",
        description: "Reject to shake, clear the code and show the error.",
      },
    ],
    usage: `import { CodeAuthBlock } from "@corpora/ui"

<CodeAuthBlock channel="sms" destination="•••-1234" onVerify={verifyCode} />`,
  },
  {
    slug: "update-password",
    name: "Update password",
    description:
      "Password change for a signed-in user: a strength-metered new password reveals the confirm field, which reveals the submit button. Mismatches are caught before submit.",
    category: "blocks",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/update-password-demo")),
    registryDependencies: ["card", "field", "password-input"],
    props: [
      {
        name: "logo",
        type: "React.ReactNode",
        description:
          "Brand mark rendered above the title. Omitted leaves no logo row at all.",
      },
      {
        name: "accent",
        type: '"corpora" | "exegia"',
        description:
          "Brand accent for the primary action — corpora is a solid #E8B124, exegia a purple gradient. Omit to keep the default primary.",
      },
      {
        name: "minStrength",
        type: "number",
        default: "4",
        description:
          "Strength (0-4) the new password must reach before the confirm field is revealed. 0 disables the gate.",
      },
      {
        name: "onSubmit",
        type: "({ password }) => Promise<void>",
        description:
          "Reject (or throw) to show the error state with the error message.",
      },
      {
        name: "onDone",
        type: "() => void",
        description:
          "Adds a Continue link to the success panel. Omit to end on the panel.",
      },
    ],
    usage: `import { UpdatePasswordBlock } from "@corpora/ui"

<UpdatePasswordBlock onSubmit={async ({ password }) => updatePassword(password)} />`,
  },
  {
    slug: "passkey-sign-in",
    name: "Passkey sign-in",
    description:
      "Passkey entry point sized to sit inside a login card: one button plus its error state. Renders nothing when the device cannot use passkeys, and treats a cancelled OS prompt as a silent return to idle.",
    category: "blocks",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/passkey-sign-in-demo")),
    registryDependencies: ["button"],
    props: [
      {
        name: "available",
        type: "boolean",
        default: "true",
        description:
          "Whether this device can use passkeys. false renders nothing at all — a button guaranteed to fail is worse than no button.",
      },
      {
        name: "label",
        type: "string",
        default: '"Sign in with a passkey"',
        description: "Button label.",
      },
      {
        name: "onSignIn",
        type: "() => Promise<{ cancelled?: boolean } | void>",
        description:
          "Reject (or throw) to show the inline error. Resolve with { cancelled: true } to return silently to idle.",
      },
      {
        name: "fallbackHint",
        type: "React.ReactNode",
        description:
          "Shown under an error, pointing at the remaining sign-in methods.",
      },
    ],
    usage: `import { PasskeySignInBlock } from "@corpora/ui"

<PasskeySignInBlock available={capability.usable} onSignIn={signInWithPasskey} />`,
  },
  {
    slug: "passkey-manager",
    name: "Passkey manager",
    description:
      "Settings panel for the passkeys on an account: register, inline rename with validation, and delete behind a confirmation that warns when the last passkey is about to go.",
    category: "blocks",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/passkey-manager-demo")),
    registryDependencies: ["card", "button", "field", "input", "spinner"],
    props: [
      {
        name: "passkeys",
        type: "PasskeyRecord[]",
        default: "[]",
        description:
          "The account's passkeys ({ id, name?, createdAt?, lastUsedAt? }), newest first.",
      },
      {
        name: "available",
        type: "boolean",
        default: "true",
        description:
          "Whether this device can register passkeys. false swaps the panel for an explanation.",
      },
      {
        name: "loading",
        type: "boolean",
        default: "false",
        description: "Shows the loading row instead of the list.",
      },
      {
        name: "onRegister",
        type: "() => Promise<{ cancelled?: boolean } | void>",
        description:
          "Reject (or throw) to show the error. Resolve with { cancelled: true } to return silently to idle.",
      },
      {
        name: "onRename / onDelete",
        type: "(id, name?) => Promise<void>",
        description:
          "Rename is validated to 1-120 characters before it fires; delete only fires after the confirmation is accepted.",
      },
    ],
    usage: `import { PasskeyManagerBlock } from "@corpora/ui"

<PasskeyManagerBlock passkeys={passkeys} onRegister={register} onDelete={remove} />`,
  },
  {
    slug: "linked-accounts",
    name: "Linked accounts",
    description:
      "Settings panel for the sign-in identities on an account: lists the connected ones, offers connect buttons for the rest, and guards the last remaining method from being disconnected.",
    category: "blocks",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/linked-accounts-demo")),
    registryDependencies: ["card", "button", "spinner", "social-providers"],
    props: [
      {
        name: "identities",
        type: "LinkedIdentity[]",
        default: "[]",
        description:
          "Identities attached to the account ({ id, provider, email? }).",
      },
      {
        name: "providers",
        type: "SocialProvider[]",
        default: '["google", "apple", "github"]',
        description:
          "Connect candidates. Already-connected providers are filtered out.",
      },
      {
        name: "loading",
        type: "boolean",
        default: "false",
        description: "Shows the loading row instead of the list.",
      },
      {
        name: "onLink / onUnlink",
        type: "(provider | id) => Promise<void>",
        description:
          "Reject (or throw) to show the inline error. Unlink never fires for the last remaining identity.",
      },
    ],
    usage: `import { LinkedAccountsBlock } from "@corpora/ui"

<LinkedAccountsBlock identities={identities} onLink={link} onUnlink={unlink} />`,
  },
  {
    slug: "onboarding",
    name: "Onboarding",
    description:
      "Multi-step profile onboarding driven by a declared steps config: progress-tracked forms with back/forward navigation, per-step validation, draft restore and a single completion signal.",
    category: "blocks",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/onboarding-demo")),
    registryDependencies: [
      "card",
      "field",
      "input",
      "textarea",
      "checkbox",
      "button",
    ],
    props: [
      {
        name: "steps",
        type: "OnboardingStepConfig[]",
        default: "DEFAULT_ONBOARDING_STEPS",
        description:
          "Declared steps; each holds text, textarea, url, select and checkbox fields with optional required + validate rules.",
      },
      {
        name: "logo",
        type: "React.ReactNode",
        description:
          "Brand mark rendered above the title. Omitted leaves no logo row at all.",
      },
      {
        name: "accent",
        type: '"corpora" | "exegia"',
        description:
          "Brand accent for the primary action — corpora is a solid #E8B124, exegia a purple gradient. Omit to keep the default primary.",
      },
      {
        name: "onStepSubmit",
        type: "(stepId, values) => Promise<void>",
        description:
          "Fires per step. Reject (or throw) to keep the user on the step and show the error.",
      },
      {
        name: "onComplete",
        type: "(profile) => Promise<void>",
        description:
          "Fires once, after the final step is accepted, with the merged profile.",
      },
      {
        name: "showCompleteScreen",
        type: "boolean",
        default: "true",
        description:
          "Brief success screen once onboarding completes. false renders nothing instead.",
      },
    ],
    usage: `import { OnboardingBlock } from "@corpora/ui"

<OnboardingBlock steps={steps} onComplete={saveProfile} />`,
  },
  {
    slug: "profile-card",
    name: "Profile card",
    description:
      "Account card that opens an action menu: the trigger is a rich identity chip (avatar over name and handle), the popup a grouped menu ending in a destructive sign-out.",
    category: "blocks",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/profile-card-demo")),
    registryDependencies: ["user-avatar", "button", "menu"],
    props: [
      {
        name: "user",
        type: "ProfileCardUser",
        required: true,
        description:
          "Identity on the card ({ name, username?, avatar?, initials? }). Initials fall back to the name's first and last word.",
      },
      {
        name: "items",
        type: "ProfileCardItem[]",
        default: "defaultProfileCardItems",
        description:
          "The whole menu, flat: actions ({ id, label, icon?, shortcut?, disabled?, variant?, onSelect? }) plus { type: “separator” } and { type: “label”, label } entries. Each run between separators becomes its own group, headed by the label inside it.",
      },
      {
        name: "onSelect",
        type: "() => void | Promise<void>",
        description:
          "Per item. Returning a promise puts the card in its loading state until it settles; a rejection goes to onError.",
      },
      {
        name: "align / side / sideOffset",
        type: '"center" | "start" | "end" / Side / number',
        default: '"center" / "bottom" / 8',
        description: "Menu placement relative to the card.",
      },
      {
        name: "menuWidth",
        type: '"content" | "card"',
        default: '"content"',
        description:
          "“content” sizes the menu to its items; “card” locks it to the trigger's width.",
      },
      {
        name: "open / defaultOpen / onOpenChange",
        type: "boolean / boolean / (open, details) => void",
        description: "Control the menu, or observe it.",
      },
      {
        name: "sound",
        type: "boolean",
        default: "true",
        description:
          "Press/release cues on the card plus open/close cues on the menu. Inert until the app calls bindSounds().",
      },
    ],
    usage: `import { ProfileCardBlock } from "@corpora/ui"

<ProfileCardBlock
  user={{ name: "Jenny Hamilton", username: "@jennycodes", avatar: src }}
  items={[
    { type: "label", label: "Management" },
    { id: "profile", label: "Profile", icon: <UserIcon />, onSelect: () => navigate("/profile") },
    { type: "separator" },
    { id: "sign-out", label: "Log out", icon: <LogOutIcon />, variant: "destructive", onSelect: signOut },
  ]}
/>`,
  },
  {
    slug: "navbar",
    name: "Navbar",
    description: "Application top navigation with branding and user menu.",
    category: "blocks",
    status: "planned",
  },
  {
    slug: "sidebar",
    name: "Sidebar",
    description:
      "Collapsible application sidebar navigation, driven by section/item data. The navigation panel only — it claims no page layout. Collapses to an icon rail (⌘B), becomes a drawer under 768px, and animates the active pill between entries.",
    category: "blocks",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/sidebar-demo")),
    registryDependencies: ["animated-sidebar"],
    props: [
      {
        name: "sections",
        type: "SidebarNavSection[]",
        required: true,
        description:
          "Titled runs of entries — { id, label?, items }. An item is { id, label, icon?, href?, badge?, disabled?, target?, onSelect?, items? }; an item with `items` expands instead of navigating. Section titles hide while collapsed.",
      },
      {
        name: "activeId",
        type: "string",
        description:
          "Id of the current entry — top-level or nested. Drives the sliding active pill, aria-current, and auto-expands the parent of an active child.",
      },
      {
        name: "onNavigate",
        type: "(item) => void",
        description:
          "Fires for every selection, after the entry's own onSelect. Entries with children toggle instead and never fire it.",
      },
      {
        name: "header / footer",
        type: "React.ReactNode",
        description:
          "Brand row above the navigation, and a pinned area below it — an account card, a version note.",
      },
      {
        name: "collapsible / variant / side",
        type: '"icon" | "offcanvas" | "none" / "sidebar" | "floating" | "inset" / "left" | "right"',
        default: '"icon" / "sidebar" / "left"',
        description:
          "How the rail collapses, how the panel is framed, and which edge it sits on.",
      },
      {
        name: "open / defaultOpen / onOpenChange",
        type: "boolean / boolean / (open) => void",
        description:
          "Control the desktop rail. ⌘B toggles it either way. Uncontrolled by default (open).",
      },
      {
        name: "openMobile / defaultOpenMobile / onOpenMobileChange",
        type: "boolean / boolean / (open) => void",
        description:
          "Under 768px the panel is a modal drawer. The in-panel trigger can't reach it from outside, so open it from your own header button through these.",
      },
      {
        name: "width / iconWidth / mobileWidth",
        type: "string",
        default: '"16rem" / "4.25rem" / "18rem"',
        description: "Rail widths as CSS lengths.",
      },
      {
        name: "showTrigger",
        type: "boolean",
        default: "true",
        description: "Collapse toggle in the header row.",
      },
    ],
    usage: `import { SidebarBlock } from "@corpora/ui"

<SidebarBlock
  sections={[
    {
      id: "work",
      label: "Research",
      items: [
        { id: "search", label: "Search", icon: <SearchIcon /> },
        { id: "library", label: "Library", icon: <LibraryIcon />, items: [
          { id: "manuscripts", label: "Manuscripts" },
        ] },
      ],
    },
  ]}
  activeId={route}
  onNavigate={(item) => navigate(item.id)}
  footer={<ProfileCardBlock user={user} side="top" />}
/>`,
  },
  {
    slug: "shell",
    name: "Shell",
    description:
      "Inset application shell with a collapsible sidebar, workspace header, command-style search affordance, top actions, and scrollable content area.",
    category: "blocks",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/shell-demo")),
    registryDependencies: ["animated-sidebar", "sidebar"],
    props: [
      {
        name: "children",
        type: "React.ReactNode",
        description: "Main scrollable content rendered inside the inset panel.",
      },
      {
        name: "variant",
        type: '"web" | "desktop"',
        description:
          "Desktop reserves room at the top for a native title bar; web does not.",
      },
      {
        name: "open / defaultOpen / onOpenChange",
        type: "boolean / boolean / (open) => void",
        description:
          "Control or observe the left rail, which collapses to icons. ⌘B toggles it.",
      },
      {
        name: "rightDrawer",
        type: "React.ReactNode",
        description:
          "Content of the right drawer. Unlike the left rail it has no icon state — it is either fully shown or fully hidden.",
      },
      {
        name: "rightOpen / defaultRightOpen / onRightOpenChange",
        type: "boolean / boolean / (open) => void",
        description:
          "Control or observe the right drawer. The header trigger toggles it.",
      },
    ],
    usage: `import { ShellLayout } from "@corpora/ui"

<ShellLayout
  variant="web"
  defaultRightOpen
  rightDrawer={<Inspector />}
>
  <Dashboard />
</ShellLayout>`,
  },
]
