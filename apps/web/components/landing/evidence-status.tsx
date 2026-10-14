import { CircleCheck, CircleDashed, CircleHelp, MessageSquareQuote } from 'lucide-react'
import { Reveal } from './reveal'
import { TiltCard } from './tilt-card'

const STATUSES = [
  {
    label: '已验证',
    meaning: '有可查看的材料（代码仓库、实验报告、演示视频）直接支撑这项能力。',
    icon: CircleCheck,
    color: '#86efac',
  },
  {
    label: '用户声明',
    meaning: '由你本人陈述的能力，目前还没有附上可核验的材料。',
    icon: MessageSquareQuote,
    color: '#93c5fd',
  },
  {
    label: '证据不足',
    meaning: '已有相关材料，但还不足以完整支撑结论，需要补充细节或成果。',
    icon: CircleHelp,
    color: '#fcd34d',
  },
  {
    label: '当前缺失',
    meaning: '目标岗位明确要求，但你目前没有相关经历或材料。',
    icon: CircleDashed,
    color: '#fda4af',
  },
]

export function EvidenceStatus() {
  return (
    <section id="status" aria-labelledby="status-title" className="px-4 py-28 md:px-8 md:py-36">
      <div className="mx-auto max-w-6xl text-white">
        <Reveal className="max-w-2xl">
          <p className="glass inline-block rounded-full px-4 py-1 text-xs">证据状态</p>
          <h2 id="status-title" className="mt-4 font-serif text-4xl font-semibold text-balance md:text-5xl">
            每项能力，只会处于四种状态之一
          </h2>
          <p className="mt-4 leading-relaxed text-white/85">
            我们不替你夸大，也不替你谦虚。状态只取决于证据本身，你随时可以补充材料改变它。
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STATUSES.map((status, i) => {
            const Icon = status.icon
            return (
              <Reveal key={status.label} delay={i * 120}>
                <TiltCard className="glass h-full rounded-3xl p-6 shadow-xl shadow-black/10">
                  <div className="flex items-center justify-between">
                    <span
                      className="flex size-11 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${status.color}33`, color: status.color }}
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="size-2.5 rounded-full" style={{ backgroundColor: status.color }} aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 font-serif text-2xl font-semibold">{status.label}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/85">{status.meaning}</p>
                </TiltCard>
              </Reveal>
            )
          })}
        </div>
      </div>
    </section>
  )
}
