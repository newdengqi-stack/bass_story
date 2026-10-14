'use client'

import { useState } from 'react'
import { useRouter } from '@/lib/navigation'
import { X, Plus, ArrowRight, Quote, ShieldCheck, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { ActionBar } from '@/components/workbench/action-bar'
import { StatusBadge } from '@/components/shared/status-badge'
import { useFlow } from '@/lib/flow-context'

import { api } from '@/lib/api'
import { useAsync } from '@/lib/use-async'

function SourcePreview() {
  const { resumeText }=useFlow()
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">原文依据</CardTitle>
        <CardDescription>以下片段来自你提交的简历内容</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-lg border border-border bg-muted/40 p-3">
          <Quote className="mb-2 size-3.5 text-muted-foreground" />
          <p className="whitespace-pre-line text-xs leading-relaxed text-muted-foreground">{resumeText || '尚无来源文本，请先添加简历。'}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export function ConfirmForm() {
  const router = useRouter()
  const { skillClaims, setSkillClaims, projectName, setProjectName, projectContribution, setProjectContribution, factsConfirmed, setFactsConfirmed, noProject, setNoProject, parsed, candidateInput, acceptCandidate } =
    useFlow()
  const [newSkill, setNewSkill] = useState('')
  const operation=useAsync()

  const pendingCount = skillClaims.filter((s) => !s.confirmed).length

  function addSkill() {
    const label = newSkill.trim()
    if (!label) return
    setSkillClaims([...skillClaims, { id: `s-${Date.now()}`, label, confirmed: true }])
    setNewSkill('')
  }

  function removeSkill(id: string) {
    setSkillClaims(skillClaims.filter((s) => s.id !== id))
  }

  function confirmSkill(id: string) {
    setSkillClaims(skillClaims.map((s) => (s.id === id ? { ...s, confirmed: true } : s)))
  }

  const canContinue = parsed && factsConfirmed && pendingCount === 0 && !operation.loading
  async function confirm() {
    if(!canContinue)return
    const saved=await operation.run(signal=>api.confirmCandidate(candidateInput,signal))
    if(saved){acceptCandidate(saved);router.push('/review')}
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8">
      <div className="flex flex-col gap-6 lg:col-span-8">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-sm">技术标签</CardTitle>
              {pendingCount > 0 && <StatusBadge tone="pending">待确认 {pendingCount} 项</StatusBadge>}
            </div>
            <CardDescription>这只是你简历中声明的技术，不代表已经通过技术测评。</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {skillClaims.map((skill) => (
                <span
                  key={skill.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card py-1 pl-3 pr-1.5 text-sm"
                >
                  {skill.label}
                  {!skill.confirmed && (
                    <button
                      type="button"
                      aria-label={`确认技能 ${skill.label}`}
                      onClick={() => confirmSkill(skill.id)}
                      className="rounded-full bg-pending-soft px-1.5 py-0.5 text-[10px] font-medium text-pending hover:bg-pending-soft/70"
                    >
                      待确认
                    </button>
                  )}
                  <button
                    type="button"
                    aria-label={`移除 ${skill.label}`}
                    onClick={() => removeSkill(skill.id)}
                    className="flex size-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                aria-label="添加技能标签"
                placeholder="添加技能标签，如 Python"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addSkill()
                  }
                }}
                className="max-w-xs"
              />
              <Button variant="outline" onClick={addSkill}>
                <Plus data-icon="inline-start" />
                添加
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">代表项目</CardTitle>
            <CardDescription>请仅填写你本人真正承担的工作；团队项目同样有价值，无需夸大职责。</CardDescription>
          </CardHeader>
          <CardContent>
            {noProject ? (
              <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed border-border p-4">
                <p className="text-sm text-muted-foreground">
                  已选择不提供项目材料。相关的项目表达维度将标记为「资料不足」，不会被当作能力缺陷。
                </p>
                <Button variant="outline" size="sm" onClick={() => setNoProject(false)}>
                  我还是想补充项目信息
                </Button>
              </div>
            ) : (
              <FieldGroup>
                <Field>
                  <FieldLabel htmlFor="project-name">项目名称</FieldLabel>
                  <Input disabled={operation.loading} id="project-name" value={projectName} onChange={(e) => setProjectName(e.target.value)} />
                  <FieldDescription>系统识别，待确认</FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="project-contribution">本人实际负责的工作</FieldLabel>
                  <Textarea
                    disabled={operation.loading}
                    id="project-contribution"
                    placeholder="例如：负责电机驱动模块的代码实现与调试，使用逻辑分析仪排查 UART 时序问题……"
                    className="min-h-28"
                    value={projectContribution}
                    onChange={(e) => setProjectContribution(e.target.value)}
                  />
                  <FieldDescription>描述具体任务、遇到的技术难点以及验证方式，而非笼统的“参与了项目”。</FieldDescription>
                </Field>
              </FieldGroup>
            )}
            {!noProject && (
              <Button variant="link" className="mt-3 h-auto p-0 text-sm text-muted-foreground" onClick={() => setNoProject(true)}>
                不提供项目材料也可以继续
              </Button>
            )}
          </CardContent>
        </Card>

        <div className="lg:hidden">
          <Sheet>
            <SheetTrigger render={<Button variant="outline" className="w-full" />}>
              <Info data-icon="inline-start" />
              查看原文依据
            </SheetTrigger>
            <SheetContent side="bottom" className="max-h-[80vh]">
              <SheetHeader>
                <SheetTitle>原文依据</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-6">
                <SourcePreview />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Card className="border-border bg-muted/40">
          <CardContent className="flex items-start gap-3 py-4">
            <Checkbox
              disabled={operation.loading}
              id="facts-confirm"
              checked={factsConfirmed}
              onCheckedChange={(v) => setFactsConfirmed(v === true)}
              className="mt-0.5"
            />
            <Label htmlFor="facts-confirm" className="text-sm font-normal leading-relaxed text-foreground">
              我确认以上内容符合本人真实经历，技能标签为本人声明，项目贡献为本人实际承担的工作。
            </Label>
          </CardContent>
        </Card>

        {!parsed && <p role="status" className="text-sm text-pending">本会话尚未添加简历，刷新后需从上传页重新录入。</p>}
        {operation.error && <p role="alert" className="text-sm text-destructive">{operation.error}</p>}
        <ActionBar back={<Button variant="ghost" onClick={() => router.push('/upload')}>返回修改简历</Button>}>
          <Button size="lg" disabled={!canContinue} onClick={confirm}>
            {operation.loading ? '正在保存确认…' : '确认并查看简历初评'}
            <ArrowRight data-icon="inline-end" />
          </Button>
        </ActionBar>
      </div>

      <div className="hidden flex-col gap-5 lg:col-span-4 lg:flex">
        <SourcePreview />
        <Card>
          <CardContent className="flex items-start gap-3 py-4 text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
            <p>更正事实后，依赖该内容的初评与审核结论会重新生成，不会静默复用旧结果。</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
