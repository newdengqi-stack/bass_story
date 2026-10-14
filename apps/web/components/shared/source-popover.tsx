'use client'

import { useId, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SOURCE_KIND_LABEL, sourceSummary, type EvidenceSource } from '@zhitu/types'

/**
 * 来源展开浮层。
 * 开启方式有三种：鼠标悬停、点击、键盘聚焦后回车 —— 触屏设备没有悬停，所以点击必须可用。
 * 来源正文始终是真实 DOM 文本，不依赖悬停才存在，读屏与键盘同样能拿到。
 * Esc 关闭并把焦点交还给触发按钮。
 */
export function SourcePopover({
  source,
  label = '来源',
  className,
}: {
  source: EvidenceSource | null
  label?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const panelId = useId()
  const buttonRef = useRef<HTMLButtonElement>(null)

  if (!source) {
    return (
      <span className={cn('inline-flex items-center gap-1.5 text-[12px] text-[var(--ws-muted)]', className)}>
        <span className="size-1.5 rounded-full bg-[var(--ws-miss)]" aria-hidden="true" />
        无可追溯来源
      </span>
    )
  }

  return (
    <span
      className={cn('relative inline-flex', className)}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && open) {
          e.stopPropagation()
          setOpen(false)
          buttonRef.current?.focus()
        }
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-full border border-[var(--ws-ghost-line)] px-2.5 py-1 text-[12px] text-[var(--ws-ink-2)] transition-colors hover:border-[var(--ws-ghost-line-strong)] hover:text-[var(--ws-ink)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ws-sand)]"
      >
        <span className="text-[var(--ws-muted)]">{label} ·</span>
        {sourceSummary(source)}
        <ChevronDown
          className={cn('size-3 transition-transform', open && 'rotate-180')}
          aria-hidden="true"
        />
      </button>

      {open && (
        // 长文本块用幽灵描边盒，不用实底卡片；照片仍透过来
        <span
          id={panelId}
          role="note"
          className="absolute left-0 top-[calc(100%+0.5rem)] z-40 block w-[min(28rem,calc(100vw-2.5rem))] rounded-xl border border-[var(--ws-ghost-line)] bg-[var(--ws-panel)] p-4 backdrop-blur-md"
        >
          <span className="block text-[11px] uppercase tracking-[0.16em] text-[var(--ws-muted)]">
            {SOURCE_KIND_LABEL[source.kind]}
          </span>

          {source.kind === 'round' ? (
            <>
              <span className="mt-2 block text-[13px] text-[var(--ws-ink-2)]">
                <span className="text-[var(--ws-muted)]">第 {source.round} 轮提问 · </span>
                {source.question}
              </span>
              <span className="mt-3 block border-l-2 border-[var(--ws-line-2)] pl-3 text-[13px] leading-relaxed text-[var(--ws-ink)]">
                {source.excerpt}
              </span>
            </>
          ) : (
            <>
              <span className="mt-2 block text-[13px] text-[var(--ws-ink-2)]">
                {source.kind === 'material' ? source.material : source.label}
              </span>
              <span className="mt-3 block border-l-2 border-[var(--ws-line-2)] pl-3 text-[13px] leading-relaxed text-[var(--ws-ink)]">
                {source.excerpt}
              </span>
            </>
          )}
        </span>
      )}
    </span>
  )
}
