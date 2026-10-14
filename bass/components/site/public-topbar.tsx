'use client'

import Link from '@/lib/navigation'
import { useRef, useState } from 'react'
import { Menu, Sparkles, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { href: '/#product', label: '产品介绍' },
  { href: '/#how-it-works', label: '简历初评' },
  { href: '/#journey', label: '岗位选择' },
  { href: '/report/sample', label: '能力诊断' },
]

export function PublicTopbar() {
  const [open, setOpen] = useState(false)
  const menuButton=useRef<HTMLButtonElement>(null)

  return (
    <header onKeyDown={e=>{if(e.key==='Escape'){setOpen(false);menuButton.current?.focus()}}} className="sticky top-0 z-50 border-b border-border/80 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <span className="text-lg">
            知程 <span className="text-primary">AI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="size-1.5 rounded-full bg-positive" aria-hidden />
            内部开发 · 非正式服务
          </span>
          <Button render={<Link href="/upload" />} nativeButton={false}>
            开始体验
          </Button>
        </div>

        <button
          ref={menuButton}
          type="button"
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
          className="flex size-10 items-center justify-center rounded-lg border border-border text-foreground md:hidden"
          aria-label={open ? '关闭菜单' : '打开菜单'}
          aria-expanded={open}
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {open && (
        <div id="mobile-menu" className="border-t border-border bg-background px-4 pb-6 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-3">
            <span className="text-xs text-muted-foreground">内部开发 · 非正式服务</span>
            <Button
              render={<Link href="/upload" onClick={() => setOpen(false)} />}
              nativeButton={false}
              className="w-full"
            >
              开始体验
            </Button>
          </div>
        </div>
      )}
    </header>
  )
}
