'use client'

import { useRef } from 'react'
import { useRouter } from '@/lib/navigation'
import { ArrowRight, Check, Compass, Cpu, Braces, Terminal, Sparkles, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'
import { ActionBar } from '@/components/workbench/action-bar'
import { StatusBadge } from '@/components/shared/status-badge'
import { cn } from '@/lib/utils'
import { useFlow, ROLE_PROFILES, type RoleId } from '@/lib/flow-context'
import { toast } from 'sonner'

const ROLE_ICONS: Record<Exclude<RoleId, null>, typeof Cpu> = {
  mcu: Cpu,
  linux: Terminal,
  cpp: Braces,
}

import { SAMPLE_JD } from '@/lib/api/fixtures'
import { api } from '@/lib/api'
import { useAsync } from '@/lib/use-async'
import type { Requirement as RequirementRow } from '@/lib/api/types'

type Importance = 'must' | 'important' | 'bonus' | 'pending'

const IMPORTANCE_META: Record<Importance, { label: string; tone: 'positive' | 'pending' | 'unknown' }> = {
  must: { label: 'must', tone: 'positive' },
  important: { label: 'important', tone: 'pending' },
  bonus: { label: 'bonus', tone: 'unknown' },
  pending: { label: '待确认', tone: 'unknown' },
}

function RoleCard({
  roleId,
  selected,
  onSelect,
}: {
  roleId: Exclude<RoleId, null>
  selected: boolean
  onSelect: () => void
}) {
  const role = ROLE_PROFILES[roleId]
  const Icon = ROLE_ICONS[roleId]
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cn(
        'flex flex-col gap-4 rounded-2xl border bg-card p-5 text-left transition-colors',
        selected ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/40',
      )}
    >
      <div
        className={cn(
          'flex size-9 items-center justify-center rounded-lg',
          selected ? 'bg-primary text-primary-foreground' : 'bg-primary-soft text-primary',
        )}
      >
        <Icon className="size-4.5" />
      </div>
      <div className="flex flex-col gap-1">
        <p className="text-sm font-semibold text-foreground">{role.name}</p>
        <p className="text-xs leading-relaxed text-muted-foreground">{role.focus}</p>
      </div>
      <p className="text-xs text-muted-foreground">查看参考岗位 · 未校准模板</p>
    </button>
  )
}

export function RoleContent() {
  const router = useRouter()
  const { mode, setMode, roleId, setRoleId, jdText, setJdText, jdExtracted, setJdExtracted, requirements, setRequirements, scopeConfirmed:confirmedScope, setScopeConfirmed:setConfirmedScope, revision, factsConfirmed } = useFlow()
  const operation=useAsync()
  const latest=useRef(revision);latest.current=revision

  const activeMode = mode ?? 'existing'

  function handleModeChange(value: string) {
    setMode(value as typeof mode)
    setConfirmedScope(false)
  }

  function handleFillSample() {
    setJdText(SAMPLE_JD)
    toast('已填入匿名示例文本')
  }

  async function handleExtract() {
    if (!roleId || !jdText.trim()) return
    const version=revision
    const result=await operation.run(signal=>api.analyzeRole(jdText,roleId,signal))
    if(result && version===latest.current){setRequirements(result);setJdExtracted(true)}
  }

  function toggleConfirmed(skill: string) {
    setRequirements(requirements.map((r) => (r.skill === skill ? { ...r, confirmed: !r.confirmed } : r)))
    setConfirmedScope(false)
  }

  const requirementsReady = !jdText.trim() || (jdExtracted && requirements.length>0 && requirements.every(r=>r.confirmed))
  const canContinue = factsConfirmed && !operation.loading && (activeMode === 'skillonly' || (Boolean(roleId) && confirmedScope && (activeMode!=='existing' || requirementsReady)))

  const ctaLabel =
    activeMode === 'skillonly' ? '开始基础能力诊断' : activeMode === 'explore' ? '确认方向并开始诊断' : '开始快速技术诊断'

  return (
    <div className="flex flex-col gap-6">
      {!factsConfirmed && <p role="status" className="text-sm text-pending">请先添加并确认简历事实；刷新后需重新录入。</p>}
      {operation.loading && <p role="status">正在分析 JD…</p>}
      {operation.error && <p role="alert" className="text-sm text-destructive">{operation.error}</p>}
      {jdExtracted && !requirements.length && <p role="status">未识别到受支持的关键词，不代表该岗位不需要技能。可修改 JD 重试，或清空 JD 后明确按演示模板继续。</p>}
      <Tabs value={activeMode} onValueChange={handleModeChange}>
        <TabsList className="w-full">
          <TabsTrigger value="existing" className="flex-1">
            已有目标岗位
          </TabsTrigger>
          <TabsTrigger value="explore" className="flex-1">
            我还在探索
          </TabsTrigger>
          <TabsTrigger value="skillonly" className="flex-1">
            先了解技术能力
          </TabsTrigger>
        </TabsList>

        <TabsContent value="existing" className="mt-6">
          <ExistingPanel
            roleId={roleId}
            setRoleId={setRoleId}
            jdText={jdText}
            setJdText={setJdText}
            jdExtracted={jdExtracted}
            requirements={requirements}
            onFillSample={handleFillSample}
            onExtract={handleExtract}
            onToggleConfirmed={toggleConfirmed}
          />
        </TabsContent>

        <TabsContent value="explore" className="mt-6">
          <ExplorePanel roleId={roleId} setRoleId={setRoleId} />
        </TabsContent>

        <TabsContent value="skillonly" className="mt-6">
          <Card className="border-border/80 bg-primary-soft/30">
            <CardContent className="flex flex-col gap-3 pt-6">
              <div className="flex items-center gap-2">
                <Compass className="size-4 text-primary" />
                <p className="text-sm font-medium text-foreground">不要求选择岗位</p>
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground">
                你将直接进入通用基础概念与工程场景题，正式报告会隐藏岗位差距、岗位达标率与岗位定向的暂缓建议，只给出一般性的技术验证结论。
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {activeMode !== 'skillonly' && (
        <Card className={cn('border-2', roleId ? 'border-primary/30' : 'border-dashed border-border')}>
          <CardContent className="flex flex-col gap-2 pt-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-semibold text-foreground">当前选择</p>
              {roleId ? (
                <p className="text-sm text-muted-foreground">
                  {ROLE_PROFILES[roleId].name} · {ROLE_PROFILES[roleId].id} · 仅演示未校准岗位模板
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">尚未选择岗位</p>
              )}
            </div>
            <StatusBadge tone={confirmedScope ? 'positive' : 'pending'}>{confirmedScope ? '已确认' : '需确认'}</StatusBadge>
          </CardContent>
        </Card>
      )}

      {activeMode !== 'skillonly' && (
        <Field orientation="horizontal">
          <Checkbox id="scope-confirm" checked={confirmedScope} onCheckedChange={(v) => setConfirmedScope(v === true)} />
          <FieldLabel htmlFor="scope-confirm" className="text-sm font-normal leading-relaxed text-muted-foreground">
            我已确认上述目标及需求范围，理解岗位模板为演示材料，尚未经过真实招聘样本校准。
          </FieldLabel>
        </Field>
      )}

      <ActionBar back={<Button variant="ghost" onClick={() => router.push('/review')}>返回简历初评</Button>}>
        <Button size="lg" disabled={!canContinue} onClick={() => router.push('/assessment')}>
          {ctaLabel}
          <ArrowRight data-icon="inline-end" />
        </Button>
      </ActionBar>
    </div>
  )
}

function ExistingPanel({
  roleId,
  setRoleId,
  jdText,
  setJdText,
  jdExtracted,
  requirements,
  onFillSample,
  onExtract,
  onToggleConfirmed,
}: {
  roleId: RoleId
  setRoleId: (v: RoleId) => void
  jdText: string
  setJdText: (v: string) => void
  jdExtracted: boolean
  requirements: RequirementRow[]
  onFillSample: () => void
  onExtract: () => void
  onToggleConfirmed: (skill: string) => void
}) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <CardTitle className="text-sm">选择一个岗位原型</CardTitle>
            <CardDescription>V0 仅覆盖下列三个受限实习岗位原型，不代表所有企业的统一标准。</CardDescription>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(Object.keys(ROLE_PROFILES) as Exclude<RoleId, null>[]).map((id) => (
            <RoleCard key={id} roleId={id} selected={roleId === id} onSelect={() => setRoleId(id)} />
          ))}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">可选：粘贴目标岗位 JD</CardTitle>
          <CardDescription>粘贴去敏后的招聘描述，我们只做本地关键词匹配演示，不会连接真实招聘数据源。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Textarea
            aria-label="目标岗位 JD"
            maxLength={30000}
            value={jdText}
            onChange={(e) => setJdText(e.target.value)}
            placeholder="粘贴去敏后的招聘描述，例如：岗位要求熟悉 C 语言、STM32、UART，了解 FreeRTOS，有独立调试经验......"
            className="min-h-32"
          />
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="outline" size="sm" onClick={onFillSample}>
              <Sparkles data-icon="inline-start" />
              使用匿名示例 JD 填充
            </Button>
            <Button size="sm" disabled={!roleId || !jdText} onClick={onExtract}>
              提取技能需求（本地关键词演示）
            </Button>
            <span className="text-xs text-muted-foreground">请确认抽取结果；原型没有连接招聘网站或 AI 解析服务。</span>
          </div>
        </CardContent>
      </Card>

      {jdExtracted && requirements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">需求清单</CardTitle>
            <CardDescription>每行为技能、JD 原文依据、当前重要度与是否已确认；未提及的技能不会默认标为「不需要」。</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col divide-y divide-border">
              {requirements.map((row) => {
                const meta = IMPORTANCE_META[row.importance]
                return (
                  <div key={row.skill} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-foreground">{row.skill}</p>
                        <StatusBadge tone={meta.tone}>{meta.label}</StatusBadge>
                      </div>
                      <p className="text-xs leading-relaxed text-muted-foreground">JD 依据：{row.quote}</p>
                    </div>
                    <Button
                      variant={row.confirmed ? 'secondary' : 'outline'}
                      size="sm"
                      onClick={() => onToggleConfirmed(row.skill)}
                    >
                      {row.confirmed && <Check data-icon="inline-start" />}
                      {row.confirmed ? '已确认' : '待确认'}
                    </Button>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/40 p-3 text-xs leading-relaxed text-muted-foreground">
        <Info className="mt-0.5 size-3.5 shrink-0" />
        <p>
          来源透明：当前展示的是「通用岗位模板」，适用于对应实习岗位方向。模板尚未经过真实 JD 样本校准，仅供本次演示使用；如编辑 JD 后原有「已确认」状态会失效，需要重新确认。
        </p>
      </div>
    </div>
  )
}

function ExplorePanel({ roleId, setRoleId }: { roleId: RoleId; setRoleId: (v: RoleId) => void }) {
  const { skillClaims }=useFlow()
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/80 bg-primary-soft/30">
        <CardContent className="flex flex-col gap-3 pt-6">
          <div className="flex items-center gap-2">
            <Compass className="size-4 text-primary" />
            <p className="text-sm font-medium text-foreground">查看三个受限岗位原型</p>
          </div>
          <ul className="flex flex-col gap-2 text-sm leading-relaxed text-muted-foreground">
            <li>本人声明的技能：{skillClaims.map(skill=>skill.label).join('、') || '暂无'}。下列方向只是可选的演示模板，没有推荐排序。</li>
            <li>· 以下不是匹配度或胜任率评分，仅为依据你本人声明技能给出的有限线索；最终仍需你主动确认一个岗位方向。</li>
          </ul>
        </CardContent>
      </Card>
      <div>
        <CardTitle className="mb-3 text-sm">请选择一个岗位方向继续</CardTitle>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {(Object.keys(ROLE_PROFILES) as Exclude<RoleId, null>[]).map((id) => (
            <RoleCard key={id} roleId={id} selected={roleId === id} onSelect={() => setRoleId(id)} />
          ))}
        </div>
      </div>
    </div>
  )
}
