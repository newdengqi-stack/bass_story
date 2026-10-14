import { WorkbenchShell } from '@/components/workbench/workbench-shell'
import { SubmissionContent } from '@/components/submission/submission-content'

export default function SubmissionPage() {
  return (
    <WorkbenchShell
      stepKey="submission"
      eyebrow="Human Review"
      title="技术结论需要人工复核"
      description="简历初评可以即时展示；但涉及技术能力的结论，必须经过人工复核才会发布，避免 AI 单方面给出误导性结论。"
      badge="模拟审核流程 · 非真实排队"
    >
      <SubmissionContent />
    </WorkbenchShell>
  )
}
