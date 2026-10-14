import { WorkbenchShell } from '@/components/workbench/workbench-shell'
import { ReportContent } from '@/components/report/report-content'

export default function ReportPage() {
  return (
    <WorkbenchShell
      stepKey="report"
      eyebrow="Published Report"
      title="本人报告状态"
      badge="人工审核与授权发布"
    >
      <ReportContent />
    </WorkbenchShell>
  )
}
