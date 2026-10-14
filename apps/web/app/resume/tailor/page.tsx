import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AppShell } from '@/components/app/app-shell'
import { TailorBoard } from '@/components/resume/tailor-board'
import { readDemoState } from '@/lib/demo-state'
import { RESUME_SUGGESTIONS, TARGET } from '@/lib/mock-data'
import { KineticTitle } from '@/components/ui/kinetic-title'

export const metadata: Metadata = { title: '岗位专版简历 · 证途' }

export default async function TailorPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const demo = readDemoState(await searchParams)
  const suggestions = demo === 'no-suggestions' ? [] : RESUME_SUGGESTIONS

  return (
    <AppShell current="我的简历">
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-16 md:px-8 md:pt-24">
        <Link
          href="/resume"
          className="inline-flex items-center gap-1.5 text-[13px] text-[var(--ws-muted)] transition-colors hover:text-[var(--ws-ink)]"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          我的简历
        </Link>

        <KineticTitle text="岗位专版简历" index="01 · ii" eyebrow="Tailored" className="mt-6" />
        <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[var(--ws-ink-2)]">
          针对「{TARGET.title}」把简历调准。每条建议都逐条过一遍 ——
          接受、改写成你自己的话，或者拒绝。强化表述必须站得住，否则面试第一轮就会露底。
        </p>

        <TailorBoard initialSuggestions={suggestions} />
      </main>
    </AppShell>
  )
}
