import { WorkbenchShell } from '@/components/workbench/workbench-shell'
import { RoleContent } from '@/components/role/role-content'


export default function RolePage() {
  return (
    <WorkbenchShell
      stepKey="role"
      eyebrow="Role Intelligence"
      title="你希望用什么岗位标准了解自己？"
      badge="RoleProfile · 演示模板"
      description="有目标、还在探索，或只想了解技术基础，都可以继续。岗位要求与个人能力是两套独立信息。"
    >
      <RoleContent />
    </WorkbenchShell>
  )
}
