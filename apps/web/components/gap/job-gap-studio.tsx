'use client'

import { useRef, useState, useTransition } from 'react'
import { AlertCircle, Check, ImageIcon, Link2, Loader2, RotateCcw, Sparkles, Type, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { analyzeJobPosting, type JobAnalysisResult, type JobRequirement } from '@/lib/job-gap-analysis'

const IMPORTANCE_LABEL: Record<JobRequirement['importance'], string> = {
  must: '明确要求',
  plus: '加分项',
}

type InputMode = 'text' | 'link' | 'image'

const MODE_TABS: { id: InputMode; label: string; icon: typeof Type }[] = [
  { id: 'text', label: '粘贴岗位描述', icon: Type },
  { id: 'link', label: '粘贴招聘链接', icon: Link2 },
  { id: 'image', label: '上传招聘截图', icon: ImageIcon },
]

const STATUS_META: Record<
  JobRequirement['status'],
  { label: string; dot: string; text: string }
> = {
  ready: { label: '已具备', dot: 'bg-[var(--ws-ok)]', text: 'text-[var(--ws-ok)]' },
  insufficient: { label: '证据不足', dot: 'bg-[var(--ws-warn)]', text: 'text-[var(--ws-warn)]' },
  missing: { label: '当前缺失', dot: 'bg-[var(--ws-miss)]', text: 'text-[var(--ws-miss)]' },
}

const EFFORT_LABEL: Record<NonNullable<JobRequirement['effort']>, string> = {
  low: '投入较低',
  mid: '投入中等',
  high: '投入较高',
}

export function JobGapStudio() {
  const [mode, setMode] = useState<InputMode>('text')
  const [text, setText] = useState('')
  const [link, setLink] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<JobAnalysisResult | null>(null)
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canSubmit =
    (mode === 'text' && text.trim().length >= 20) ||
    (mode === 'link' && link.trim().length > 0) ||
    (mode === 'image' && imageFile !== null)

  function handleFile(file: File | null) {
    setImageFile(file)
    if (imagePreview) URL.revokeObjectURL(imagePreview)
    setImagePreview(file ? URL.createObjectURL(file) : null)
  }

  function onSubmit() {
    setError(null)
    const formData = new FormData()
    formData.set('mode', mode)
    if (mode === 'text') formData.set('text', text)
    if (mode === 'link') formData.set('link', link)
    if (mode === 'image' && imageFile) formData.set('image', imageFile)

    startTransition(async () => {
      const outcome = await analyzeJobPosting(formData)
      if (!outcome.ok) {
        setError(outcome.error)
        return
      }
      if (outcome.data.requirements.length === 0) {
        setError('没能从这段内容里识别出岗位要求，确认一下粘贴的是招聘信息本身吗？')
        return
      }
      setResult(outcome.data)
    })
  }

  function reset() {
    setResult(null)
    setError(null)
  }

  if (result) {
    return <AnalysisResult result={result} onReset={reset} />
  }

  return (
    <div className="ws-ghost-box mt-10 px-6 py-7 md:px-8 md:py-8">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="岗位信息输入方式">
        {MODE_TABS.map((tab) => {
          const Icon = tab.icon
          const active = mode === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => {
                setMode(tab.id)
                setError(null)
              }}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] font-medium transition-colors',
                active
                  ? 'border-[var(--ws-sand)] bg-[var(--ws-sand)]/10 text-[var(--ws-sand)]'
                  : 'border-[var(--ws-line)] text-[var(--ws-muted)] hover:text-[var(--ws-ink)]',
              )}
            >
              <Icon className="size-3.5" aria-hidden="true" />
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="mt-6">
        {mode === 'text' && (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="把招聘网站上的岗位描述完整粘贴进来，包括岗位职责和任职要求……"
            rows={7}
            className="w-full resize-none rounded-lg border border-[var(--ws-line)] bg-[var(--ws-panel)] px-4 py-3 text-[14px] leading-relaxed text-[var(--ws-ink)] placeholder:text-[var(--ws-muted)] focus:border-[var(--ws-sand)] focus:outline-none"
          />
        )}

        {mode === 'link' && (
          <input
            type="url"
            inputMode="url"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://example.com/jobs/12345"
            className="w-full rounded-lg border border-[var(--ws-line)] bg-[var(--ws-panel)] px-4 py-3 text-[14px] text-[var(--ws-ink)] placeholder:text-[var(--ws-muted)] focus:border-[var(--ws-sand)] focus:outline-none"
          />
        )}

        {mode === 'image' && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
            {!imagePreview ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--ws-line-2)] bg-[var(--ws-panel)] px-4 py-10 text-[var(--ws-muted)] transition-colors hover:border-[var(--ws-sand)] hover:text-[var(--ws-ink)]"
              >
                <ImageIcon className="size-6" aria-hidden="true" />
                <span className="text-[14px]">点击选择招聘页面截图</span>
                <span className="text-[12px]">支持 JPG / PNG，最大 8MB</span>
              </button>
            ) : (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element -- 用户本地截图预览，非站点资源 */}
                <img
                  src={imagePreview || '/placeholder.svg'}
                  alt="已选择的招聘页面截图预览"
                  className="max-h-64 rounded-lg border border-[var(--ws-line)] object-contain"
                />
                <button
                  type="button"
                  onClick={() => handleFile(null)}
                  aria-label="移除截图"
                  className="absolute right-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 flex items-start gap-2 text-[13px] leading-relaxed text-[var(--ws-warn)]">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit || isPending}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--ws-sand)] px-6 py-2.5 text-[14px] font-medium text-[var(--ws-bg)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            正在逐条分析岗位要求……
          </>
        ) : (
          <>
            <Sparkles className="size-4" aria-hidden="true" />
            开始分析
          </>
        )}
      </button>
    </div>
  )
}

function AnalysisResult({ result, onReset }: { result: JobAnalysisResult; onReset: () => void }) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const gaps = result.requirements.filter((r) => r.status !== 'ready')
  const readyCount = result.requirements.length - gaps.length
  const active = result.requirements[selectedIndex] ?? result.requirements[0]

  if (!active) return null

  const activeMeta = STATUS_META[active.status]

  return (
    <div className="mt-10">
      <div className="ws-ghost-box flex flex-wrap items-center justify-between gap-4 px-5 py-4">
        <div>
          <p className="text-[13px] text-[var(--ws-muted)]">识别到的岗位</p>
          <p className="mt-0.5 text-[16px] font-medium text-[var(--ws-ink)]">{result.roleGuess}</p>
        </div>
        <div className="flex items-center gap-6">
          <Stat label="已具备" value={readyCount} className="text-[var(--ws-ok)]" />
          <Stat label="需要补齐" value={gaps.length} className="text-[var(--ws-warn)]" />
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ws-line)] px-4 py-2 text-[13px] text-[var(--ws-ink-2)] transition-colors hover:text-[var(--ws-ink)]"
          >
            <RotateCcw className="size-3.5" aria-hidden="true" />
            换一个岗位重新分析
          </button>
        </div>
      </div>

      <div className="mt-8 grid items-start gap-10 lg:grid-cols-[260px_1fr_300px] lg:gap-8">
        {/* ============ 左：岗位要求目录 ============ */}
        <nav
          aria-label="岗位要求目录"
          className="ws-scroll lg:sticky lg:top-24 lg:max-h-[calc(100svh-7rem)] lg:overflow-y-auto lg:border-r lg:border-[var(--ws-line)] lg:pr-6"
        >
          <h2 className="text-[12px] font-medium uppercase tracking-wider text-[var(--ws-muted)]">
            岗位要求（{result.requirements.length}）
          </h2>
          <ul className="mt-4 flex flex-col gap-1 lg:gap-1.5">
            {result.requirements.map((req, i) => {
              const meta = STATUS_META[req.status]
              const isActive = i === selectedIndex
              return (
                <li key={`${req.skill}-${i}`}>
                  <button
                    type="button"
                    onClick={() => setSelectedIndex(i)}
                    aria-current={isActive ? 'true' : undefined}
                    className={cn(
                      'w-full rounded-lg px-3 py-2.5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-sand)]',
                      isActive
                        ? 'bg-[var(--ws-ghost)] text-[var(--ws-ink)]'
                        : 'text-[var(--ws-ink-2)] hover:bg-[var(--ws-ghost)]/60 hover:text-[var(--ws-ink)]',
                    )}
                  >
                    <span className="flex items-center gap-2">
                      <span className={cn('size-1.5 shrink-0 rounded-full', meta.dot)} aria-hidden="true" />
                      <span className="text-[14px] font-medium">{req.skill}</span>
                    </span>
                    <span className="mt-0.5 block pl-3.5 text-[12px] text-[var(--ws-muted)]">
                      {IMPORTANCE_LABEL[req.importance]} · {meta.label}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* ============ 中：原文 / 判断依据 ============ */}
        <section
          aria-labelledby="req-detail-title"
          className="ws-scroll min-w-0 lg:sticky lg:top-24 lg:max-h-[calc(100svh-7rem)] lg:overflow-y-auto lg:pr-2"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 id="req-detail-title" className="text-[20px] font-semibold tracking-tight text-[var(--ws-ink)]">
              {active.skill}
            </h2>
            <span className={cn('text-[12px] font-medium', activeMeta.text)}>{activeMeta.label}</span>
          </div>

          <p className="mt-2 text-[12px] text-[var(--ws-muted)]">{IMPORTANCE_LABEL[active.importance]}</p>

          <div className="mt-8">
            <h3 className="text-[13px] font-medium text-[var(--ws-ink-2)]">岗位原文</h3>
            <div className="ws-ghost-box mt-3 px-5 py-4">
              <p className="text-[14px] leading-relaxed text-[var(--ws-ink)]">
                {'“'}
                {active.quote}
                {'”'}
              </p>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-[13px] font-medium text-[var(--ws-ink-2)]">判断依据</h3>
            <p className="mt-3 text-[14px] leading-relaxed text-[var(--ws-ink-2)]">{active.reason}</p>
          </div>
        </section>

        {/* ============ 右：对应办法 ============ */}
        <aside
          aria-labelledby="solution-title"
          className="ws-scroll lg:sticky lg:top-24 lg:max-h-[calc(100svh-7rem)] lg:overflow-y-auto lg:border-l lg:border-[var(--ws-line)] lg:pl-6"
        >
          <h2 id="solution-title" className="text-[12px] font-medium uppercase tracking-wider text-[var(--ws-muted)]">
            对应的办法
          </h2>

          {active.status === 'ready' ? (
            <p className="mt-4 flex items-start gap-2 text-[13px] leading-relaxed text-[var(--ws-ok)]">
              <Check className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              这一项你已经有证据支撑，不需要额外补充。
            </p>
          ) : (
            <div className="mt-4">
              {active.effort && (
                <span className="inline-block rounded-full border border-[var(--ws-ghost-line)] px-2.5 py-0.5 text-[12px] text-[var(--ws-ink-2)]">
                  {EFFORT_LABEL[active.effort]}
                </span>
              )}
              <p className="mt-3 text-[14px] leading-relaxed text-[var(--ws-ink-2)]">{active.solution}</p>
            </div>
          )}

          <div className="mt-8 border-t border-[var(--ws-line)] pt-5">
            <h3 className="text-[13px] font-medium text-[var(--ws-ink-2)]">其他待补项</h3>
            {gaps.length === 0 ? (
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--ws-muted)]">没有其他需要补齐的项。</p>
            ) : (
              <ul className="mt-2 flex flex-col gap-2">
                {gaps.map((g) => {
                  const i = result.requirements.indexOf(g)
                  const meta = STATUS_META[g.status]
                  return (
                    <li key={`${g.skill}-${i}`}>
                      <button
                        type="button"
                        onClick={() => setSelectedIndex(i)}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-[13px] transition-colors hover:bg-[var(--ws-ghost)]/60',
                          i === selectedIndex ? 'text-[var(--ws-ink)]' : 'text-[var(--ws-ink-2)]',
                        )}
                      >
                        <span className={cn('size-1.5 shrink-0 rounded-full', meta.dot)} aria-hidden="true" />
                        {g.skill}
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}

function Stat({ label, value, className }: { label: string; value: number; className?: string }) {
  return (
    <div className="text-right">
      <p className={cn('text-[22px] font-semibold leading-none tabular-nums', className)}>{value}</p>
      <p className="mt-1 text-[11px] text-[var(--ws-muted)]">{label}</p>
    </div>
  )
}
