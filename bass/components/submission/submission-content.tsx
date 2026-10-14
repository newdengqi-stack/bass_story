import { useRef, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  FileSearch,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { ActionBar } from '@/components/workbench/action-bar'
import { useFlow, ROLE_PROFILES } from '@/lib/flow-context'
import { api, isMock } from '@/lib/api'
import { useAsync } from '@/lib/use-async'
import { useRouter } from '@/lib/navigation'
import { DemoStateSwitcher } from '@/components/shared/demo-state-switcher'
const previews = [
  { value: 'pending', label: '待审核' },
  { value: 'reviewing', label: '审核中' },
  { value: 'published', label: '已发布' },
  { value: 'rejected', label: '审核未通过' },
  { value: 'unable', label: '无法完成' },
  { value: 'expired', label: '已过期/撤销' },
]
export function SubmissionContent() {
  const router = useRouter(),
    f = useFlow(),
    operation = useAsync()
  const busy = useRef(false)
  const [preview, setPreview] = useState('pending')
  const canSubmit =
    !!f.assessment &&
    f.assessment.questions.every(
      (q) => f.statuses[q.id] === 'answered' || f.statuses[q.id] === 'skipped',
    )
  async function submit() {
    if (busy.current || !canSubmit || !f.assessment || f.submitted) return
    busy.current = true
    const result = await operation.run((signal) =>
      api.submit(
        f.assessment!.id,
        `submit-${f.assessment!.id}-${f.responseVersion}`,
        signal,
      ),
    )
    if (result) {
      f.setStatus(result)
      f.setSubmissionId(result.submissionId)
      f.setSubmitted(true)
    }
    busy.current = false
  }
  async function refresh() {
    if (!f.submissionId) return
    const result = await operation.run((signal) =>
      api.reviewStatus(f.submissionId, signal),
    )
    if (result) f.setStatus(result)
  }
  const current = f.status
  const stateLabel = !f.submitted
    ? '尚未提交'
    : current?.access === 'expired'
      ? '已过期'
      : current?.access === 'revoked'
        ? '访问已撤销'
        : current?.processing === 'unable_to_complete'
          ? '无法完成'
          : current?.processing === 'reviewing'
            ? '审核中'
            : current?.review === 'published'
              ? '已发布'
              : current?.review === 'approved'
                ? '审核通过，尚未发布'
                : current?.review === 'rejected'
                  ? '审核未通过'
                  : current?.review === 'needs_revision'
                    ? '需要补充资料'
                    : '待人工审核'
  const timeline = [
    {
      label: '问答提交',
      description: f.submitted
        ? '已收到接口回执；Mock 回执仅用于本地演示。'
        : '尚未提交，不声称答卷已归档。',
      icon: CheckCircle2,
      done: f.submitted,
    },
    {
      label: '人工复核',
      description: '由后端返回审核处理状态；未审核结果不作为正式能力结论。',
      icon: FileSearch,
      done: current?.review === 'approved' || current?.review === 'published',
    },
    {
      label: '报告发布',
      description: '只有后端明确授权的已发布版本可查看。',
      icon: ShieldCheck,
      done: current?.review === 'published' && current.access === 'active',
    },
  ]
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">本次将被复核的内容</CardTitle>
          <CardDescription>
            审核员只对已验证范围作判断；技术结论须经人工复核后才会发布。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-muted-foreground">目标岗位</dt>
              <dd className="mt-1 text-sm">
                {f.mode === 'skillonly' || !f.roleId
                  ? '仅通用技术验证'
                  : ROLE_PROFILES[f.roleId].name}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">问答记录</dt>
              <dd className="mt-1 text-sm">
                已回答 {f.answeredCount} 题 · 跳过 {f.skippedCount} 题
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">审核状态</dt>
              <dd className="mt-1 text-sm" role="status">
                {stateLabel}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>
      {operation.error && (
        <p role="alert" className="text-sm text-destructive">
          {operation.error}
        </p>
      )}
      {!canSubmit && !f.submitted && (
        <p role="status">
          暂无完整问答记录，请返回问答。刷新后的本地演示会话无法恢复。
        </p>
      )}
      {current && (
        <p className="text-sm text-muted-foreground">{current.message}</p>
      )}
      <div className="flex flex-wrap gap-3">
        <Button
          onClick={submit}
          disabled={!canSubmit || f.submitted || operation.loading}
        >
          {operation.loading
            ? '正在处理…'
            : f.submitted
              ? '已提交，避免重复操作'
              : '提交并等待人工复核'}
        </Button>
        {f.submitted && (
          <Button
            variant="outline"
            onClick={refresh}
            disabled={operation.loading}
          >
            刷新审核状态
          </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">审核流程</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {timeline.map((step) => (
            <div key={step.label} className="flex gap-3">
              <span
                className={
                  step.done ? 'text-positive' : 'text-muted-foreground'
                }
              >
                <step.icon className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium">{step.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="border-dashed bg-muted/40">
        <CardContent className="flex gap-3 pt-6">
          <Clock className="size-4 shrink-0" />
          <p className="text-sm text-muted-foreground">
            {isMock
              ? 'MOCK · 没有真实审核员、通知服务或固定审核时限。示例报告为独立虚构材料，与本次资料和回答无关。'
              : '审核时间不固定，只有已发布且授权有效的版本能够打开。'}
          </p>
        </CardContent>
      </Card>
      {isMock && (
        <section
          id="demo-states"
          className="rounded-xl border border-dashed border-border p-4"
        >
          <DemoStateSwitcher
            value={preview}
            onChange={setPreview}
            options={previews}
            label="审核展示样例"
          />
          <p className="mt-3 text-sm">
            仅预览状态文案：{previews.find((p) => p.value === preview)?.label}
            。此操作不修改本人审核状态，不解锁正式报告。
          </p>
        </section>
      )}
      <ActionBar
        back={
          <Button variant="ghost" onClick={() => router.push('/assessment')}>
            返回技术问答
          </Button>
        }
      >
        <Button variant="outline" onClick={() => router.push('/report/sample')}>
          查看虚构报告示例
        </Button>
        <Button size="lg" onClick={() => router.push('/report')}>
          查看本人报告状态
          <ArrowRight data-icon="inline-end" />
        </Button>
      </ActionBar>
    </div>
  )
}
