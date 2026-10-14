import { WorkbenchShell } from '@/components/workbench/workbench-shell'
import { SampleReportContent } from '@/components/report/sample-report-content'
export default function SampleReportPage() {
  return <WorkbenchShell stepKey="report" eyebrow="Sample Report" title="报告示例" badge="虚构案例 · 非本人测评"><SampleReportContent /></WorkbenchShell>
}
