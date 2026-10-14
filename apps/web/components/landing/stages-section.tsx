'use client'

import { useEffect, useRef, useState } from 'react'
import { Crosshair, FileCheck2, ListTodo, ScrollText } from 'lucide-react'
import { cn } from '@/lib/utils'
import { StageVisual } from './stage-visual'

const STAGES = [
  {
    title: '建目标岗位',
    description: '把嵌入式目标岗位的要求拆解为可核验的能力项，每一项都对应到具体技能，而不是一句模糊的「熟悉」。',
    icon: Crosshair,
  },
  {
    title: '项目验证',
    description: '将你的项目经历与能力项逐条对照，为每条结论标注所依据的代码、文档或演示。',
    icon: FileCheck2,
  },
  {
    title: '差距计划',
    description: '针对证据不足或缺失的能力，生成带排序理由的补齐任务，每项控制在 90 分钟以内。',
    icon: ListTodo,
  },
  {
    title: '专版简历',
    description: '基于已验证的证据生成岗位专版简历，每一条修改建议都由你逐条确认后才会生效。',
    icon: ScrollText,
  },
]

const STEP_ANGLE = 360 / STAGES.length

export function StagesSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const [active, setActive] = useState(0)

  // 滚动驱动 3D 转环 —— 向下滑动时环旋转，四阶段依次转正
  useEffect(() => {
    const section = sectionRef.current
    const ring = ringRef.current
    if (!section || !ring) return

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let current = 0
    let lastActive = -1

    const tick = () => {
      const rect = section.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const progress = total > 0 ? Math.min(Math.max(-rect.top / total, 0), 1) : 0
      const targetAngle = progress * STEP_ANGLE * (STAGES.length - 1)

      if (reduceMotion) {
        current = targetAngle
      } else {
        current += (targetAngle - current) * 0.1
      }

      ring.style.transform = `translateZ(calc(var(--ring-r) * -1)) rotateY(${-current}deg)`

      const index = Math.round(current / STEP_ANGLE)
      if (index !== lastActive) {
        lastActive = index
        setActive(index)
      }
      frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  // 点击列表：滚动到对应阶段
  const scrollTo = (i: number) => {
    const section = sectionRef.current
    if (!section) return
    const total = section.scrollHeight - window.innerHeight
    const top = section.offsetTop + (total * i) / (STAGES.length - 1)
    window.scrollTo({ top, behavior: 'smooth' })
  }

  return (
    <section ref={sectionRef} id="stages" aria-labelledby="stages-title" className="relative h-[400vh]">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden px-4 md:px-8">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-10 md:grid-cols-2 md:gap-14">
          {/* 左：标题 + 阶段列表 */}
          <div className="text-white">
            <p className="glass inline-block rounded-full px-4 py-1 text-xs">闭环流程</p>
            <h2 id="stages-title" className="mt-4 font-serif text-4xl font-semibold text-balance md:text-5xl">
              四个阶段，一条完整的准备闭环
            </h2>
            <ol className="mt-8 flex flex-col gap-1" role="listbox" aria-label="准备阶段">
              {STAGES.map((stage, i) => {
                const Icon = stage.icon
                const current = active === i
                return (
                  <li key={stage.title} role="option" aria-selected={current}>
                    <button
                      type="button"
                      onClick={() => scrollTo(i)}
                      className={cn(
                        'flex w-full items-center gap-4 rounded-2xl px-4 py-3 text-left transition-all duration-500',
                        current ? 'glass translate-x-2' : 'opacity-60 hover:opacity-90',
                      )}
                    >
                      <span className="font-serif text-2xl tabular-nums">{String(i + 1).padStart(2, '0')}</span>
                      <Icon className="size-5 shrink-0" aria-hidden="true" />
                      <span className="text-lg font-medium">{stage.title}</span>
                    </button>
                  </li>
                )
              })}
            </ol>
          </div>

          {/* 右：3D 转环 —— 四张卡片围成一圈，滚动时旋转 */}
          <div
            className="relative mx-auto h-[400px] w-[240px] [--ring-r:180px] [perspective:1400px] sm:w-[280px] sm:[--ring-r:220px] md:h-[460px]"
            aria-hidden="true"
          >
            <div ref={ringRef} className="absolute inset-0 [transform-style:preserve-3d]">
              {STAGES.map((stage, i) => {
                const Icon = stage.icon
                return (
                  <article
                    key={stage.title}
                    className="glass absolute inset-0 flex flex-col overflow-hidden rounded-3xl text-white shadow-2xl shadow-black/20 [backface-visibility:hidden]"
                    style={{ transform: `rotateY(${i * STEP_ANGLE}deg) translateZ(var(--ring-r))` }}
                  >
                    {/* 自绘视觉（替代原照片） */}
                    <div className="flex h-44 shrink-0 items-center justify-center px-6 md:h-52">
                      <StageVisual index={i} />
                    </div>
                    <div className="flex flex-1 flex-col gap-3 p-5">
                      <div className="flex items-center gap-2">
                        <Icon className="size-5" />
                        <h3 className="text-xl font-semibold">{stage.title}</h3>
                      </div>
                      <p className="text-sm leading-relaxed text-white/85">{stage.description}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </div>

        <p className="sr-only" aria-live="polite">
          {`第 ${active + 1} 阶段：${STAGES[active].title}。${STAGES[active].description}`}
        </p>
      </div>
    </section>
  )
}
