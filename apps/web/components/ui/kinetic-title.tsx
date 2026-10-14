'use client'

import { useEffect, useRef, type CSSProperties } from 'react'
import { cn } from '@/lib/utils'

type KineticTitleProps = {
  text: string
  id?: string
  className?: string
  /** 英文斜体副标，如 "Chapter II — Résumé" */
  eyebrow?: string
  /** 编号，如 "02" */
  index?: string
  /** 起始延迟（秒） */
  delay?: number
  as?: 'h1' | 'h2'
  /** 覆盖 eyebrow 行的间距/颜色，用于深色照片背景 */
  eyebrowClassName?: string
}

/**
 * 动态标题：
 * 1. 进场 —— 每个字从下方翻起、去模糊，逐字错峰
 * 2. 常驻 —— 每个字以不同相位轻微浮动（主动，不依赖输入）
 * 3. 指针 —— 光标靠近时，附近的字被「托起」并染上沙金色
 */
export function KineticTitle({
  text,
  id,
  className,
  eyebrow,
  eyebrowClassName,
  index,
  delay = 0,
  as: Tag = 'h1',
}: KineticTitleProps) {
  const rootRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    const glyphs = Array.from(root.querySelectorAll<HTMLSpanElement>('[data-glyph]'))
    let frame = 0
    let pointer = { x: -9999, y: -9999 }

    const update = () => {
      frame = 0
      for (const g of glyphs) {
        const r = g.getBoundingClientRect()
        const dx = pointer.x - (r.left + r.width / 2)
        const dy = pointer.y - (r.top + r.height / 2)
        const dist = Math.hypot(dx, dy)
        const force = Math.max(0, 1 - dist / 220)
        const eased = force * force * (3 - 2 * force)
        g.style.setProperty('--lift', `${(-eased * 0.22).toFixed(3)}em`)
        g.style.setProperty('--tilt', `${((dx / 220) * eased * -10).toFixed(2)}deg`)
        g.style.setProperty('--heat', eased.toFixed(3))
      }
    }

    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY }
      if (!frame) frame = requestAnimationFrame(update)
    }
    const onLeave = () => {
      pointer = { x: -9999, y: -9999 }
      if (!frame) frame = requestAnimationFrame(update)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      cancelAnimationFrame(frame)
    }
  }, [])

  const chars = Array.from(text)

  return (
    <div className="kinetic">
      {(eyebrow || index) && (
        <p className={cn('kinetic-eyebrow', eyebrowClassName)} style={{ animationDelay: `${delay}s` }}>
          {index && <span className="font-mono text-[11px] tracking-[0.2em] text-[var(--ws-sand)]">{index}</span>}
          {index && eyebrow && <span className="kinetic-eyebrow-rule" aria-hidden="true" />}
          {eyebrow && (
            <span className="font-display-latin text-[19px] italic text-[var(--eyebrow-color,var(--ws-ink-2))]">
              {eyebrow}
            </span>
          )}
        </p>
      )}
      <Tag
        ref={rootRef}
        id={id}
        aria-label={text}
        className={cn(
          'kinetic-title font-display text-balance text-[3rem] leading-[1.04] tracking-[-0.045em] text-[var(--ws-ink)] md:text-[5rem]',
          className,
        )}
      >
        {chars.map((ch, i) =>
          ch === ' ' ? (
            <span key={i} aria-hidden="true">
              {' '}
            </span>
          ) : (
            <span
              key={i}
              aria-hidden="true"
              className="kinetic-char"
              style={{ '--i': i, '--d': `${delay + 0.12 + i * 0.055}s` } as CSSProperties}
            >
              <span data-glyph className="kinetic-glyph">
                {ch}
              </span>
            </span>
          ),
        )}
      </Tag>
    </div>
  )
}
