// 拷打房间的共享类型与常量 —— 拆出来避免各子组件重复定义。

import { Flame, ShieldAlert, Swords } from 'lucide-react'
import type { AnswerVerdict, Difficulty, InterrogationQuestion } from '@/lib/interrogation-types'

export type Stage = 'setup' | 'loading-questions' | 'live' | 'loading-summary' | 'summary' | 'error'

export type QuestionView = 'question' | 'verdict'

export type LiveRecord = {
  question: InterrogationQuestion
  answerText: string
  skipped: boolean
  seconds: number
  verdict: AnswerVerdict | null
}

export const DIFFICULTY_ICON: Record<Difficulty, typeof Swords> = {
  soft: ShieldAlert,
  strict: Swords,
  soul: Flame,
}

/** 翻卡动画时长，与 globals.css 的 .interrogate-* 保持一致 */
export const FLIP_MS = 320

export function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

/** 一条记录转成结案报告需要的输入形状 */
export function toRecordInput(r: LiveRecord) {
  return {
    category: r.question.category,
    prompt: r.question.prompt,
    answerText: r.answerText,
    skipped: r.skipped,
    seconds: r.seconds,
    verdict: r.verdict,
  }
}
