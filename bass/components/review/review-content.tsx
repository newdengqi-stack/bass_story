'use client'

import { useEffect, useState } from 'react'
import { InitialReviewContent } from './initial-review-content'
import { api } from '@/lib/api'
import { useFlow } from '@/lib/flow-context'
import { useAsync } from '@/lib/use-async'
import type { ReviewDimension } from '@/lib/api/types'
import { useRouter } from '@/lib/navigation'
import { ArrowRight, Lightbulb, CircleAlert, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ActionBar } from '@/components/workbench/action-bar'
import { StatusBadge, type StatusTone } from '@/components/shared/status-badge'

type ReviewStatus = 'clear' | 'improve' | 'unknown' | 'na'

const STATUS_META: Record<ReviewStatus, { label: string; tone: StatusTone }> = {
  clear: { label: '表达较清楚', tone: 'positive' },
  improve: { label: '建议优化', tone: 'pending' },
  unknown: { label: '无法判断', tone: 'unknown' },
  na: { label: '暂不适用', tone: 'unknown' },
}

export function ReviewContent() {
  const { initialReview } = useFlow()
  return initialReview ? (
    <InitialReviewContent review={initialReview} />
  ) : (
    <LegacyReviewContent />
  )
}

function LegacyReviewContent() {
  const router = useRouter()
  const { candidateInput, factsConfirmed } = useFlow()
  const [dimensions, setDimensions] = useState<ReviewDimension[]>([])
  const operation = useAsync()
  const { run } = operation
  useEffect(() => {
    if (factsConfirmed)
      void run((signal) => api.reviewCandidate(candidateInput, signal)).then(
        (result) => {
          if (result) setDimensions(result)
        },
      )
  }, [factsConfirmed, candidateInput, run])
  async function retry() {
    const result = await run((signal) =>
      api.reviewCandidate(candidateInput, signal),
    )
    if (result) setDimensions(result)
  }

  return (
    <div className="flex flex-col gap-6">
      {!factsConfirmed && (
        <p role="status" className="text-sm text-pending">
          请先返回确认资料；当前无有效初评。
        </p>
      )}
      {operation.loading && <p role="status">正在获取初评…</p>}
      {operation.error && (
        <div role="alert">
          {operation.error}
          <Button onClick={retry}>重试初评</Button>
        </div>
      )}
      {factsConfirmed &&
        !operation.loading &&
        !dimensions.length &&
        !operation.error && <p role="status">暂无初评内容，请重试。</p>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card className="border-pending/30 bg-pending-soft/40">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CircleAlert className="size-4 text-pending" />
              <CardTitle className="text-sm">最值得先处理的问题</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm text-foreground">
              <li>
                {candidateInput.noProject
                  ? '未提供项目材料，不评价项目质量或个人贡献。'
                  : '请仅根据真实经历补充本人任务、验证过程与可追溯证据。'}
              </li>
            </ul>
          </CardContent>
        </Card>
        <Card className="border-positive/30 bg-positive-soft/40">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Lightbulb className="size-4 text-positive" />
              <CardTitle className="text-sm">发现的亮点 / 待确认资料</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-2 text-sm text-foreground">
              <li>
                本人声明：
                {candidateInput.skills.map((s) => s.label).join('、') ||
                  '暂无技能材料'}
              </li>
              <li>未进行技术验证，不能据此确定技术水平。</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">六维评价详情</CardTitle>
          <CardDescription>
            点击展开查看原文引用与具体建议。状态仅描述表达清晰度，不代表技术能力结论。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion>
            {dimensions.map((dim) => {
              const meta = STATUS_META[dim.status]
              return (
                <AccordionItem key={dim.id} value={dim.id}>
                  <AccordionTrigger className="text-left">
                    <div className="flex flex-1 items-center justify-between gap-3 pr-2">
                      <span className="text-sm font-medium text-foreground">
                        <span className="mr-2 text-xs font-normal text-muted-foreground">
                          {dim.id}
                        </span>
                        {dim.title}
                      </span>
                      <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="flex flex-col gap-3">
                      {dim.quote && (
                        <div className="rounded-lg border border-border bg-muted/40 p-3">
                          <Quote className="mb-1.5 size-3.5 text-muted-foreground" />
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            {dim.quote}
                          </p>
                        </div>
                      )}
                      <p className="text-sm leading-relaxed text-foreground">
                        {dim.explanation}
                      </p>
                      {dim.action && (
                        <p className="text-sm leading-relaxed text-primary">
                          <span className="font-medium">修改建议：</span>
                          {dim.action}
                        </p>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </CardContent>
      </Card>

      <ActionBar
        back={
          <Button variant="ghost" onClick={() => router.push('/confirm')}>
            返回修改资料
          </Button>
        }
      >
        <Button
          size="lg"
          disabled={!factsConfirmed || operation.loading || !dimensions.length}
          onClick={() => router.push('/role')}
        >
          继续选择岗位
          <ArrowRight data-icon="inline-end" />
        </Button>
      </ActionBar>
    </div>
  )
}
