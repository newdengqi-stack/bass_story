'use client'

import { Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SPRINT_MINUTES_MAX, type SprintTask } from '@zhitu/types'
import { SourcePopover } from './source-popover'

/**
 * 冲刺任务卡。
 * 四项必须有：标题、时长档位、完成定义、来源能力 —— 缺任何一项这张卡都不算完成。
 * 时长只接受固定档位（15/30/45/60/90），超出上限的取值在开发期就会被类型挡住。
 */
export function TaskCard({
  task,
  onChangeState,
  className,
}: {
  task: SprintTask
  onChangeState?: (state: SprintTask['state']) => void
  className?: string
}) {
  const settled = task.state !== 'todo'
  const actionable = Boolean(onChangeState)

  return (
    <article
      className={cn(
        'border-t border-[var(--ws-line)] py-6 first:border-t-0 first:pt-0',
        settled && 'opacity-70',
        className,
      )}
    >
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-2">
        <h3
          className={cn(
            'text-[17px] font-medium text-[var(--ws-ink)]',
            task.state === 'done' && 'line-through decoration-[var(--ws-line-2)]',
          )}
        >
          {task.title}
        </h3>
        <span
          className={cn(
            'shrink-0 rounded-full border px-2.5 py-0.5 text-[12px] tabular-nums',
            task.minutes === SPRINT_MINUTES_MAX
              ? 'border-[var(--ws-ghost-line)] text-[var(--ws-warn)]'
              : 'border-[var(--ws-ghost-line)] text-[var(--ws-sand)]',
          )}
        >
          {task.minutes} 分钟
        </span>
        <span className="shrink-0 rounded-full border border-[var(--ws-ghost-line)] px-2.5 py-0.5 text-[12px] text-[var(--ws-ink-2)]">
          {task.skill}
        </span>
        {task.state === 'done' && (
          <span className="inline-flex shrink-0 items-center gap-1 text-[12px] text-[var(--ws-ok)]">
            <Check className="size-3.5" aria-hidden="true" />
            已完成
          </span>
        )}
        {task.state === 'skipped' && (
          <span className="shrink-0 text-[12px] text-[var(--ws-muted)]">已跳过</span>
        )}
      </div>

      {task.goal && (
        <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-[var(--ws-ink-2)]">
          <span className="text-[var(--ws-muted)]">任务目标 · </span>
          {task.goal}
        </p>
      )}

      <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[var(--ws-ink-2)]">
        <span className="text-[var(--ws-muted)]">完成定义 · </span>
        {task.done}
      </p>

      <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[var(--ws-ink-2)]">
        <span className="text-[var(--ws-muted)]">再次验证 · </span>
        {task.revalidate}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <SourcePopover source={task.source} label="依据" />

        {actionable && (
          <>
            <button
              type="button"
              onClick={() => onChangeState?.('done')}
              disabled={task.state === 'done'}
              className="inline-flex items-center gap-1 rounded-full border border-[var(--ws-ghost-line)] px-3 py-1 text-[12px] text-[var(--ws-ink-2)] transition-colors hover:border-[var(--ws-ghost-line-strong)] hover:text-[var(--ws-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-sand)] disabled:pointer-events-none disabled:opacity-40"
            >
              标记完成
            </button>
            <button
              type="button"
              onClick={() => onChangeState?.('skipped')}
              disabled={task.state === 'skipped'}
              className="inline-flex items-center gap-0.5 rounded-full px-2 py-1 text-[12px] text-[var(--ws-muted)] transition-colors hover:text-[var(--ws-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-sand)] disabled:pointer-events-none disabled:opacity-40"
            >
              跳过
              <ChevronRight className="size-3" aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </article>
  )
}
