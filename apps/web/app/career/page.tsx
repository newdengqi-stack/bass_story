import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowUpRight, Building2, Lock, MapPin } from 'lucide-react'
import { AppShell } from '@/components/app/app-shell'
import { KineticTitle } from '@/components/ui/kinetic-title'
import { PixelRule, TickStrip } from '@/components/ui/pixel'
import { StarExpansionMap } from '@/components/career/star-expansion-map'
import { JdWorkbench } from '@/components/career/jd-workbench'
import { TARGET } from '@/lib/mock-data'

export const metadata: Metadata = { title: '意向职业 · 证途' }

const RELATED = [
  { href: '/resume', label: '我的简历', note: '把经历整理成可引用的证据' },
  { href: '/gap', label: '职业差距分析', note: '要求与证据逐条对照' },
  { href: '/projects', label: '项目深挖', note: '补足证据不足的能力项' },
]

function TagGroup({ title, items, tone }: { title: string; items: string[]; tone: string }) {
  return (
    <div>
      <p className="flex items-center gap-2 text-[12px] text-[var(--ws-muted)]">
        <span className={`size-1.5 rounded-full ${tone}`} aria-hidden="true" />
        {title}
        <span className="font-mono tabular-nums">{items.length}</span>
      </p>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {items.map((item) => (
          <li key={item} className="rounded-full border border-[var(--ws-line)] bg-white/5 px-2.5 py-1 text-[13px] text-[var(--ws-ink-2)]">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function CareerPage() {
  return (
    <AppShell current="意向职业">
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-16 md:px-8 md:pt-24">
        <header>
          <KineticTitle text="意向职业" index="02" eyebrow="The Brief" />
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[var(--ws-ink-2)]">
            粘一份具体的 JD，把它拆成可核验的能力项。未在 JD 中出现的技术，不会被标为「明确要求」——这是这份分析能被核实的前提。
          </p>
        </header>

        <section aria-labelledby="target-title" className="ws-glass-card mt-10 grid gap-8 rounded-3xl p-6 md:grid-cols-[1.3fr_1fr] md:p-8">
          <div className="flex flex-col">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[var(--ws-sand)]">Current Target</p>
            <h2 id="target-title" className="mt-2 text-[28px] font-semibold tracking-tight text-[var(--ws-ink)]">
              {TARGET.title}
            </h2>
            <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-[var(--ws-muted)]">
              <span className="inline-flex items-center gap-1.5">
                <Building2 className="size-3.5" aria-hidden="true" />
                {TARGET.company}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="size-3.5" aria-hidden="true" />
                {TARGET.location}
              </span>
            </p>

            <div className="mt-6 flex flex-col gap-5">
              <TagGroup title="必须" items={TARGET.must} tone="bg-[var(--ws-sand)]" />
              <TagGroup title="加分" items={TARGET.plus} tone="bg-[var(--ws-info)]" />
              <div>
                <p className="flex items-center gap-2 text-[12px] text-[var(--ws-muted)]">
                  <Lock className="size-3 text-[var(--ws-warn)]" aria-hidden="true" />
                  硬性条件
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {TARGET.hard.map((item) => (
                    <li key={item} className="rounded-full border border-dashed border-[var(--ws-warn)]/50 px-2.5 py-1 text-[13px] text-[var(--ws-ink-2)]">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/gap"
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--ws-sand-fill)] px-5 py-2.5 text-[14px] font-medium text-[var(--ws-on-sand)] transition-opacity hover:opacity-90"
              >
                查看差距分析
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
              <Link href="/target/new" className="ws-pill inline-flex items-center px-5 py-2.5 text-[14px] text-[var(--ws-ink-2)]">
                切换目标
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center rounded-2xl border border-[var(--ws-line)] bg-black/15 p-6">
            <StarExpansionMap />
          </div>
        </section>

        <JdWorkbench />

        <PixelRule className="mt-16" />

        <section aria-labelledby="related-title" className="mt-12">
          <h2 id="related-title" className="text-[15px] font-medium text-[var(--ws-muted)]">
            准备闭环的其他环节
          </h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-3">
            {RELATED.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="ws-glass-card group flex h-full items-start justify-between gap-3 rounded-2xl p-5 transition-transform hover:-translate-y-0.5"
                >
                  <span>
                    <span className="block text-[15px] font-medium text-[var(--ws-ink)]">{item.label}</span>
                    <span className="mt-1 block text-[13px] text-[var(--ws-muted)]">{item.note}</span>
                  </span>
                  <ArrowUpRight
                    className="size-4 shrink-0 text-[var(--ws-muted)] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <div className="mt-20 flex items-end gap-6">
          <TickStrip count={56} seed={3} className="flex-1 overflow-hidden" />
          <span className="shrink-0 font-mono text-[11px] tracking-wider text-[var(--ws-muted)]">ZHITU / CAREER</span>
        </div>
      </main>
    </AppShell>
  )
}
