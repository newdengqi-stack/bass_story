import { WorkbenchShell } from '@/components/workbench/workbench-shell'
import { UploadForm } from '@/components/upload/upload-form'


export default function UploadPage() {
  return (
    <WorkbenchShell
      stepKey="upload"
      eyebrow="Add Resume"
      title="先添加你的简历"
      description="本轮请粘贴简历文本，获得六维非数值文字初评。PDF 解析将在后续接入；当前不产生正式技能等级或技术报告。"
    >
      <UploadForm />
    </WorkbenchShell>
  )
}
