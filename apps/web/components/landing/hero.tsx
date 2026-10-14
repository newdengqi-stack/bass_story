import Link from 'next/link'
import { ArrowUpRight, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

const HEADLINE: Array<Array<{ ch: string; hl?: boolean }>> = [
  [{ ch: '让' }, { ch: '每' }, { ch: '一' }, { ch: '项' }, { ch: '能' }, { ch: '力' }],
  [
    { ch: '都' },
    { ch: '有' },
    { ch: '证', hl: true },
    { ch: '据', hl: true },
    { ch: '可' },
    { ch: '循' },
  ],
]
const PROMISES = ['结论可追溯', '排序可解释', '任务 < 90 分钟', '简历逐条确认']

export function Hero() {
  let charIndex = 0

  return (
    <section className="relative flex min-h-svh flex-col items-center justify-center px-4 pt-28 pb-10 text-center text-white">
      <div className="flex flex-1 flex-col items-center justify-center">
        <p
          className="glass animate-fade-up flex items-center gap-2 rounded-full py-1 pr-4 pl-1 text-xs md:text-sm"
          style={{ animationDelay: '100ms' }}
        >
          <span className="rounded-full bg-white px-2.5 py-0.5 font-medium text-[#2a2140]">新</span>
          面向嵌入式校招 / 实习的证据化求职准备
        </p>

        <h1 className="mt-6 font-serif text-5xl leading-tight font-normal text-balance drop-shadow-[0_4px_24px_rgb(0_0_0/0.25)] sm:text-6xl md:text-7xl lg:text-8xl">
          {HEADLINE.map((line, li) => (
            <span key={li} className="block">
              {line.map(({ ch, hl }) => {
                const delay = 250 + charIndex++ * 55
                return (
                  <span
                    key={`${li}-${ch}-${charIndex}`}
                    className={cn('animate-char', hl && 'font-semibold text-[#e9c9a8]')}
                    style={{ animationDelay: `${delay}ms` }}
                  >
                    {ch}
                  </span>
                )
              })}
            </span>
          ))}
        </h1>

        <p
          className="animate-fade-up mt-6 max-w-2xl text-base leading-relaxed text-pretty text-white/90 drop-shadow md:text-lg"
          style={{ animationDelay: '1100ms' }}
        >
          从目标岗位出发，用真实项目验证你的能力、找到差距、生成专版简历。
          每一条结论都标明依据，告诉你哪些已被证明，哪些还需要补齐。
        </p>

        <div
          className="animate-fade-up mt-8 flex flex-wrap items-center justify-center gap-3"
          style={{ animationDelay: '1300ms' }}
        >
          <Link
            href="/register"
            className="glass group flex items-center gap-2 rounded-full px-6 py-3 font-medium transition-colors hover:bg-white hover:text-[#2a2140]"
          >
            开始准备
            <ArrowUpRight
              className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              aria-hidden="true"
            />
          </Link>
          <Link href="/login" className="rounded-full px-6 py-3 font-medium transition-colors hover:bg-white/15">
            已有账号，登录
          </Link>
        </div>
      </div>

      <div className="animate-fade-up flex flex-col items-center gap-4" style={{ animationDelay: '1500ms' }}>
        <p className="glass rounded-full px-4 py-1 text-xs">我们对每一位求职者的承诺</p>
        <ul className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 font-serif text-lg text-white/95 md:gap-x-12 md:text-2xl">
          {PROMISES.map((item) => (
            <li key={item} className="drop-shadow">
              {item}
            </li>
          ))}
        </ul>
        <a href="#stages" className="mt-2 text-white/80 transition-colors hover:text-white" aria-label="向下浏览">
          <ChevronDown className="size-6 animate-bounce" aria-hidden="true" />
        </a>
      </div>
    </section>
  )
}
