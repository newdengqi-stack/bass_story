'use client'

import { useRouter } from '@/lib/navigation'
import { AlertTriangle, ArrowRight, Copy, Diamond, Columns2, Sparkles, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { StatusBadge } from '@/components/shared/status-badge'
import { ActionBar } from '@/components/workbench/action-bar'
import { toast } from 'sonner'
import { copyText } from '@/lib/copy'
import { useFlow } from '@/lib/flow-context'

const COVERAGE_ITEMS = [
  { label: '示例：C 语言基础', status: '已获有效证据' as const, tone: 'positive' as const },
  { label: '示例：指针生命周期', status: '需进一步加强' as const, tone: 'pending' as const },
  { label: '示例：Linux 网络 I/O', status: '尚未验证' as const, tone: 'unknown' as const },
]

const PROJECT_LAYERS = [
  {
    icon: Diamond,
    title: '项目本身',
    description: '技术与工程复杂度、设计约束、测试完整性。',
    tag: '仅示例',
  },
  {
    icon: Columns2,
    title: '个人贡献',
    description: '本人负责的模块、设计取舍与可追溯证据。',
    tag: '需真实核查',
  },
  {
    icon: ArrowRight,
    title: '岗位价值与表达',
    description: '项目如何支撑目标岗位，事实如何准确写在简历中。',
    tag: '依岗位变化',
  },
]

export function SampleReportContent() {
  const router = useRouter()
  const {reset}=useFlow()

  async function handleCopySummary() {
    try { await copyText('虚构报告示例：仅用于展示结构，与本人输入和回答无关。');toast.success('已复制虚构示例摘要') }
    catch { toast.error('复制失败，请手动选择示例文本。') }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="overflow-hidden border-none bg-gradient-to-br from-primary via-primary to-[#2a1f6e] text-primary-foreground">
        <CardContent className="flex flex-col gap-3 py-8">
          <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium">
            <Sparkles className="size-3.5" />
            EXAMPLE ONLY
          </span>
          <h2 className="text-2xl font-bold sm:text-[28px]">一份有依据、有边界的成长建议。</h2>
          <p className="max-w-3xl text-sm leading-relaxed text-primary-foreground/80">
            本报告为虚构示例，数据与本次输入和回答无关。示例不经过真实人工复核，不用于解锁本人正式报告。
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusBadge tone="unknown">仅演示已审批报告的页面结构</StatusBadge>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopySummary}>
            <Copy data-icon="inline-start" />
            复制演示摘要
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push('/submission')}>
            返回审核页
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">01 · 本次评估覆盖</CardTitle>
            <StatusBadge tone="unknown">虚构案例</StatusBadge>
          </div>
          <CardDescription>覆盖率不是能力得分，也不是岗位匹配概率。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-3xl font-bold text-foreground">
              3<span className="text-lg font-medium text-muted-foreground">/8</span>
            </p>
            <p className="text-xs text-muted-foreground">核心节点得到充分评估</p>
            <Progress aria-label="虚构示例评估覆盖范围" value={37.5} className="h-2" />
            <p className="text-xs text-muted-foreground">其余 5 项仍需验证，无法给出总体岗位准备度结论。</p>
          </div>
          <div className="flex flex-col gap-3 border-t border-border pt-4">
            {COVERAGE_ITEMS.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="size-1.5 rounded-full bg-primary" />
                  <span className="text-sm text-foreground">{item.label}</span>
                </div>
                <StatusBadge tone={item.tone}>{item.status}</StatusBadge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">02 · 证据如何支持结论</CardTitle>
          <CardDescription>每条正式能力结论都应关联题目、答卷、Rubric 及审核版本。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border bg-muted/30 p-5">
            <StatusBadge tone="unknown">虚构证据 · CL-04</StatusBadge>
            <p className="mt-3 text-sm font-semibold text-foreground">观察到指针基础理解，但对象生命周期仍需进一步验证</p>
            <blockquote className="mt-3 border-l-2 border-primary/40 pl-3 text-sm italic text-muted-foreground">
              &ldquo;我知道指针可以保存对象地址，但对局部对象生命周期的解释不完整。&rdquo;
            </blockquote>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              这是虚构回答示例。正式服务只有在有效问题与交叉验证充分时，才能产生相应能力状态。
            </p>
            <p className="mt-3 text-xs text-muted-foreground">来源：示例问题 Q-03 Rubric：示例版本 人工审批：模拟状态</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">03 · 一个项目，分三个层次看</CardTitle>
          <CardDescription>项目本身复杂，不等于个人独立完成。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {PROJECT_LAYERS.map((layer) => {
              const Icon = layer.icon
              return (
                <div key={layer.title} className="flex flex-col gap-3 rounded-xl border border-border p-4">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Icon className="size-4.5" />
                  </span>
                  <p className="text-sm font-semibold text-foreground">{layer.title}</p>
                  <p className="text-xs leading-relaxed text-muted-foreground">{layer.description}</p>
                  <StatusBadge tone="unknown" className="w-fit">
                    {layer.tag}
                  </StatusBadge>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">04 · 岗位差距（局部）</CardTitle>
          <CardDescription>只讨论已验证节点和相关表达问题，不输出全局匹配分。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5 rounded-xl border border-border p-4">
            <StatusBadge tone="pending" className="w-fit">
              需验证的差距
            </StatusBadge>
            <p className="text-sm font-medium text-foreground">针对示例岗位，进一步验证指针生命周期与实际调试能力</p>
            <p className="text-xs leading-relaxed text-muted-foreground">此建议依据虚构的任务与证据构建，不代表当前用户的水平。</p>
          </div>
          <div className="flex flex-col gap-1.5 rounded-xl border border-border p-4">
            <StatusBadge tone="unknown" className="w-fit">
              表达差距
            </StatusBadge>
            <p className="text-sm font-medium text-foreground">把&ldquo;使用了某技术&rdquo;改为&ldquo;具体解决了什么问题&rdquo;</p>
            <p className="text-xs leading-relaxed text-muted-foreground">在确认事实后，补充实现过程与验证方法。</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">05 · 接下来怎么做</CardTitle>
          <CardDescription>每个建议都应有原因、步骤、交付物和验收条件。</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 rounded-xl border border-border p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">01 / NOW</span>
              <p className="text-sm font-semibold text-foreground">梳理对象生命周期的核心边界</p>
              <p className="text-xs leading-relaxed text-muted-foreground">为什么现在做：虚构案例在生命周期判断中暴露出需要巩固的部分。</p>
              <p className="text-xs leading-relaxed text-muted-foreground">交付物：一份带代码与解释的生命周期笔记</p>
              <p className="text-xs leading-relaxed text-muted-foreground">验收：能正确说明至少三种不同存储周期的边界</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-border p-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-primary">02 / NOW</span>
              <p className="text-sm font-semibold text-foreground">补全代表项目的个人贡献证据</p>
              <p className="text-xs leading-relaxed text-muted-foreground">为什么现在做：把团队项目中的个人工作与整体成果分开。</p>
              <p className="text-xs leading-relaxed text-muted-foreground">交付物：模块职责、一个故障定位过程及验证记录</p>
              <p className="text-xs leading-relaxed text-muted-foreground">验收：陈述能对应真实代码、日志或操作记录</p>
            </div>
          </div>
          <div className="rounded-xl border border-border p-4"><p className="text-xs font-semibold text-primary">LATER · 以后做（虚构示例）</p><p className="mt-2 text-sm">在完成当前基础验证后，再依据真实岗位需求扩展新的工具实践；交付物与验收条件由后续证据决定。</p></div>
          <div className="flex items-start gap-3 rounded-xl border border-dashed border-border bg-muted/40 p-4">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-[var(--color-warning)]" />
            <div>
              <p className="text-sm font-medium text-foreground">当前不建议优先做</p>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                示例：若目标是 MCU 应用开发且 JD 未要求 Docker，相比扩展容器工具链，可以先完善中断、DMA 与资源同步的实践证据。具体取舍必须依据真实 JD。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">06 · 简历描述增强（事实约束）</CardTitle>
          <CardDescription>真实系统只根据本人确认的事实建议改写，不增加不存在的数字与个人贡献。</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2 rounded-xl border border-border p-4">
              <p className="text-xs font-semibold text-muted-foreground">原始表述示例</p>
              <p className="text-sm text-foreground">参与智能小车项目，使用 STM32 和 PID。</p>
            </div>
            <div className="flex flex-col gap-2 rounded-xl border border-primary/30 bg-primary-soft/40 p-4">
              <p className="text-xs font-semibold text-primary">建议的安全表达方向</p>
              <p className="text-sm text-foreground">
                参与基于 STM32 的智能小车项目，在本人实际负责的模块中说明使用 PID 的具体任务、调试过程与验证方式（待本人确认）。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ActionBar back={<Button variant="ghost" onClick={() => router.push('/')}>回到首页</Button>}>
        <Button size="lg" onClick={() => { reset();router.push('/upload') }}>
          <RotateCcw data-icon="inline-start" />
          重新体验演示
        </Button>
      </ActionBar>
    </div>
  )
}
