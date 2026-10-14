import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { AppShell } from '@/components/app/app-shell'
import { GapBoard } from '@/components/gap/gap-board'
import { PixelRule, TickStrip } from '@/components/ui/pixel'
import type { GapItem } from '@zhitu/types'
import { readDemoState } from '@/lib/demo-state'
import { GAP_ITEMS, SPRINT_TASKS, TARGET } from '@/lib/mock-data'
import { KineticTitle } from '@/components/ui/kinetic-title'
import { JobGapStudio } from '@/components/gap/job-gap-studio'

export const metadata: Metadata = { title: '职业差距分析 · 证途' }

/** 「证据全部不足」时，非硬性条件一律降级为不足/缺失 —— 让这条分支由数据驱动，而不是靠 if */
function degradeToInsufficient(items: GapItem[]): GapItem[] {
  return items.map((item) =>
    item.bucket === 'hard'
      ? item
      : {
          ...item,
          status: item.status === 'missing' ? 'missing' : 'insufficient',
          bucket: item.status === 'missing' ? 'missing' : 'needs-evidence',
          note: '目前没有足够的证据支撑这一项，需要先完成项目深挖。',
        },
  )
}

export default async function GapPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const demo = readDemoState(await searchParams)
  const items = demo === 'all-insufficient' ? degradeToInsufficient(GAP_ITEMS) : GAP_ITEMS

  const allInsufficient = items
    .filter((i) => i.bucket !== 'hard')
    .every((i) => i.status === 'insufficient' || i.status === 'missing')

  const readyCount = items.filter((i) => i.bucket === 'ready').length
  const hardCount = items.filter((i) => i.bucket === 'hard').length

  return (
    <AppShell current="职业差距分析">
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-16 md:px-8 md:pt-24">
        <header>
          <KineticTitle text="职业差距分析" index="04" eyebrow="Mind the Gap" />
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[var(--ws-ink-2)]">
            把 {TARGET.title} 的要求和你手上的证据逐条对上，看清离目标还差什么，
            以及在有限时间里先补哪一项。排序依据可以展开 —— 不是一个说不清来历的分数。
          </p>

          <div className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
            <div>
              <p className="text-[2.5rem] font-semibold leading-none tabular-nums text-[var(--ws-ink)]">
                {readyCount}
              </p>
              <p className="mt-2 text-[13px] text-[var(--ws-muted)]">已有证据可强调</p>
            </div>
            <div>
              <p className="text-[2.5rem] font-semibold leading-none tabular-nums text-[var(--ws-ink)]">
                {items.length - readyCount - hardCount}
              </p>
              <p className="mt-2 text-[13px] text-[var(--ws-muted)]">待补强</p>
            </div>
            <div>
              <p className="text-[2.5rem] font-semibold leading-none tabular-nums text-[var(--ws-ink)]">
                {hardCount}
              </p>
              <p className="mt-2 text-[13px] text-[var(--ws-muted)]">硬性条件</p>
            </div>
          </div>
        </header>

        <JobGapStudio />

        <div className="ws-ghost-box mt-10 flex flex-wrap items-center justify-between gap-4 px-6 py-5">
          <div>
            <p className="text-[14px] font-medium text-[var(--ws-ink)]">这些差距经不经得起追问？</p>
            <p className="mt-1 text-[13px] text-[var(--ws-muted)]">
              去拷打模式，让 AI 挑你最薄弱的环节当场提问，答不上来当场给参考答案。
            </p>
          </div>
          <Link
            href="/interrogate"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-[var(--ws-sand)] px-5 py-2.5 text-[14px] font-medium text-[var(--ws-on-sand)] transition-opacity hover:opacity-90"
          >
            进入拷打模式
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <PixelRule className="mt-16" />

        <h2 className="mt-12 text-[22px] font-semibold tracking-tight text-[var(--ws-ink)]">
          当前目标岗位：{TARGET.title}
        </h2>
        <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-[var(--ws-muted)]">
          这是系统对 {TARGET.company} 这个已追问验证过的目标岗位给出的完整差距清单，仅供参考 ——
          想分析其他岗位，用上面的输入框试试。
        </p>

        <GapBoard initialItems={items} tasks={SPRINT_TASKS} allInsufficient={allInsufficient} />

        <div className="mt-20 flex items-end gap-6">
          <TickStrip count={56} seed={17} className="flex-1 overflow-hidden" />
          <span className="shrink-0 font-mono text-[11px] tracking-wider text-[var(--ws-muted)]">
            ZHITU / GAP
          </span>
        </div>
      </main>
    </AppShell>
  )
}
