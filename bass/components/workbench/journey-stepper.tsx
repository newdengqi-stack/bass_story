import Link from '@/lib/navigation'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { JOURNEY_STEPS } from '@/lib/journey'

export function JourneyStepperDesktop({ currentKey }: { currentKey: string }) {
  const currentIdx = JOURNEY_STEPS.findIndex((s) => s.key === currentKey)

  return (
    <nav aria-label="诊断流程进度" className="hidden w-48 shrink-0 lg:block">
      <p className="mb-4 flex items-center justify-between text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Your Journey
        <span className="rounded-full bg-primary-soft px-2 py-0.5 text-[11px] font-semibold text-primary-soft-foreground">V0</span>
      </p>
      <ol className="flex flex-col gap-1">
        {JOURNEY_STEPS.map((step, idx) => {
          const state = idx < currentIdx ? 'done' : idx === currentIdx ? 'current' : 'upcoming'
          return (
            <li key={step.key}>
              {state === 'upcoming' ? (
                <div className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-muted-foreground/70">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-full border border-border text-xs">
                    {idx + 1}
                  </span>
                  <span className="text-sm">{step.label}</span>
                </div>
              ) : (
                <Link
                  href={step.href}
                  aria-current={state === 'current' ? 'step' : undefined}
                  className={cn(
                    'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors',
                    state === 'current'
                      ? 'bg-primary-soft font-semibold text-primary-soft-foreground'
                      : 'text-foreground hover:bg-muted',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-6 shrink-0 items-center justify-center rounded-full text-xs',
                      state === 'done' ? 'bg-positive text-positive-foreground' : 'border border-primary bg-primary text-primary-foreground',
                    )}
                  >
                    {state === 'done' ? <Check className="size-3.5" /> : idx + 1}
                  </span>
                  {step.label}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

export function JourneyStepperMobile({ currentKey }: { currentKey: string }) {
  const currentIdx = JOURNEY_STEPS.findIndex((s) => s.key === currentKey)
  const total = JOURNEY_STEPS.length

  return (
    <div className="lg:hidden">
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          步骤 {currentIdx + 1}/{total}
        </span>
        <span className="font-medium text-foreground">{JOURNEY_STEPS[currentIdx]?.label}</span>
      </div>
      <div className="mt-2 flex gap-1.5">
        {JOURNEY_STEPS.map((step, idx) => (
          <span
            key={step.key}
            className={cn(
              'h-1.5 flex-1 rounded-full',
              idx <= currentIdx ? 'bg-primary' : 'bg-border',
            )}
          />
        ))}
      </div>
    </div>
  )
}
