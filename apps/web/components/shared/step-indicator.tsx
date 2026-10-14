import { cn } from '@/lib/utils'

/**
 * 步骤指示器。
 * 只显示序号、不显示长标签 —— 标签放在下方单独一行。
 * 用等分列（repeat(n, minmax(0,1fr))）而不是 flex，9 步在 320px 下也不会横向滚动。
 */
export function StepIndicator({
  steps,
  current,
  ariaLabel = '流程进度',
  className,
}: {
  steps: readonly string[]
  /** 当前步骤下标，从 0 开始 */
  current: number
  ariaLabel?: string
  className?: string
}) {
  const total = steps.length
  const safeCurrent = Math.min(Math.max(current, 0), Math.max(total - 1, 0))

  return (
    <div className={cn('min-w-0', className)}>
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
        role="img"
        aria-label={`${ariaLabel}：第 ${safeCurrent + 1} 步，共 ${total} 步 — ${steps[safeCurrent] ?? ''}`}
      >
        {steps.map((step, i) => {
          const done = i < safeCurrent
          const active = i === safeCurrent
          return (
            <span key={step} className="flex min-w-0 flex-col gap-1.5">
              <span
                className={cn(
                  'h-[3px] w-full rounded-full transition-colors',
                  done && 'bg-[var(--ws-sand)]',
                  active && 'bg-[var(--ws-ink)]',
                  !done && !active && 'bg-[var(--ws-line)]',
                )}
              />
              <span
                className={cn(
                  'font-mono text-[10px] tabular-nums leading-none',
                  active ? 'text-[var(--ws-ink)]' : done ? 'text-[var(--ws-sand)]' : 'text-[var(--ws-muted)]',
                )}
              >
                {String(i + 1).padStart(2, '0')}
              </span>
            </span>
          )
        })}
      </div>

      <p className="mt-3 text-[13px] text-[var(--ws-ink-2)]">
        <span className="text-[var(--ws-muted)]">
          第 {safeCurrent + 1} / {total} 步 ·{' '}
        </span>
        <span className="font-medium text-[var(--ws-ink)]">{steps[safeCurrent]}</span>
      </p>
    </div>
  )
}
