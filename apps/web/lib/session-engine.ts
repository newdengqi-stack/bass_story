// 追问会话引擎 —— 规则实现，与 lib/jd-parse.ts 同一种做法：
// 规则定边界（什么时候问什么、什么算证据），不假装有模型。
//
// 两条硬规则在这里落地：
//   1. 下一问必须基于本项目、目标岗位或上一轮回答 —— 不做完全无关的随机提问
//   2. 「已验证」只在用户能解释清楚时给出，不因为没有材料就一律降级

import {
  DIMENSIONS,
  MIN_EVIDENCE_COUNT,
  type ClaimKind,
  type Dimension,
  type EvidenceCard,
  type EvidenceStatus,
  type Project,
  type Target,
} from '@zhitu/types'

/* ============ 阈值 ============ */

/** 低于这个长度视为「明显过短」，提交前会提示将记为证据不足 */
export const MIN_ANSWER_LENGTH = 20

/** 达到这个长度视为讲清楚了，可以给「已验证」 */
export const DETAILED_ANSWER_LENGTH = 60

/** 同一维度最多追问几轮 */
const ROUNDS_PER_DIMENSION = 2

/* ============ 会话状态 ============ */

export type SessionPhase = 'answering' | 'generating' | 'ended'

export type AskAction = 'answered' | 'skipped' | 'never-done'

export type SessionRound = {
  /** 全局轮次，从 1 开始，用作来源标注里的「第几轮」 */
  round: number
  dimensionId: string
  dimensionIndex: number
  /** 该轮是所属维度的第几轮，从 0 开始 */
  roundInDimension: number
  question: string
  /** 这一问是否承上一轮回答生成 */
  basedOnPrevious: boolean
  /** 该轮对应的能力标签 */
  skill: string
  action: AskAction
  answer: string
}

export type SessionState = {
  rounds: SessionRound[]
  cards: EvidenceCard[]
  /** 当前所处的维度下标 */
  dimensionIndex: number
  /** 当前维度内已进行的轮数 */
  roundInDimension: number
  phase: SessionPhase
}

/* ============ 下一问怎么来 ============ */

/**
 * 话题线索 —— 命中就把追问落到用户刚提到的那个点上，
 * 而不是照本宣科问下一条通用问题。这是「追问基于上下文」的实现方式。
 */
const TOPIC_PROBES: { pattern: RegExp; probe: (hit: string) => string }[] = [
  { pattern: /周期|时序|频率|延时|定时|节拍/, probe: (h) => `你刚提到「${h}」，这个数值是怎么定下来的？换成别的取值会出现什么结果？` },
  { pattern: /选型|方案|对比|评估|替代|选(了|用)/, probe: (h) => `关于「${h}」，当时还比较过哪些方案？为什么最后没选它们？` },
  { pattern: /数据|缓存|队列|存储|链表|结构/, probe: (h) => `你提到「${h}」—— 这份数据从产生到被消费，中间经过了哪些环节？` },
  { pattern: /异常|错误|失败|重启|死锁|卡死|崩溃/, probe: (h) => `「${h}」出现的条件是什么？当时你是怎么让它不再发生的？` },
  { pattern: /测试|验证|复现|用例|测过/, probe: (h) => `你说到「${h}」—— 怎么确认结论是对的？有没有能反复复现的做法？` },
  { pattern: /团队|评审|文档|沟通|协作/, probe: (h) => `这部分有别人参与吗？你负责的是哪一块，边界在哪？` },
  { pattern: /因为|所以|为了|原因/, probe: () => '你讲到的这个因果关系，能再往后推一层吗？为什么它会带来你预期的效果？' },
]

/** 每个维度的通用深挖问法（没命中话题线索时用） */
const GENERIC_FOLLOW_UP: Record<string, string[]> = {
  goal: ['做到什么程度才算达标？当时有没有明确的验收标准？'],
  contribution: ['这部分里，哪几个决定是你做的，哪几个是别人定的？'],
  architecture: ['如果其中某个环节断了，整个链路会怎样？'],
  choice: ['这个选择后来被证明是对的吗？有没有留下代价？'],
  implementation: ['换个人来做，最容易卡在哪一步？'],
  debugging: ['除了最终定位到的那条路，你还排除过哪些可能？'],
  exception: ['这个处理方式有没有覆盖不到的情况？'],
  quality: ['这些做法里，哪一条是你自己坚持加的，而不是团队要求的？'],
  limits: ['如果多给你两周，你会先动哪一块？'],
}

/** 从回答里挑一个可以指代的短语 */
function pickTopic(answer: string): string | null {
  const match = answer.match(/[一-龥A-Za-z0-9_-]{2,8}(?=这|的|是|在|用|把|会|被)/)
  return match ? match[0] : null
}

/**
 * 生成下一问。三种来源，按优先级：
 *   1. 维度首问 —— 带项目名，读起来是针对这个项目的
 *   2. 承上一轮回答 —— 命中话题线索时，追问落到用户刚提到的那个点上
 *   3. 维度通用深挖 —— 并顺带对照一条岗位要求，避免问题脱离目标岗位
 */
export function buildQuestion(
  project: Project,
  target: Target,
  dimensionIndex: number,
  roundInDimension: number,
  previousAnswer: string,
): { question: string; basedOnPrevious: boolean } {
  const dimension = DIMENSIONS[dimensionIndex]
  if (!dimension) return { question: '', basedOnPrevious: false }

  if (roundInDimension === 0) {
    return { question: `${project.name}里，${dimension.question}`, basedOnPrevious: false }
  }

  const answer = previousAnswer.trim()
  for (const topic of TOPIC_PROBES) {
    const hit = answer.match(topic.pattern)
    if (!hit) continue
    const phrase = pickTopic(answer) ?? hit[0]
    return { question: topic.probe(phrase), basedOnPrevious: true }
  }

  const pool = GENERIC_FOLLOW_UP[dimension.id] ?? ['能再多讲一点细节吗？']
  let question = pool[(roundInDimension - 1) % pool.length]

  // 第一次深挖且没有可承接的话题时，对照一条岗位要求 —— 让追问不脱离目标岗位
  if (roundInDimension === 1 && target.must.length > 0) {
    const requirement = target.must[dimensionIndex % target.must.length]
    question = `${question}（岗位要求里写了「${requirement}」，这块在这个项目里有没有体现？）`
  }

  return { question, basedOnPrevious: true }
}

/* ============ 一轮回答怎么变成结论 ============ */

const ACTION_CLAIM_KIND: Record<AskAction, ClaimKind> = {
  answered: 'fact',
  'never-done': 'claim',
  skipped: 'claim',
}

/** 判定证据状态 —— 只看能不能解释清楚，不因为「没有材料」就一律降级 */
export function judgeStatus(action: AskAction, answer: string): EvidenceStatus {
  if (action === 'never-done') return 'missing'
  if (action === 'skipped') return 'insufficient'
  const length = answer.trim().length
  if (length >= DETAILED_ANSWER_LENGTH) return 'verified'
  return 'insufficient'
}

/**
 * 把一轮回答落成结论。
 * 跳过不落卡 —— 该轮不计入证据。
 */
export function roundToCard(
  projectId: string,
  dimension: Dimension,
  round: number,
  question: string,
  action: AskAction,
  answer: string,
  skill: string,
): EvidenceCard | null {
  if (action === 'skipped') return null
  const status = judgeStatus(action, answer)
  const excerpt = action === 'never-done' ? answer || '用户声明这部分自己未参与' : answer

  return {
    id: `live-${projectId}-${round}`,
    projectId,
    skill,
    dimension: dimension.name,
    status,
    kind: ACTION_CLAIM_KIND[action],
    conclusion:
      action === 'never-done'
        ? `${skill}：用户声明这部分自己没有做过，本次不记为能力证据。`
        : `${skill}：${summarize(answer)}`,
    source: { kind: 'round', round, question, excerpt },
  }
}

/**
 * 给一轮回答挑一个能力标签：先在本项目技术与岗位要求里找命中词，
 * 找不到就退回该维度的名字 —— 宁可标得粗一点，也不要硬凑一个没提到的技术。
 */
export function pickSkill(project: Project, target: Target, dimension: Dimension, text: string): string {
  const pool = [...project.tech, ...target.must, ...target.plus]
  return pool.find((k) => text.includes(k)) ?? dimension.name
}

function summarize(answer: string): string {
  const clean = answer.trim().replace(/\s+/g, '')
  return clean.length <= 48 ? clean : `${clean.slice(0, 48)}…`
}

/* ============ 会话推进 ============ */

/**
 * 恢复：从已有的轮次重建会话位置。
 * 位置直接由最后一轮记录的「维度下标 + 轮内下标」推出，不靠轮号取模之类的推断。
 * 跳过与「未做过」都直接推进到下一维度；只有作答且未满轮数时才留在原维度。
 */
export function restoreState(existingRounds: SessionRound[], existingCards: EvidenceCard[]): SessionState {
  const last = existingRounds[existingRounds.length - 1]
  if (!last) {
    return { rounds: [], cards: existingCards, dimensionIndex: 0, roundInDimension: 0, phase: 'answering' }
  }

  const staysInDimension = last.action === 'answered' && last.roundInDimension + 1 < ROUNDS_PER_DIMENSION

  if (staysInDimension) {
    return {
      rounds: existingRounds,
      cards: existingCards,
      dimensionIndex: last.dimensionIndex,
      roundInDimension: last.roundInDimension + 1,
      phase: 'answering',
    }
  }

  const nextIndex = last.dimensionIndex + 1
  return {
    rounds: existingRounds,
    cards: existingCards,
    dimensionIndex: nextIndex,
    roundInDimension: 0,
    phase: nextIndex >= DIMENSIONS.length ? 'ended' : 'answering',
  }
}

/**
 * 回放一段历史轮次，得到结论卡。
 * 会话页与报告页都从这里取数 —— 只有一份事实来源，两边不会各说各话。
 */
export function replayHistory(
  projectId: string,
  history: readonly SessionRound[],
): { rounds: SessionRound[]; cards: EvidenceCard[] } {
  const cards: EvidenceCard[] = []
  for (const r of history) {
    const dimension = DIMENSIONS[r.dimensionIndex]
    if (!dimension) continue
    const card = roundToCard(projectId, dimension, r.round, r.question, r.action, r.answer, r.skill)
    if (card) cards.push(card)
  }
  return { rounds: [...history], cards }
}

/** 是否已达到可结束的门槛 */
export function canConclude(state: SessionState): boolean {
  return countFormed(state.cards) >= MIN_EVIDENCE_COUNT
}

/** 计入结论的卡片数 —— 跳过的不算，因为它压根没落卡 */
export function countFormed(cards: EvidenceCard[]): number {
  return cards.length
}

export { ROUNDS_PER_DIMENSION }
