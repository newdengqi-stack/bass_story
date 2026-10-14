import { useFlow } from '@/lib/flow-context'
import Link from '@/lib/navigation'
import { Sparkles } from 'lucide-react'

export function WorkbenchTopbar() {
  const { initialReview } = useFlow()
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/75">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-foreground"
        >
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="text-lg">
            知程 <span className="text-primary">AI</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground sm:text-xs">
            <span className="size-1.5 rounded-full bg-positive" aria-hidden />
            {initialReview?.mode === 'model'
              ? 'AI 初评 · 内部验证'
              : initialReview
                ? 'MOCK · 后端演示'
                : '内部开发 · 文本初评'}
          </span>
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            退出体验
          </Link>
        </div>
      </div>
    </header>
  )
}
