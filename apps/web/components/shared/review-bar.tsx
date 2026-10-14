'use client'

import type { ReactNode } from 'react'
import { Lock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SourcePopover } from './source-popover'
import type { EvidenceSource } from '@zhitu/types'

export type ReviewAction = {
  key: string
  label: string
  onSelect: () => void
  /**
   * 是否受证据门禁约束，默认 true。
   * 只有「删除／忽略」这类不写入结果的动作才应显式设为 false ——
   * 否则没有来源的条目会连删都删不掉，用户被卡死在一条无用记录上。
   */
  requiresSource?: boolean
  tone?: 'primary' | 'ghost' | 'danger'
  disabled?: boolean
}

/**
 * 逐条确认条 —— 证据门禁内建在这里，而不是由页面各自判断。
 *
 * 只要 source 为 null，受门禁约束的动作全部禁用，并在条目上直接显示原因。
 * 这样任何一页都无法「忘记」检查来源：规则写在组件里，不在调用方。
 */
export function ReviewBar({
  children,
  source,
  actions,
  status,
  className,
}: {
  children: ReactNode
  source: EvidenceSource | null
  actions: ReviewAction[]
  /** 可选的处理状态标签 */
  status?: ReactNode
  className?: string
}) {
  const blocked = source === null

  const toneClass: Record<NonNullable<ReviewAction['tone']>, string> = {
    primary:
      'bg-[var(--ws-sand-fill)] text-[var(--ws-on-sand)] hover:scale-[1.02] border border-transparent',
    ghost:
      'border border-[var(--ws-ghost-line)] text-[var(--ws-ink-2)] hover:border-[var(--ws-ghost-line-strong)] hover:text-[var(--ws-ink)]',
    danger:
      'border border-transparent text-[var(--ws-miss)] hover:border-[var(--ws-ghost-line)] hover:text-[var(--ws-ink)]',
  }

  return (
    <article className={cn('border-t border-[var(--ws-line)] py-6 first:border-t-0 first:pt-0', className)}>
      <div className="min-w-0">{children}</div>

      {blocked && (
        <p
          role="note"
          className="mt-4 flex items-start gap-2 border-l-2 border-[var(--ws-miss)] pl-3 text-[13px] leading-relaxed text-[var(--ws-miss)]"
        >
          <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
          <span>这条没有可追溯的来源，无法处理。请先补上项目验证或已确认事实，再回来处理它。</span>
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <SourcePopover source={source} />

        {/* 动作全部靠右对齐，来源在左 —— 与任务卡保持同一节奏 */}
        <span className="ml-auto flex flex-wrap items-center gap-2">
          {status}
          {actions.map((a) => {
            const gated = blocked && a.requiresSource !== false
            return (
              <button
                key={a.key}
                type="button"
                onClick={a.onSelect}
                disabled={gated || a.disabled}
                title={gated ? '该条没有可追溯的来源' : undefined}
                className={cn(
                  'inline-flex items-center gap-1 rounded-full px-3.5 py-1.5 text-[13px] transition-colors',
                  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-sand)]',
                  'disabled:pointer-events-none disabled:opacity-40',
                  toneClass[a.tone ?? 'ghost'],
                )}
              >
                {a.label}
              </button>
            )
          })}
        </span>
      </div>
    </article>
  )
}
