import { WorkbenchShell } from '@/components/workbench/workbench-shell'
import { ConfirmForm } from '@/components/confirm/confirm-form'


export default function ConfirmPage() {
  return (
    <WorkbenchShell
      stepKey="confirm"
      eyebrow="Confirm Facts"
      title="先确认事实，再开始分析"
      description="系统识别到的信息可能有误，你可以逐项修改。技能标签只是简历中的声明，尚未经过技术验证。"
    >
      <ConfirmForm />
    </WorkbenchShell>
  )
}
