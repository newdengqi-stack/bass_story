import { useCallback, useEffect, useState } from 'react'
import { ArrowRight, Copy, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { api } from '@/lib/api'
import { isAuthorizedReport } from '@/lib/api/guards'
import type { PublishedReport } from '@/lib/api/types'
import { useFlow } from '@/lib/flow-context'
import { useRouter } from '@/lib/navigation'
import { useAsync } from '@/lib/use-async'
import { copyText } from '@/lib/copy'
import { toast } from 'sonner'
const performanceLabels = {
  not_tested: '尚未验证',
  insufficient_evidence: '证据不足',
  graded: '证据支持的等级',
  demonstrated_below_L1: '已验证范围内低于 L1',
  disputed: '存在争议，待复核',
}
export function ReportContent() {
  const { submissionId, status, setStatus } = useFlow(),
    router = useRouter(),
    operation = useAsync()
  const [report, setReport] = useState<PublishedReport | null>(null)
  const { run } = operation
  const load = useCallback(async () => {
    setReport(null)
    if (!submissionId) return
    const result = await run(async (signal) => {
      const review = await api.reviewStatus(submissionId, signal)
      if (
        review.review !== 'published' ||
        review.access !== 'active' ||
        !review.canRequestReport
      )
        return { review, report: null }
      const body = await api.report(submissionId, signal)
      if (!isAuthorizedReport(body) || body.version !== review.reportVersion)
        throw new Error('报告版本与当前发布授权不一致，请重新查询。')
      return { review, report: body }
    })
    if (result) {
      setStatus(result.review)
      setReport(result.report)
    }
  }, [submissionId, run, setStatus])
  useEffect(() => {
    void load()
    if (!submissionId) return
    const timer = setInterval(() => void load(), 30000)
    const visible = () => {
      if (document.visibilityState === 'visible') void load()
    }
    document.addEventListener('visibilitychange', visible)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', visible)
    }
  }, [load, submissionId])
  useEffect(() => {
    if (!report) return
    const timer = setTimeout(
      () => setReport(null),
      Math.min(
        Math.max(0, Date.parse(report.expiresAt) - Date.now()),
        2147483647,
      ),
    )
    return () => clearTimeout(timer)
  }, [report])
  async function copy(text: string) {
    try {
      await copyText(text)
      toast.success('已复制已发布报告文本')
    } catch {
      toast.error('复制失败，请手动选择文本后复制。')
    }
  }
  const allowed =
    isAuthorizedReport(report) &&
    status?.access === 'active' &&
    status?.review === 'published' &&
    status.canRequestReport &&
    report.version === status.reportVersion
  if (!allowed)
    return (
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader>
            <ShieldCheck className="size-7 text-primary" />
            <CardTitle>正式技术报告尚不可查看</CardTitle>
            <CardDescription>
              本人报告仅展示后端明确授权的已审核发布版本。示例与本人报告分开。
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <p role="status" className="text-sm">
              {operation.loading
                ? '正在查询授权与审核状态…'
                : status?.message ||
                  '本会话尚无已提交且授权发布的报告。刷新会清除本地演示会话。'}
            </p>
            {operation.error && (
              <p role="alert" className="text-sm text-destructive">
                {operation.error}
              </p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button
                disabled={!submissionId || operation.loading}
                onClick={load}
              >
                重新查询报告状态
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/submission')}
              >
                返回审核页
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/report/sample')}
              >
                查看虚构报告示例
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-none bg-gradient-to-br from-primary to-[#2a1f6e] text-primary-foreground">
        <CardContent className="flex flex-col gap-3 py-8">
          <p className="text-xs">已审核并授权发布 · 版本 {report.version}</p>
          <h2 className="text-2xl font-bold">有依据、有边界的成长建议</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {report.summary}
          </p>
          <Button
            variant="secondary"
            className="w-fit"
            onClick={() => copy(report.summary)}
          >
            <Copy data-icon="inline-start" />
            复制已发布摘要
          </Button>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">
        资料快照 {report.sources.candidateSnapshotId} · 问答快照{' '}
        {report.sources.assessmentSnapshotId} · Rubric{' '}
        {report.sources.rubricVersion}
      </p>
      <Card>
        <CardHeader>
          <CardTitle>技术证据与能力状态</CardTitle>
          <CardDescription>
            未验证与证据不足不会被当作能力差；等级仅限已审核范围。
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {report.skills.length ? (
            report.skills.map((skill, i) => (
              <article key={i} className="rounded-xl border border-border p-4">
                <h3 className="text-sm font-semibold">
                  {skill.label} · {performanceLabels[skill.performance]}
                  {skill.level && ` · ${skill.level}`}
                </h3>
                <ul className="mt-2 space-y-2 text-sm text-muted-foreground">
                  {skill.evidence.map((e, j) => (
                    <li key={j}>
                      <blockquote>{e.quote}</blockquote>
                      <p className="mt-1 text-xs">
                        问题 {e.questionId} · 答卷 {e.answerId} · Rubric{' '}
                        {e.rubricVersion}
                      </p>
                    </li>
                  ))}
                </ul>
              </article>
            ))
          ) : (
            <p>本版本无可展示的技能结论。</p>
          )}
        </CardContent>
      </Card>
      {(['now', 'later', 'defer'] as const).map((priority) => (
        <Card key={priority}>
          <CardHeader>
            <CardTitle>
              {{ now: '现在做', later: '以后做', defer: '暂缓做' }[priority]}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {report.recommendations
              .filter((r) => r.priority === priority)
              .map((r, i) => (
                <article
                  key={i}
                  className="rounded-xl border border-border p-4"
                >
                  <h3 className="text-sm font-semibold">{r.title}</h3>
                  <p className="mt-2 text-sm">原因：{r.reason}</p>
                  <p className="mt-2 text-sm">步骤：{r.action}</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    交付物：{r.deliverable}；验收条件：{r.acceptance}
                  </p>
                </article>
              ))}
            {!report.recommendations.some((r) => r.priority === priority) && (
              <p className="text-sm text-muted-foreground">
                本版本暂无此类建议。
              </p>
            )}
          </CardContent>
        </Card>
      ))}
      {report.safeResumeText && (
        <Card>
          <CardHeader>
            <CardTitle>基于本人确认事实的简历表达</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">
              {report.safeResumeText}
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => copy(report.safeResumeText!)}
            >
              复制事实约束文本
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
