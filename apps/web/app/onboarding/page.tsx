import type { Metadata } from 'next'
import Link from 'next/link'
import { AppShell } from '@/components/app/app-shell'
import { OnboardingWizard } from '@/components/onboarding/onboarding-wizard'
import { KineticTitle } from '@/components/ui/kinetic-title'

export const metadata: Metadata = { title: '开始使用 · 证途' }

export default function OnboardingPage() {
  return (
    <AppShell scene="设置">
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-16 md:px-8 md:pt-24">
        <KineticTitle text="四步开始" index="00" eyebrow="Begin Here" />
        <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[var(--ws-ink-2)]">
          定岗位、导简历、核对解析、选项目 —— 走完这四步，差距分析才有东西可算。
          中途随时可以退回上一步，已经填好的内容不会丢。
        </p>

        <OnboardingWizard />

        <p className="mt-12 text-[13px] text-[var(--ws-muted)]">
          已经走完引导？直接去
          <Link href="/dashboard" className="ml-1 text-[var(--ws-sand)] transition-opacity hover:opacity-70">
            工作台
          </Link>
        </p>
      </main>
    </AppShell>
  )
}
