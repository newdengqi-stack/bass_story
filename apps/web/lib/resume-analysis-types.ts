import { z } from 'zod'

export const RESUME_ISSUE_CATEGORY = ['结构', '量化', '关键词', '动词', '格式'] as const
export type ResumeIssueCategory = (typeof RESUME_ISSUE_CATEGORY)[number]

export const RESUME_ISSUE_SEVERITY = ['high', 'medium', 'low'] as const
export type ResumeIssueSeverity = (typeof RESUME_ISSUE_SEVERITY)[number]

export const resumeIssueSchema = z.object({
  id: z.string().describe('短 slug，如 issue-1'),
  category: z.enum(RESUME_ISSUE_CATEGORY),
  severity: z.enum(RESUME_ISSUE_SEVERITY),
  title: z.string().describe('问题的简短标题，8 个字以内'),
  quote: z
    .string()
    .describe('必须是原文中逐字出现的一段话（10-60字），作为问题的证据，不能改写或总结'),
  problem: z.string().describe('基于这段原文具体说明问题出在哪里，为什么算问题'),
  suggestion: z.string().describe('给出可执行的修改办法'),
  rewrittenQuote: z.string().describe('对应在右侧推荐简历全文中出现的改写后原句，必须逐字能在 rewrittenResume 中找到'),
})
export type ResumeIssue = z.infer<typeof resumeIssueSchema>

export const resumeAnalysisSchema = z.object({
  score: z.number().min(0).max(100).describe('简历整体质量评分'),
  summary: z.string().describe('一句话总体诊断'),
  strengths: z.array(z.string()).describe('已经做得好的 2-4 点，需结合原文依据'),
  issues: z.array(resumeIssueSchema).min(3).max(8),
  rewrittenResume: z.string().describe('基于原文改写的完整推荐简历全文，保留原有结构与真实经历，只优化表达、量化与关键词'),
})
export type ResumeAnalysisResult = z.infer<typeof resumeAnalysisSchema>

export const CATEGORY_TONE: Record<ResumeIssueCategory, { label: string }> = {
  结构: { label: '结构' },
  量化: { label: '量化缺失' },
  关键词: { label: '关键词' },
  动词: { label: '动词强度' },
  格式: { label: '格式' },
}

export const SEVERITY_LABEL: Record<ResumeIssueSeverity, string> = {
  high: '高优先级',
  medium: '中优先级',
  low: '低优先级',
}
