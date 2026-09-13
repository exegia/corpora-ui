import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import type { AtomSize } from "./types";


export type TLoaderType = "spinner" | "dots";
export interface ILoaderProps {
  type?: TLoaderType;
  className?: string;
  size?: AtomSize;
}


const sizeMap: Record<AtomSize, string> = {
  xs: 'w-0.5 h-0.5',
  sm: 'w-1 h-1',
  md: 'w-2 h-2',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
  xxl: 'w-5 h-5',
} as const;

export function Loader({ type = "spinner", className, size }: ILoaderProps) {

  if (type === "dots") {
    return (
      <div className={cn('flex gap-1 justify-center items-center', className)}>
        {[0, 1, 2].map((i) => (
          <span 
            key={i}
            className={cn("bg-foreground animate-bounce rounded-full", sizeMap[size ?? 'md'])}
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    );
  }
  
  return (
    <Spinner className={cn('text-foreground', className)} size={size} />
  );
}
