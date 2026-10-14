import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { JdIntake } from '@/components/target/jd-intake'
import { InteractiveBackground } from '@/components/landing/interactive-background'
import { KineticTitle } from '@/components/ui/kinetic-title'

export const metadata: Metadata = {
  title: '建立主目标岗位 · 证途',
}

export default function NewTargetPage() {
  return (
    <>
      <InteractiveBackground src="/images/scene-career.png" focus="object-[50%_60%]" />
      <div className="pointer-events-none fixed top-0 left-0 h-screen w-screen -z-10 bg-[#0f0b1a]/55" aria-hidden="true" />

      <header className="px-4 pt-6 md:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2.5 text-white">
            <span className="flex size-10 items-center justify-center rounded-full bg-white font-serif text-lg font-semibold text-[#2a2140]">
              证
            </span>
            <span className="font-serif text-lg font-semibold tracking-wide">证途</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 rounded-full border border-white/20 px-4 py-2 text-sm text-white/70 transition-colors hover:border-white/40 hover:text-white"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            返回工作台
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-24 pt-10 md:px-8">
        {/* 步骤指示 */}
        <p className="text-xs tracking-widest text-white/40">准备闭环 · 第 1 步 / 共 4 步</p>
        <KineticTitle text="建立主目标岗位" index="02" eyebrow="Set the Target" className="mt-3" />
        <p className="mt-3 max-w-2xl leading-relaxed text-white/60">
          粘一份完整的 JD。系统会把要求拆成可核验的能力项，逐条交给你确认——
          后面所有的项目验证、差距报告和简历建议，都围绕这一个目标岗位展开。
        </p>

        <div className="mt-8">
          <JdIntake />
        </div>
      </main>
    </>
  )
}
