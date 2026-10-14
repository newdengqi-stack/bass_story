import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { AppShell } from '@/components/app/app-shell'
import { ResumeImport } from '@/components/resume/resume-import'
import { KineticTitle } from '@/components/ui/kinetic-title'

export const metadata: Metadata = { title: '导入简历 · 证途' }

export default function ResumeImportPage() {
  return (
    <AppShell current="我的简历">
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-16 md:px-8 md:pt-24">
        <Link
          href="/resume"
          className="inline-flex items-center gap-1.5 text-[13px] text-[var(--ws-muted)] transition-colors hover:text-[var(--ws-ink)]"
        >
          <ArrowLeft className="size-3.5" aria-hidden="true" />
          我的简历
        </Link>

        <KineticTitle text="导入简历" index="01 · i" eyebrow="Import" className="mt-6" />
        <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-[var(--ws-ink-2)]">
          粘进来，拆成一条条，再逐条核对。这一步不改变任何能力的状态 —— 只是把底料备齐。
        </p>

        <ResumeImport />
      </main>
    </AppShell>
  )
}
