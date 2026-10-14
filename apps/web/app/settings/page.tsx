import type { Metadata } from 'next'
import { AppShell } from '@/components/app/app-shell'
import { SettingsPanels } from '@/components/account/settings-panels'
import { KineticTitle } from '@/components/ui/kinetic-title'

export const metadata: Metadata = { title: '账户设置 · 证途' }

export default function SettingsPage() {
  return (
    <AppShell scene="设置">
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-16 md:px-8 md:pt-24">
        <KineticTitle text="账户设置" index="—" eyebrow="Settings" />
        <p className="mt-5 max-w-2xl text-[17px] leading-relaxed text-[var(--ws-ink-2)]">
          管理你的基本信息、登录方式与数据。所有结论与来源都在你手上 —— 随时可以导出，也可以全部删除。
        </p>

        <SettingsPanels />
      </main>
    </AppShell>
  )
}
