import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { KineticTitle } from '@/components/ui/kinetic-title'

const PHASES = ['未开始', '目标岗位', '资产档案', '项目验证', '冲刺计划', '简历就绪', '模拟面试', '真实投递']
const CURRENT = 3

// 页面主视觉 —— 压在照片上的白字，与落地页同一套氛围
export function TargetCard() {
  return (
    <section aria-labelledby="target-title" data-tour="target">
      <KineticTitle
        id="target-title"
        text="嵌入式软件实习生"
        index="NOW"
        eyebrow="Currently targeting"
        className="md:text-[5.75rem]"
      />

      <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-[15px] text-[var(--ws-ink-2)]">
        <span>华勤技术</span>
        <span className="text-[var(--ws-ink)]/35" aria-hidden="true">
          ·
        </span>
        <span>上海</span>
        <span className="text-[var(--ws-ink)]/35" aria-hidden="true">
          ·
        </span>
        <span>投递截止 10月20日</span>
        <span className="ws-pill px-2.5 py-0.5 text-[12px] text-[var(--ws-sand)]">高优先级</span>
      </p>

      {/* 准备进度 —— 位寄存器：8 个阶段 = 8 位 */}
      <div
        className="mt-9 max-w-xl"
        aria-label={`准备进度：已完成 ${CURRENT} / ${PHASES.length} 个阶段`}
      >
        <div className="flex items-center gap-[5px]">
          {PHASES.map((phase, i) => (
            <span
              key={phase}
              title={phase}
              className={cn(
                'h-3.5 w-3.5 rounded-[2px] border transition-colors',
                i === CURRENT
                  ? 'border-[var(--ws-ink)] bg-[var(--ws-ink)]'
                  : i < CURRENT
                    ? 'border-[var(--ws-ink)]/55 bg-[var(--ws-ink)]/45'
                    : 'border-[var(--ws-ink)]/28 bg-transparent',
              )}
            />
          ))}
          <span className="ml-2 font-mono text-[12px] tabular-nums tracking-wider text-[var(--ws-muted)]">
            0b{PHASES.map((_, i) => (i < CURRENT ? '1' : '0')).join('')}
          </span>
        </div>
        <div className="mt-3.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-[15px] text-[var(--ws-ink)]">
            <span className="font-medium">{PHASES[CURRENT]}</span>
            <span className="ml-2 text-[var(--ws-muted)]">
              已完成 {CURRENT} / {PHASES.length} 个阶段
            </span>
          </p>
          <p className="text-[13px] text-[var(--ws-muted)]">下一步：生成冲刺计划</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="/gap"
          className="group inline-flex items-center gap-1.5 rounded-full bg-[var(--ws-sand-fill)] px-5 py-2.5 text-[15px] font-medium text-[#2a2140] transition-transform hover:scale-[1.02]"
        >
          生成冲刺计划
          <ArrowUpRight
            className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            aria-hidden="true"
          />
        </Link>
        <Link href="/career" className="ws-pill inline-flex items-center px-5 py-2.5 text-[15px] text-[var(--ws-ink)]">
          查看岗位要求
        </Link>
      </div>
    </section>
  )
}
