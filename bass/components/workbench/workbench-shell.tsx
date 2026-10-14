import type { ReactNode } from 'react'
import { WorkbenchTopbar } from '@/components/workbench/workbench-topbar'
import {
  JourneyStepperDesktop,
  JourneyStepperMobile,
} from '@/components/workbench/journey-stepper'
import { PrivacyControls } from '@/components/shared/privacy-controls'
import { TrustNote } from '@/components/workbench/trust-note'
import { stepIndex, JOURNEY_STEPS } from '@/lib/journey'
import { useFlow } from '@/lib/flow-context'
import Link from '@/lib/navigation'

interface WorkbenchShellProps {
  stepKey: string
  eyebrow: string
  title: string
  description?: string
  badge?: string
  children: ReactNode
  rightSlot?: ReactNode
}

export function WorkbenchShell({
  stepKey,
  eyebrow,
  title,
  description,
  badge,
  children,
  rightSlot,
}: WorkbenchShellProps) {
  const { initialReview } = useFlow()
  const textOnly =
    stepKey === 'upload' || (stepKey === 'review' && !!initialReview)
  const idx = textOnly ? (stepKey === 'review' ? 1 : 0) : stepIndex(stepKey)
  const total = textOnly ? 2 : JOURNEY_STEPS.length

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <WorkbenchTopbar />
      <div className="mx-auto flex w-full max-w-[1280px] flex-1 flex-col gap-8 px-4 py-8 sm:px-6 lg:flex-row lg:gap-10 lg:px-8 lg:py-10">
        {textOnly ? (
          <nav
            aria-label="文本初评流程"
            className="hidden w-48 shrink-0 lg:block"
          >
            <p className="mb-4 text-xs font-medium text-muted-foreground">
              D0 · 内部文本初评
            </p>
            <ol className="space-y-2">
              <li>
                <Link
                  href="/upload"
                  aria-current={stepKey === 'upload' ? 'step' : undefined}
                  className="block rounded-xl bg-primary-soft px-3 py-3 text-sm text-primary"
                >
                  01 · 添加简历文本
                </Link>
              </li>
              <li
                className="px-3 py-3 text-sm"
                aria-current={stepKey === 'review' ? 'step' : undefined}
              >
                02 · 六维文字初评
              </li>
            </ol>
          </nav>
        ) : (
          <JourneyStepperDesktop currentKey={stepKey} />
        )}

        <main className="min-w-0 flex-1">
          {textOnly ? (
            <p className="text-xs text-muted-foreground lg:hidden">
              D0 内部验证 · 步骤 {idx + 1}/2
            </p>
          ) : (
            <JourneyStepperMobile currentKey={stepKey} />
          )}

          <div className="mb-6 mt-5 flex flex-wrap items-start justify-between gap-3 lg:mt-0">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {String(idx + 1).padStart(2, '0')} /{' '}
                {String(total).padStart(2, '0')} · {eyebrow}
              </p>
              <h1 className="mt-2 text-2xl font-bold text-foreground sm:text-[28px]">
                {title}
              </h1>
              {description && (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              )}
            </div>
            {badge && (
              <span className="shrink-0 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                {badge}
              </span>
            )}
          </div>

          {children}
          <PrivacyControls textOnly={textOnly} />
        </main>

        {rightSlot ?? <TrustNote />}
      </div>
    </div>
  )
}
