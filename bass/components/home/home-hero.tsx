import Link from '@/lib/navigation'
import { ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ReportPreviewMock } from '@/components/home/report-preview-mock'

export function HomeHero() {
  return (
    <section id="product" className="relative overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px] opacity-80"
        style={{
          background:
            'radial-gradient(60% 55% at 18% 0%, color-mix(in oklab, var(--primary) 16%, transparent), transparent 70%)',
        }}
        aria-hidden
      />
      <div className="mx-auto grid max-w-[1280px] gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-8 lg:py-24 lg:px-8">
        <div className="order-2 lg:order-1 lg:col-span-6">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary-soft bg-primary-soft px-3 py-1 text-xs font-medium text-primary-soft-foreground">
            <Sparkles className="size-3.5" />
            AI CAREER INTELLIGENCE · V0 PROTOTYPE
          </span>

          <h1 className="mt-5 text-[36px] font-bold leading-[1.15] tracking-tight text-foreground sm:text-5xl lg:text-[56px]">
            看清真实能力，
            <br />
            <span className="text-primary">找到更值得走的下一步。</span>
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            从你的简历出发，结合技术追问和目标岗位的具体要求，分清
            <span className="font-medium text-foreground">哪些优势已有证据、哪些能力还需验证</span>
            ，以及接下来真正值得做什么。
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              render={<Link href="/upload" />}
              nativeButton={false}
              className="w-full sm:w-auto"
            >
              开始我的简历初评
              <ArrowRight data-icon="inline-end" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/report/sample" />}
              nativeButton={false}
              className="w-full sm:w-auto"
            >
              查看报告结构示例
            </Button>
          </div>

          <p className="mt-4 text-xs text-muted-foreground">
            无需手机号 · 先看文字初评 · 技术结论人工审核后发布
          </p>

          <dl className="mt-10 grid grid-cols-3 gap-4 border-t border-border pt-6 text-sm">
            <div>
              <dt className="font-semibold text-foreground">01 真实事实</dt>
            </div>
            <div>
              <dt className="font-semibold text-foreground">02 证据可追溯</dt>
            </div>
            <div>
              <dt className="font-semibold text-foreground">03 不虚构录用概率</dt>
            </div>
          </dl>
        </div>

        <div className="order-1 lg:order-2 lg:col-span-6">
          <ReportPreviewMock />
        </div>
      </div>
    </section>
  )
}
