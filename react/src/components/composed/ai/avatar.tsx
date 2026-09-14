import OWLImage from "@/assets/owl-avatar.png"
import { Badge } from "@/components/ui/badge";
import { Avatar as AvatarAtom } from "@/components/atoms";

export const Avatar = () => {
  return (
    <div className="flex items-center gap-2">
      <AvatarAtom size="default" className="bg-indigo-950 dark:bg-indigo-300 p-0.5 scale-110" user={{ avatarUrl: OWLImage }} />
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-semibold">Exegia</span>
          <Badge variant="default" size="xs">
            Agent
          </Badge>
        </div>
        <span className="text-xs text-muted-foreground">AI Scholar</span>
      </div>
    </div>
  )
}