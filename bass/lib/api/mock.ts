import { ApiError, delay } from './client'
import { QUESTION_BANKS } from './fixtures'
import type {
  BusinessApi,
  CandidateInput,
  ReviewDimension,
  ReviewStatus,
} from './types'
export const uploadPolicy = {
  maxBytes: 5 * 1024 * 1024,
  maxText: 30000,
  mime: 'application/pdf',
}
const pending = (id: string): ReviewStatus => ({
  submissionId: id,
  review: 'pending_human_review',
  processing: 'waiting',
  access: 'active',
  canRequestReport: false,
  reportVersion: null,
  message: 'Mock：已在本地演示会话中提交，未进入真实人工审核队列。',
})
const dimensions = [
  '信息与结构完整性',
  '排版与可读性',
  '个人介绍',
  '项目表达',
  '技术证据表达',
  '岗位针对性',
]
export function mockReview(input: CandidateInput): ReviewDimension[] {
  return dimensions.map((title, i) => ({
    id: `RQ-0${i + 1}`,
    title,
    status: i === 5 ? 'na' : 'unknown',
    quote:
      i === 3 && !input.noProject && input.projectName
        ? input.projectName
        : undefined,
    explanation:
      i === 3 && input.noProject
        ? '未提供项目材料，资料不足；这不代表能力差。'
        : i === 1
          ? '纯文本或未解析的 PDF 不含可靠排版信息，本项无法判断。'
          : i === 5
            ? '本次尚未建立已确认岗位依据，暂不适用。'
            : 'Mock 未调用 AI，不对表达质量或技术能力作确定判断。',
    action:
      i === 3 && !input.noProject
        ? '仅在确有经历时，补充本人负责的任务、排查步骤与验证方式，不增加未经确认的贡献或数字。'
        : undefined,
  }))
}
export function createMockApi(): BusinessApi {
  const seen = new Map<string, ReviewStatus>()
  const responses = new Map<string, Map<string, string>>()
  let deleted = false
  const wait = async (signal?: AbortSignal) => {
    await delay(import.meta.env.MODE === 'test' ? 1 : 350, signal)
    if (deleted) throw new ApiError(410, '本地演示资料已清除，请重新开始。')
  }
  return {
    async parseResume(input, signal) {
      await wait(signal)
      if (!input.consent) throw new ApiError(422, '请先确认数据使用说明。')
      if (input.file && !input.text.trim())
        throw new ApiError(
          422,
          'Mock 不解析真实 PDF。请粘贴文件正文或使用明确标识的匿名示例继续。',
        )
      const text = input.text.trim()
      if (!text || text.length > uploadPolicy.maxText)
        throw new ApiError(422, '请输入有效简历文本（最多30000字）。')
      const line = text.split(/\r?\n/).find((s) => /^技能[：:]/.test(s))
      const project =
        text
          .split(/\r?\n/)
          .find((s) => /^项目经历[：:]/.test(s))
          ?.replace(/^项目经历[：:]\s*/, '') ?? ''
      return {
        id: crypto.randomUUID(),
        resumeId: 'mock-resume',
        version: '1',
        source: text,
        skills: line
          ? line
              .replace(/^技能[：:]\s*/, '')
              .split(/[、,，；;]/)
              .filter(Boolean)
              .map((label, i) => ({
                id: `s${i}`,
                label: label.trim(),
                confirmed: false,
              }))
          : [],
        projectName: project,
        contribution: '',
        noProject: !project,
      }
    },
    async confirmCandidate(input, signal) {
      await wait(signal)
      return {
        id: 'mock-candidate',
        resumeId: input.resumeId,
        version: input.version,
        source: input.source,
        skills: input.skills,
        projectName: input.noProject ? '' : input.projectName,
        contribution: input.noProject ? '' : input.contribution,
        noProject: input.noProject,
      }
    },
    async reviewCandidate(input, signal) {
      await wait(signal)
      return mockReview(input)
    },
    async analyzeRole(text, _role, signal) {
      await wait(signal)
      const skills = [
        'C 语言',
        'C++',
        'Python',
        'STM32',
        'UART',
        'I2C',
        'SPI',
        'FreeRTOS',
        'Linux',
        'Git',
        'Docker',
        'Qt',
      ]
      return skills
        .filter((skill) => text.toLowerCase().includes(skill.toLowerCase()))
        .map((skill) => ({
          skill,
          quote:
            text
              .split(/[。；\n]/)
              .find((line) =>
                line.toLowerCase().includes(skill.toLowerCase()),
              ) ?? text,
          importance: 'pending',
          confirmed: false,
        }))
    },
    async createAssessment(input, signal) {
      await wait(signal)
      return {
        id: crypto.randomUUID(),
        version: '1',
        questions: QUESTION_BANKS[
          input.mode === 'skillonly' ? 'generic' : (input.role ?? 'generic')
        ].map((q) => ({ ...q, version: '1' })),
      }
    },
    async saveAnswer(assessment, question, answer, status, _key, signal) {
      await wait(signal)
      if (status === 'answered' && !answer.trim())
        throw new ApiError(422, '回答不能为空。')
      if (!responses.has(assessment)) responses.set(assessment, new Map())
      responses.get(assessment)!.set(question, status)
      return String(responses.get(assessment)!.size + 1)
    },
    async submit(id, key, signal) {
      await wait(signal)
      const prior = seen.get(key)
      if (prior) return prior
      const result = pending(id)
      if (![...(responses.get(id)?.values() ?? [])].includes('answered')) {
        result.processing = 'unable_to_complete'
        result.message =
          'Mock：没有有效回答，证据不足，无法完成正式报告；不代表能力差。'
      }
      seen.set(key, result)
      return result
    },
    async reviewStatus(id, signal) {
      await wait(signal)
      return (
        [...seen.values()].find((s) => s.submissionId === id) ?? pending(id)
      )
    },
    async report(_id, signal) {
      await wait(signal)
      throw new ApiError(
        403,
        'Mock 不提供本人正式技术报告；可单独查看虚构示例。',
      )
    },
    async deleteData(signal) {
      await delay(200, signal)
      deleted = true
      seen.clear()
      return { receiptId: crypto.randomUUID(), state: 'completed' }
    },
  }
}
