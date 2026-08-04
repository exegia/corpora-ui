"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import * as React from "react";

import {
  SOCIAL_PROVIDERS,
  type SocialProvider,
} from "@/components/composed/social-providers";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { AuthError, EASE } from "./auth-shell";

/** One sign-in identity attached to the account. */
export interface LinkedIdentity {
  id: string;
  provider: SocialProvider;
  /** Account address shown under the provider name, when known. */
  email?: string | null;
}

export interface LinkedAccountsBlockProps {
  title?: string;
  description?: string;
  /** Identities already attached to the account. */
  identities?: LinkedIdentity[];
  /** Providers offered as connect candidates; connected ones are filtered out. */
  providers?: SocialProvider[];
  /** Shows the loading row instead of the list. */
  loading?: boolean;
  /**
   * The account can also sign in through a method that has no row in this
   * list — an email/password credential, say. Lifts the last-method guard,
   * which otherwise refuses to disconnect the final listed identity.
   */
  hasOtherSignInMethods?: boolean;
  /** Reject (or throw) to show the inline error. */
  onLink?: (provider: SocialProvider) => Promise<void> | void;
  onUnlink?: (id: string) => Promise<void> | void;
  className?: string;
}

const LAST_METHOD_EXPLANATION =
  "This is your only way to sign in, so it can't be disconnected.";

/**
 * Settings panel for the sign-in identities attached to an account: lists the
 * connected ones, offers connect buttons for the rest, and guards the last
 * remaining method from being disconnected — the guard is a disabled button
 * plus an explanation rather than an error after the fact.
 */
export function LinkedAccountsBlock({
  title = "Connected accounts",
  description = "Manage the accounts you can use to sign in.",
  identities = [],
  providers = ["google", "apple", "github"],
  loading = false,
  hasOtherSignInMethods = false,
  onLink,
  onUnlink,
  className,
}: LinkedAccountsBlockProps) {
  const noteId = React.useId();
  const [error, setError] = React.useState<string | null>(null);
  const [linking, setLinking] = React.useState<SocialProvider | null>(null);
  const [unlinking, setUnlinking] = React.useState<string | null>(null);

  const connected = new Set(identities.map((identity) => identity.provider));
  const connectable = providers.filter((provider) => !connected.has(provider));
  const busy = linking !== null || unlinking !== null;
  // The backend rule, enforced here so we never fire a request that would
  // remove the account's only way in. An off-list method (a password) keeps
  // the account reachable, so it lifts the guard.
  const lastMethod = !hasOtherSignInMethods && identities.length <= 1;

  async function connect(provider: SocialProvider) {
    if (busy) return;
    setError(null);
    setLinking(provider);
    try {
      await onLink?.(provider);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to connect account.",
      );
    } finally {
      setLinking(null);
    }
  }

  async function disconnect(id: string) {
    if (busy || lastMethod) return;
    setError(null);
    setUnlinking(id);
    try {
      await onUnlink?.(id);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Unable to disconnect account.",
      );
    } finally {
      setUnlinking(null);
    }
  }

  return (
    <MotionConfig reducedMotion="user">
      <Card className={cn("w-full", className)} data-slot="auth-block">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardPanel>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner className="size-4" />
              Loading connected accounts…
            </div>
          ) : (
            <motion.div
              layout
              transition={{ duration: 0.3, ease: EASE }}
              className="flex flex-col gap-3"
            >
              <AuthError message={error} />

              {identities.length > 0 ? (
                <ul
                  aria-label="Connected accounts"
                  className="flex flex-col gap-2"
                >
                  <AnimatePresence initial={false}>
                    {identities.map((identity, index) => {
                      const { label, Icon } = SOCIAL_PROVIDERS[
                        identity.provider
                      ];
                      return (
                        <motion.li
                          key={identity.id}
                          layout
                          className="flex items-center justify-between gap-3 rounded-lg border px-3 py-2"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          // 40ms per row, capped so a long identity list never
                          // leaves the last row arriving noticeably late.
                          transition={{
                            duration: 0.25,
                            ease: EASE,
                            delay: Math.min(index, 5) * 0.04,
                          }}
                        >
                          <div className="flex min-w-0 items-center gap-2.5">
                            <Icon
                              aria-hidden="true"
                              className="size-4 text-muted-foreground"
                            />
                            <div className="flex min-w-0 flex-col">
                              <span className="font-medium text-sm">
                                {label}
                              </span>
                              {identity.email && (
                                <span className="truncate text-xs text-muted-foreground">
                                  {identity.email}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            aria-describedby={lastMethod ? noteId : undefined}
                            aria-label={`Disconnect ${label}`}
                            size="sm"
                            type="button"
                            variant="destructive-outline"
                            disabled={busy || lastMethod}
                            loading={unlinking === identity.id}
                            onClick={() => void disconnect(identity.id)}
                          >
                            Disconnect
                          </Button>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No sign-in methods connected yet.
                </p>
              )}

              {lastMethod && identities.length > 0 && (
                <p className="text-xs text-muted-foreground" id={noteId}>
                  {LAST_METHOD_EXPLANATION}
                </p>
              )}

              {connectable.map((provider) => {
                const { label, Icon } = SOCIAL_PROVIDERS[provider];
                return (
                  <Button
                    key={provider}
                    className="w-full"
                    type="button"
                    variant="outline"
                    disabled={busy}
                    loading={linking === provider}
                    onClick={() => void connect(provider)}
                  >
                    <Icon aria-hidden="true" />
                    <span className="flex-1">Connect {label}</span>
                  </Button>
                );
              })}
            </motion.div>
          )}
        </CardPanel>
      </Card>
    </MotionConfig>
  );
}
