import { FileText, Command, ArrowUpRight } from 'lucide-react'

const ITEMS = [
  {
    icon: FileText,
    index: '01 · RESUME',
    title: '简历先给你答案',
    description: '六个维度检查表达与可读性。没有技术问答，也能先发现具体可修改的问题。',
  },
  {
    icon: Command,
    index: '02 · ASSESSMENT',
    title: '技术能力用证据说话',
    description: '围绕基础、项目和工程场景追问；没有测到的能力就明确说尚未验证。',
  },
  {
    icon: ArrowUpRight,
    index: '03 · ACTION',
    title: '知道该做什么，也知道什么先不做',
    description: '依据目标岗位的具体需求，给出可执行、可检查的短期行动建议。',
  },
]

export function HomeValueProps() {
  return (
    <section id="how-it-works" className="mx-auto max-w-[1280px] px-4 py-20 sm:px-6 lg:px-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">HOW IT WORKS</p>
      <h2 className="mt-3 max-w-2xl text-[28px] font-bold leading-tight text-foreground sm:text-[34px]">
        不止是改简历，
        <br />
        而是<span className="text-primary">让每一步成长都有依据。</span>
      </h2>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {ITEMS.map((item) => (
          <div key={item.title} className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary-soft text-primary-soft-foreground">
              <item.icon className="size-5" />
            </div>
            <p className="mt-5 text-xs font-medium text-muted-foreground">{item.index}</p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
