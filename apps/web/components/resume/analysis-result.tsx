'use client'

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ArrowRight, CheckCircle2, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CATEGORY_TONE,
  SEVERITY_LABEL,
  type ResumeAnalysisResult,
  type ResumeIssueSeverity,
} from '@/lib/resume-analysis-types'

const SEVERITY_DOT: Record<ResumeIssueSeverity, string> = {
  high: 'bg-[var(--ws-miss)]',
  medium: 'bg-[var(--ws-warn)]',
  low: 'bg-[var(--ws-muted)]',
}

/** 把命中的原句高亮出来，并挂 ref 以便滚动定位 */
function renderHighlighted(
  fullText: string,
  quote: string | null,
  markRef: React.RefObject<HTMLElement | null>,
): ReactNode {
  if (!quote) return fullText
  const idx = fullText.indexOf(quote)
  if (idx === -1) return fullText

  return (
    <>
      {fullText.slice(0, idx)}
      <mark
        ref={markRef as React.RefObject<HTMLElement>}
        className="rounded bg-[var(--ws-sand)]/25 px-0.5 text-[var(--ws-ink)] ring-1 ring-[var(--ws-sand)]/50"
      >
        {quote}
      </mark>
      {fullText.slice(idx + quote.length)}
    </>
  )
}

function ScoreDial({ score }: { score: number }) {
  return (
    <div className="relative flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-[var(--ws-sand)]/40">
      <span className="text-[20px] font-semibold tabular-nums text-[var(--ws-ink)]">{score}</span>
    </div>
  )
}

/** 三栏对照：原文 → 问题清单 → 推荐改写，点任一问题三栏同步定位 */
export function AnalysisResult({
  result,
  originalText,
  pdfUrl,
  pdfName,
  onReset,
}: {
  result: ResumeAnalysisResult
  originalText: string
  pdfUrl: string | null
  pdfName: string | null
  onReset: () => void
}) {
  const [selectedId, setSelectedId] = useState<string>(result.issues[0]?.id ?? '')
  const active = useMemo(
    () => result.issues.find((i) => i.id === selectedId) ?? result.issues[0],
    [result.issues, selectedId],
  )

  const leftMarkRef = useRef<HTMLElement | null>(null)
  const rightMarkRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    leftMarkRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
    rightMarkRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [selectedId])

  if (!active) return null

  const categories = Array.from(new Set(result.issues.map((i) => i.category)))

  return (
    <div className="mt-10">
      {/* 概览条 */}
      <div className="ws-ghost-box flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div className="flex items-center gap-5">
          <ScoreDial score={result.score} />
          <div>
            <p className="text-[13px] text-[var(--ws-muted)]">总体诊断</p>
            <p className="mt-0.5 max-w-md text-[15px] leading-relaxed text-[var(--ws-ink)]">{result.summary}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--ws-line)] px-4 py-2 text-[13px] text-[var(--ws-ink-2)] transition-colors hover:text-[var(--ws-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-sand)]"
        >
          <RotateCcw className="size-3.5" aria-hidden="true" />
          重新分析
        </button>
      </div>

      {result.strengths.length > 0 && (
        <ul className="mt-4 flex flex-wrap gap-3">
          {result.strengths.map((s, i) => (
            <li
              key={i}
              className="flex items-center gap-1.5 rounded-full border border-[var(--ws-ok)]/30 bg-[var(--ws-ok)]/10 px-3 py-1.5 text-[12px] text-[var(--ws-ok)]"
            >
              <CheckCircle2 className="size-3.5 shrink-0" aria-hidden="true" />
              {s}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[1fr_280px_1fr] lg:gap-5">
        {/* 左：原文 */}
        <section aria-labelledby="original-title" className="min-w-0">
          <h2 id="original-title" className="text-[13px] font-medium uppercase tracking-wider text-[var(--ws-muted)]">
            简历原文{pdfName ? ` · ${pdfName}` : ''}
          </h2>
          <div className="ws-scroll mt-3 h-[520px] overflow-y-auto rounded-xl border border-[var(--ws-line)] bg-[var(--ws-panel)]">
            {pdfUrl ? (
              <iframe src={pdfUrl} title="简历原文 PDF" className="h-full w-full rounded-xl" />
            ) : (
              <p className="whitespace-pre-wrap p-5 text-[13.5px] leading-[1.9] text-[var(--ws-ink-2)]">
                {renderHighlighted(originalText, active.quote, leftMarkRef)}
              </p>
            )}
          </div>
        </section>

        {/* 中：问题列表 */}
        <nav aria-label="问题列表" className="ws-scroll lg:sticky lg:top-24 lg:max-h-[560px] lg:overflow-y-auto">
          <h2 className="text-[13px] font-medium uppercase tracking-wider text-[var(--ws-muted)]">
            发现的问题（{result.issues.length}）
          </h2>
          {categories.map((cat) => {
            const items = result.issues.filter((i) => i.category === cat)
            return (
              <div key={cat} className="mt-4">
                <p className="text-[12px] font-medium text-[var(--ws-muted)]">{CATEGORY_TONE[cat].label}</p>
                <ul className="mt-2 flex flex-col gap-1.5">
                  {items.map((issue) => {
                    const isActive = issue.id === active.id
                    return (
                      <li key={issue.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedId(issue.id)}
                          aria-current={isActive ? 'true' : undefined}
                          className={cn(
                            'w-full rounded-lg px-3 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-sand)]',
                            isActive
                              ? 'bg-[var(--ws-ghost)] text-[var(--ws-ink)]'
                              : 'text-[var(--ws-ink-2)] hover:bg-[var(--ws-ghost)]/60 hover:text-[var(--ws-ink)]',
                          )}
                        >
                          <span className="flex items-center gap-2">
                            <span
                              className={cn('size-1.5 shrink-0 rounded-full', SEVERITY_DOT[issue.severity])}
                              aria-hidden="true"
                            />
                            <span className="text-[13.5px] font-medium">{issue.title}</span>
                          </span>
                          <span className="mt-0.5 block pl-3.5 text-[11px] text-[var(--ws-muted)]">
                            {SEVERITY_LABEL[issue.severity]}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            )
          })}

          <div className="ws-ghost-box mt-6 px-4 py-4">
            <p className="text-[12px] font-medium text-[var(--ws-ink)]">判断依据</p>
            <blockquote className="mt-2 border-l-2 border-[var(--ws-sand)] pl-3 text-[12.5px] leading-relaxed text-[var(--ws-ink-2)]">
              {'“'}
              {active.quote}
              {'”'}
            </blockquote>
            <p className="mt-3 text-[12.5px] leading-relaxed text-[var(--ws-ink-2)]">{active.problem}</p>
            <div className="mt-3 flex items-center gap-1.5 text-[12.5px] text-[var(--ws-sand)]">
              <ArrowRight className="size-3.5 shrink-0" aria-hidden="true" />
              <span>{active.suggestion}</span>
            </div>
          </div>
        </nav>

        {/* 右：推荐改写 */}
        <section aria-labelledby="rewritten-title" className="min-w-0">
          <h2 id="rewritten-title" className="text-[13px] font-medium uppercase tracking-wider text-[var(--ws-muted)]">
            推荐简历
          </h2>
          <div className="ws-scroll mt-3 h-[520px] overflow-y-auto rounded-xl border border-[var(--ws-sand)]/40 bg-[var(--ws-panel)]">
            <p className="whitespace-pre-wrap p-5 text-[13.5px] leading-[1.9] text-[var(--ws-ink-2)]">
              {renderHighlighted(result.rewrittenResume, active.rewrittenQuote, rightMarkRef)}
            </p>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-[var(--ws-muted)]">
            由本地规则生成，只调整了措辞与结构，没有添加任何原文里没有的事实。
          </p>
        </section>
      </div>
    </div>
  )
}
