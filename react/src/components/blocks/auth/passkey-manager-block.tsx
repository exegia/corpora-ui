"use client";

import { AnimatePresence, MotionConfig, motion } from "motion/react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardPanel,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { AuthError, EASE, Reveal } from "./auth-shell";

/** One registered passkey, as rendered by {@link PasskeyManagerBlock}. */
export interface PasskeyRecord {
  id: string;
  /** Server-derived name; falls back to "Passkey" when absent. */
  name?: string | null;
  /** ISO timestamps. Unparseable values are simply not shown. */
  createdAt?: string | null;
  lastUsedAt?: string | null;
}

export interface PasskeyManagerBlockProps {
  title?: string;
  description?: string;
  /** The account's passkeys, newest first. */
  passkeys?: PasskeyRecord[];
  /** Whether this device can register passkeys at all. */
  available?: boolean;
  /** Shows the loading row instead of the list. */
  loading?: boolean;
  /**
   * Reject (or throw) to show the error. Resolving with `{ cancelled: true }`
   * returns silently to idle — a dismissed OS prompt is not a failure.
   */
  onRegister?: () => Promise<{ cancelled?: boolean } | void> | void;
  onRename?: (id: string, name: string) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  className?: string;
}

const NAME_MAX = 120;

const LAST_PASSKEY_WARNING =
  "This is your last passkey. After deleting it you won't be able to sign in with a passkey until you register a new one.";

function formatDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? null : date.toLocaleDateString();
}

/**
 * Settings panel for the passkeys on an account: register, inline rename with
 * field-level validation, and delete behind an explicit confirmation. Deleting
 * the last passkey is allowed — it is the account's passkey method that goes
 * away, not its only way in — so the confirmation carries a warning instead of
 * a block.
 */
export function PasskeyManagerBlock({
  title = "Passkeys",
  description = "Sign in without a password using your device's biometrics or security key.",
  passkeys = [],
  available = true,
  loading = false,
  onRegister,
  onRename,
  onDelete,
  className,
}: PasskeyManagerBlockProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [registering, setRegistering] = React.useState(false);
  const [renamingId, setRenamingId] = React.useState<string | null>(null);
  const [renameValue, setRenameValue] = React.useState("");
  const [renameError, setRenameError] = React.useState<string | null>(null);
  const [confirmingId, setConfirmingId] = React.useState<string | null>(null);

  const lastPasskey = passkeys.length === 1;

  async function run(action: () => Promise<unknown> | unknown) {
    if (busy) return { ok: false } as const;
    setError(null);
    setBusy(true);
    try {
      const result = await action();
      return { ok: true, result } as const;
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Something went wrong.",
      );
      return { ok: false } as const;
    } finally {
      setBusy(false);
    }
  }

  async function handleRegister() {
    setRegistering(true);
    await run(() => onRegister?.());
    setRegistering(false);
  }

  function startRename(passkey: PasskeyRecord) {
    setConfirmingId(null);
    setRenamingId(passkey.id);
    setRenameValue(passkey.name ?? "");
    setRenameError(null);
  }

  async function submitRename(id: string) {
    const name = renameValue.trim();
    if (name.length < 1 || name.length > NAME_MAX) {
      setRenameError(`Name must be between 1 and ${NAME_MAX} characters.`);
      return;
    }
    const outcome = await run(() => onRename?.(id, name));
    if (!outcome.ok) return;
    setRenamingId(null);
    setRenameError(null);
  }

  async function confirmDelete(id: string) {
    const outcome = await run(() => onDelete?.(id));
    setConfirmingId(null);
    if (!outcome.ok) return;
    if (renamingId === id) setRenamingId(null);
  }

  return (
    <MotionConfig reducedMotion="user">
      <Card className={cn("w-full", className)} data-slot="auth-block">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardPanel>
          {!available ? (
            <p className="text-sm text-muted-foreground">
              Passkeys aren&apos;t available on this device. You can manage them
              from a device that supports passkeys.
            </p>
          ) : loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Spinner className="size-4" />
              Loading passkeys…
            </div>
          ) : (
            <motion.div
              layout
              transition={{ duration: 0.3, ease: EASE }}
              className="flex flex-col gap-3"
            >
              <AuthError message={error} />

              {passkeys.length > 0 ? (
                <ul aria-label="Passkeys" className="flex flex-col gap-2">
                  <AnimatePresence initial={false}>
                    {passkeys.map((passkey, index) => {
                      const name = passkey.name ?? "Passkey";
                      const created = formatDate(passkey.createdAt);
                      const lastUsed = formatDate(passkey.lastUsedAt);
                      return (
                        <motion.li
                          key={passkey.id}
                          layout
                          className="flex flex-col gap-2 rounded-lg border px-3 py-2"
                          initial={{ opacity: 0, y: -4 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          // 40ms per row, capped so a long list never leaves
                          // the last row arriving noticeably late.
                          transition={{
                            duration: 0.25,
                            ease: EASE,
                            delay: Math.min(index, 5) * 0.04,
                          }}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex min-w-0 flex-col">
                              <span className="truncate font-medium text-sm">
                                {name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {created ? `Added ${created}` : null}
                                {created && lastUsed ? " · " : null}
                                {lastUsed ? `Last used ${lastUsed}` : null}
                              </span>
                            </div>
                            <div className="flex shrink-0 gap-2">
                              <Button
                                aria-label={`Rename ${name}`}
                                size="sm"
                                type="button"
                                variant="outline"
                                disabled={busy}
                                onClick={() => startRename(passkey)}
                              >
                                Rename
                              </Button>
                              <Button
                                aria-label={`Delete ${name}`}
                                size="sm"
                                type="button"
                                variant="destructive-outline"
                                disabled={busy}
                                onClick={() => {
                                  setRenamingId(null);
                                  setConfirmingId(passkey.id);
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </div>

                          <Reveal show={renamingId === passkey.id}>
                            <form
                              className="flex items-start gap-2 pt-1"
                              onSubmit={(event) => {
                                event.preventDefault();
                                void submitRename(passkey.id);
                              }}
                            >
                              <Field
                                className="min-w-0 grow"
                                invalid={Boolean(renameError)}
                              >
                                <FieldLabel className="sr-only">
                                  Passkey name
                                </FieldLabel>
                                <Input
                                  aria-label="Passkey name"
                                  aria-invalid={renameError ? true : undefined}
                                  autoFocus
                                  disabled={busy}
                                  maxLength={NAME_MAX + 1}
                                  value={renameValue}
                                  onChange={(event) =>
                                    setRenameValue(event.target.value)
                                  }
                                />
                                {renameError && (
                                  <FieldError match>{renameError}</FieldError>
                                )}
                              </Field>
                              <Button size="sm" type="submit" loading={busy}>
                                Save
                              </Button>
                              <Button
                                size="sm"
                                type="button"
                                variant="ghost"
                                disabled={busy}
                                onClick={() => setRenamingId(null)}
                              >
                                Cancel
                              </Button>
                            </form>
                          </Reveal>

                          <Reveal show={confirmingId === passkey.id}>
                            <div
                              className="flex flex-col gap-2 rounded-lg bg-muted/50 p-2"
                              role="alertdialog"
                              aria-label={`Confirm deleting ${name}`}
                            >
                              <p className="text-sm">
                                Delete this passkey? It can no longer be used to
                                sign in.
                              </p>
                              {lastPasskey && (
                                <p className="text-xs text-destructive-foreground">
                                  {LAST_PASSKEY_WARNING}
                                </p>
                              )}
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  type="button"
                                  variant="destructive"
                                  loading={busy}
                                  onClick={() => void confirmDelete(passkey.id)}
                                >
                                  Delete passkey
                                </Button>
                                <Button
                                  size="sm"
                                  type="button"
                                  variant="ghost"
                                  disabled={busy}
                                  onClick={() => setConfirmingId(null)}
                                >
                                  Keep it
                                </Button>
                              </div>
                            </div>
                          </Reveal>
                        </motion.li>
                      );
                    })}
                  </AnimatePresence>
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No passkeys registered yet. Add one to sign in without a
                  password.
                </p>
              )}

              <Button
                className="w-full"
                type="button"
                variant="outline"
                disabled={busy}
                loading={registering}
                onClick={() => void handleRegister()}
              >
                Add a passkey
              </Button>
            </motion.div>
          )}
        </CardPanel>
      </Card>
    </MotionConfig>
  );
}
