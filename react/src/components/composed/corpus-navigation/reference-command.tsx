"use client"

import { useCallback, useMemo, useRef } from "react"
import type { ComponentProps } from "react"
import { useAtomValue } from "jotai"
import { SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandInput,
  CommandList,
  CommandGroup,
  CommandGroupLabel,
  CommandItem,
  CommandEmpty,
} from "@/components/ui/command"
import {
  Modal,
  ModalPopup,
  ModalTrigger,
  ModalTitle,
  ModalDescription,
} from "@/components/ui/modal"
import { corpusNavigationDataAtom } from "./corpus-navigation-atom"
import {
  useCorpusNavigationActions,
  useCorpusNavigationState,
} from "./use-corpus-navigation-state"
import { useReferenceShortcut } from "./use-reference-shortcut"
import type { ReferenceShortcut } from "./use-reference-shortcut"

export interface ReferenceCommandProps {
  navigatorId: string
  /** focused by default. A global shortcut explicitly opts into document ownership. */
  shortcut?: ReferenceShortcut
  portalProps?: ComponentProps<typeof ModalPopup>["portalProps"]
}
export default function ReferenceCommand({
  navigatorId,
  shortcut = "focused",
  portalProps,
}: ReferenceCommandProps) {
  const data = useAtomValue(corpusNavigationDataAtom(navigatorId))
  const state = useCorpusNavigationState(navigatorId)
  const actions = useCorpusNavigationActions(navigatorId)
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const open = useCallback(() => actions.setCommandOpen(true), [actions])
  useReferenceShortcut(root, shortcut, open)
  const groups = useMemo(
    () =>
      [
        {
          label: "Go to reference",
          items: state.results.filter((result) => result.kind === "reference"),
        },
        {
          label: "Text matches",
          items: state.results.filter((result) => result.kind === "text"),
        },
      ].filter((group) => group.items.length),
    [state.results]
  )
  return (
    <div ref={root}>
      <Modal
        open={state.commandOpen}
        onOpenChange={(value) => {
          if (value) open()
          else actions.cancel()
        }}
      >
        <ModalTrigger
          render={
            <Button
              ref={trigger}
              variant="outline"
              className="min-h-11 gap-2 w-full justify-start"
            />
          }
        >
          <SearchIcon />
          Find a reference
          <span
            className="text-xs ms-auto text-muted-foreground"
            aria-hidden="true"
          >
            ⌘ / Ctrl K
          </span>
        </ModalTrigger>
        <ModalPopup
          portalProps={portalProps}
          finalFocus={trigger}
          className="p-2 duration-180"
          dir={data?.direction}
        >
          <ModalTitle className="px-3 pt-3 text-base font-semibold">
            Jump to a location
          </ModalTitle>
          <ModalDescription className="px-3 pb-2 text-sm text-muted-foreground">
            Enter a reference
            {data?.search ? " or search the text" : " in this edition"}.
          </ModalDescription>
          <Command
            value={state.query}
            onValueChange={(query) => {
              void actions.search(query)
            }}
            filter={null}
            items={groups}
            itemToStringValue={(item) =>
              typeof item === "object" && item !== null && "label" in item
                ? String(item.label)
                : ""
            }
          >
            <CommandInput
              aria-label="Reference or text"
              placeholder="Enter a reference…"
            />
            <CommandList className="max-h-[50dvh] overflow-y-auto">
              {groups.map((group) => (
                <CommandGroup key={group.label} items={group.items}>
                  <CommandGroupLabel>{group.label}</CommandGroupLabel>
                  {group.items.map((result) => (
                    <CommandItem
                      key={`${result.kind}/${result.anchor.nodeId}`}
                      value={result}
                      disabled={state.pending}
                      onClick={() => {
                        void actions.commit(result.anchor)
                      }}
                      className="min-h-11"
                    >
                      <div className="min-w-0">
                        <bdi className="block truncate">{result.label}</bdi>
                        {result.excerpt && (
                          <p className="text-xs truncate text-muted-foreground">
                            {result.excerpt}
                          </p>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ))}
            </CommandList>
            <CommandEmpty>
              {state.searchStatus === "loading"
                ? "Searching…"
                : state.query
                  ? "No valid reference or text match. Check the name and range."
                  : "Type a reference to begin."}
            </CommandEmpty>
          </Command>
          <div
            role="status"
            aria-live="polite"
            className="px-3 py-2 text-xs text-muted-foreground"
          >
            {state.pending
              ? "Opening location…"
              : state.searchStatus === "loading"
                ? "Searching…"
                : state.searchStatus === "ready"
                  ? `${state.results.length} results`
                  : ""}
          </div>
          {(state.searchError || state.error) && (
            <div className="px-3 pb-3">
              <p role="alert" className="text-sm text-destructive">
                {state.searchError ?? state.error}
              </p>
              <Button
                variant="outline"
                className="mt-2 min-h-11"
                onClick={() => {
                  if (state.searchError) void actions.search(state.query)
                  else void actions.commit()
                }}
              >
                Retry
              </Button>
            </div>
          )}
        </ModalPopup>
      </Modal>
    </div>
  )
}
