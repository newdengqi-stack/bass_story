import type { Metadata } from 'next'
import { AppShell } from '@/components/app/app-shell'
import { TargetCard } from '@/components/dashboard/target-card'
import { Tasks } from '@/components/dashboard/tasks'
import { Readiness, EvidenceSummary, EvidenceStatusGrid } from '@/components/dashboard/summaries'
import { Activity } from '@/components/dashboard/activity'
import { Onboarding } from '@/components/dashboard/onboarding'
import { PixelRule, TickStrip } from '@/components/ui/pixel'
import { MeteorShower } from '@/components/ui/meteor-shower'

export const metadata: Metadata = {
  title: '工作台 · 证途',
}

const TAGS = ['证据可追溯', '排序可解释', '任务 < 90 分钟', '简历逐条确认', '硬性条件不混淆']

export default function DashboardPage() {
  return (
    <AppShell>
      <MeteorShower />
      {/* 主视觉：直接压在照片上 */}
      <section className="relative flex min-h-[32rem] flex-col justify-end px-4 pb-20 pt-16 md:min-h-[36rem] md:px-8">
        <div className="mx-auto w-full max-w-5xl">
          <TargetCard />
        </div>
      </section>

      {/* 以下内容全部以玻璃层浮在照片上 */}
      <main className="mx-auto max-w-5xl px-4 pb-24 md:px-8">
        <Tasks />

        <PixelRule className="mt-16" />

        <div className="mt-14">
          <Readiness />
        </div>

        <div className="mt-14">
          <EvidenceStatusGrid />
        </div>

        <PixelRule className="mt-16" />

        <div className="mt-14 grid gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <EvidenceSummary />
          <Activity />
        </div>

        {/* 标签带 + 信号刻度收尾 */}
        <div className="mt-16 flex flex-wrap gap-2">
          {TAGS.map((t) => (
            <span key={t} className="ws-pill px-3.5 py-1.5 text-[13px] text-[var(--ws-ink-2)]">
              {t}
            </span>
          ))}
        </div>

        <div className="mt-14 flex items-end gap-6">
          <TickStrip count={64} seed={11} className="flex-1 overflow-hidden" />
          <span className="shrink-0 font-mono text-[11px] tracking-wider text-[var(--ws-muted)]">
            ZHITU / OFFER
          </span>
        </div>
      </main>

      <Onboarding />
    </AppShell>
  )
}
