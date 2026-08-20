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
    usage: `import { LoginBlock, useAuthFlow, useAuthFlowActions } from "@corpora/ui"

<LoginBlock onSubmit={async ({ email, password }) => login(email, password)} />

// Wired into the shared auth flow (needs <ExegiaProvider> at the root):
// the block keeps the password local; the flow tracks which step shows and
// what identifier is in flight, so CodeAuthBlock can pick it up masked.
const flow = useAuthFlow()
const { beginVerification, complete } = useAuthFlowActions()

{flow.step === "login" && (
  <LoginBlock
    onSubmit={async ({ email, password }) => {
      const result = await login(email, password)
      if (result.needsCode) beginVerification({ identifier: email })
      else complete(result.user) // signs the session in — see useAuthSession()
    }}
  />
)}`,
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
    usage: `import { CodeAuthBlock, useAuthFlow, useAuthFlowActions } from "@corpora/ui"

<CodeAuthBlock channel="sms" destination="•••-1234" onVerify={verifyCode} />

// From the shared auth flow: after beginVerification({ identifier, channel })
// the flow exposes the identifier already masked (y•••@example.com, •••4567).
const flow = useAuthFlow()
const { complete } = useAuthFlowActions()

{flow.step === "verify-code" && (
  <CodeAuthBlock
    channel={flow.channel}
    destination={flow.maskedIdentifier ?? undefined}
    onVerify={async (code) => complete(await api.verify(code))}
  />
)}`,
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
          "Identity on the card ({ name, username?, avatar?, initials?, presence? }). Initials fall back to the name's first and last word.",
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
        name: "variant",
        type: '"expanded" | "collapsed"',
        description:
          "collapsed folds the card to its avatar for an icon rail — name, handle and chevron animate to zero width, the avatar stays, title names the tile on hover, the accessible name is unchanged. Controlled when passed; unset, it follows the AnimatedPanel it sits in (a SidebarBlock footer folds with ⌘B on its own), else defaultVariant.",
      },
      {
        name: "defaultVariant / onVariantChange",
        type: '"expanded" | "collapsed" / (variant) => void',
        default: '"expanded"',
        description:
          "Uncontrolled start value, and the change report (fires for store-driven changes too).",
      },
      {
        name: "profileCardId",
        type: "string",
        description:
          "Names this card's slice of the Jotai store: useProfileCardState(id) reads variant / menuOpen / busy, useProfileCardActions(id) folds it or opens its menu from anywhere under ExegiaProvider. Unnamed cards key off useId and are dropped on unmount.",
      },
      {
        name: "presence / avatarId",
        type: '"online" | "offline" / string',
        description:
          "Presence badge on the avatar (presence overrides user.presence). avatarId names the avatar in the store so useUserAvatarActions(id).setPresence() can flip the badge from a socket handler.",
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
    usage: `import { ProfileCardBlock, useAuthSession, useAuthSessionActions } from "@corpora/ui"

// The signed-in AuthUser from the shared session drops straight in, and
// signOut clears the session and returns the auth flow to the login step.
const { user } = useAuthSession()
const { signOut } = useAuthSessionActions()

<ProfileCardBlock
  user={user ?? { name: "Jenny Hamilton", username: "@jennycodes", avatar: src }}
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
      "Nested tree of projects, folders, files and bookmarks for a workspace rail. Rows drag to reorder or reparent, rename in place, and carry a per-row actions menu. Optimistic moves roll back when the handler rejects.",
    category: "blocks",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/resource-tree-demo")),
    registryDependencies: ["button", "menu"],
    props: [
      {
        name: "items / defaultItems",
        type: "SidebarResource[]",
        description:
          'The tree. A resource is { id, label, kind, children?, disabled? } where kind is "project" | "folder" | "file" | "bookmark". Pass `items` to control the tree, `defaultItems` to let it own its own state.',
      },
      {
        name: "onItemsChange",
        type: "(items) => void",
        description:
          "Fires with the whole tree after any structural change — a move, a rename. This is the uncontrolled escape hatch; use it to persist.",
      },
      {
        name: "onMove",
        type: "(move) => void | Promise<void>",
        description:
          'A drag landed: { itemId, targetId, position } where position is "before" | "inside" | "after" and targetId is null at the root. The move is applied optimistically — reject the promise to roll it back.',
      },
      {
        name: "onMoveError",
        type: "(error, move) => void",
        description:
          "Fires after a rejected `onMove` has been rolled back, so you can surface the failure.",
      },
      {
        name: "onRename",
        type: "(item, label) => void | Promise<void>",
        description: "A row committed an in-place rename with the new label.",
      },
      {
        name: "activeId / defaultActiveId / onActiveChange",
        type: "string | null / string | null / (id) => void",
        description:
          "The selected row. Controlled via `activeId`, uncontrolled via `defaultActiveId`.",
      },
      {
        name: "expandedIds / defaultExpandedIds / onExpandedChange",
        type: "string[] / string[] / (ids) => void",
        description:
          "Which rows are open. Controlled via `expandedIds`, uncontrolled via `defaultExpandedIds`.",
      },
      {
        name: "controller",
        type: "AISidebarController",
        description:
          "A useAISidebar() controller, in place of the data and handler props. Every behaviour — select, expand/collapse (one row, all rows, or the ancestors of one), move focus, rename, open a row's menu, reorder — becomes callable from outside the block.",
      },
      {
        name: "renderIcon",
        type: "(item) => ReactNode",
        description: "Replaces the default per-kind icon.",
      },
      {
        name: "renderMenu",
        type: "(item, controls) => ReactNode",
        description:
          "Contents of a row's actions popover. `controls` carries { close, rename } so a custom item can start an in-place rename.",
      },
      {
        name: "renderActionsTrigger",
        type: "(item) => ReactElement",
        description:
          'Replaces the default "…" actions button. Must return a single element — the popover clones it to attach its trigger ref and click handler.',
      },
      {
        name: "ariaLabel",
        type: "string",
        description: "Accessible name for the tree.",
      },
      {
        name: "sidebarId",
        type: "string",
        description:
          "Names this instance in the shared store so useAISidebarState(id) / useAISidebarActions(id) can reach it from anywhere under ExegiaProvider. A named sidebar keeps its state across unmounts — call removeAISidebarInstance(id) on teardown. Unnamed sidebars are dropped on unmount.",
      },
    ],
    usage: `import {
  Sidebar,
  useAISidebar,
  useAISidebarActions,
  useAISidebarState,
  type SidebarResource,
} from "@corpora/ui"

// Props form — the block owns its state.
<Sidebar.Wrapper
  defaultItems={resources}
  defaultExpandedIds={["corpora"]}
  defaultActiveId="codex-a"
  onActiveChange={setActiveId}
  onMove={(move) => persistMove(move)}
/>

// Controller form — drive it from anywhere.
const sidebar = useAISidebar({ defaultItems: resources })

<Sidebar.Wrapper controller={sidebar} />
<Button onClick={sidebar.collapseAll}>Collapse all</Button>
<Button onClick={() => sidebar.startRename(sidebar.selectedId!)}>Rename</Button>

// By id — no controller to pass around. Needs <ExegiaProvider> at the root.
<Sidebar.Wrapper sidebarId="app-resources" defaultItems={resources} />

// …anywhere else in the app:
const resources = useAISidebarActions("app-resources") // writes only, never re-renders
const { selectedId } = useAISidebarState("app-resources") // subscribes to the sidebar
<Button onClick={() => selectedId && resources.reveal(selectedId)}>Reveal</Button>`,
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
        name: "panels",
        type: "TPanelMap",
        description:
          "Panel content keyed by side. `left` fills the collapsible icon rail, `right` fills the offcanvas drawer — it has no icon state, it is either fully shown or fully hidden. Each panel's own `open`/`defaultOpen` seeds its side's initial state, and its optional `trigger` node replaces the default icon inside that side's header trigger.",
      },
      {
        name: "open / defaultOpen / onOpenChange",
        type: "Partial<Record<Side, boolean>> ×2 / (open, side) => void",
        description:
          "Side-keyed control of the panels — no per-side props. ⌘B toggles the left rail. The `openMobile` family has the same shape for the mobile overlays. Spread `useShellPanels().providerProps` instead of wiring them by hand.",
      },
      {
        name: "shellId / defaultPanelWidth",
        type: "string / number",
        description:
          "The shell measures itself (rail + body + panel floors vs. the viewport) and files the verdict in Jotai atoms under `shellId` — whether the secondary panel fits, its px width, its resize bounds. Name the id to read it anywhere below `ExegiaProvider` with `useShellFitState(id)` / drive it with `useShellFitActions(id)`, and to keep a dragged width across a route change. `defaultPanelWidth` seeds the panel's opening width instead of `--panel-width`. Column widths are CSS variables on the provider (`--sidebar-width`, `--panel-width`, `--inset-min-width`) — override them by restyling.",
      },
    ],
    usage: `import { ShellLayout, useShellPanels, useShellFitActions } from "@corpora/ui"

function App() {
  const panels = useShellPanels({
    shellId: "app-shell",
    onPanelChange: (open, side) => console.log(side, open ? "expanded" : "collapsed"),
  })

  return (
    <ShellLayout
      {...panels.providerProps}
      variant="web"
      panels={{
        right: { id: "inspector", name: "Inspector", side: "right", open: false, component: <Inspector /> },
      }}
    >
      <Dashboard />
    </ShellLayout>
  )
}

// panels.toggle("right") from anywhere — a title-bar button, a shortcut.
// panels.isNarrow / panels.panelWidth mirror the shell's own measurement.
// Or by id, from any component under ExegiaProvider:
const inspector = useShellFitActions("app-shell")
inspector.resizePanel(480)`,
  },
  {
    slug: "scaffold",
    name: "Scaffold",
    description:
      "Composable desktop workspace: an icon rail on a soft gradient backdrop, a canvas of closable/swappable panels, a floating actions cluster, and an inspector drawer that slides in over the canvas.",
    category: "blocks",
    status: "in-progress",
    preview: React.lazy(() => import("./demos/scaffold-demo")),
    registryDependencies: [],
    props: [
      {
        name: "Root · scaffoldId / inspectorOpen / defaultInspectorOpen / onInspectorOpenChange",
        type: "string / boolean / boolean / (open) => void",
        description:
          "State lives in Jotai atom families keyed by `scaffoldId` — omit it and the root keys off `useId`, dropping its state on unmount; name it and the state outlives the component, with `useScaffoldState(id)` / `useScaffoldActions(id)` reading and driving it from anywhere (title-bar buttons, a command palette, shortcuts). `useScaffold().providerProps` carries an id for you. A controlled `inspectorOpen` stays the source of truth: store writes are gated off and actions report through `onInspectorOpenChange`. `inspectorWidth` (px, default 272) sizes the drawer and how far Actions slides aside.",
      },
      {
        name: "Panel · id / SecondaryPanel / onSwap / onCloseSecondary",
        type: "string / ReactNode / () => void / () => void",
        description:
          "`id` opts the panel into responsive hiding: each id'd panel keeps at least `SCAFFOLD_PANEL_MIN_WIDTH` (320px), and when the canvas can't grant every panel that width the scaffold hides panels (least-recently-activated first) until the rest fit — pair with a `Scaffold.Tab` carrying the matching `panelId`. `SecondaryPanel` renders the utility strip as its own card below the primary surface, with the seam menu between the two — a ⋯ toggle that morphs into Expand | Swap | Close. `onSwap` powers Swap: a layout morph trades the two cards; flip the slot content in the callback. `onCloseSecondary` powers Close — remove `SecondaryPanel` there. Panels themselves close from the Actions tabs, and flex to share the canvas.",
      },
      {
        name: "Actions · onAdd / children",
        type: "() => void / ReactNode",
        description:
          "The pill cluster in the top-right (the design's panel context menu). `onAdd` powers the Add segment, which renders only while present — omit it once the canvas holds `SCAFFOLD_PANEL_CAPACITY` (3) panels. Children render before Add: one `Scaffold.Tab` per open panel, plus any extra segments.",
      },
      {
        name: "Tab · children / panelId / onClose / closeLabel",
        type: "ReactNode / string / () => void / string",
        description:
          "A panel's tab inside the Actions pill — its label plus a close button. With `panelId` (a `Scaffold.Panel`'s `id`) the tab fronts that panel's visibility: a hidden panel dims its tab behind an eye-off icon, and pressing the label toggles it — showing one past capacity hides the least-recently-activated panel in its place. Hovering the tab spotlights its panel — every other id'd panel fades to 0.35 opacity. The close button renders only while `onClose` is present; omit it on the last remaining panel's tab so at least one panel stays open. Key each tab — closes animate out of the pill.",
      },
      {
        name: "Inspector · name / children",
        type: "string / ReactNode",
        description:
          "Drawer content. Stays mounted and inert while closed so it can slide back out; opening also slides the Actions cluster leftward in step.",
      },
    ],
    usage: `import { Scaffold, SCAFFOLD_PANEL_CAPACITY, useScaffold } from "@corpora/ui"

function App() {
  const scaffold = useScaffold()

  return (
    <Scaffold.Root {...scaffold.providerProps} className="h-svh">
      <Scaffold.Sidebar>{/* icon buttons */}</Scaffold.Sidebar>
      <Scaffold.Main>
        <Scaffold.Actions onAdd={panels.length < SCAFFOLD_PANEL_CAPACITY ? addPanel : undefined}>
          <Scaffold.Tab key="draft" onClose={panels.length > 1 ? close : undefined}>Draft</Scaffold.Tab>
        </Scaffold.Actions>
        <Scaffold.Canvas>
          <Scaffold.Panel key="draft" SecondaryPanel={<PromptBar />} onSwap={swap} onCloseSecondary={hidePromptBar}>
            <Editor />
          </Scaffold.Panel>
        </Scaffold.Canvas>
        <Scaffold.Inspector>
          <Details />
        </Scaffold.Inspector>
      </Scaffold.Main>
    </Scaffold.Root>
  )
}

// scaffold.toggleInspector() from anywhere — a rail icon, a shortcut.
// Or skip the hook: name the instance and drive it by id, no controller held.
//   <Scaffold.Root scaffoldId="workspace" />
//   useScaffoldActions("workspace").toggleInspector()
//   useScaffoldState("workspace").hiddenPanelIds`,
  },
]
