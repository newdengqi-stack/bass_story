'use client'

import { useEffect, useRef } from 'react'

const RIBBON_COLORS = ['#ffd6a5', '#ffadc6', '#c9b8ff', '#a8dcff', '#fff3c4']
const POINTS = 42

type Point = { x: number; y: number }
type Ribbon = {
  color: string
  spring: number
  friction: number
  width: number
  phase: number
  head: Point & { vx: number; vy: number }
  points: Point[]
}

export function RibbonCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduceMotion) return

    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    let lastMove = 0
    let alpha = 0
    let frame = 0
    let time = 0

    const ribbons: Ribbon[] = RIBBON_COLORS.map((color, i) => ({
      color,
      spring: 0.12 - i * 0.014,
      friction: 0.72 + i * 0.03,
      width: 7 - i * 0.7,
      phase: i * 1.3,
      head: { x: mouse.x, y: mouse.y, vx: 0, vy: 0 },
      points: Array.from({ length: POINTS }, () => ({ x: mouse.x, y: mouse.y })),
    }))

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = window.innerWidth * dpr
      canvas.height = window.innerHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return
      mouse.x = event.clientX
      mouse.y = event.clientY
      lastMove = performance.now()
    }

    const draw = () => {
      time += 0.05
      const idle = performance.now() - lastMove > 900
      alpha += ((idle ? 0 : 1) - alpha) * 0.06

      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      for (const ribbon of ribbons) {
        const { head, points } = ribbon
        head.vx = (head.vx + (mouse.x - head.x) * ribbon.spring) * ribbon.friction
        head.vy = (head.vy + (mouse.y - head.y) * ribbon.spring) * ribbon.friction
        head.x += head.vx
        head.y += head.vy

        points[0].x = head.x
        points[0].y = head.y
        for (let j = 1; j < points.length; j++) {
          points[j].x += (points[j - 1].x - points[j].x) * 0.45
          points[j].y += (points[j - 1].y - points[j].y) * 0.45
        }

        if (alpha < 0.01) continue

        for (let j = 1; j < points.length; j++) {
          const prev = points[j - 1]
          const point = points[j]
          const dx = point.x - prev.x
          const dy = point.y - prev.y
          const length = Math.hypot(dx, dy) || 1
          const t = j / points.length
          const wave = Math.sin(time + j * 0.35 + ribbon.phase) * 10 * t
          const nx = (-dy / length) * wave
          const ny = (dx / length) * wave

          ctx.beginPath()
          ctx.moveTo(prev.x + nx, prev.y + ny)
          ctx.lineTo(point.x + nx, point.y + ny)
          ctx.strokeStyle = ribbon.color
          ctx.globalAlpha = alpha * (1 - t) * 0.9
          ctx.lineWidth = ribbon.width * (1 - t * 0.85)
          ctx.stroke()
        }
      }
      ctx.globalAlpha = 1
      frame = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    frame = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-40 h-screen w-screen"
    />
  )
}
