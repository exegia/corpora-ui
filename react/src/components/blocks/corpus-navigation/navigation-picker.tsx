"use client"
import { useAtomValue } from "jotai"
import { Button } from "@/components/ui/button"
import {
  HierarchyPicker,
  LocationGrid,
  useCorpusNavigationActions,
  useCorpusNavigationState,
  corpusNavigationDataAtom,
  formatReference,
} from "@/components/composed/corpus-navigation"
export default function NavigationPicker({
  navigatorId,
}: {
  navigatorId: string
}) {
  const data = useAtomValue(corpusNavigationDataAtom(navigatorId))
  const { draft, pending, error } = useCorpusNavigationState(navigatorId)
  const actions = useCorpusNavigationActions(navigatorId)
  if (!data) return null
  return (
    <div className="min-h-0 flex flex-col" dir={data.direction}>
      <div className="min-h-0 space-y-6 px-4 py-4 [touch-action:pan-y] overflow-y-auto overscroll-contain">
        <HierarchyPicker navigatorId={navigatorId} />
        {data.schema.levels
          .filter((level) => level.kind === "number")
          .map((level) => (
            <LocationGrid
              key={level.id}
              navigatorId={navigatorId}
              levelId={level.id}
            />
          ))}
        {!data.nodes.length && (
          <p className="text-sm text-muted-foreground">
            No navigation index is available for this edition.
          </p>
        )}
      </div>
      <div className="space-y-3 p-4 border-t bg-background pb-[max(1rem,env(safe-area-inset-bottom))]">
        <p className="text-xs text-muted-foreground">
          Selected{" "}
          <bdi className="font-medium text-foreground">
            {formatReference(data, draft)}
          </bdi>
        </p>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="gap-2 flex">
          <Button
            variant="outline"
            className="min-h-11 flex-1"
            onClick={actions.cancel}
          >
            Cancel
          </Button>
          <Button
            className="min-h-11 flex-1 transition-colors duration-180 motion-reduce:transition-none"
            disabled={!draft || pending}
            onClick={() => {
              void actions.commit()
            }}
          >
            {pending ? "Opening…" : error ? "Retry" : "Go to location"}
          </Button>
        </div>
      </div>
    </div>
  )
}
