import {
  ApiError,
  array,
  enumValue,
  record,
  request,
  string,
} from './api/client'

export const dimensionIds = [
  'completeness',
  'layout_readability',
  'self_intro',
  'project_expression',
  'evidence_expression',
  'role_relevance',
] as const
export type InitialDimension = (typeof dimensionIds)[number]
export interface ResumeAnalysis {
  requestId: string
  mode: 'mock' | 'model'
  notice: string
  sources: { id: string; line: number; quote: string }[]
  dimensions: {
    id: InitialDimension
    title: string
    status: 'clear' | 'needs_improvement' | 'unknown' | 'not_applicable'
    explanation: string
    sourceIds: string[]
  }[]
  findings: {
    id: string
    dimension: InitialDimension
    issue: string
    reason: string
    action: string
    sourceIds: string[]
    missingFacts: string[]
  }[]
  metadata: { provider: string; model: string; elapsedMs: number }
}
export function mapResumeAnalysis(value: unknown): ResumeAnalysis {
  const d = record(value)
  if (d.result_type !== 'resume_initial_review')
    throw new ApiError(0, '返回内容不是简历初评。')
  const sources = array(d.sources).map((value) => {
    const s = record(value)
    if (!Number.isInteger(s.line) || Number(s.line) < 1)
      throw new ApiError(0, '来源位置无效。')
    return {
      id: string(s.span_id),
      line: Number(s.line),
      quote: string(s.quote),
    }
  })
  const ids = new Set(sources.map((s) => s.id))
  if (ids.size !== sources.length) throw new ApiError(0, '来源标识重复。')
  function refs(value: unknown) {
    const refs = array(value).map(string)
    if (refs.some((id) => !ids.has(id)))
      throw new ApiError(0, '初评包含无效来源。')
    return refs
  }
  const dimensions = array(d.dimensions).map((value) => {
    const dim = record(value)
    return {
      id: enumValue(dim.dimension, dimensionIds),
      title: string(dim.title),
      status: enumValue(dim.status, [
        'clear',
        'needs_improvement',
        'unknown',
        'not_applicable',
      ]),
      explanation: string(dim.explanation),
      sourceIds: refs(dim.evidence_refs),
    }
  })
  if (
    dimensions.length !== 6 ||
    new Set(dimensions.map((d) => d.id)).size !== 6
  )
    throw new ApiError(0, '初评六维缺失或重复。')
  if (
    dimensions.find((d) => d.id === 'layout_readability')?.status !==
      'unknown' ||
    dimensions.find((d) => d.id === 'role_relevance')?.status !==
      'not_applicable'
  )
    throw new ApiError(0, '纯文本版式或岗位状态不符合初评约束。')
  const findings = array(d.findings).map((value) => {
    const f = record(value)
    if (f.confirmation_state !== 'pending_confirmation')
      throw new ApiError(0, '未核实的事实不能作为确定结论。')
    return {
      id: string(f.finding_id),
      dimension: enumValue(f.dimension, dimensionIds),
      issue: string(f.issue),
      reason: string(f.reason),
      action: string(f.action),
      sourceIds: refs(f.source_span_ids),
      missingFacts: array(f.missing_facts).map(string),
    }
  })
  const m = record(d.metadata)
  if (typeof m.elapsed_ms !== 'number' || m.elapsed_ms < 0)
    throw new ApiError(0, '模型元数据无效。')
  return {
    requestId: string(d.request_id),
    mode: enumValue(d.analysis_mode, ['mock', 'model']),
    notice: string(d.notice),
    sources,
    dimensions,
    findings,
    metadata: {
      provider: string(m.provider),
      model: string(m.model),
      elapsedMs: m.elapsed_ms,
    },
  }
}
export async function analyzeResumeText(
  text: string,
  consent: boolean,
  signal?: AbortSignal,
): Promise<ResumeAnalysis> {
  return mapResumeAnalysis(
    await request(
      '/api/v1/resume-reviews/analyze',
      { method: 'POST', body: JSON.stringify({ text, consent }), signal },
      65000,
    ),
  )
}
export async function getAnalysisHealth(signal?: AbortSignal) {
  const d = record(await request('/api/v1/health', { signal }, 5000))
  return {
    mode: enumValue(d.ai_mode, ['mock', 'dashscope', 'deepseek']),
    configured: d.model_configured === true,
  }
}
