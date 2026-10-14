import Link from '@/lib/navigation'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HomeFinalCta() {
  return (
    <section className="mx-auto max-w-[1280px] px-4 pb-20 sm:px-6 lg:px-8">
      <div className="flex flex-col items-start gap-6 rounded-3xl border border-primary-soft bg-primary-soft p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
        <div>
          <h2 className="text-xl font-bold text-foreground sm:text-2xl">准备好看清自己的真实能力了吗？</h2>
          <p className="mt-2 text-sm text-muted-foreground">先看简历初评，技术结论留给审核之后再给你。</p>
        </div>
        <Button
          size="lg"
          render={<Link href="/upload" />}
          nativeButton={false}
          className="w-full sm:w-auto"
        >
          开始我的简历初评
          <ArrowRight data-icon="inline-end" />
        </Button>
      </div>
    </section>
  )
}
