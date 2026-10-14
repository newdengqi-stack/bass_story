'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from '@/lib/navigation'
import { ArrowRight, Check, CircleDashed, SkipForward } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { ActionBar } from '@/components/workbench/action-bar'
import { StatusBadge } from '@/components/shared/status-badge'
import { cn } from '@/lib/utils'
import { useFlow } from '@/lib/flow-context'

import { api } from '@/lib/api'
import { useAsync } from '@/lib/use-async'

export function AssessmentContent() {
  const router = useRouter()
  const { roleId, mode, drafts, setDrafts, statuses, setStatuses, questionIndex:index, setQuestionIndex:setIndex, assessment, setAssessment, candidateId, revision, factsConfirmed, scopeConfirmed } = useFlow()
  const operation=useAsync();const {run}=operation
  const keys=useRef(new Map<string,{value:string;key:string}>())
  const canStart=factsConfirmed && (mode==='skillonly' || (!!roleId && scopeConfirmed))
  useEffect(()=>{
    if(canStart && !assessment)void run(signal=>api.createAssessment({mode:mode??'existing',role:roleId,candidateId,key:`create-${candidateId}-${revision}`},signal)).then(result=>{if(result)setAssessment(result)})
  },[canStart,assessment,mode,roleId,candidateId,revision,run,setAssessment])
  async function retry(){const result=await run(signal=>api.createAssessment({mode:mode??'existing',role:roleId,candidateId,key:`create-${candidateId}-${revision}`},signal));if(result)setAssessment(result)}
  if(!assessment || !assessment.questions.length)return <div className="flex flex-col gap-4"><p role={operation.error?'alert':'status'}>{operation.error || (operation.loading?'正在获取题目…':canStart?'暂未返回可答题目。':'请先确认简历并选择诊断范围；刷新后需重新开始。')}</p>{canStart&&<Button onClick={retry} disabled={operation.loading}>重试获取题目</Button>}<Button variant="outline" onClick={()=>router.push('/role')}>返回选择范围</Button></div>
  const questions=assessment.questions
  const current = questions[Math.min(index,questions.length-1)]
  const total = questions.length
  const completedCount = Object.values(statuses).filter((s) => s !== 'pending').length
  const isLast = index === total - 1
  const allDone = completedCount === total

  async function commit(status: 'answered' | 'skipped') {
    if(operation.loading || !assessment)return
    const value=status+':'+(drafts[current.id]??'')
    let entry=keys.current.get(current.id)
    if(!entry||entry.value!==value){entry={value,key:crypto.randomUUID()};keys.current.set(current.id,entry)}
    const saved=await operation.run(signal=>api.saveAnswer(assessment.id,current.id,drafts[current.id]??'',status,entry.key,signal,{question:current.version,assessment:assessment.version}))
    if(saved){setAssessment({...assessment,version:saved});setStatuses({ ...statuses, [current.id]: status });if (!isLast) setIndex(index + 1)}
  }

  function goTo(i: number) {
    setIndex(i)
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xs text-muted-foreground">本会话在内存中保存草稿；可返回其他步骤后继续，刷新会清除本地演示资料。跳过表示尚未验证。</p>
      {operation.error && <p role="alert" className="text-sm text-destructive">{operation.error}</p>}
      {operation.loading && <div role="status">正在保存回答…<Button variant="outline" onClick={operation.cancel}>取消操作</Button></div>}
      <div className="flex items-center gap-3">
        <Progress aria-label="问答完成进度" value={(completedCount / total) * 100} className="h-2 flex-1" />
        <span className="shrink-0 text-xs font-medium text-muted-foreground">
          已完成 {completedCount} / {total}
        </span>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_260px]">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">{current.id}</span>
              <StatusBadge tone="pending">{current.dimension}</StatusBadge>
            </div>
            <CardTitle className="text-base leading-relaxed">{current.prompt.split('`').map((part,i)=>i%2?<code key={i} className="rounded bg-muted px-1 font-mono text-sm">{part}</code>:part)}</CardTitle>
            <CardDescription>{current.hint}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Textarea
              aria-label="当前题目回答"
              disabled={operation.loading}
              maxLength={20000}
              value={drafts[current.id] ?? ''}
              onChange={(e) => setDrafts({ ...drafts, [current.id]: e.target.value })}
              placeholder="在这里输入你的回答……没有字数要求，诚实、具体比完整更重要。"
              className="min-h-40"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button
                variant="ghost"
                disabled={operation.loading}
                onClick={() => commit('skipped')}
                className="text-muted-foreground"
              >
                <SkipForward data-icon="inline-start" />
                跳过（尚未验证）
              </Button>
              <Button onClick={() => commit('answered')} disabled={operation.loading || !drafts[current.id]?.trim()}>
                提交并{isLast ? '完成' : '继续下一题'}
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-sm">题目导航</CardTitle>
            <CardDescription>可回看已完成的题目，跳过的题目会在报告中标注为「尚未验证」。</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-1.5">
            {questions.map((q, i) => {
              const status = statuses[q.id] ?? 'pending'
              return (
                <button
                  key={q.id}
                  type="button"
                  aria-current={i===index?'step':undefined}
                  disabled={operation.loading}
                  onClick={() => goTo(i)}
                  className={cn(
                    'flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-sm transition-colors',
                    i === index ? 'bg-primary-soft text-foreground' : 'hover:bg-muted/60',
                  )}
                >
                  {status === 'answered' ? (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-positive)] text-white">
                      <Check className="size-3" />
                    </span>
                  ) : status === 'skipped' ? (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground">
                      <SkipForward className="size-3" />
                    </span>
                  ) : (
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-dashed border-border text-muted-foreground">
                      <CircleDashed className="size-3" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1 truncate">
                    {q.id} · {q.dimension}
                  </span>
                </button>
              )
            })}
          </CardContent>
        </Card>
      </div>

      <ActionBar back={<Button variant="ghost" onClick={() => router.push('/role')}>返回岗位与 JD</Button>}>
        <Button size="lg" disabled={!allDone || operation.loading} onClick={() => router.push('/submission')}>
          完成问答，进入人工复核
          <ArrowRight data-icon="inline-end" />
        </Button>
      </ActionBar>
    </div>
  )
}
