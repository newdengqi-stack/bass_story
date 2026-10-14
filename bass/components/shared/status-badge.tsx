import { cn } from '@/lib/utils'

export type StatusTone = 'positive' | 'pending' | 'unknown' | 'destructive' | 'primary'

const TONE_CLASSES: Record<StatusTone, string> = {
  positive: 'bg-positive-soft text-positive',
  pending: 'bg-pending-soft text-pending',
  unknown: 'bg-unknown-soft text-unknown',
  destructive: 'bg-destructive/10 text-destructive',
  primary: 'bg-primary-soft text-primary-soft-foreground',
}

export function StatusBadge({ tone, children, className }: { tone: StatusTone; children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium',
        TONE_CLASSES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
