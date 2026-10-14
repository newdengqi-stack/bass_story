import Link from '@/lib/navigation'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

const STEPS = ['上传并确认简历', '即时六维初评', '岗位与技术问答', '复核通过后开放报告']

export function HomeJourney() {
  return (
    <section id="journey" className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-6 lg:px-8">
      <div className="grid gap-10 rounded-3xl bg-foreground px-6 py-10 text-background sm:px-10 lg:grid-cols-2 lg:gap-16 lg:p-14">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-background/60">A CLEAR JOURNEY</p>
          <h2 className="mt-3 text-[28px] font-bold leading-tight sm:text-[34px]">
            从简历，到清晰的下一步。
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-background/70">
            简历初评即时展示；能力报告需要人工复核。我们把这两件事清楚地区分开。
          </p>
          <Button
            size="lg"
            variant="secondary"
            render={<Link href="/upload" />}
            nativeButton={false}
            className="mt-6"
          >
            体验完整流程
            <ArrowRight data-icon="inline-end" />
          </Button>
        </div>

        <ol className="flex flex-col gap-3">
          {STEPS.map((step, i) => (
            <li
              key={step}
              className="flex items-center gap-4 rounded-xl border border-background/15 bg-background/5 px-5 py-4"
            >
              <span className="text-sm font-semibold text-background/50">{String(i + 1).padStart(2, '0')}</span>
              <span className="text-sm font-medium">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
