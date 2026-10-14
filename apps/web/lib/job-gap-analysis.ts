'use server'

// 岗位差距分析 —— 把一段招聘信息（文本 / 链接）拆成逐条岗位要求，
// 对照用户已有的证据分类，并为「不足/缺失」项给出具体办法。
//
// ⚠️ 演示实现：原版用 AI SDK 的 generateObject（模型标识写死为 v0 平台 Gateway，本仓库无密钥会整体失败）。
// 现改为复用 lib/jd-parse.ts 的规则抽取 —— 本仓库既有的「规则定边界」做法。
// 规则词典覆盖面有限，抽不到东西时会明确报错，不编造要求。
//
// 恢复真实 AI 调用：把 analyzeText 的函数体换回 generateObject({ model, schema: resultSchema, system, prompt })，
// 下方的 resultSchema 原样保留即可复用；并重新安装 `ai` 依赖。

import { z } from 'zod'
import { parseJd, type Strength } from './jd-parse'
import { GAP_ITEMS } from './mock-data'
import type { EvidenceStatus, GapItem } from '@zhitu/types'

export type RequirementStatus = 'ready' | 'insufficient' | 'missing'

export type JobRequirement = {
  skill: string
  importance: 'must' | 'plus'
  quote: string
  status: RequirementStatus
  reason: string
  solution: string | null
  effort: 'low' | 'mid' | 'high' | null
}

export type JobAnalysisResult = {
  roleGuess: string
  requirements: JobRequirement[]
}

export type JobAnalysisOutcome = { ok: true; data: JobAnalysisResult } | { ok: false; error: string }

/** AI 契约（保留）—— 恢复真实调用时直接用这份 schema */
const resultSchema = z.object({
  roleGuess: z.string(),
  requirements: z.array(
    z.object({
      skill: z.string(),
      importance: z.enum(['must', 'plus']),
      quote: z.string(),
      status: z.enum(['ready', 'insufficient', 'missing']),
      reason: z.string(),
      solution: z.string().nullable(),
      effort: z.enum(['low', 'mid', 'high']).nullable(),
    }),
  ),
})

/* ============ 要求 → 证据 对照 ============ */

const READY: EvidenceStatus[] = ['verified']

/** 把能力名对上候选人已有的证据项 */
function matchEvidence(skill: string): GapItem | undefined {
  return GAP_ITEMS.find(
    (g) => g.skill === skill || g.skill.includes(skill) || skill.includes(g.skill),
  )
}

function judge(skill: string): Pick<JobRequirement, 'status' | 'reason' | 'solution' | 'effort'> {
  const hit = matchEvidence(skill)

  if (!hit) {
    return {
      status: 'missing',
      reason: '在你的项目与能力清单里没有找到对应证据。',
      solution: `围绕 ${skill} 做一个小练习或小模块，把过程和结论记下来，再回来重跑一次项目深挖。`,
      effort: 'high',
    }
  }

  if (READY.includes(hit.status)) {
    return { status: 'ready', reason: `已有证据支撑：${hit.note}`, solution: null, effort: null }
  }

  if (hit.status === 'missing') {
    return {
      status: 'missing',
      reason: hit.note,
      solution: `先判断这项值不值得投入 —— 它需要一段真实经历，不是靠改简历能补的。若值得，从最小可跑通的实验开始。`,
      effort: hit.cost,
    }
  }

  return {
    status: 'insufficient',
    reason: hit.note,
    solution: `把现有材料补到能支撑结论：${hit.note}`,
    effort: hit.cost,
  }
}

const IMPORTANCE: Record<Strength, 'must' | 'plus'> = {
  must: 'must',
  plus: 'plus',
  inferred: 'plus', // 推断项不算明确要求，降级为加分项
}

/* ============ 文本 → 要求 ============ */

function guessRole(text: string): string {
  const labelled = text.match(/(?:岗位名称|职位名称|岗位|职位)\s*[：:]\s*([^\n，,。；;]{2,20})/)
  if (labelled) return labelled[1].trim()

  const firstLine = text.split('\n').map((s) => s.trim()).find(Boolean)
  if (firstLine && firstLine.length <= 20) return firstLine

  return '未识别出岗位名称'
}

/** 硬性条件没有「能力证据」可对照，只能核对信息是否写对 */
function judgeHard(label: string): Pick<JobRequirement, 'status' | 'reason' | 'solution' | 'effort'> {
  const key = /学历|本科|硕士|博士|大专/.test(label)
    ? '学历'
    : /届|毕业/.test(label)
      ? '毕业'
      : /英语|CET|四级|六级/i.test(label)
        ? '英语'
        : /专业/.test(label)
          ? '专业'
          : null

  const hit = key ? GAP_ITEMS.find((g) => g.bucket === 'hard' && g.skill.includes(key)) : undefined

  if (hit && READY.includes(hit.status)) {
    return { status: 'ready', reason: `已核对：${hit.note}`, solution: null, effort: null }
  }
  if (hit) {
    return { status: 'missing', reason: hit.note, solution: '核对这一项是否写对；若确实不符，只能调整目标岗位。', effort: hit.cost }
  }
  return {
    status: 'missing',
    reason: '这一项无法通过项目补强，需要你自己核对。',
    solution: '核对自己的实际情况是否满足；不满足则不要投这个岗位。',
    effort: 'low',
  }
}

function analyzeText(
  rawText: string,
  role: string,
): { ok: true; data: JobAnalysisResult } | { ok: false; error: string } {
  const text = rawText.slice(0, 12_000)
  const { tags, hard } = parseJd(text)

  if (tags.length === 0 && hard.length === 0) {
    return {
      ok: false,
      error:
        '没能从这段描述里提取到可识别的要求（当前演示版用的是有限词典）。请换成更具体的岗位描述，或直接粘贴含技术关键词的部分。',
    }
  }

  const requirements: JobRequirement[] = [
    ...tags.map((t) => ({
      skill: t.label,
      importance: IMPORTANCE[t.strength],
      quote: t.source ?? '',
      ...judge(t.label),
    })),
    ...hard.map((h) => ({
      skill: h.label,
      importance: 'must' as const,
      quote: h.source,
      ...judgeHard(h.label),
    })),
  ]

  const parsed = resultSchema.safeParse({ roleGuess: role, requirements })
  if (!parsed.success) return { ok: false, error: '分析结果不符合契约，请把这个错误反馈给我们。' }

  return { ok: true, data: parsed.data }
}

/* ============ 链接抓取（含 SSRF 防护） ============ */

/**
 * 私网 / 保留地址段 —— backend-rules §15 是安全红线：
 * 服务端不得直接访问用户提供的任意 URL，必须做目标地址控制。
 * 这里阻断回环、私网、链路本地（含云元数据地址 169.254.169.254）。
 */
const BLOCKED_HOST = [
  /^localhost$/i,
  /^127\./,
  /^0\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[01])\./,
  /^169\.254\./,
  /^\[?::1\]?$/,
  /^\[?f[cd][0-9a-f]{2}:/i,
  /^metadata\./i,
]

function hostBlocked(hostname: string): boolean {
  return BLOCKED_HOST.some((re) => re.test(hostname))
}

/** 单次抓取的响应体上限，避免一个请求拉爆内存 */
const MAX_FETCH_BYTES = 512 * 1024

function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ')
    .replace(/<\/(p|div|li|br|h[1-6]|tr)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim()
}

async function fetchLinkText(link: string): Promise<{ ok: true; text: string } | { ok: false; error: string }> {
  let url: URL
  try {
    url = new URL(link)
  } catch {
    return { ok: false, error: '链接格式不正确，请检查后重试。' }
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    return { ok: false, error: '只支持 http/https 链接。' }
  }
  if (url.username || url.password) {
    return { ok: false, error: '链接里不能带账号密码。' }
  }
  // SSRF 红线：拒绝直连内网与本机地址
  if (hostBlocked(url.hostname)) {
    return { ok: false, error: '不支持抓取内网或本机地址。' }
  }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10_000)
    const res = await fetch(url.toString(), {
      signal: controller.signal,
      // 跟随重定向会让上面的地址校验被绕过，这里直接拒绝重定向
      redirect: 'error',
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ZhengtuBot/1.0)' },
    })
    clearTimeout(timeout)

    if (!res.ok) {
      return { ok: false, error: `无法打开这个链接（状态码 ${res.status}），请改用粘贴文本。` }
    }

    // 先看声明长度，再按实际读取量截断
    const declared = Number(res.headers.get('content-length') ?? 0)
    if (declared > MAX_FETCH_BYTES) {
      return { ok: false, error: '这个页面太大了，请改用粘贴文本。' }
    }

    const raw = await res.text()
    const text = stripHtml(raw.slice(0, MAX_FETCH_BYTES)).slice(0, 12_000)
    if (text.length < 30) {
      return { ok: false, error: '从这个链接里没有提取到足够的文字内容，请改用粘贴文本。' }
    }
    return { ok: true, text }
  } catch {
    return { ok: false, error: '抓取这个链接超时或被拒绝，很多招聘网站会屏蔽自动抓取。请改用粘贴文本。' }
  }
}

/* ============ 入口 ============ */

export async function analyzeJobPosting(formData: FormData): Promise<JobAnalysisOutcome> {
  const mode = formData.get('mode')

  try {
    if (mode === 'text') {
      const text = String(formData.get('text') ?? '').trim()
      if (text.length < 20) return { ok: false, error: '请粘贴更完整的岗位描述（至少几十个字）。' }
      return analyzeText(text, guessRole(text))
    }

    if (mode === 'link') {
      const link = String(formData.get('link') ?? '').trim()
      if (!link) return { ok: false, error: '请输入招聘页面链接。' }
      const fetched = await fetchLinkText(link)
      if (!fetched.ok) return { ok: false, error: fetched.error }
      return analyzeText(fetched.text, guessRole(fetched.text))
    }

    if (mode === 'image') {
      // 截图识别需要视觉模型。演示版没有接入，如实说明，不用假数据糊弄。
      return {
        ok: false,
        error: '截图识别需要接入 AI 视觉能力，当前演示版尚未接入。请改用粘贴文本方式。',
      }
    }

    return { ok: false, error: '未知的输入方式。' }
  } catch (error) {
    console.error('[job-gap-analysis] analyzeJobPosting failed:', error)
    return { ok: false, error: '分析失败，请重试一次。' }
  }
}
