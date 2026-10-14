'use client'

import Image from 'next/image'
import { useEffect, useRef } from 'react'

type InteractiveBackgroundProps = {
  mode?: 'fixed' | 'band'
  src?: string
  /** 图片焦点，Tailwind object-position 值 */
  focus?: string
}

/**
 * 全屏照片背景：
 * - 主动：缓慢的镜头漂移（Ken Burns）+ 漂移的环境光 + 胶片颗粒
 * - 被动：鼠标视差、滚动时推近并压暗
 */
export function InteractiveBackground({
  mode = 'fixed',
  src = '/images/citic-tower.png',
  focus = 'object-[50%_35%]',
}: InteractiveBackgroundProps) {
  const layerRef = useRef<HTMLDivElement>(null)
  const shadeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const layer = layerRef.current
    const shade = shadeRef.current
    if (!layer || !shade) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0, p: 0 }
    const start = performance.now()
    let frame = 0

    const onPointerMove = (event: PointerEvent) => {
      target.x = (event.clientX / window.innerWidth) * 2 - 1
      target.y = (event.clientY / window.innerHeight) * 2 - 1
    }

    const tick = (now: number) => {
      const t = (now - start) / 1000
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0

      current.x += (target.x - current.x) * 0.06
      current.y += (target.y - current.y) * 0.06
      current.p += (progress - current.p) * 0.08

      const driftX = Math.sin(t * 0.07) * 18
      const driftY = Math.cos(t * 0.05) * 10
      const breathe = Math.sin(t * 0.09) * 0.025

      const scale = 1.14 + breathe + current.p * 0.18
      const rotate = current.p * -3
      layer.style.transform = `translate3d(${current.x * -26 + driftX}px, ${current.y * -18 + driftY}px, 0) rotateX(${current.y * 2}deg) rotateY(${current.x * -2}deg) rotate(${rotate}deg) scale(${scale})`
      shade.style.opacity = '0'

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

  const wrapper =
    mode === 'fixed'
      ? 'fixed top-0 left-0 h-screen w-screen -z-10 overflow-hidden bg-[#2a2140] [perspective:1200px]'
      : 'absolute inset-0 overflow-hidden bg-[#2a2140] [perspective:1200px]'

  return (
    <div aria-hidden="true" className={wrapper}>
      <div className="scene-in absolute inset-0">
        <div ref={layerRef} className="absolute inset-0 scale-110 will-change-transform">
          <Image src={src || "/placeholder.svg"} alt="" fill priority sizes="100vw" className={`object-cover ${focus}`} />
        </div>
      </div>
      <div className="ambient-light" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
      <div ref={shadeRef} className="absolute inset-0 bg-[#1b1530] opacity-10" />
      <div className="film-grain" />
    </div>
  )
}
