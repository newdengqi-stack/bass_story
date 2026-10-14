import { WorkbenchShell } from '@/components/workbench/workbench-shell'
import { AssessmentContent } from '@/components/assessment/assessment-content'

export default function AssessmentPage() {
  return (
    <WorkbenchShell
      stepKey="assessment"
      eyebrow="Technical Q&A"
      title="技术问答：回答由你，判断由证据"
      description="没有标准答案评分页；每道题的回答都会被当作证据片段保留，供人工复核时引用。可以跳过不熟悉的题目。"
      badge="演示题库 · 非真实技术测评"
    >
      <AssessmentContent />
    </WorkbenchShell>
  )
}
