'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, ArrowLeft, X, Compass } from 'lucide-react'
import { cn } from '@/lib/utils'

const STORAGE_KEY = 'zhitu:onboarded'

// 弹窗是一块独立表面，用自己的固定配色 —— 不跟随 .ws 的 token 翻转
const INK = '#221d16'
const PAPER = '#faf8f4'
const MUTED = '#6f665a'
const LINE = 'rgb(34 29 22 / 0.14)'

const STEPS = [
  {
    tour: null as string | null,
    title: '这是你的工作台',
    body: '从这里能看到准备进度、下一步该做什么，以及每一项能力的证据状态。花一分钟走完，后面会顺手很多。',
  },
  {
    tour: 'target',
    title: '意向职业',
    body: '所有内容都围绕这一个岗位展开——差距分析、证据判定、简历版本都绑定它。岗位变了，整套上下文跟着变。',
  },
  {
    tour: 'tasks',
    title: '下一步任务',
    body: '系统把差距拆成小于 90 分钟的具体动作，每项都写清完成定义。做完一项，能力状态就地更新。',
  },
  {
    tour: 'gap',
    title: '职业差距分析',
    body: '可强调、待补证据、当前缺失分开计数；硬性条件单独列出，不假装能用项目弥补。',
  },
  {
    tour: 'evidence',
    title: '项目深挖',
    body: '四种状态：已验证 / 用户声明 / 证据不足 / 当前缺失。只有「已验证」的能力，才会被写进简历。',
  },
]

export function Onboarding() {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!window.localStorage.getItem(STORAGE_KEY)) setOpen(true)
  }, [])

  useEffect(() => {
    if (!open) return
    const tour = STEPS[step]?.tour
    document.querySelectorAll('.tour-target').forEach((el) => el.classList.remove('tour-target'))
    if (!tour) return
    const el = document.querySelector(`[data-tour="${tour}"]`)
    if (!el) return
    el.classList.add('tour-target')
    el.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [open, step])

  const finish = useCallback(() => {
    document.querySelectorAll('.tour-target').forEach((el) => el.classList.remove('tour-target'))
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, '1')
    setOpen(false)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, finish])

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setStep(0)
          setOpen(true)
        }}
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 rounded-full border px-4 py-2.5 text-[13px] backdrop-blur-md transition-colors"
        style={{
          color: '#fff',
          textShadow: '0 1px 3px rgb(12 9 20 / 0.8)',
          borderColor: 'rgb(255 255 255 / 0.28)',
          background: 'rgb(255 255 255 / 0.12)',
        }}
      >
        <Compass className="size-4" aria-hidden="true" />
        重看引导
      </button>
    )
  }

  const isFirst = step === 0
  const isLast = step === STEPS.length - 1
  const current = STEPS[step]

  return (
    <div className="fixed top-0 left-0 z-40 flex h-screen w-screen items-center justify-center p-4">
      <div className="absolute inset-0 bg-[#0c0914]/55 backdrop-blur-sm" onClick={finish} aria-hidden="true" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        className="animate-fade-up relative w-full max-w-[30rem] rounded-[1.25rem] p-7 shadow-2xl shadow-black/40 [text-shadow:none] md:p-8"
        style={{ background: PAPER, color: INK }}
      >
        <button
          type="button"
          onClick={finish}
          aria-label="跳过引导"
          className="absolute right-4 top-4 rounded-full p-2 transition-colors hover:bg-black/5"
          style={{ color: MUTED }}
        >
          <X className="size-4" aria-hidden="true" />
        </button>

        {isFirst ? (
          <>
            <span
              className="flex size-11 items-center justify-center rounded-full"
              style={{ background: INK, color: PAPER }}
            >
              <Compass className="size-5" aria-hidden="true" />
            </span>
            <h2 id="onboarding-title" className="mt-5 text-[26px] font-semibold tracking-tight">
              欢迎来到证途
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: '#4a4238' }}>
              用 5 步快速认识工作台。你不必现在看完——随时可以从右下角重新打开。
            </p>
          </>
        ) : (
          <>
            <p className="text-[12px] font-medium tabular-nums" style={{ color: MUTED }}>
              {step} / {STEPS.length - 1}
            </p>
            <h2 id="onboarding-title" className="mt-2.5 text-[26px] font-semibold tracking-tight">
              {current.title}
            </h2>
            <p className="mt-3 text-[15px] leading-relaxed" style={{ color: '#4a4238' }}>
              {current.body}
            </p>
          </>
        )}

        <div className="mt-7 flex gap-1.5" aria-hidden="true">
          {STEPS.map((_, i) => (
            <span
              key={i}
              className={cn('h-1 rounded-full transition-all duration-300', i === step ? 'w-6' : 'w-1.5')}
              style={{ background: i === step ? INK : 'rgb(34 29 22 / 0.2)' }}
            />
          ))}
        </div>

        <div className="mt-7 flex flex-wrap items-center gap-3 pt-6" style={{ borderTop: `1px solid ${LINE}` }}>
          <button
            type="button"
            onClick={() => (isLast ? finish() : setStep((s) => s + 1))}
            className="group flex items-center gap-2 rounded-full px-5 py-2.5 text-[15px] font-medium transition-transform hover:scale-[1.02]"
            style={{ background: INK, color: PAPER }}
          >
            {isFirst ? '开始引导' : isLast ? '完成' : '下一步'}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </button>

          {!isFirst && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="flex items-center gap-1.5 rounded-full border px-4 py-2.5 text-[14px] transition-colors hover:bg-black/5"
              style={{ borderColor: 'rgb(34 29 22 / 0.2)', color: '#4a4238' }}
            >
              <ArrowLeft className="size-3.5" aria-hidden="true" />
              上一步
            </button>
          )}

          <button
            type="button"
            onClick={finish}
            className="ml-auto text-[14px] transition-colors hover:opacity-70"
            style={{ color: MUTED }}
          >
            跳过
          </button>
        </div>
      </div>
    </div>
  )
}
