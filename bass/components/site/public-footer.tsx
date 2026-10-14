import Link from '@/lib/navigation'

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>知程 AI · 内部文本初评验证。分析模式以结果页标识为准，不提供正式技术认证。</p>
        <div className="flex gap-5">
          <Link href="/report/sample" className="hover:text-foreground">
            报告结构示例
          </Link>
          <Link href="/states" className="hover:text-foreground">
            全局状态说明
          </Link>
        </div>
      </div>
    </footer>
  )
}
