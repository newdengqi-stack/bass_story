'use client'

import { AlertCircle, Loader2, Mic, Send, SkipForward, Timer } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InterrogationQuestion } from '@/lib/interrogation-types'
import { formatTime } from './room-types'

/** 左右两栏：左边审讯官出题 + 计时，右边作答区。 */
export function AnswerPanel({
  question,
  elapsed,
  answerText,
  onAnswerChange,
  micSupported,
  listening,
  onToggleMic,
  judging,
  errorMsg,
  onSubmit,
  onSkip,
}: {
  question: InterrogationQuestion
  elapsed: number
  answerText: string
  onAnswerChange: (v: string) => void
  micSupported: boolean
  listening: boolean
  onToggleMic: () => void
  judging: boolean
  errorMsg: string | null
  onSubmit: () => void
  onSkip: () => void
}) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* 审讯官 */}
      <div className="ws-ghost-box flex flex-col justify-between px-6 py-7">
        <div>
          <div className="flex items-center gap-2 text-[12px] font-medium uppercase tracking-wider text-[var(--ws-muted)]">
            <span className="interrogate-rec-dot size-1.5 rounded-full bg-[var(--ws-miss)]" aria-hidden="true" />
            {question.category} · {question.projectRef}
          </div>
          <p className="mt-5 text-[22px] font-semibold leading-snug tracking-tight text-[var(--ws-ink)]">
            {question.prompt}
          </p>
        </div>
        <div className="mt-8 flex items-center gap-2 font-mono text-[28px] tabular-nums text-[var(--ws-sand)]">
          <Timer className="size-5" aria-hidden="true" />
          {formatTime(elapsed)}
        </div>
      </div>

      {/* 供词 */}
      <div className="ws-ghost-box flex flex-col px-6 py-7">
        <div className="flex items-center justify-between">
          <label htmlFor="interrogate-answer" className="text-[12px] font-medium uppercase tracking-wider text-[var(--ws-muted)]">
            你的回答
          </label>
          {micSupported && (
            <button
              type="button"
              onClick={onToggleMic}
              aria-pressed={listening}
              className={cn(
                'flex size-8 items-center justify-center rounded-full border transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-sand)]',
                listening
                  ? 'animate-breathe border-[var(--ws-miss)] bg-[var(--ws-miss)]/20 text-[var(--ws-miss)]'
                  : 'border-[var(--ws-line)] text-[var(--ws-muted)] hover:text-[var(--ws-ink)]',
              )}
              aria-label={listening ? '停止语音输入' : '开始语音输入'}
            >
              <Mic className="size-4" aria-hidden="true" />
            </button>
          )}
        </div>

        <textarea
          id="interrogate-answer"
          value={answerText}
          onChange={(e) => onAnswerChange(e.target.value)}
          placeholder={micSupported ? '打字，或者点右上角的麦克风直接说……' : '在这里打字作答……'}
          rows={6}
          className="mt-3 w-full flex-1 resize-none rounded-lg border border-[var(--ws-line)] bg-[var(--ws-panel)] px-4 py-3 text-[14px] leading-relaxed text-[var(--ws-ink)] placeholder:text-[var(--ws-muted)] focus:border-[var(--ws-sand)] focus:outline-none"
        />

        {errorMsg && (
          <p role="alert" className="mt-3 flex items-start gap-2 text-[13px] leading-relaxed text-[var(--ws-warn)]">
            <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {errorMsg}
          </p>
        )}

        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={onSubmit}
            disabled={!answerText.trim() || judging}
            className="inline-flex items-center gap-2 rounded-full bg-[var(--ws-sand)] px-5 py-2.5 text-[14px] font-medium text-[var(--ws-on-sand)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-ink)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {judging ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="size-4" aria-hidden="true" />
            )}
            {judging ? '正在审查……' : '提交供词'}
          </button>
          <button
            type="button"
            onClick={onSkip}
            disabled={judging}
            className="inline-flex items-center gap-1.5 rounded-full border border-[var(--ws-line)] px-4 py-2.5 text-[13px] text-[var(--ws-ink-2)] transition-colors hover:text-[var(--ws-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-sand)] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <SkipForward className="size-3.5" aria-hidden="true" />
            暂时跳过
          </button>
        </div>
      </div>
    </div>
  )
}
