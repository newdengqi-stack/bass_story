const ACTIVITIES = [
  { time: '今天 10:20', text: '完成追问 2 轮', tag: '个人贡献边界 → 已验证', accent: true },
  { time: '今天 09:05', text: '提交 CAN 调试记录材料', tag: '智能温控终端' },
  { time: '昨天', text: '生成项目证据报告', tag: '智能温控终端 · 5 条证据' },
  { time: '10-01', text: '导入简历并确认解析结果', tag: '简历 + 3 个项目' },
]

export function Activity() {
  return (
    <section aria-labelledby="activity-title">
      <h2 id="activity-title" className="text-[26px] font-semibold tracking-tight text-[var(--ws-ink)]">
        最近活动
      </h2>

      <ol className="mt-5 divide-y divide-[var(--ws-line)]">
        {ACTIVITIES.map((a) => (
          <li key={a.time} className="flex items-start gap-3 py-4 first:pt-0 last:pb-0">
            <span
              className={
                a.accent
                  ? 'mt-1.5 size-2 shrink-0 rounded-full bg-[var(--ws-sand)] svg-anim animate-breathe'
                  : 'mt-1.5 size-2 shrink-0 rounded-full bg-[var(--ws-line-2)]'
              }
              aria-hidden="true"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[15px] text-[var(--ws-ink)]">{a.text}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[12px] text-[var(--ws-muted)]">
                <span>{a.time}</span>
                <span aria-hidden="true">·</span>
                <span>{a.tag}</span>
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  )
}
