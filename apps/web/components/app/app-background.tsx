'use client'

import { useEffect, useRef } from 'react'

type Glow = { a: string; b: string; c: string }

/**
 * 每个模块一种光域色相 —— 同一套暗底语言，不同的「光」。
 * 不用城市照片：底色足够深，文字对比度不再受天空亮度摆布。
 */
const VARIANTS: Record<string, Glow> = {
  default: { a: 'rgb(255 214 170 / 0.32)', b: 'rgb(180 200 255 / 0.26)', c: 'rgb(255 190 210 / 0.18)' },
  我的简历: { a: 'rgb(255 222 190 / 0.3)', b: 'rgb(170 210 255 / 0.24)', c: 'rgb(200 255 224 / 0.16)' },
  意向职业: { a: 'rgb(255 206 150 / 0.34)', b: 'rgb(200 180 255 / 0.26)', c: 'rgb(255 221 170 / 0.16)' },
  项目深挖: { a: 'rgb(170 210 255 / 0.3)', b: 'rgb(190 180 255 / 0.24)', c: 'rgb(150 240 220 / 0.16)' },
  职业差距分析: { a: 'rgb(255 190 170 / 0.3)', b: 'rgb(200 180 255 / 0.22)', c: 'rgb(255 221 170 / 0.16)' },
  拷打模式: { a: 'rgb(255 150 130 / 0.32)', b: 'rgb(220 110 120 / 0.22)', c: 'rgb(255 190 120 / 0.16)' },
  设置: { a: 'rgb(230 210 255 / 0.26)', b: 'rgb(180 200 255 / 0.22)', c: 'rgb(255 221 200 / 0.16)' },
}

export function AppBackground({ variant = 'default' }: { variant?: string }) {
  const auroraRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const aurora = auroraRef.current
    if (!aurora) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    const start = performance.now()
    let frame = 0

    const onPointerMove = (event: PointerEvent) => {
      target.x = (event.clientX / window.innerWidth) * 2 - 1
      target.y = (event.clientY / window.innerHeight) * 2 - 1
    }

    const tick = (now: number) => {
      const t = (now - start) / 1000
      current.x += (target.x - current.x) * 0.05
      current.y += (target.y - current.y) * 0.05

      const driftX = Math.sin(t * 0.06) * 22
      const driftY = Math.cos(t * 0.05) * 14
      const breathe = 1 + Math.sin(t * 0.08) * 0.04

      aurora.style.transform = `translate3d(${current.x * -32 + driftX}px, ${current.y * -20 + driftY}px, 0) scale(${breathe})`

      frame = requestAnimationFrame(tick)
    }

    if (!reduceMotion) {
      window.addEventListener('pointermove', onPointerMove, { passive: true })
      frame = requestAnimationFrame(tick)
    }

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      cancelAnimationFrame(frame)
    }
  }, [])

  const v = VARIANTS[variant] ?? VARIANTS.default

  return (
    <div aria-hidden="true" className="fixed top-0 left-0 h-screen w-screen -z-10 overflow-hidden bg-[#dce8f5]">
      <div
        className="scene-in absolute inset-[-4%] bg-cover bg-center"
        style={{ backgroundImage: 'url(/images/aurora-dreamy-bg.png)', filter: 'saturate(1.1)' }}
      />
      {/* 顶部/底部轻量渐暗，只为导航与文案留出可读区，不盖住极光本身 */}
      <div className="absolute inset-x-0 top-0 h-56 bg-gradient-to-b from-black/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-72 bg-gradient-to-t from-black/40 to-transparent" />
      {/* 模块色相：极淡的一笔点缀，不覆盖画面细节 */}
      <div
        ref={auroraRef}
        className="absolute inset-[-25%] mix-blend-screen will-change-transform opacity-30"
        style={{
          background: `radial-gradient(30% 26% at 18% 22%, ${v.a}, transparent 72%), radial-gradient(26% 22% at 82% 70%, ${v.b}, transparent 72%)`,
        }}
      />
      <div className="film-grain" />
    </div>
  )
}
