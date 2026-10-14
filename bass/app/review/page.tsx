import { WorkbenchShell } from '@/components/workbench/workbench-shell'
import { ReviewContent } from '@/components/review/review-content'


export default function ReviewPage() {
  return (
    <WorkbenchShell
      stepKey="review"
      eyebrow="Resume Review"
      title="简历初评"
      badge="仅基于文本与可靠提取的版式证据"
      description="以下是即时的简历文字反馈，尚未进行任何技术能力验证。技术能力需要通过后续的问答环节来评估。"
    >
      <ReviewContent />
    </WorkbenchShell>
  )
}
