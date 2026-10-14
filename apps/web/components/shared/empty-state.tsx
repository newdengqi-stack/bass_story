import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/**
 * 空态块。
 * 结构固定为三段：空的到底是什么 → 为什么它重要 → 一个动作。
 * 只允许一个主动作，避免空态变成一排按钮墙。
 */
export function EmptyState({
  what,
  why,
  action,
  children,
  className,
}: {
  /** 空的是什么 */
  what: string
  /** 为什么重要 */
  why: string
  /** 一个动作（链接形式） */
  action?: { label: string; href: string }
  /** 需要按钮而非链接时，用 children 作为动作槽 */
  children?: ReactNode
  className?: string
}) {
  const hasAction = Boolean(action) || Boolean(children)

  return (
    <div
      className={cn(
        'ws-ghost-box flex flex-col items-start gap-4 px-6 py-8 sm:px-8 sm:py-10',
        className,
      )}
    >
      <div className="min-w-0">
        <p className="text-[17px] font-medium text-[var(--ws-ink)]">{what}</p>
        <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-[var(--ws-ink-2)]">{why}</p>
      </div>

      {hasAction && (
        <div className="min-w-0">
          {action ? (
            <Link
              href={action.href}
              className="group inline-flex items-center gap-1.5 rounded-full bg-[var(--ws-sand-fill)] px-5 py-2.5 text-[14px] font-medium text-[var(--ws-on-sand)] transition-transform hover:scale-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-ink)]"
            >
              {action.label}
              <ArrowUpRight
                className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                aria-hidden="true"
              />
            </Link>
          ) : (
            children
          )}
        </div>
      )}
    </div>
  )
}
