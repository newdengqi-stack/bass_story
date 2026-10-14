import { CircleCheck, CircleDashed, CircleHelp, MessageSquareQuote } from 'lucide-react'

const STATUS_VAR: Record<string, string> = {
  已验证: 'var(--ws-ok)',
  用户声明: 'var(--ws-info)',
  证据不足: 'var(--ws-warn)',
  当前缺失: 'var(--ws-miss)',
}

const READINESS = [
  { label: '可强调', value: 3, hint: '有证据支撑，可以写进简历' },
  { label: '待补证据', value: 2, hint: '有经历，缺材料' },
  { label: '当前缺失', value: 4, hint: '岗位要，你还没有' },
]

export function Readiness() {
  return (
    <section aria-labelledby="readiness-title" data-tour="gap">
      <h2 id="readiness-title" className="text-[26px] font-semibold tracking-tight text-[var(--ws-ink)]">
        职业差距分析
      </h2>

      <div className="mt-8 grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-4">
        {READINESS.map((item) => (
          <div key={item.label}>
            <p className="text-[3.5rem] font-semibold leading-none tracking-tight tabular-nums text-[var(--ws-ink)]">
              {item.value}
            </p>
            <p className="mt-3.5 text-[15px] font-medium text-[var(--ws-ink)]">{item.label}</p>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--ws-muted)]">{item.hint}</p>
          </div>
        ))}

        <div>
          <p className="text-[3.5rem] font-semibold leading-none tracking-tight tabular-nums text-[var(--ws-ink)]">
            2<span className="text-[var(--ws-muted)]">/2</span>
          </p>
          <p className="mt-3.5 text-[15px] font-medium text-[var(--ws-ink)]">硬性条件</p>
          <ul className="mt-1.5 flex flex-col gap-1 text-[13px] text-[var(--ws-ink-2)]">
            <li className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--ws-ok)]" aria-hidden="true" />
              本科 · 电子类
            </li>
            <li className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-[var(--ws-ok)]" aria-hidden="true" />
              英语四级
            </li>
          </ul>
          <p className="mt-1.5 text-[12px] leading-relaxed text-[var(--ws-muted)]">
            学历、院校不能靠项目弥补，单独核对
          </p>
        </div>
      </div>
    </section>
  )
}

const STATES = [
  { label: '已验证', count: 3, meaning: '有材料或连续追问撑住，你能从头讲到尾。', verdict: '可强化表述', icon: CircleCheck },
  { label: '用户声明', count: 5, meaning: '你填写过，但还没有可核验的材料。', verdict: '不写成强化表述', icon: MessageSquareQuote },
  { label: '证据不足', count: 4, meaning: '有相关材料，但不足以完整支撑结论。', verdict: '不可以写入', icon: CircleHelp },
  { label: '当前缺失', count: 4, meaning: '岗位明确要求，但你目前没有相关经历。', verdict: '进入差距计划', icon: CircleDashed },
]

// 四状态：极淡的幽灵描边分隔，不用实底卡片
export function EvidenceStatusGrid() {
  return (
    <section aria-labelledby="states-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="states-title" className="text-[26px] font-semibold tracking-tight text-[var(--ws-ink)]">
          证据状态
        </h2>
        <span className="text-[13px] text-[var(--ws-muted)]">每项能力只处于其中一种</span>
      </div>

      <div className="mt-7 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
        {STATES.map((s) => {
          const Icon = s.icon
          return (
            <article key={s.label} className="flex flex-col">
              <div className="flex items-center justify-between">
                <Icon className="size-5" style={{ color: STATUS_VAR[s.label] }} aria-hidden="true" />
                <span className="font-mono text-[20px] tabular-nums text-[var(--ws-ink)]">{s.count}</span>
              </div>

              <h3 className="mt-4 text-[17px] font-medium text-[var(--ws-ink)]">{s.label}</h3>
              <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[var(--ws-ink-2)]">{s.meaning}</p>

              <p className="mt-4 border-t border-[var(--ws-line)] pt-3 text-[12px] text-[var(--ws-muted)]">
                写入简历 · {s.verdict}
              </p>
            </article>
          )
        })}
      </div>
    </section>
  )
}

const PROJECTS = [
  { name: '智能温控终端', role: '固件开发', states: { 已验证: 2, 证据不足: 1, 当前缺失: 1 } },
  { name: '四轴无人机飞控', role: '姿态解算', states: { 已验证: 1, 证据不足: 2 } },
]

export function EvidenceSummary() {
  return (
    <section aria-labelledby="evidence-title" data-tour="evidence">
      <h2 id="evidence-title" className="text-[26px] font-semibold tracking-tight text-[var(--ws-ink)]">
        项目深挖
      </h2>

      <ul className="mt-7 divide-y divide-[var(--ws-line)]">
        {PROJECTS.map((p) => (
          <li key={p.name} className="py-5 first:pt-0">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-[16px] font-medium text-[var(--ws-ink)]">{p.name}</p>
              <p className="text-[12px] text-[var(--ws-muted)]">{p.role}</p>
            </div>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2">
              {Object.entries(p.states).map(([state, count]) => (
                <span key={state} className="flex items-center gap-1.5 text-[13px] text-[var(--ws-ink-2)]">
                  <span
                    className="size-1.5 rounded-full"
                    style={{ backgroundColor: STATUS_VAR[state] }}
                    aria-hidden="true"
                  />
                  {state}
                  <span className="font-medium tabular-nums text-[var(--ws-ink)]">{count}</span>
                </span>
              ))}
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[13px] text-[var(--ws-muted)]">
        只有<span className="text-[var(--ws-ink)]">「已验证」</span>的能力，才会写进简历。
      </p>
    </section>
  )
}
