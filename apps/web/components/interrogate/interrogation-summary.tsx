'use client'

import { AlertTriangle, CheckCircle2, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InterrogationSummary } from '@/lib/interrogation-types'

type ReviewItem = {
  category: string
  prompt: string
  answerText: string
  skipped: boolean
  seconds: number
  correct: boolean | null
}

export function InterrogationReport({
  summary,
  review,
  onRestart,
}: {
  summary: InterrogationSummary
  review: ReviewItem[]
  onRestart: () => void
}) {
  const totalSeconds = review.reduce((sum, r) => sum + r.seconds, 0)

  return (
    <div className="animate-fade-up mt-10">
      <div className="ws-ghost-box px-6 py-8 text-center md:px-10 md:py-10">
        <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-[var(--ws-muted)]">结案陈词</p>
        <p className="mt-4 text-[64px] font-semibold leading-none tabular-nums text-[var(--ws-sand)]">
          {summary.overallScore}
        </p>
        <h2 className="mt-3 text-[24px] font-semibold tracking-tight text-[var(--ws-ink)]">{summary.verdictLabel}</h2>
        <p className="mx-auto mt-4 max-w-xl text-[14px] leading-relaxed text-[var(--ws-ink-2)]">{summary.closing}</p>
        <p className="mt-4 text-[12px] text-[var(--ws-muted)]">
          全程用时 {Math.floor(totalSeconds / 60)} 分 {totalSeconds % 60} 秒
        </p>
      </div>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="ws-ghost-box px-5 py-5">
          <h3 className="flex items-center gap-2 text-[14px] font-medium text-[var(--ws-ok)]">
            <CheckCircle2 className="size-4" aria-hidden="true" />
            顶住的部分
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            {summary.strengths.map((s, i) => (
              <li key={i} className="text-[13px] leading-relaxed text-[var(--ws-ink-2)]">
                {s}
              </li>
            ))}
          </ul>
        </div>
        <div className="ws-ghost-box px-5 py-5">
          <h3 className="flex items-center gap-2 text-[14px] font-medium text-[var(--ws-miss)]">
            <AlertTriangle className="size-4" aria-hidden="true" />
            暴露的破绽
          </h3>
          <ul className="mt-3 flex flex-col gap-2">
            {summary.weaknesses.map((s, i) => (
              <li key={i} className="text-[13px] leading-relaxed text-[var(--ws-ink-2)]">
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="ws-ghost-box mt-6 px-5 py-5">
        <h3 className="text-[13px] font-medium uppercase tracking-wider text-[var(--ws-muted)]">按维度得分</h3>
        <div className="mt-4 flex flex-col gap-3">
          {summary.categoryBreakdown.map((c) => (
            <div key={c.category}>
              <div className="flex items-center justify-between text-[13px] text-[var(--ws-ink-2)]">
                <span>{c.category}</span>
                <span className="tabular-nums">{c.score}</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-[var(--ws-ghost)]">
                <div className="h-full rounded-full bg-[var(--ws-sand)]" style={{ width: `${Math.max(4, c.score)}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ws-ghost-box mt-6 px-5 py-5">
        <h3 className="text-[13px] font-medium uppercase tracking-wider text-[var(--ws-muted)]">下一步</h3>
        <ol className="mt-3 flex flex-col gap-2">
          {summary.nextActions.map((a, i) => (
            <li key={i} className="flex gap-3 text-[13px] leading-relaxed text-[var(--ws-ink-2)]">
              <span className="shrink-0 font-mono text-[var(--ws-sand)]">{String(i + 1).padStart(2, '0')}</span>
              {a}
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-8">
        <h3 className="text-[13px] font-medium uppercase tracking-wider text-[var(--ws-muted)]">逐题回放</h3>
        <ul className="mt-4 flex flex-col gap-2">
          {review.map((r, i) => (
            <li key={i} className="ws-ghost-box flex items-start justify-between gap-4 px-4 py-3">
              <div className="min-w-0">
                <p className="text-[12px] text-[var(--ws-muted)]">{r.category}</p>
                <p className="mt-0.5 truncate text-[14px] text-[var(--ws-ink)]">{r.prompt}</p>
              </div>
              <div className="flex shrink-0 items-center gap-3 text-[12px] text-[var(--ws-muted)]">
                <span className="font-mono tabular-nums">{r.seconds}s</span>
                <span
                  className={cn(
                    'font-medium',
                    r.skipped ? 'text-[var(--ws-muted)]' : r.correct ? 'text-[var(--ws-ok)]' : 'text-[var(--ws-miss)]',
                  )}
                >
                  {r.skipped ? '跳过' : r.correct ? '通过' : '未通过'}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={onRestart}
        className="mt-8 inline-flex items-center gap-2 rounded-full bg-[var(--ws-sand)] px-6 py-2.5 text-[14px] font-medium text-[var(--ws-on-sand)] transition-opacity hover:opacity-90"
      >
        <RotateCcw className="size-4" aria-hidden="true" />
        再来一轮
      </button>
    </div>
  )
}
