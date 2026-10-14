'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Check, FileText, Lock, Quote, RotateCcw, Sparkles, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { parseJd, SAMPLE_JD, type JdBreakdown, type JdTag, type Strength } from '@/lib/jd-parse'

const COLUMNS: { id: Strength; title: string; hint: string; tone: string }[] = [
  { id: 'must', title: '必须', hint: 'JD 中明确要求', tone: 'bg-[var(--ws-sand)]' },
  { id: 'plus', title: '加分', hint: '带「优先 / 了解」等措辞', tone: 'bg-[var(--ws-info)]' },
  { id: 'inferred', title: '岗位推断', hint: '原文未写，默认不参与差距判定', tone: 'bg-[var(--ws-muted)]' },
]

const NEXT_STRENGTH: Record<Strength, Strength> = { must: 'plus', plus: 'inferred', inferred: 'must' }

export function JdWorkbench() {
  const [text, setText] = useState('')
  const [result, setResult] = useState<JdBreakdown | null>(null)
  const [confirmed, setConfirmed] = useState<Set<string>>(new Set())
  const [activeSource, setActiveSource] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  function analyze() {
    const parsed = parseJd(text)
    if (parsed.tags.length === 0 && parsed.hard.length === 0) {
      setError('没能从这段文字里识别出能力项，确认粘贴的是岗位描述本身吗？')
      setResult(null)
      return
    }
    setError(null)
    setConfirmed(new Set())
    setActiveSource(null)
    setResult(parsed)
  }

  function updateTag(id: string, patch: Partial<JdTag> | null) {
    setResult((prev) => {
      if (!prev) return prev
      const tags = patch === null ? prev.tags.filter((t) => t.id !== id) : prev.tags.map((t) => (t.id === id ? { ...t, ...patch } : t))
      return { ...prev, tags }
    })
  }

  function toggleConfirm(id: string) {
    setConfirmed((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function reset() {
    setResult(null)
    setText('')
    setError(null)
  }

  const total = result?.tags.length ?? 0

  return (
    <section aria-labelledby="workbench-title" className="ws-glass-card mt-10 rounded-3xl p-6 md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ws-sand)]">JD Breakdown</p>
          <h2 id="workbench-title" className="mt-2 text-[22px] font-semibold tracking-tight text-[var(--ws-ink)]">
            拆解一份新的 JD
          </h2>
          <p className="mt-1.5 max-w-xl text-[14px] leading-relaxed text-[var(--ws-muted)]">
            每个能力项都会回链到原文片段。点击标签可查看出处，确认、改强度或删除。
          </p>
        </div>
        {result && (
          <button
            type="button"
            onClick={reset}
            className="ws-pill inline-flex items-center gap-1.5 px-4 py-2 text-[13px] text-[var(--ws-ink-2)]"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            换一份 JD
          </button>
        )}
      </div>

      {!result ? (
        <div className="mt-6">
          <label htmlFor="jd-input" className="sr-only">
            岗位描述原文
          </label>
          <textarea
            id="jd-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={9}
            placeholder="把招聘页上的「岗位职责」和「任职要求」整段粘贴进来……"
            className="w-full resize-y rounded-2xl border border-[var(--ws-line)] bg-[var(--ws-field)] p-4 text-[14px] leading-relaxed text-[var(--ws-ink)] placeholder:text-[var(--ws-muted)]/70 focus:border-[var(--ws-sand)] focus:outline-none"
          />
          {error && (
            <p role="alert" className="mt-3 text-[13px] text-[var(--ws-miss)]">
              {error}
            </p>
          )}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setText(SAMPLE_JD)}
              className="inline-flex items-center gap-1.5 text-[13px] text-[var(--ws-muted)] underline-offset-4 transition-colors hover:text-[var(--ws-ink)] hover:underline"
            >
              <FileText className="size-3.5" aria-hidden="true" />
              填入示例 JD
            </button>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[12px] tabular-nums text-[var(--ws-muted)]">{text.trim().length} 字</span>
              <button
                type="button"
                onClick={analyze}
                disabled={text.trim().length < 20}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--ws-sand-fill)] px-5 py-2.5 text-[14px] font-medium text-[var(--ws-on-sand)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Sparkles className="size-4" aria-hidden="true" />
                开始拆解
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-6">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[13px] text-[var(--ws-muted)]">
            <span>
              共识别 <strong className="font-semibold tabular-nums text-[var(--ws-ink)]">{total}</strong> 个能力项
            </span>
            <span>
              已确认 <strong className="font-semibold tabular-nums text-[var(--ws-ok)]">{confirmed.size}</strong> / {total}
            </span>
            <span>
              硬性条件 <strong className="font-semibold tabular-nums text-[var(--ws-ink)]">{result.hard.length}</strong>
            </span>
          </div>
          <div className="mt-3 h-1 overflow-hidden rounded-full bg-[var(--ws-line)]">
            <div
              className="h-full rounded-full bg-[var(--ws-ok)] transition-[width] duration-500"
              style={{ width: total ? `${(confirmed.size / total) * 100}%` : '0%' }}
            />
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {COLUMNS.map((col) => {
              const items = result.tags.filter((t) => t.strength === col.id)
              return (
                <div key={col.id} className="rounded-2xl border border-[var(--ws-line)] bg-black/15 p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-[15px] font-semibold text-[var(--ws-ink)]">
                      <span className={cn('size-2 rounded-full', col.tone)} aria-hidden="true" />
                      {col.title}
                    </h3>
                    <span className="font-mono text-[12px] tabular-nums text-[var(--ws-muted)]">{items.length}</span>
                  </div>
                  <p className="mt-1 text-[12px] text-[var(--ws-muted)]">{col.hint}</p>
                  <ul className="mt-4 flex flex-col gap-2">
                    {items.length === 0 && <li className="text-[13px] text-[var(--ws-muted)]/80">暂无</li>}
                    {items.map((tag) => {
                      const isConfirmed = confirmed.has(tag.id)
                      const isOpen = activeSource === tag.id
                      return (
                        <li
                          key={tag.id}
                          className={cn(
                            'rounded-xl border px-3 py-2.5 transition-colors',
                            isConfirmed ? 'border-[var(--ws-ok)]/50 bg-[var(--ws-ok)]/10' : 'border-[var(--ws-line)] bg-white/5',
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveSource(isOpen ? null : tag.id)}
                              aria-expanded={isOpen}
                              className="min-w-0 flex-1 text-left"
                            >
                              <span className="block truncate text-[14px] font-medium text-[var(--ws-ink)]">{tag.label}</span>
                              <span className="text-[11px] text-[var(--ws-muted)]">
                                {tag.category === 'tech' ? '技术' : '工程能力'}
                              </span>
                            </button>
                            <button
                              type="button"
                              onClick={() => updateTag(tag.id, { strength: NEXT_STRENGTH[tag.strength] })}
                              className="rounded-full border border-[var(--ws-line)] px-2 py-0.5 text-[11px] text-[var(--ws-muted)] transition-colors hover:text-[var(--ws-ink)]"
                              aria-label={`调整 ${tag.label} 的要求强度`}
                            >
                              改强度
                            </button>
                            <button
                              type="button"
                              onClick={() => toggleConfirm(tag.id)}
                              aria-pressed={isConfirmed}
                              aria-label={isConfirmed ? `取消确认 ${tag.label}` : `确认 ${tag.label}`}
                              className={cn(
                                'grid size-7 place-items-center rounded-full transition-colors',
                                isConfirmed ? 'bg-[var(--ws-ok)] text-[#0d2a17]' : 'text-[var(--ws-muted)] hover:bg-white/10 hover:text-[var(--ws-ink)]',
                              )}
                            >
                              <Check className="size-3.5" aria-hidden="true" />
                            </button>
                            <button
                              type="button"
                              onClick={() => updateTag(tag.id, null)}
                              aria-label={`删除 ${tag.label}`}
                              className="grid size-7 place-items-center rounded-full text-[var(--ws-muted)] transition-colors hover:bg-[var(--ws-miss-soft)] hover:text-[var(--ws-miss)]"
                            >
                              <X className="size-3.5" aria-hidden="true" />
                            </button>
                          </div>
                          {isOpen && (
                            <p className="mt-2 flex gap-2 border-t border-[var(--ws-line)] pt-2 text-[12px] leading-relaxed text-[var(--ws-ink-2)]">
                              <Quote className="mt-0.5 size-3 shrink-0 text-[var(--ws-sand)]" aria-hidden="true" />
                              {tag.source ?? '原文未提及，按岗位类型推断。'}
                            </p>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )
            })}
          </div>

          <div className="mt-4 rounded-2xl border border-dashed border-[var(--ws-warn)]/50 bg-[var(--ws-warn)]/5 p-4">
            <h3 className="flex items-center gap-2 text-[15px] font-semibold text-[var(--ws-ink)]">
              <Lock className="size-4 text-[var(--ws-warn)]" aria-hidden="true" />
              硬性条件
              <span className="text-[12px] font-normal text-[var(--ws-muted)]">项目经历无法弥补，单独列出</span>
            </h3>
            {result.hard.length === 0 ? (
              <p className="mt-3 text-[13px] text-[var(--ws-muted)]">未识别到学历、届别、语言等硬性条件。</p>
            ) : (
              <ul className="mt-3 flex flex-wrap gap-2">
                {result.hard.map((h) => (
                  <li
                    key={h.id}
                    title={h.source}
                    className="rounded-full border border-[var(--ws-warn)]/40 px-3 py-1 text-[13px] text-[var(--ws-ink-2)]"
                  >
                    {h.label}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
            <p className="mr-auto text-[13px] text-[var(--ws-muted)]">确认完后，用这份拆解去对照你的证据。</p>
            <Link
              href="/gap"
              className="inline-flex items-center gap-2 rounded-full bg-[var(--ws-sand-fill)] px-5 py-2.5 text-[14px] font-medium text-[var(--ws-on-sand)] transition-opacity hover:opacity-90"
            >
              进入差距分析
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      )}
    </section>
  )
}
