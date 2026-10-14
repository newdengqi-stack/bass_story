'use client'

import { AlertTriangle, CheckCircle2, SkipForward, XCircle } from 'lucide-react'
import type { LiveRecord } from './room-types'

/** 单题判定结果：过没过、点评、以及没顶住时的参考答案。 */
export function VerdictCard({
  record,
  onNext,
  isLast,
}: {
  record: LiveRecord
  onNext: () => void
  isLast: boolean
}) {
  const { verdict, skipped, question, answerText } = record
  const passed = verdict?.correct ?? false

  return (
    <div className="ws-ghost-box px-6 py-7">
      <div className="flex items-center gap-2">
        {skipped ? (
          <>
            <SkipForward className="size-5 text-[var(--ws-muted)]" aria-hidden="true" />
            <span className="text-[15px] font-medium text-[var(--ws-muted)]">跳过了这一题</span>
          </>
        ) : passed ? (
          <>
            <CheckCircle2 className="size-5 text-[var(--ws-ok)]" aria-hidden="true" />
            <span className="text-[15px] font-medium text-[var(--ws-ok)]">顶住了，评分 {verdict?.score}</span>
          </>
        ) : (
          <>
            <XCircle className="size-5 text-[var(--ws-miss)]" aria-hidden="true" />
            <span className="text-[15px] font-medium text-[var(--ws-miss)]">没顶住，评分 {verdict?.score}</span>
          </>
        )}
      </div>

      <p className="mt-4 text-[13px] text-[var(--ws-muted)]">问题</p>
      <p className="mt-1 text-[14px] leading-relaxed text-[var(--ws-ink)]">{question.prompt}</p>

      {!skipped && (
        <>
          <p className="mt-4 text-[13px] text-[var(--ws-muted)]">你的回答</p>
          <p className="mt-1 text-[14px] leading-relaxed text-[var(--ws-ink-2)]">{answerText}</p>
        </>
      )}

      {verdict && (
        <>
          <p className="mt-4 text-[13px] text-[var(--ws-muted)]">点评</p>
          <p className="mt-1 text-[14px] leading-relaxed text-[var(--ws-ink-2)]">{verdict.feedback}</p>
        </>
      )}

      {(skipped || !passed) && (
        <div className="mt-5 border-t border-[var(--ws-line)] pt-5">
          <p className="flex items-center gap-1.5 text-[13px] font-medium text-[var(--ws-sand)]">
            <AlertTriangle className="size-3.5" aria-hidden="true" />
            参考答案
          </p>
          <p className="mt-2 text-[14px] leading-relaxed text-[var(--ws-ink-2)]">
            {verdict ? verdict.referenceAnswer : `应该覆盖：${question.focusPoints.join('；')}`}
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={onNext}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--ws-sand)] px-6 py-2.5 text-[14px] font-medium text-[var(--ws-on-sand)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-ink)]"
      >
        {isLast ? '生成结案报告' : '下一题'}
      </button>
    </div>
  )
}
