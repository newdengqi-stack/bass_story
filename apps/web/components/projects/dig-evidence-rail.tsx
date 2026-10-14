'use client'

import { cn } from '@/lib/utils'
import { MIN_EVIDENCE_COUNT, type EvidenceCard } from '@zhitu/types'
import { EvidenceStatusTag } from '@/components/shared/evidence-status'
import { SourcePopover } from '@/components/shared/source-popover'

/**
 * 会话证据侧栏。
 * 每完成一轮回答，结论立即出现在这里 —— 不等会话结束才可见。
 * 新落下的那张卡会短暂高亮，让「刚发生了什么」看得见。
 */
export function DigEvidenceRail({
  cards,
  highlightId,
  className,
}: {
  cards: EvidenceCard[]
  /** 最新落下的那张卡 */
  highlightId: string | null
  className?: string
}) {
  const reached = cards.length >= MIN_EVIDENCE_COUNT

  return (
    <aside aria-labelledby="rail-title" className={cn('min-w-0', className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="rail-title" className="text-[15px] font-medium text-[var(--ws-muted)]">
          已形成的结论
        </h2>
        <span className="font-mono text-[13px] tabular-nums text-[var(--ws-ink)]">
          {cards.length}
          <span className="text-[var(--ws-muted)]"> / {MIN_EVIDENCE_COUNT}</span>
        </span>
      </div>

      {cards.length === 0 ? (
        <p className="mt-4 text-[13px] leading-relaxed text-[var(--ws-muted)]">
          还没有结论。回答第一个问题后，结果会立刻出现在这里，并标明状态与来源。
        </p>
      ) : (
        <ul className="mt-4 flex flex-col">
          {cards.map((card, i) => (
            <li
              key={card.id}
              className={cn(
                'border-t border-[var(--ws-line)] py-4 first:border-t-0 first:pt-0',
                card.id === highlightId && 'animate-fade-up',
              )}
              style={card.id === highlightId ? { animationDelay: '0ms' } : undefined}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <span className="text-[14px] font-medium text-[var(--ws-ink)]">{card.skill}</span>
                <EvidenceStatusTag status={card.status} />
              </div>

              <p className="mt-2 text-[13px] leading-relaxed text-[var(--ws-ink-2)]">{card.conclusion}</p>

              <div className="mt-3 flex flex-wrap items-center gap-3">
                <span className="text-[12px] text-[var(--ws-muted)]">{card.dimension}</span>
                <SourcePopover source={card.source} />
              </div>

              {i === cards.length - 1 && !reached && (
                <p className="mt-3 text-[12px] text-[var(--ws-muted)]">
                  距离完成条件还差 {MIN_EVIDENCE_COUNT - cards.length} 条
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}
