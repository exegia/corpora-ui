"use client"

import { LoginBlock } from "@/components/blocks/auth/login-block"
import { SignupBlock } from "@/components/blocks/auth/signup-block"
import { ForgotPasswordBlock } from "@/components/blocks/auth/forgot-password-block"
import { CodeAuthBlock } from "@/components/blocks/auth/code-auth-block"
import { UpdatePasswordBlock } from "@/components/blocks/auth/update-password-block"
import { PasskeySignInBlock } from "@/components/blocks/auth/passkey-sign-in-block"
import { PasskeyManagerBlock } from "@/components/blocks/auth/passkey-manager-block"
import { LinkedAccountsBlock } from "@/components/blocks/auth/linked-accounts-block"
import { OnboardingBlock } from "@/components/blocks/auth/onboarding-block"
import { AuthFlowBlock } from "@/components/blocks/auth/auth-flow-block"
import { ProfileCardBlock } from "@/components/blocks/profile/profile-card-block"
import { ShellLayout } from "@/components/blocks/shell/shell-layout"
import { Scaffold } from "@/components/blocks/scaffold"
import { AiPanel } from "@/components/blocks/chat/base"
import { GalleryTile } from "./atoms-gallery"

const blocks = [
  {
    slug: "login",
    name: "Login",
    blurb: "Progressive sign-in with social providers",
    preview: <LoginBlock />,
  },
  {
    slug: "signup",
    name: "Signup",
    blurb: "Account creation, password strength and consent",
    preview: <SignupBlock />,
  },
  {
    slug: "forgot-password",
    name: "Forgot password",
    blurb: "Reset requests and inbox confirmation",
    preview: <ForgotPasswordBlock />,
  },
  {
    slug: "code-auth",
    name: "Code authentication",
    blurb: "Email and SMS verification with resend controls",
    preview: <CodeAuthBlock channel="email" destination="r•••@example.com" />,
  },
  {
    slug: "update-password",
    name: "Update password",
    blurb: "Progressive password change with validation",
    preview: <UpdatePasswordBlock />,
  },
  {
    slug: "passkey-sign-in",
    name: "Passkey sign-in",
    blurb: "Passwordless entry with availability handling",
    preview: <PasskeySignInBlock available />,
  },
  {
    slug: "passkey-manager",
    name: "Passkey manager",
    blurb: "Manage registered devices and credentials",
    preview: (
      <PasskeyManagerBlock
        available
        passkeys={[{ id: "gallery-laptop", name: "Research laptop" }]}
      />
    ),
  },
  {
    slug: "linked-accounts",
    name: "Linked accounts",
    blurb: "Manage connected sign-in identities",
    preview: (
      <LinkedAccountsBlock
        identities={[
          {
            id: "gallery-github",
            provider: "github",
            email: "researcher@example.com",
          },
        ]}
      />
    ),
  },
  {
    slug: "onboarding",
    name: "Onboarding",
    blurb: "Guided profile setup with step validation",
    preview: <OnboardingBlock autoFocus={false} />,
  },
  {
    slug: "auth-flow",
    name: "Auth flow",
    blurb: "Connected login, verification and account setup",
    preview: <AuthFlowBlock flowId="docs-blocks-gallery" />,
  },
  {
    slug: "profile-card",
    name: "Profile card",
    blurb: "Account identity and grouped profile actions",
    preview: (
      <ProfileCardBlock
        user={{ name: "Jenny Hamilton", username: "@jennycodes" }}
        defaultVariant="expanded"
        sound={false}
      />
    ),
  },
  {
    slug: "navbar",
    name: "Navbar · planned",
    blurb: "Application navigation with branding and a user menu",
    preview: (
      <div className="gap-3 py-12 flex flex-col items-center text-center">
        <span className="px-3 py-1 text-xs rounded-full border text-muted-foreground">
          Planned
        </span>
        <p className="text-sm text-muted-foreground">
          This block is not available yet.
        </p>
      </div>
    ),
  },
  {
    slug: "shell",
    name: "Shell",
    blurb: "Application frame with collapsible workspace panels",
    wide: true,
    preview: (
      <ShellLayout
        variant="web"
        className="h-[24rem] w-full"
        header="Corpus workspace"
        panels={{
          left: {
            id: "gallery-library",
            name: "Library",
            side: "left",
            open: true,
            defaultOpen: true,
            component: (
              <div className="space-y-4 p-4 text-sm">
                <p>Library</p>
                <p>Iliad</p>
                <p>Odyssey</p>
                <p>Hesiod</p>
              </div>
            ),
          },
        }}
      >
        <div className="space-y-3 p-6">
          <h3 className="font-semibold">Iliad · Book I</h3>
          <p className="text-sm text-muted-foreground">
            Sing, goddess, the anger of Peleus’ son Achilles.
          </p>
        </div>
      </ShellLayout>
    ),
  },
  {
    slug: "scaffold",
    name: "Scaffold",
    blurb: "Composable workspace panels and inspector",
    wide: true,
    preview: (
      <Scaffold.Root className="h-[24rem] w-full">
        <Scaffold.Main>
          <Scaffold.Canvas>
            <Scaffold.Panel>
              <div className="space-y-3 p-6">
                <h3 className="font-semibold">Corpus workspace</h3>
                <p className="text-sm text-muted-foreground">
                  Read, annotate and compare passages.
                </p>
              </div>
            </Scaffold.Panel>
          </Scaffold.Canvas>
        </Scaffold.Main>
      </Scaffold.Root>
    ),
  },
  {
    slug: "chat",
    name: "Chat",
    blurb: "Scoped corpus conversations and generated answers",
    wide: true,
    preview: (
      <AiPanel
        className="h-[28rem] w-full"
        headerTitle="Context Fabric"
        scope={{ kind: "passage", label: "Iliad 1.1", range: "¶1–¶2" }}
        thread={
          <p className="p-4 text-sm text-muted-foreground">
            Ask a question about this passage to begin your research.
          </p>
        }
      />
    ),
  },
]

/** The same live gallery tiles used by atoms and composed components. */
export function BlocksGallery() {
  return (
    <div className="not-prose gap-4 md:grid-cols-4 grid grid-cols-1">
      {blocks.map((block, index) => (
        <GalleryTile
          key={block.slug}
          index={index}
          href={`/blocks/${block.slug}`}
          name={block.name}
          blurb={block.blurb}
          className={
            block.wide ? "min-w-0 md:col-span-4" : "min-w-0 md:col-span-2"
          }
          stageClassName="min-h-64 px-3 py-6 sm:px-6"
        >
          <div className="min-w-0 flex w-full items-center justify-center">
            {block.preview}
          </div>
        </GalleryTile>
      ))}
    </div>
  )
}
