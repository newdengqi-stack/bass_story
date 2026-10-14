'use client'

import { useRef, useState, useTransition } from 'react'
import { AlertCircle, FileText, Loader2, Sparkles, Upload } from 'lucide-react'
import { cn } from '@/lib/utils'
import { analyzeResume, extractPdfText } from '@/lib/resume-analysis'
import type { ResumeAnalysisResult } from '@/lib/resume-analysis-types'
import { SAMPLE_RESUME } from '@/lib/mock-data'
import { AnalysisResult } from './analysis-result'

type InputMode = 'text' | 'pdf'

export function ResumeAnalysisStudio() {
  const [mode, setMode] = useState<InputMode>('text')
  const [text, setText] = useState('')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [pdfName, setPdfName] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [extracting, setExtracting] = useState(false)
  const [result, setResult] = useState<ResumeAnalysisResult | null>(null)
  const [originalText, setOriginalText] = useState('')
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File | null) {
    if (!file) return
    setError(null)
    setExtracting(true)
    if (pdfUrl) URL.revokeObjectURL(pdfUrl)
    setPdfUrl(URL.createObjectURL(file))
    setPdfName(file.name)

    const buffer = await file.arrayBuffer()
    const base64 = btoa(Array.from(new Uint8Array(buffer), (b) => String.fromCharCode(b)).join(''))
    const outcome = await extractPdfText(base64)
    setExtracting(false)
    if (!outcome.ok) {
      setError(outcome.error)
      return
    }
    setText(outcome.text)
  }

  function onSubmit() {
    setError(null)
    if (text.trim().length < 30) {
      setError('简历内容太短，至少需要 30 个字符。')
      return
    }
    startTransition(async () => {
      const outcome = await analyzeResume(text)
      if (!outcome.ok) {
        setError(outcome.error)
        return
      }
      setOriginalText(text)
      setResult(outcome.result)
    })
  }

  function reset() {
    setResult(null)
    setError(null)
  }

  if (result) {
    return <AnalysisResult result={result} originalText={originalText} pdfUrl={pdfUrl} pdfName={pdfName} onReset={reset} />
  }

  return (
    <div className="ws-ghost-box mt-10 px-6 py-7 md:px-8 md:py-8">
      <div className="flex flex-wrap gap-2" role="tablist" aria-label="简历输入方式">
        {(
          [
            { id: 'text' as const, label: '粘贴文本', icon: FileText },
            { id: 'pdf' as const, label: '上传 PDF', icon: Upload },
          ]
        ).map((tab) => {
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

        <button
          type="button"
          onClick={() => {
            setMode('text')
            setText(SAMPLE_RESUME)
            setPdfUrl(null)
            setPdfName(null)
          }}
          className="ml-auto rounded-full border border-[var(--ws-ghost-line)] px-3 py-1.5 text-[12px] text-[var(--ws-muted)] transition-colors hover:border-[var(--ws-ghost-line-strong)] hover:text-[var(--ws-ink)]"
        >
          填入示例简历
        </button>
      </div>

      <div className="mt-6">
        {mode === 'text' && (
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="把简历正文整段粘贴进来……"
            rows={10}
            className="w-full resize-none rounded-lg border border-[var(--ws-line)] bg-[var(--ws-panel)] px-4 py-3 text-[14px] leading-relaxed text-[var(--ws-ink)] placeholder:text-[var(--ws-muted)] focus:border-[var(--ws-sand)] focus:outline-none"
          />
        )}

        {mode === 'pdf' && (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="sr-only"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
            />
            {!pdfUrl ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-[var(--ws-line-2)] bg-[var(--ws-panel)] px-4 py-10 text-[var(--ws-muted)] transition-colors hover:border-[var(--ws-sand)] hover:text-[var(--ws-ink)]"
              >
                <Upload className="size-6" aria-hidden="true" />
                <span className="text-[14px]">点击选择简历 PDF</span>
                <span className="text-[12px]">文字版 PDF 效果最好，扫描件可能无法提取文字</span>
              </button>
            ) : (
              <div className="flex items-center gap-4 rounded-lg border border-[var(--ws-line)] bg-[var(--ws-panel)] px-4 py-3">
                <FileText className="size-5 shrink-0 text-[var(--ws-sand)]" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[14px] text-[var(--ws-ink)]">{pdfName}</p>
                  <p className="text-[12px] text-[var(--ws-muted)]">
                    {extracting ? '正在提取文字……' : `已提取 ${text.length} 字`}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="shrink-0 rounded-full border border-[var(--ws-ghost-line)] px-3 py-1.5 text-[12px] text-[var(--ws-ink-2)] hover:text-[var(--ws-ink)]"
                >
                  重新选择
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
        disabled={text.trim().length < 30 || isPending || extracting}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[var(--ws-sand)] px-6 py-2.5 text-[14px] font-medium text-[var(--ws-bg)] transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            正在逐条比对简历……
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
