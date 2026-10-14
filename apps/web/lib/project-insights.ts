// 「项目深挖」工作台的派生数据 —— 把项目的原始字段、追问记录与简历建议
// 组装成三栏视图（目录 / 简历对照 / 逻辑链条与分析）需要的形状。
// 全部从已有的事实来源计算得出，不引入新的虚构内容（见 domain.ts 的证据原则）。

import { statusCounts, type EvidenceStatus, type Project, type ResumeSuggestion } from '@zhitu/types'
import { PROJECTS, RESUME_SUGGESTIONS } from './mock-data'
import { cardsOfProject, roundsOfProject } from './session-seed'

export type ProjectGap = {
  skill: string
  status: EvidenceStatus
  conclusion: string
}

export type ProjectInsight = {
  project: Project
  counts: Record<EvidenceStatus, number>
  roundsCount: number
  /** 架构与数据流追问的回答，拆成若干步骤；没问到则为 null */
  architectureSteps: string[] | null
  /** 关键实现追问的回答 */
  coreChallenge: string | null
  /** 技术选型追问的回答 */
  techChoice: string | null
  /** 证据不足 / 当前缺失的结论，最多 3 条 */
  gaps: ProjectGap[]
  /** 这个项目相关的简历建议 */
  suggestions: ResumeSuggestion[]
}

/** 把一段追问回答按句拆成若干条，供逻辑链条展示 */
function splitIntoSteps(text: string): string[] {
  return text
    .split(/[；。]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
}

export function buildProjectInsight(project: Project): ProjectInsight {
  const cards = cardsOfProject(project.id)
  const rounds = roundsOfProject(project.id)

  const architectureRound = rounds.find((r) => r.dimensionId === 'architecture' && r.action === 'answered')
  const implementationRound = rounds.find((r) => r.dimensionId === 'implementation' && r.action === 'answered')
  const choiceRound = rounds.find((r) => r.dimensionId === 'choice' && r.action === 'answered')

  const gaps: ProjectGap[] = cards
    .filter((c) => c.status === 'insufficient' || c.status === 'missing')
    .slice(0, 3)
    .map((c) => ({ skill: c.skill, status: c.status, conclusion: c.conclusion }))

  return {
    project,
    counts: statusCounts(cards),
    roundsCount: rounds.length,
    architectureSteps: architectureRound ? splitIntoSteps(architectureRound.answer) : null,
    coreChallenge: implementationRound?.answer ?? null,
    techChoice: choiceRound?.answer ?? null,
    gaps,
    suggestions: RESUME_SUGGESTIONS.filter((s) => s.projectId === project.id),
  }
}

export function allProjectInsights(): ProjectInsight[] {
  return PROJECTS.map(buildProjectInsight)
}
