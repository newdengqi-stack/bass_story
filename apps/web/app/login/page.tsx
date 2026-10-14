import type { Metadata } from 'next'
import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'
import { InteractiveBackground } from '@/components/landing/interactive-background'
import { LoginForm } from '@/components/auth/login-form'
import { KineticTitle } from '@/components/ui/kinetic-title'

export const metadata: Metadata = {
  title: '登录 · 证途',
}

export default function LoginPage() {
  return (
    <>
      {/* 沿用落地页的照片背景 + 视差 */}
      <InteractiveBackground />

      <main className="relative grid min-h-svh md:grid-cols-2">
        {/* ============ 左：文字压在照片上 ============ */}
        <div className="relative flex flex-col justify-center px-6 pb-8 pt-20 md:px-10 md:py-0 md:pl-14">
          {/* 极轻的定向压暗 —— 只托住文字，不盖照片 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0f0b1a]/70 via-[#0f0b1a]/25 to-transparent md:bg-gradient-to-r md:from-[#0f0b1a]/78 md:via-[#0f0b1a]/28 md:to-transparent"
          />

          <div className="relative max-w-lg">
            <Link href="/" className="inline-flex items-center gap-2.5 text-white" aria-label="返回证途首页">
              <span className="flex size-11 items-center justify-center rounded-full bg-white font-serif text-lg font-semibold text-[#2a2140] shadow-lg shadow-black/25">
                证
              </span>
              <span className="font-serif text-xl font-semibold tracking-wide drop-shadow-[0_2px_12px_rgb(0_0_0/0.6)]">
                证途
              </span>
            </Link>

            <KineticTitle
              text="欢迎回来"
              eyebrow="Welcome back"
              className="mt-10 text-white md:text-[5.5rem]"
              eyebrowClassName="mt-2 [--eyebrow-color:rgb(255_255_255/0.85)] drop-shadow-[0_2px_10px_rgb(0_0_0/0.6)]"
            />

            <p className="mt-6 max-w-md text-lg leading-relaxed text-white/95 drop-shadow-[0_2px_14px_rgb(0_0_0/0.6)]">
              继续把项目里的每一段经历，变成经得起追问的证据。
            </p>

            <p className="mt-10 flex items-center gap-2 text-sm text-[#e9c9a8] drop-shadow-[0_2px_10px_rgb(0_0_0/0.7)]">
              <ShieldCheck className="size-4" aria-hidden="true" />
              不承诺 Offer · 承诺每条结论有来源
            </p>
          </div>
        </div>

        {/* ============ 右：表单直接落在照片上（无卡片） ============ */}
        <div className="relative flex items-center justify-center px-6 pb-24 pt-4 md:px-10 md:py-0">
          {/* 表单这一侧稍压一点，保证输入文字可读；右侧轻、左侧淡 */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#0f0b1a]/45 via-[#0f0b1a]/30 to-[#0f0b1a]/55 md:bg-gradient-to-l md:from-[#0f0b1a]/52 md:via-[#0f0b1a]/28 md:to-transparent"
          />
          <div className="relative w-full max-w-sm">
            <LoginForm />
          </div>
        </div>
      </main>
    </>
  )
}
