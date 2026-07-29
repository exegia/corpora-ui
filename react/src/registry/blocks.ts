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
        name: "showNameField / showTerms",
        type: "boolean",
        default: "true",
        description: "Toggle the name field and terms checkbox.",
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
    slug: "navbar",
    name: "Navbar",
    description: "Application top navigation with branding and user menu.",
    category: "blocks",
    status: "planned",
  },
  {
    slug: "sidebar",
    name: "Sidebar",
    description: "Collapsible application sidebar navigation.",
    category: "blocks",
    status: "planned",
  },
]
