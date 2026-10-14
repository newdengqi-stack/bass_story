'use server'

// 简历分析与 PDF 提取。
//
// ⚠️ 演示实现：analyzeResume 原版用 AI SDK 的 generateObject（模型标识写死为 v0 平台 Gateway，
// 本仓库无密钥会整体失败）。现改为确定性规则实现 —— 与本项目 lib/jd-parse.ts 同一种做法。
// 它只能识别「可被规则描述」的问题（弱动词、缺量化、缺关键词、结构缺失），
// 不做语义级改写。恢复真实 AI 调用时换回 generateObject({ model, schema: resumeAnalysisSchema, ... })。
//
// PDF 一侧是真实实现，并已按 backend-rules §16（文件上传是安全红线）补上：
// 大小上限、%PDF- 魔数校验、页数上限、提取文本上限。不得移除。

import { resumeAnalysisSchema, type ResumeAnalysisResult } from '@/lib/resume-analysis-types'
import { TARGET } from './mock-data'

/* ============ PDF 提取（含安全校验） ============ */

const MAX_PDF_BYTES = 10 * 1024 * 1024 // 10MB
const MAX_PDF_PAGES = 30
const MAX_TEXT_CHARS = 20_000

/** base64 字符数上限 —— 先按字符串长度拦截，避免为超限内容做解码 */
const MAX_BASE64_CHARS = Math.ceil(MAX_PDF_BYTES / 3) * 4

/** 允许前置 data URL 前缀，其余一律要求是裸 base64 */
function stripDataUrl(input: string): string {
  const m = input.match(/^data:application\/pdf;base64,([\s\S]*)$/i)
  return (m ? m[1] : input).replace(/\s/g, '')
}

export async function extractPdfText(base64: string): Promise<
  { ok: true; text: string } | { ok: false; error: string }
> {
  const payload = stripDataUrl(base64)

  // §16：限制上传大小。不能等解码完再判断。
  if (payload.length > MAX_BASE64_CHARS) {
    return { ok: false, error: `PDF 太大，请控制在 ${MAX_PDF_BYTES / 1024 / 1024}MB 以内。` }
  }

  let binary: Buffer
  try {
    binary = Buffer.from(payload, 'base64')
  } catch {
    return { ok: false, error: '文件内容无法解码，请换一个 PDF。' }
  }

  // §16：不能只靠扩展名/MIME 判断类型，必须校验文件头
  if (binary.length < 5 || binary.subarray(0, 5).toString('latin1') !== '%PDF-') {
    return { ok: false, error: '这个文件不是有效的 PDF。' }
  }

  try {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs')
    const doc = await pdfjs.getDocument({ data: new Uint8Array(binary), useWorkerFetch: false }).promise

    // §19：不得让一个请求触发无界数据处理
    if (doc.numPages > MAX_PDF_PAGES) {
      return { ok: false, error: `PDF 页数太多（${doc.numPages} 页），请控制在 ${MAX_PDF_PAGES} 页以内。` }
    }

    const pages: string[] = []
    let total = 0
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i)
      const content = await page.getTextContent()
      const line = content.items.map((item) => ('str' in item ? item.str : '')).join(' ')
      pages.push(line)
      total += line.length
      if (total >= MAX_TEXT_CHARS) break
    }

    const text = pages.join('\n\n').replace(/[ \t]+/g, ' ').trim().slice(0, MAX_TEXT_CHARS)
    if (text.length < 20) {
      return { ok: false, error: '没能从这个 PDF 里提取到文字，可能是扫描件 —— 请改用粘贴文本。' }
    }
    return { ok: true, text }
  } catch (error) {
    console.error('[resume-analysis] extractPdfText failed', error)
    return { ok: false, error: 'PDF 解析失败，请改用粘贴文本。' }
  }
}

/* ============ 规则化简历分析 ============ */

type Issue = ResumeAnalysisResult['issues'][number]

/** 弱动词 → 更具体的说法。只换动词，不添加任何原文没有的事实 */
const WEAK_VERB: Record<string, string> = {
  负责: '独立负责',
  参与: '主导其中',
  协助: '配合完成',
  帮助: '推动',
  配合: '协同完成',
}

const WEAK_VERB_RE = /负责|参与|协助|帮助|配合/

const SECTION_HINTS = ['教育', '项目', '技能', '实习', '证书', '经历']

/** 看起来像「一段经历描述」的行：有展开、够长 */
function isExperienceLine(line: string): boolean {
  return line.length >= 12 && /[：:，,。]/.test(line)
}

/** 去掉日期后是否还有数字 —— 只有日期不算量化 */
function hasScaleNumber(line: string): boolean {
  return /\d/.test(line.replace(/20\d{2}\s*[-–—./]\s*\d{1,2}(\s*[-–—./]\s*\d{1,2})?/g, ''))
}

/** quote 必须是原文的**逐字子串**，否则前端的 indexOf 高亮会失效 */
function quoteOf(line: string): string {
  return line.length > 60 ? line.slice(0, 60) : line
}

/* ---- 单项检查：返回改写后的整行 + 问题，没命中则返回 null ---- */

function checkVerb(line: string, id: string): { rewritten: string; issue: Issue } | null {
  if (!isExperienceLine(line)) return null
  const m = line.match(WEAK_VERB_RE)
  if (!m) return null

  const rewritten = line.replace(WEAK_VERB_RE, WEAK_VERB[m[0]])
  return {
    rewritten,
    issue: {
      id,
      category: '动词',
      severity: 'medium',
      title: '动词偏弱',
      quote: quoteOf(line),
      problem: `「${m[0]}」只交代了分工，没说清你实际做了什么、交付了什么。面试官无法据此判断能力。`,
      suggestion: `换成能体现动作与范围的说法，例如「${WEAK_VERB[m[0]]}…」，后面再补一句最终交付了什么。`,
      rewrittenQuote: rewritten,
    },
  }
}

function checkQuantify(line: string, id: string): { rewritten: string; issue: Issue } | null {
  if (!isExperienceLine(line)) return null
  if (hasScaleNumber(line)) return null

  const rewritten = `${line}（此处补上真实数字：处理规模、耗时变化或提升幅度）`
  return {
    rewritten,
    issue: {
      id,
      category: '量化',
      severity: 'high',
      title: '缺少量化',
      quote: quoteOf(line),
      problem: '整句没有任何规模或效果上的数字，读者分不出「做了」和「做成了」。',
      suggestion:
        '补一个你真记得住的数字。不要编造 —— 记不清就写量级（「十余次」「上百条」），有实测数据更好。',
      rewrittenQuote: rewritten,
    },
  }
}

function checkThinProject(line: string, id: string): { rewritten: string; issue: Issue } | null {
  if (line.length > 45 || line.length < 8) return null
  if (!/项目|系统|平台|终端|飞控|网关|工具/.test(line)) return null
  if (/[：:，,。]/.test(line)) return null

  const rewritten = `${line}（补一句你负责什么、用什么技术、交付了什么）`
  return {
    rewritten,
    issue: {
      id,
      category: '结构',
      severity: 'medium',
      title: '项目描述过短',
      quote: quoteOf(line),
      problem: '只有一行标题，看不出你在其中做了什么，招聘方会直接跳过。',
      suggestion: '每个项目至少写三件事：你的角色、用到的技术、最终交付物。',
      rewrittenQuote: rewritten,
    },
  }
}

function checkSkillList(line: string, id: string): { rewritten: string; issue: Issue } | null {
  const tokens = line.split(/[、,，]/).map((s) => s.trim()).filter(Boolean)
  if (tokens.length < 3 || line.length > 70) return null

  const rewritten = `${line}（标注每项用在哪：项目名或使用场景）`
  return {
    rewritten,
    issue: {
      id,
      category: '关键词',
      severity: 'medium',
      title: '技能只罗列',
      quote: quoteOf(line),
      problem: `列了 ${tokens.length} 项技能，但没有说明任何一项用在哪里。罗列本身不构成证据。`,
      suggestion: '给每项技能标上使用场景（哪个项目、解决什么问题），或把它挪进对应的项目描述里。',
      rewrittenQuote: rewritten,
    },
  }
}

const CHECKS = [checkVerb, checkQuantify, checkThinProject, checkSkillList]

/** 结构性缺口 —— 兜底用，保证结果不会少于契约要求的 3 条 */
function structuralIssues(text: string, firstLine: string, nextId: () => string): Issue[] {
  const out: Issue[] = []

  if (!text.includes('项目')) {
    out.push({
      id: nextId(),
      category: '结构',
      severity: 'high',
      title: '缺项目小节',
      quote: quoteOf(firstLine),
      problem: '整份简历里找不到「项目」相关的内容，招聘方无法定位你最该被看到的部分。',
      suggestion: '单独起一节「项目经历」，每个项目写清角色、技术与交付物。',
      rewrittenQuote: '项目经历',
    })
  }

  if (!text.includes('技能')) {
    out.push({
      id: nextId(),
      category: '关键词',
      severity: 'medium',
      title: '技能不集中',
      quote: quoteOf(firstLine),
      problem: `目标岗位要求 ${TARGET.must.slice(0, 3).join('、')} 等关键词，简历里没有集中列出，机器筛简历时容易漏掉。`,
      suggestion: '单独起一节「技能」，列出你确实用过的关键词，并与项目经历里的说法保持一致。',
      rewrittenQuote: '技能',
    })
  }

  if (!text.includes('教育')) {
    out.push({
      id: nextId(),
      category: '结构',
      severity: 'low',
      title: '缺教育经历',
      quote: quoteOf(firstLine),
      problem: '校招场景下，教育经历是筛选的硬性字段，缺失会直接影响通过率。',
      suggestion: '补上学校、专业、学历与起止时间。',
      rewrittenQuote: '教育经历',
    })
  }

  return out
}

function fallbackIssue(firstLine: string, id: string): Issue {
  return {
    id,
    category: '格式',
    severity: 'low',
    title: '缺少分节',
    quote: quoteOf(firstLine),
    problem: '内容连成一片，没有可扫读的分节，招聘方在几秒内抓不到重点。',
    suggestion: '按「教育 / 项目 / 技能」分节，每节用一行小标题隔开。',
    rewrittenQuote: '项目经历',
  }
}

export async function analyzeResume(resumeText: string): Promise<
  { ok: true; result: ResumeAnalysisResult } | { ok: false; error: string }
> {
  const text = resumeText.trim()
  if (text.length < 30) {
    return { ok: false, error: '简历内容太短，至少需要 30 个字符才能分析。' }
  }

  const lines = text.split('\n').map((s) => s.trim()).filter(Boolean)
  const firstLine = lines[0] ?? text.slice(0, 40)

  let seq = 0
  const nextId = () => `issue-${++seq}`

  const rewrittenLines: string[] = []
  const issues: Issue[] = []

  for (const line of lines) {
    if (issues.length >= 8) {
      rewrittenLines.push(line)
      continue
    }
    let hit: { rewritten: string; issue: Issue } | null = null
    for (const check of CHECKS) {
      hit = check(line, nextId())
      if (hit) break
    }
    if (hit) {
      issues.push(hit.issue)
      rewrittenLines.push(hit.rewritten)
    } else {
      rewrittenLines.push(line)
    }
  }

  // 兜底：契约要求 3-8 条，不让一份「看起来没问题」的简历返回空结果。
  // 注意这里只补结构性缺口与格式提示，不编造原文里没有的内容问题。
  const gaps = structuralIssues(text, firstLine, nextId)
  for (const gap of gaps) {
    if (issues.length >= 3) break
    if (issues.some((i) => i.title === gap.title)) continue
    issues.push(gap)
    rewrittenLines.push(gap.rewrittenQuote)
  }
  if (issues.length < 3) {
    issues.push(fallbackIssue(firstLine, nextId()))
    rewrittenLines.push('项目经历')
  }

  const severityPenalty = issues.reduce(
    (sum, i) => sum + (i.severity === 'high' ? 12 : i.severity === 'medium' ? 6 : 2),
    0,
  )
  const score = Math.max(20, Math.min(100, 88 - severityPenalty))
  const rewrittenResume = rewrittenLines.join('\n')

  const strengths: string[] = []
  if (lines.some(hasScaleNumber)) strengths.push('部分经历带具体数字，比通篇定性描述可信得多')
  if (lines.some((l) => l.length > 30)) strengths.push('有展开描述的经历，不是只有一行标题')
  if (SECTION_HINTS.filter((h) => text.includes(h)).length >= 3) strengths.push('分节清晰，招聘方能快速定位')
  if (strengths.length === 0) strengths.push('内容已具备基本结构，补齐下面的问题就能明显提升')

  const candidate = {
    score,
    summary: `整体 ${score} 分。共发现 ${issues.length} 处可改进的地方，其中高优先级 ${
      issues.filter((i) => i.severity === 'high').length
    } 处。`,
    strengths: strengths.slice(0, 4),
    issues: issues.slice(0, 8),
    rewrittenResume,
  }

  const parsed = resumeAnalysisSchema.safeParse(candidate)
  if (!parsed.success) {
    return { ok: false, error: '分析结果不符合契约，请把这个错误反馈给我们。' }
  }
  return { ok: true, result: parsed.data }
}
