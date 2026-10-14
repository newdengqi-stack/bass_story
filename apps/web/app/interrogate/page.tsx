import type { Metadata } from 'next'
import { AppShell } from '@/components/app/app-shell'
import { KineticTitle } from '@/components/ui/kinetic-title'
import { TickStrip } from '@/components/ui/pixel'
import { InterrogationRoom } from '@/components/interrogate/interrogation-room'

export const metadata: Metadata = { title: '拷打模式 · 证途' }

export default function InterrogatePage() {
  return (
    <AppShell current="拷打模式">
      <main className="mx-auto max-w-5xl px-4 pb-28 pt-16 md:px-8 md:pt-24">
        <header>
          <KineticTitle text="拷打模式" index="05" eyebrow="Cross-Examination" />
          <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[var(--ws-ink-2)]">
            AI 会照着你的项目经历和目标岗位，挑最薄弱的环节追问到底。打字或开口回答都行，
            答错当场给出参考答案，通关后会有一份完整的结案报告。
          </p>
        </header>

        <InterrogationRoom />

        <div className="mt-20 flex items-end gap-6">
          <TickStrip count={56} seed={31} className="flex-1 overflow-hidden" />
          <span className="shrink-0 font-mono text-[11px] tracking-wider text-[var(--ws-muted)]">
            ZHITU / INTERROGATE
          </span>
        </div>
      </main>
    </AppShell>
  )
}
