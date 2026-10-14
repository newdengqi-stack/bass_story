import type { Metadata } from 'next'
import { AppShell } from '@/components/app/app-shell'
import { EmptyState } from '@/components/shared/empty-state'
import { ProjectDeepDive } from '@/components/projects/project-deep-dive'
import { PixelRule, TickStrip } from '@/components/ui/pixel'
import { PROJECTS } from '@/lib/mock-data'
import { allProjectInsights } from '@/lib/project-insights'
import { KineticTitle } from '@/components/ui/kinetic-title'

export const metadata: Metadata = { title: '项目深挖 · 证途' }

export default function ProjectsPage() {
  const insights = allProjectInsights()

  return (
    <AppShell current="项目深挖">
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-16 md:px-8 md:pt-24">
        <header>
          <KineticTitle text="项目深挖" index="03" eyebrow="The Deep Dive" />
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[var(--ws-ink-2)]">
            左边选项目，中间对照简历原文与推荐排版，右边还原这个项目的逻辑链条、技术栈与待补证据。
            这里不评价你，只判断证据够不够 —— 九项能力对齐 {PROJECTS.length} 个项目，逐条留下带来源的结论。
          </p>
        </header>

        {PROJECTS.length === 0 ? (
          <EmptyState
            className="mt-14"
            what="还没有可以深挖的项目"
            why="项目深挖必须围绕真实做过的事展开。没有项目，就无法形成任何带来源的证据，后面的差距分析也算不出来。"
            action={{ label: '导入简历', href: '/resume/import' }}
          />
        ) : (
          <ProjectDeepDive insights={insights} />
        )}

        <PixelRule className="mt-16" />

        <div className="mt-14 flex items-end gap-6">
          <TickStrip count={56} seed={9} className="flex-1 overflow-hidden" />
          <span className="shrink-0 font-mono text-[11px] tracking-wider text-[var(--ws-muted)]">
            ZHITU / DIG
          </span>
        </div>
      </main>
    </AppShell>
  )
}
