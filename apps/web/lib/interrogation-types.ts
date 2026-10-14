// 拷打模式共享的类型与常量 —— 单独拆出来，因为 'use server' 文件只能导出 async 函数。

export type Difficulty = 'soft' | 'strict' | 'soul'

export const DIFFICULTY_META: Record<Difficulty, { label: string; tagline: string; detail: string }> = {
  soft: {
    label: '温和盘问',
    tagline: '学长学姐式确认',
    detail: '语气温和，给你把话说完的空间，方向对、逻辑自洽就算通过。',
  },
  strict: {
    label: '严格审查',
    tagline: '技术面官式追问',
    detail: '要求答案具体、有依据，会追问细节和取舍，泛泛而谈判不通过。',
  },
  soul: {
    label: '灵魂拷问',
    tagline: '步步紧逼的终极审讯',
    detail: '专挑最薄弱的环节追问到底，只有真正做过且讲得清楚的才算过关。',
  },
}

export type InterrogationQuestion = {
  id: string
  category: string
  projectRef: string
  prompt: string
  focusPoints: string[]
}

export type AnswerVerdict = {
  correct: boolean
  score: number
  feedback: string
  missing: string[]
  referenceAnswer: string
}

export type InterrogationRecordInput = {
  category: string
  prompt: string
  answerText: string
  skipped: boolean
  seconds: number
  verdict: AnswerVerdict | null
}

export type InterrogationSummary = {
  overallScore: number
  verdictLabel: string
  closing: string
  strengths: string[]
  weaknesses: string[]
  nextActions: string[]
  categoryBreakdown: { category: string; score: number }[]
}

export type QuestionsOutcome = { ok: true; data: InterrogationQuestion[] } | { ok: false; error: string }
export type VerdictOutcome = { ok: true; data: AnswerVerdict } | { ok: false; error: string }
export type SummaryOutcome = { ok: true; data: InterrogationSummary } | { ok: false; error: string }
