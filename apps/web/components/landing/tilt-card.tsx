'use client'

import { useRef, type PointerEvent, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function TiltCard({
  children,
  className,
  intensity = 10,
}: {
  children: ReactNode
  className?: string
  intensity?: number
}) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    const node = ref.current
    if (!node || event.pointerType !== 'mouse') return
    const rect = node.getBoundingClientRect()
    const x = (event.clientX - rect.left) / rect.width
    const y = (event.clientY - rect.top) / rect.height
    node.style.transform = `perspective(900px) rotateX(${(0.5 - y) * intensity}deg) rotateY(${(x - 0.5) * intensity}deg) translateZ(0)`
    node.style.setProperty('--glare-x', `${x * 100}%`)
    node.style.setProperty('--glare-y', `${y * 100}%`)
    node.style.setProperty('--glare-o', '1')
  }

  const handleLeave = () => {
    const node = ref.current
    if (!node) return
    node.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg)'
    node.style.setProperty('--glare-o', '0')
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      onPointerLeave={handleLeave}
      className={cn(
        'relative transition-transform duration-300 ease-out will-change-transform [transform-style:preserve-3d]',
        className,
      )}
    >
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: 'var(--glare-o, 0)',
          background:
            'radial-gradient(circle at var(--glare-x, 50%) var(--glare-y, 50%), rgb(255 255 255 / 0.35), transparent 55%)',
        }}
      />
    </div>
  )
}
