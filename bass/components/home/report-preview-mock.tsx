import { Sparkles, ArrowUpRight } from 'lucide-react'
import { Progress } from '@/components/ui/progress'

export function ReportPreviewMock() {
  return (
    <div className="relative">
      <span className="absolute -top-4 left-4 z-10 inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm">
        <Sparkles className="size-3.5 text-primary" />
        证据驱动
      </span>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-elevated)]">
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-destructive/40" />
            <span className="size-2.5 rounded-full bg-pending/40" />
            <span className="size-2.5 rounded-full bg-positive/40" />
          </div>
          <p className="text-xs font-medium text-muted-foreground">知程 AI / 诊断概览</p>
          <span className="text-xs text-muted-foreground">虚构示例</span>
        </div>

        <div className="space-y-5 p-6">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Sparkles className="size-4" />
            </div>
            <div>
              <p className="text-base font-semibold text-foreground">你好，小程</p>
              <p className="text-xs text-muted-foreground">从你的真实经历出发，看见可以行动的下一步</p>
            </div>
          </div>

          <div className="rounded-xl bg-primary-soft p-4">
            <p className="text-xs font-medium text-primary-soft-foreground/70">本次重点</p>
            <p className="mt-1 text-sm font-semibold text-foreground">把项目经验讲得更有说服力</p>
            <p className="mt-1 text-xs text-muted-foreground">建议优先说明个人贡献和排查过程</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground">项目表达</p>
              <p className="mt-1 text-sm font-semibold text-foreground">需优化</p>
              <Progress aria-label="虚构示例状态 1，不代表能力得分" value={35} className="mt-3 h-1.5" />
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs text-muted-foreground">技术证据</p>
              <p className="mt-1 text-sm font-semibold text-foreground">待验证</p>
              <Progress aria-label="虚构示例状态 2，不代表能力得分" value={15} className="mt-3 h-1.5" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3">
            <div>
              <p className="text-xs text-muted-foreground">本周建议</p>
              <p className="text-sm font-medium text-foreground">梳理一个项目的关键技术决策</p>
            </div>
            <ArrowUpRight className="size-4 shrink-0 text-primary" />
          </div>
        </div>
      </div>

      <div className="absolute -bottom-4 right-4 inline-flex items-center gap-1.5 rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-sm">
        按岗位制定下一步
        <ArrowUpRight className="size-3.5" />
      </div>
    </div>
  )
}
