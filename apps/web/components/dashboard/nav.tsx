'use client'

import Link from 'next/link'
import { useLayoutEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/resume', label: '简历分析' },
  { href: '/career', label: '意向职业' },
  { href: '/projects', label: '项目深挖' },
  { href: '/gap', label: '职业差距分析' },
  { href: '/interrogate', label: '拷打模式' },
]

type Indicator = { left: number; width: number }

/** 悬浮玻璃导航 —— 白色指示器在条目间滑动：悬停时跟随，离开时回到当前页 */
export function DashboardNav({ current }: { current?: string }) {
  const listRef = useRef<HTMLUListElement>(null)
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const activeIndex = NAV.findIndex((item) => item.label === current)
  const [focusIndex, setFocusIndex] = useState(activeIndex)
  const [indicator, setIndicator] = useState<Indicator | null>(null)

  useLayoutEffect(() => {
    const measure = () => {
      const list = listRef.current
      const el = focusIndex >= 0 ? itemRefs.current[focusIndex] : null
      if (!list || !el) return setIndicator(null)
      const a = el.getBoundingClientRect()
      const b = list.getBoundingClientRect()
      setIndicator({ left: a.left - b.left, width: a.width })
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [focusIndex])

  const reset = () => setFocusIndex(activeIndex)

  return (
    <header className="sticky top-0 z-30 px-3 pt-4 md:px-6">
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4">
        <Link href="/dashboard" className="group flex shrink-0 items-center gap-2 text-[var(--ws-ink)]" aria-label="证途工作台">
          <span className="flex size-9 items-center justify-center rounded-full bg-white font-serif text-[15px] font-semibold text-[#2a2140] shadow-lg shadow-black/20">
            证
          </span>
          <span className="hidden font-display-latin text-[21px] italic lg:inline">Zhengtu</span>
        </Link>

        <nav aria-label="主导航" className="nav-glass mx-auto rounded-full p-1">
          <ul ref={listRef} className="relative flex items-center" onMouseLeave={reset}>
            <span
              aria-hidden="true"
              className="absolute inset-y-0 rounded-full bg-white shadow-[0_4px_18px_-4px_rgb(0_0_0/0.35)] transition-[left,width,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
              style={{ left: indicator?.left ?? 0, width: indicator?.width ?? 0, opacity: indicator ? 1 : 0 }}
            />
            {NAV.map((item, i) => {
              const active = i === activeIndex
              const lit = i === focusIndex
              return (
                <li key={item.label} className="relative">
                  <Link
                    ref={(el) => {
                      itemRefs.current[i] = el
                    }}
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    onMouseEnter={() => setFocusIndex(i)}
                    onFocus={() => setFocusIndex(i)}
                    onBlur={reset}
                    className={cn(
                      'relative block whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] transition-colors duration-300 md:px-4',
                      lit ? 'text-[#2a2140]' : 'text-white/80 hover:text-white',
                      active && 'font-medium',
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/target/new"
            className="nav-glass hidden rounded-full px-4 py-2 text-[13px] text-white transition-colors hover:bg-white hover:text-[#2a2140] sm:block"
          >
            切换目标
          </Link>
          <Link
            href="/settings"
            aria-label="账户设置"
            className="nav-glass flex size-9 items-center justify-center rounded-full text-[12px] font-medium text-white"
          >
            我
          </Link>
        </div>
      </div>
    </header>
  )
}
