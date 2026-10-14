import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Check } from 'lucide-react'
import { Reveal } from './reveal'
import { TiltCard } from './tilt-card'

const PROMISES = [
  { title: '结论可追溯', detail: '每一条判断都能回到具体的证据来源。' },
  { title: '排序可解释', detail: '任务优先级附带理由，而不是黑盒打分。' },
  { title: '任务 < 90 分钟', detail: '单项补齐任务控制在一次专注时长内。' },
  { title: '简历建议逐条确认', detail: '不会在你不知情时改写任何一句话。' },
]

export function FinalCta() {
  return (
    <section id="promise" aria-labelledby="promise-title" className="px-4 pt-10 pb-24 md:px-8">
      <Reveal className="mx-auto max-w-6xl">
        <div className="glass grid items-center gap-10 rounded-[2rem] p-6 text-white shadow-2xl shadow-black/20 md:grid-cols-[1.1fr_1fr] md:p-12">
          <div>
            <p className="glass inline-block rounded-full px-4 py-1 text-xs">我们的承诺</p>
            <h2 id="promise-title" className="mt-4 font-serif text-4xl font-semibold text-balance md:text-5xl">
              现在开始，为下一份 offer 积累证据
            </h2>
            <ul className="mt-8 flex flex-col gap-4">
              {PROMISES.map((item) => (
                <li key={item.title} className="flex gap-3">
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-white text-[#2a2140]">
                    <Check className="size-3.5" aria-hidden="true" />
                  </span>
                  <span>
                    <span className="font-medium">{item.title}</span>
                    <span className="text-white/75">{' — '}{item.detail}</span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="group flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-[#2a2140] transition-transform hover:scale-[1.03]"
              >
                开始准备
                <ArrowUpRight
                  className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  aria-hidden="true"
                />
              </Link>
              <Link href="/login" className="rounded-full px-6 py-3 font-medium transition-colors hover:bg-white/15">
                登录
              </Link>
            </div>
          </div>

          <TiltCard intensity={14} className="mx-auto aspect-[4/5] w-full max-w-sm overflow-hidden rounded-3xl shadow-2xl shadow-black/30">
            <Image
              src="/images/citic-tower-dusk.png"
              alt="暮色中的北京中信大厦"
              fill
              sizes="(min-width: 768px) 384px, 90vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-5 font-serif text-xl text-white [transform:translateZ(40px)]">
              一步一证，向上生长
            </p>
          </TiltCard>
        </div>
      </Reveal>

      <footer className="mx-auto mt-16 flex max-w-6xl flex-col items-center justify-between gap-2 text-sm text-white/70 md:flex-row">
        <p>证途 · 证据化求职准备</p>
        <p>面向嵌入式校招与实习</p>
      </footer>
    </section>
  )
}
