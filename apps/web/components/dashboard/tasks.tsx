import { ArrowUpRight } from 'lucide-react'

const TASKS = [
  {
    title: '补充 CAN 通信的调试日志',
    skill: 'CAN 总线',
    minutes: 30,
    done: '整理 3 条波形或日志截图，并说明每一条验证了什么',
    source: '差距报告 · 待补证据',
  },
  {
    title: '回答追问：中断优先级为何这样设',
    skill: 'RTOS',
    minutes: 45,
    done: '写清优先级分配的依据，以及为什么这个顺序能保证实时性',
    source: '项目追问 · 智能温控终端',
  },
]

// 无卡片：标题与内容直接落在照片上，靠字号和留白分层
export function Tasks() {
  return (
    <section id="tasks" aria-labelledby="tasks-title" data-tour="tasks">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="tasks-title" className="text-[26px] font-semibold tracking-tight text-[var(--ws-ink)]">
          下一步任务
        </h2>
        <span className="text-[13px] text-[var(--ws-muted)]">按优先级排序，每项 90 分钟内</span>
      </div>

      <ul className="mt-7 divide-y divide-[var(--ws-line)]">
        {TASKS.map((task) => (
          <li key={task.title} className="flex flex-wrap items-start gap-x-6 gap-y-3 py-6 first:pt-0">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="text-[18px] font-medium text-[var(--ws-ink)]">{task.title}</h3>
                <span className="rounded-full border border-[var(--ws-ghost-line)] px-2.5 py-0.5 text-[12px] text-[var(--ws-sand)]">
                  {task.skill}
                </span>
              </div>
              <p className="mt-2.5 max-w-2xl text-[14px] leading-relaxed text-[var(--ws-ink-2)]">
                <span className="text-[var(--ws-muted)]">完成定义 · </span>
                {task.done}
              </p>
              <p className="mt-2 text-[12px] text-[var(--ws-muted)]">{task.source}</p>
            </div>

            <div className="flex items-center gap-5 md:flex-col md:items-end md:gap-2">
              <span className="text-[15px] tabular-nums text-[var(--ws-ink)]">{task.minutes} 分钟</span>
              <button
                type="button"
                className="group flex items-center gap-1 text-[14px] font-medium text-[var(--ws-sand)] transition-opacity hover:opacity-70"
              >
                开始
                <ArrowUpRight
                  className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
