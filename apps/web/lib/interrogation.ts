'use server'

// 拷打模式 —— 基于候选人的项目经历与目标岗位生成追问式面试题，
// 逐题即时判定作答是否经得起推敲，答错当场给参考答案，最后生成一份综合结案报告。
//
// ⚠️ 演示实现：原版通过 AI SDK 的 generateObject 调用大模型（模型标识写死为 v0 平台的
// Gateway 名称，在本仓库无密钥会整体失败）。现改为确定性本地规则实现，
// 与本项目 lib/jd-parse.ts、lib/session-engine.ts 的「规则定边界」做法一致。
//
// 恢复真实 AI 调用时：把下面三个函数体换回 generateObject({ model, schema, system, prompt })，
// 上方三个 zod schema 原样保留即可直接复用；并重新安装 `ai` 依赖。

import { z } from 'zod'
import { GAP_ITEMS, PROJECTS } from './mock-data'
import type {
  Difficulty,
  InterrogationQuestion,
  InterrogationRecordInput,
  QuestionsOutcome,
  SummaryOutcome,
  VerdictOutcome,
} from './interrogation-types'
import type { GapItem, Project } from '@zhitu/types'

const QUESTION_COUNT = 6

/* ============ AI 契约（保留） ============ */
// 这三份 schema 原本是 generateObject 的返回结构，现在用来校验本地规则实现的输出。
// 好处有二：恢复 AI 调用时直接用它们；本地实现在契约上跑偏会立刻暴露。

const questionsSchema = z.object({
  questions: z
    .array(
      z.object({
        id: z.string(),
        category: z.string(),
        projectRef: z.string(),
        prompt: z.string().min(8),
        focusPoints: z.array(z.string()).min(2).max(4),
      }),
    )
    .length(QUESTION_COUNT),
})

const verdictSchema = z.object({
  correct: z.boolean(),
  score: z.number().min(0).max(100),
  feedback: z.string(),
  missing: z.array(z.string()),
  referenceAnswer: z.string(),
})

const summarySchema = z.object({
  overallScore: z.number().min(0).max(100),
  verdictLabel: z.string(),
  closing: z.string(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  nextActions: z.array(z.string()),
  categoryBreakdown: z.array(z.object({ category: z.string(), score: z.number().min(0).max(100) })),
})

/* ============ 出题 ============ */

/** 越靠前越薄弱 —— 拷打优先挑最经不起问的地方 */
const WEAKNESS_ORDER: Record<GapItem['status'], number> = {
  missing: 0,
  insufficient: 1,
  claimed: 2,
  verified: 3,
}

/** 同一道追问的四种问法，按维度轮换，避免一水儿的同一句式 */
type Template = {
  category: string
  build: (skill: string, project: Project) => string
  focus: (skill: string) => string[]
}

const TEMPLATES: Template[] = [
  {
    category: '调试定位',
    build: (s, p) => `你说 ${p.name} 里用过 ${s}。哪一次故障逼着你把 ${s} 翻了个底朝天？当时怎么定位到根因的？`,
    focus: (s) => [`${s} 出问题时的具体现象`, '排除过的假设，以及为什么排除', '最终定位到根因的判断依据'],
  },
  {
    category: '技术选型',
    build: (s, p) => `${p.name} 为什么用 ${s}？当时还比较过哪些方案，为什么没选它们？`,
    focus: (s) => [`选 ${s} 的关键理由`, '被放弃的备选方案及放弃原因', '这个选择后来留下的代价'],
  },
  {
    category: '关键实现',
    build: (s, p) => `${p.name} 里 ${s} 这块最难的地方在哪？你是怎么把它做出来的？`,
    focus: (s) => [`${s} 实现中的技术难点`, '你的解决思路与取舍', '怎么确认做对了'],
  },
  {
    category: '个人贡献',
    build: (s, p) => `${p.name} 里和 ${s} 相关的工作，具体哪些是你亲手做的？边界在哪？`,
    focus: () => ['你本人负责的具体部分', '与协作者的分工边界', '你独立做出的关键决定'],
  },
  {
    category: '局限与改进',
    build: (s, p) => `${s} 这个部分，现在回头看有什么不足？如果重做你会怎么改？`,
    focus: (s) => [`${s} 现有的局限`, '已知但没解决的问题', '重做时的具体改进方向'],
  },
]

function pickProjectFor(skill: string, index: number): Project {
  return PROJECTS.find((p) => p.tech.some((t) => t.includes(skill) || skill.includes(t))) ?? PROJECTS[index % PROJECTS.length]
}

/** 从证据状态最弱的能力项生成题目 —— 挑的就是最经不起问的地方 */
export async function generateInterrogationQuestions(difficulty: Difficulty): Promise<QuestionsOutcome> {
  const weakest = [...GAP_ITEMS]
    .filter((g) => g.bucket !== 'hard')
    .sort((a, b) => WEAKNESS_ORDER[a.status] - WEAKNESS_ORDER[b.status] || a.skill.localeCompare(b.skill))
    .slice(0, QUESTION_COUNT)

  if (weakest.length === 0) {
    return { ok: false, error: '还没有可追问的能力项，先去补齐项目证据。' }
  }

  // 「灵魂拷问」只问最薄弱的几项，把同一项拆成多角度追问
  const pool = difficulty === 'soul' ? weakest.slice(0, 3) : weakest

  const questions: InterrogationQuestion[] = Array.from({ length: QUESTION_COUNT }, (_, i) => {
    const item = pool[i % pool.length]
    const template = TEMPLATES[i % TEMPLATES.length]
    const project = pickProjectFor(item.skill, i)
    return {
      id: `q-${i}`,
      category: template.category,
      projectRef: project.name,
      prompt: template.build(item.skill, project),
      focusPoints: template.focus(item.skill),
    }
  })

  const parsed = questionsSchema.safeParse({ questions })
  if (!parsed.success) return { ok: false, error: '出题结果不符合契约，请把这个错误反馈给我们。' }
  return { ok: true, data: parsed.data.questions }
}


/* ============ 判定 ============ */

/** 各难度下「算过关」的门槛分 */
const PASS_SCORE: Record<Difficulty, number> = { soft: 55, strict: 70, soul: 82 }

/** 各难度下，答到多少字才算讲清楚了 —— 与 session-engine 的阈值同一量级 */
const ENOUGH_CHARS: Record<Difficulty, number> = { soft: 60, strict: 100, soul: 140 }

/** 去掉标点后做包含判断，避免标点差异导致误判「没覆盖」 */
function normalize(text: string): string {
  return text.replace(/[\s，。、；：？！,.;:?!「」『』（）()]/g, '')
}

/** 一个要点是否被覆盖：取要点里最长的连续片段做包含匹配 */
function covers(answer: string, focus: string): boolean {
  const a = normalize(answer)
  const f = normalize(focus)
  if (!a || !f) return false
  const probe = f.slice(0, 6)
  return a.includes(probe) || f.split('').filter((c) => a.includes(c)).length / f.length > 0.6
}

/** 判定一题的作答。评分由「说够了没有」与「要点覆盖」各占一半合成 */
export async function judgeInterrogationAnswer(
  question: InterrogationQuestion,
  answerText: string,
  difficulty: Difficulty,
): Promise<VerdictOutcome> {
  const answer = answerText.trim()
  if (answer.length === 0) {
    return { ok: false, error: '没有收到作答内容。' }
  }

  const lengthScore = Math.min(100, Math.round((answer.length / ENOUGH_CHARS[difficulty]) * 100))
  const uncovered = question.focusPoints.filter((f) => !covers(answer, f))
  const coverScore = Math.round(((question.focusPoints.length - uncovered.length) / question.focusPoints.length) * 100)
  const score = Math.max(0, Math.min(100, Math.round(lengthScore * 0.5 + coverScore * 0.5)))

  const correct = score >= PASS_SCORE[difficulty]

  const feedback = correct
    ? `要点基本覆盖到了，${uncovered.length === 0 ? '没有明显缺口' : `还差「${uncovered[0]}」`}。`
    : answer.length < ENOUGH_CHARS[difficulty]
      ? '说得太短了，没讲出过程。面试官听到这里会直接换题。'
      : `关键要点没讲到：${uncovered.slice(0, 2).join('、')}。`

  const verdict = {
    correct,
    score,
    feedback,
    missing: uncovered,
    referenceAnswer: `${question.focusPoints.map((f, i) => `${i + 1}. ${f}`).join('\n')}\n—— 按这个顺序讲，先给现象和判断依据，再给取舍。`,
  }

  const parsed = verdictSchema.safeParse(verdict)
  if (!parsed.success) return { ok: false, error: '判定结果不符合契约，请把这个错误反馈给我们。' }
  return { ok: true, data: parsed.data }
}

/* ============ 结案报告 ============ */

/** 由各题判定汇总 —— 纯聚合，不引入任何新判断 */
export async function summarizeInterrogation(
  records: InterrogationRecordInput[],
  difficulty: Difficulty,
): Promise<SummaryOutcome> {
  const answered = records.filter((r) => !r.skipped && r.verdict)
  if (answered.length === 0) {
    return { ok: false, error: '这一轮没有有效作答，无法生成报告。' }
  }

  const scores = answered.map((r) => r.verdict?.score ?? 0)
  const overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

  const byCategory = new Map<string, number[]>()
  for (const r of answered) {
    const arr = byCategory.get(r.category) ?? []
    arr.push(r.verdict?.score ?? 0)
    byCategory.set(r.category, arr)
  }
  const categoryBreakdown = [...byCategory.entries()].map(([category, list]) => ({
    category,
    score: Math.round(list.reduce((a, b) => a + b, 0) / list.length),
  }))

  const strengths = categoryBreakdown
    .filter((c) => c.score >= PASS_SCORE[difficulty])
    .map((c) => `${c.category}：均分 ${c.score}，这一项经得起追问`)
    .slice(0, 4)

  const weaknesses = [
    ...categoryBreakdown.filter((c) => c.score < PASS_SCORE[difficulty]).map((c) => `${c.category}：均分 ${c.score}，还讲不透`),
    ...[...new Set(answered.flatMap((r) => r.verdict?.missing ?? []))].map((m) => `普遍没讲到：${m}`),
  ].slice(0, 4)

  const nextActions = weaknesses.slice(0, 3).map((w) => {
    const label = w.includes('：') ? w.split('：')[0] : w
    return `针对「${label}」补一段具体的项目记录，然后回来重打这一轮`
  })

  const verdictLabel =
    overallScore >= 85 ? '基本顶住了审讯'
      : overallScore >= PASS_SCORE[difficulty] ? '有破绽，但站得住'
        : overallScore >= 50 ? '破绽不少'
          : '这块还得重做'

  const skipped = records.filter((r) => r.skipped).length

  const summary = {
    overallScore,
    verdictLabel,
    closing: `共 ${records.length} 题，作答 ${answered.length} 题${skipped > 0 ? `，跳过 ${skipped} 题` : ''}，均分 ${overallScore}。${
      weaknesses.length > 0 ? `最该补的是「${weaknesses[0].split('：')[0]}」。` : '没有明显短板。'
    }`,
    strengths,
    weaknesses,
    nextActions: nextActions.length > 0 ? nextActions : ['保持这个状态，换一个项目再来一轮'],
    categoryBreakdown,
  }

  const parsed = summarySchema.safeParse(summary)
  if (!parsed.success) return { ok: false, error: '结案报告不符合契约，请把这个错误反馈给我们。' }
  return { ok: true, data: parsed.data }
}

