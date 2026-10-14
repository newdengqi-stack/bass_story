import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

const NAV_LINKS = [
  { href: '#stages', label: '四个阶段' },
  { href: '#status', label: '证据状态' },
  { href: '#promise', label: '我们的承诺' },
]

export function SiteHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-30 px-4 pt-4 md:px-8 md:pt-6">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2.5 text-white" aria-label="证途 首页">
          <span className="flex size-10 items-center justify-center rounded-full bg-white font-serif text-lg font-semibold text-[#2a2140] shadow-lg shadow-black/10">
            证
          </span>
          <span className="font-serif text-lg font-semibold tracking-wide drop-shadow">证途</span>
        </Link>

        <nav
          aria-label="主导航"
          className="glass flex items-center gap-1 rounded-full p-1.5 pl-2 text-sm text-white shadow-lg shadow-black/5"
        >
          <ul className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="rounded-full px-3.5 py-1.5 transition-colors hover:bg-white/15"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <Link
            href="/login"
            className="rounded-full px-3.5 py-1.5 transition-colors hover:bg-white/15"
          >
            登录
          </Link>
          <Link
            href="/register"
            className="flex items-center gap-1 rounded-full bg-white px-4 py-1.5 font-medium text-[#2a2140] transition-transform hover:scale-[1.03]"
          >
            注册
            <ArrowUpRight className="size-3.5" aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  )
}
