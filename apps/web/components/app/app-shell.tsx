import type { ReactNode } from 'react'
import { AppBackground } from '@/components/app/app-background'
import { DashboardNav } from '@/components/dashboard/nav'

export function AppShell({
  current,
  scene,
  children,
}: {
  current?: string
  /** 覆盖默认光域（不改变导航高亮） */
  scene?: string
  children: ReactNode
}) {
  const variant = scene ?? current ?? 'default'
  return (
    <div className="ws min-h-svh">
      <AppBackground key={variant} variant={variant} />
      <DashboardNav current={current} />
      <div className="page-in">{children}</div>
    </div>
  )
}
