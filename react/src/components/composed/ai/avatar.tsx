import OWLImage from "@/assets/owl-avatar.png"
import { Badge } from "@/components/ui/badge";
import { Avatar as AvatarAtom } from "@/components/atoms";

export const Avatar = () => {
  return (
    <div className="flex items-center gap-1.5">
      <AvatarAtom size="default" className="bg-indigo-900/20 dark:bg-indigo-100/40 p-0.5 scale-90 shadow-debossed inset-shadow-accent" user={{ avatarUrl: OWLImage }} />
      <div className="flex flex-col">
        <div className="inline-flex items-center gap-1.5">
          <span className="text-sm font-semibold">Exegia</span>
          <Badge variant="default" size="xs">
            AI Scholar
          </Badge>
        </div>
      </div>
    </div>
  )
}