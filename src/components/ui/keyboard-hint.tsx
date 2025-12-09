import { cn } from '@/lib/utils';

interface KeyboardHintProps {
  keys: string;
  description?: string;
  className?: string;
}

export function KeyboardHint({ keys, description, className }: KeyboardHintProps) {
  return (
    <span className={cn('text-xs text-gray-400', className)}>
      {description && '('}
      <span className="bg-muted/60 px-1 rounded font-mono text-[0.9em] border border-muted">
        {keys}
      </span>
      {description && ` ${description})`}
    </span>
  );
}

