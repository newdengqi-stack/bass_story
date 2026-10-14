import type { ResumeAnalysis } from '@/lib/resume-analysis'
import { useRouter } from '@/lib/navigation'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { StatusBadge, type StatusTone } from '@/components/shared/status-badge'
import { Quote } from 'lucide-react'

const statuses: Record<
  ResumeAnalysis['dimensions'][number]['status'],
  { label: string; tone: StatusTone }
> = {
  clear: { label: '表达较清楚', tone: 'positive' },
  needs_improvement: { label: '建议优化', tone: 'pending' },
  unknown: { label: '无法判断', tone: 'unknown' },
  not_applicable: { label: '暂不适用', tone: 'unknown' },
}
export function InitialReviewContent({ review }: { review: ResumeAnalysis }) {
  const router = useRouter()
  const sourceMap = new Map(review.sources.map((s) => [s.id, s]))
  const missing = [...new Set(review.findings.flatMap((f) => f.missingFacts))]
  function quotes(ids: string[]) {
    return ids.map((id) => {
      const source = sourceMap.get(id)!
      return (
        <blockquote
          key={id}
          className="rounded-lg border border-border bg-muted/40 p-3"
        >
          <p className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
            <Quote className="size-3.5" />
            原文依据 · 第 {source.line} 行（联系方式已去敏）
          </p>
          <p className="whitespace-pre-wrap text-sm leading-relaxed">
            {source.quote}
          </p>
        </blockquote>
      )
    })
  }
  return (
    <div className="flex flex-col gap-6">
      <div
        role="status"
        className="rounded-xl border border-primary/20 bg-primary-soft/40 p-4 text-sm leading-relaxed"
      >
        {review.notice}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-pending/30 bg-pending-soft/40">
          <CardHeader>
            <CardTitle className="text-sm">最值得先处理的问题</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {review.findings.length ? (
                review.findings
                  .slice(0, 3)
                  .map((f) => <li key={f.id}>· {f.issue}</li>)
              ) : (
                <li>本次没有返回具体问题；不代表已验证简历或技术能力。</li>
              )}
            </ul>
          </CardContent>
        </Card>
        <Card className="border-positive/30 bg-positive-soft/40">
          <CardHeader>
            <CardTitle className="text-sm">待本人确认的资料</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {missing.length ? (
                missing.slice(0, 5).map((item) => <li key={item}>· {item}</li>)
              ) : (
                <li>暂未返回待确认项；全部经历仍属于本人自述。</li>
              )}
            </ul>
            {missing.length > 5 && (
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer text-primary">
                  查看其余待确认项（{missing.length - 5}）
                </summary>
                <ul className="mt-2 space-y-2">
                  {missing.slice(5).map((item) => (
                    <li key={item}>· {item}</li>
                  ))}
                </ul>
              </details>
            )}
            <p className="mt-3 text-xs text-muted-foreground">
              按实际情况选择补充，可忽略不适用项，不要求编造经历。
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">六维文字初评</CardTitle>
          <CardDescription>
            仅讨论文字表达，无综合分、技能等级或录用概率。点击各维度查看原因、原文和修改方向。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion>
            {review.dimensions.map((dim) => {
              const meta = statuses[dim.status],
                findings = review.findings.filter((f) => f.dimension === dim.id)
              return (
                <AccordionItem value={dim.id} key={dim.id}>
                  <AccordionTrigger>
                    <span className="flex flex-1 flex-wrap items-center justify-between gap-3 pr-2 text-left">
                      <span>{dim.title}</span>
                      <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-4">
                      <p className="text-sm leading-relaxed">
                        {dim.explanation}
                      </p>
                      {quotes(dim.sourceIds)}
                      {findings.map((f) => (
                        <article
                          key={f.id}
                          className="rounded-xl border border-border p-4"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <h3 className="text-sm font-semibold">{f.issue}</h3>
                            <StatusBadge tone="pending">
                              待确认 · 非技术认证
                            </StatusBadge>
                          </div>
                          <p className="mt-3 text-sm leading-relaxed">
                            原因：{f.reason}
                          </p>
                          <div className="mt-3 space-y-2">
                            {quotes(f.sourceIds)}
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-primary">
                            修改方向：{f.action}
                          </p>
                          {f.missingFacts.length > 0 && (
                            <p className="mt-2 text-xs text-muted-foreground">
                              待核对：{f.missingFacts.join('；')}
                            </p>
                          )}
                        </article>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </CardContent>
      </Card>
      <p className="break-all text-xs text-muted-foreground">
        {review.mode === 'mock' ? 'Mock 规则' : '实际模型'}：
        {review.metadata.provider} / {review.metadata.model} · 请求{' '}
        {review.requestId}
      </p>
      <div>
        <Button variant="outline" onClick={() => router.push('/upload')}>
          返回修改文本并重新分析
        </Button>
      </div>
    </div>
  )
}
