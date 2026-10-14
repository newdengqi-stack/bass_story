// 领域模型 —— 证据化求职准备的核心类型
// 关键约定：凡是「结论」，都必须带 status（证据状态）与 source（来源）。
// source 允许为 null，但 null 的下游一律是不可操作态，而不是「空着而已」。

/* ============ 证据状态 ============ */

export type EvidenceStatus = 'verified' | 'claimed' | 'insufficient' | 'missing'

export const EVIDENCE_STATUS_LABEL: Record<EvidenceStatus, string> = {
  verified: '已验证',
  claimed: '用户声明',
  insufficient: '证据不足',
  missing: '当前缺失',
}

/** 语义色 —— 与 app/globals.css 的 --ws-* 一一对应 */
export const EVIDENCE_STATUS_COLOR: Record<EvidenceStatus, string> = {
  verified: 'var(--ws-ok)',
  claimed: 'var(--ws-info)',
  insufficient: 'var(--ws-warn)',
  missing: 'var(--ws-miss)',
}

/** 可以写进简历的状态集合 —— 只有它会被简历建议消费 */
export const RESUME_SAFE_STATUSES: readonly EvidenceStatus[] = ['verified']

export const EVIDENCE_STATUS_ORDER: readonly EvidenceStatus[] = [
  'verified',
  'claimed',
  'insufficient',
  'missing',
]

/* ============ 来源 ============ */

/** 三类来源：追问轮次 / 已提交材料 / 用户已确认的事实 */
export type EvidenceSource =
  | { kind: 'round'; round: number; question: string; excerpt: string }
  | { kind: 'material'; material: string; excerpt: string }
  | { kind: 'confirmed'; label: string; excerpt: string }

export const SOURCE_KIND_LABEL: Record<EvidenceSource['kind'], string> = {
  round: '追问记录',
  material: '已提交材料',
  confirmed: '已确认事实',
}

/** 一行式来源摘要，用于列表里的入口文案 */
export function sourceSummary(source: EvidenceSource): string {
  if (source.kind === 'round') return `第 ${source.round} 轮追问`
  if (source.kind === 'material') return source.material
  return source.label
}

/* ============ 内容性质 ============ */

/** 报告必须把三类内容分开标注：事实 / 用户声明 / 建议 */
export type ClaimKind = 'fact' | 'claim' | 'advice'

export const CLAIM_KIND_LABEL: Record<ClaimKind, string> = {
  fact: '事实',
  claim: '用户声明',
  advice: '建议',
}

/* ============ 能力与证据 ============ */

export type SkillTag = {
  id: string
  name: string
  status: EvidenceStatus
  source: EvidenceSource | null
}

export type EvidenceCard = {
  id: string
  projectId: string
  /** 能力标签 */
  skill: string
  /** 所属验证维度 */
  dimension: string
  status: EvidenceStatus
  kind: ClaimKind
  conclusion: string
  source: EvidenceSource | null
}

/* ============ 项目 ============ */

export type MaterialKind = 'link' | 'doc' | 'log'

export type EvidenceMaterial = {
  id: string
  kind: MaterialKind
  label: string
  href: string
}

export const MATERIAL_KIND_LABEL: Record<MaterialKind, string> = {
  link: '代码仓库 / 链接',
  doc: '项目文档',
  log: '调试记录',
}

export type ProjectStatus = 'draft' | 'digging' | 'reported'

export type Project = {
  id: string
  name: string
  role: string
  period: string
  tech: string[]
  goal: string
  status: ProjectStatus
  materials: EvidenceMaterial[]
  /** 已完成的追问轮次，用于中断恢复 */
  completedRounds: number
}

/** 项目在四种证据状态上的计数 */
export function statusCounts(cards: EvidenceCard[]): Record<EvidenceStatus, number> {
  const counts: Record<EvidenceStatus, number> = {
    verified: 0,
    claimed: 0,
    insufficient: 0,
    missing: 0,
  }
  for (const card of cards) counts[card.status] += 1
  return counts
}

/* ============ 冲刺任务 ============ */

/** 固定时长档位 —— 超出 90 分钟必须拆分，不生成档位之外的取值 */
export type SprintMinutes = 15 | 30 | 45 | 60 | 90

export const SPRINT_MINUTES: readonly SprintMinutes[] = [15, 30, 45, 60, 90]

export const SPRINT_MINUTES_MAX: SprintMinutes = 90

export type SprintTaskState = 'todo' | 'done' | 'skipped'

export type SprintTask = {
  id: string
  title: string
  goal: string
  /** 完成定义 */
  done: string
  /** 再次验证方式 */
  revalidate: string
  /** 关联的能力标签 */
  skill: string
  minutes: SprintMinutes
  state: SprintTaskState
  source: EvidenceSource | null
}

/* ============ 差距 ============ */

/** 四类结果 —— 硬性条件必须独立成区，不与能力混排 */
export type GapBucket = 'ready' | 'needs-evidence' | 'missing' | 'hard'

export const GAP_BUCKET_LABEL: Record<GapBucket, string> = {
  ready: '已具备且可强调',
  'needs-evidence': '与岗位有关，需补证据',
  missing: '当前缺失，必须处理',
  hard: '硬性条件',
}

export const GAP_BUCKET_HINT: Record<GapBucket, string> = {
  ready: '有证据支撑，可以写进简历',
  'needs-evidence': '有相关经历，缺可核验的材料',
  missing: '岗位明确要求，你目前没有相关经历',
  hard: '学历、专业、年限等 — 不可用项目弥补，只能核对或换岗位',
}

export type Level = 'high' | 'mid' | 'low'

export const LEVEL_LABEL: Record<Level, string> = { high: '高', mid: '中', low: '低' }

export type GapItem = {
  id: string
  skill: string
  bucket: GapBucket
  /** 岗位相关性 */
  relevance: Level
  status: EvidenceStatus
  /** 准备成本 */
  cost: Level
  /** 时间紧迫度 */
  urgency: Level
  note: string
}

/* ============ 简历建议 ============ */

export type SuggestionType = 'rewrite' | 'quantify' | 'reorder' | 'trim'

export const SUGGESTION_TYPE_LABEL: Record<SuggestionType, string> = {
  rewrite: '表述强化',
  quantify: '补充量化',
  reorder: '顺序调整',
  trim: '删除冗余',
}

export type SuggestionState = 'pending' | 'accepted' | 'edited' | 'rejected'

export const SUGGESTION_STATE_LABEL: Record<SuggestionState, string> = {
  pending: '待处理',
  accepted: '已接受',
  edited: '已编辑',
  rejected: '已拒绝',
}

export type ResumeSuggestion = {
  id: string
  /** 关联项目 —— 用于按项目聚合简历建议；不关联具体项目时为 null */
  projectId: string | null
  /** 简历原文 */
  original: string
  /** 系统建议 */
  suggested: string
  /** 建议理由（为什么这样改） */
  reason: string
  type: SuggestionType
  state: SuggestionState
  /** 用户编辑后的文本；存在时优先于 suggested */
  editedText: string | null
  source: EvidenceSource | null
}

/** 逐条确认后，最终进入简历的那句话 */
export function effectiveText(s: ResumeSuggestion): string {
  return s.editedText ?? s.suggested
}

export type ResumeVersion = {
  id: string
  version: number
  createdAt: string
  targetTitle: string
  entries: number
}

/* ============ 主目标岗位 ============ */

export type Target = {
  title: string
  company: string
  location: string
  /** 与 jd-parse 的标签模型对齐（此处只用需要的字段） */
  must: string[]
  plus: string[]
  hard: string[]
}

/* ============ 验证维度 ============ */

export type Dimension = {
  id: string
  name: string
  /** 该维度的首问 */
  question: string
}

/** 九个验证维度 —— 顺序即会话推进顺序 */
export const DIMENSIONS: readonly Dimension[] = [
  { id: 'goal', name: '项目目标', question: '这个项目要解决什么问题？做成什么样算成功？' },
  { id: 'contribution', name: '个人贡献', question: '你在其中具体负责哪一部分？哪几行代码或哪个模块是你写的？' },
  { id: 'architecture', name: '架构与数据流', question: '整个系统的数据是怎么流动的？从一端到另一端经过了哪些环节？' },
  { id: 'choice', name: '技术选型', question: '关键的技术选型你是怎么定的？当时还考虑过哪些方案？' },
  { id: 'implementation', name: '关键实现', question: '最难的那段实现是什么？你是怎么把它做出来的？' },
  { id: 'debugging', name: '调试定位', question: '印象最深的一个 bug 是什么？你是怎么定位到根因的？' },
  { id: 'exception', name: '异常处理', question: '出现异常或边界情况时，系统是怎么处理的？' },
  { id: 'quality', name: '工程质量', question: '你怎么保证代码质量？做过哪些测试或评审？' },
  { id: 'limits', name: '局限与改进', question: '这个项目现在有哪些不足？如果重做你会改哪里？' },
]

/** 完成条件：至少形成五条带来源的结论 */
export const MIN_EVIDENCE_COUNT = 5
