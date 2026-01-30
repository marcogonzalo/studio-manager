import { cn } from "@/lib/utils";

interface KeyboardHintProps {
  keys: string;
  description?: string;
  className?: string;
}

export function KeyboardHint({
  keys,
  description,
  className,
}: KeyboardHintProps) {
  return (
    <span className={cn("text-muted-foreground text-xs", className)}>
      {description && "("}
      <span className="bg-muted/60 border-muted rounded border px-1 font-mono text-[0.9em]">
        {keys}
      </span>
      {description && ` ${description})`}
    </span>
  );
}
