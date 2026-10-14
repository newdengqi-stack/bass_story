'use client'

import { AlertCircle, Send } from 'lucide-react'
import { DIFFICULTY_META, type Difficulty } from '@/lib/interrogation-types'
import { DIFFICULTY_ICON } from './room-types'

/** 开局：选审讯强度。三种强度的差别写在卡片上，不让用户猜。 */
export function DifficultyPicker({
  errorMsg,
  onStart,
}: {
  errorMsg: string | null
  onStart: (level: Difficulty) => void
}) {
  return (
    <div className="mt-10">
      {errorMsg && (
        <p role="alert" className="mb-6 flex items-start gap-2 text-[13px] leading-relaxed text-[var(--ws-warn)]">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
          {errorMsg}
        </p>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {(Object.keys(DIFFICULTY_META) as Difficulty[]).map((level) => {
          const meta = DIFFICULTY_META[level]
          const Icon = DIFFICULTY_ICON[level]
          return (
            <button
              key={level}
              type="button"
              onClick={() => onStart(level)}
              className="group ws-ghost-box flex flex-col items-start gap-3 px-5 py-6 text-left transition-colors hover:border-[var(--ws-sand)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-sand)]"
            >
              <Icon className="size-6 text-[var(--ws-sand)]" aria-hidden="true" />
              <div>
                <p className="text-[16px] font-semibold text-[var(--ws-ink)]">{meta.label}</p>
                <p className="mt-0.5 text-[12px] text-[var(--ws-muted)]">{meta.tagline}</p>
              </div>
              <p className="text-[13px] leading-relaxed text-[var(--ws-ink-2)]">{meta.detail}</p>
              <span className="mt-auto inline-flex items-center gap-1 text-[13px] font-medium text-[var(--ws-sand)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                开始拷问 <Send className="size-3.5" aria-hidden="true" />
              </span>
            </button>
          )
        })}
      </div>

      <p className="mt-6 text-[12px] text-[var(--ws-muted)]">
        每轮固定 6 题，可以打字也可以开口说，答错当场给参考答案，答不上来可以跳过。
      </p>
    </div>
  )
}
